import { inject, Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { Subject } from 'rxjs';
import { GpsData, GpsUpdate, OfflineGpsPing } from '../Data/data-interface';
import { OfflineDbService } from './OfflineDbService';
import { AuthService } from './auth.service';
import { ConfigService } from '../app/config.service';



@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection: signalR.HubConnection;
  private CACHE_KEY = 'offline_gps_updates';
  private locationSubject = new Subject<GpsUpdate>();
private vehicleUpdateSubject = new Subject<GpsUpdate>();
  // Observable that components can subscribe to
  public locationUpdates$ = this.locationSubject.asObservable();
public vehicleUpdateSubject$ =this.vehicleUpdateSubject.asObservable()
 authService =inject(AuthService)
private readonly urlConfig =inject(ConfigService)
get baseUrl():string {
  return this.urlConfig.rootUrl
}
  constructor(private offlineDb: OfflineDbService) {

    // Use your actual backend URL (adjust port if needed)
  //  const baseUrl =this.authService.get; // or your production URL
//console.log(`${this.baseUrl}trackingHub`)
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(`${this.baseUrl}trackingHub`,
        {
          // 🌟 SignalR intercepts this factory callback natively before firing the handshake
        accessTokenFactory: () => {
          const userToken = this.authService.getToken(); // Retrieve the JWT returned from step 1
          return userToken ? userToken : '';
        }
        }
      )

      .withAutomaticReconnect()
      .build();



      // Hook into the reconnect event
this.hubConnection.onreconnected(() => {
  console.log('SignalR Reconnected! Syncing offline history...');
  this.syncOfflineData();
});



    this.hubConnection.on('UpdateLocation', (data: GpsUpdate) => {
      // The method name must match the server's SendAsync("UpdateLocation", ...)
      this.locationSubject.next(data);
    });

      this.hubConnection.on('ReceiveVehicleUpdate', (data: any) => {
  console.log('Received vehicle update from server:', data);

  // Example: Push it to an RxJS Subject so components can subscribe to it
  this.vehicleUpdateSubject.next(data);
});
  }



  public stopConnection(): void {
    this.hubConnection.stop();
  }
// Inside your Angular Service (e.g., TrackingService)
public async sendVehicleLocation(vehicleData:any): Promise<void> {
    // const { companyId, ...vehicleData } = payload;
      // console.log(vehicleData)
 if (this.isConnected) {
      // 1. If online, try sending immediately
      try {

        await this.hubConnection.invoke('SendVehicleUpdate', vehicleData);
      } catch (err) {

       const isHubError = err?.toString().includes('Failed to invoke');

      if (isHubError) {
console.log(err)
        throw err; // Bubble up to the component (e.g., authorization failed)
      }
       // this.cacheLocally(vehicleData);
       await this.saveToDexie(vehicleData.companyId, vehicleData);
      }
    } else {
      // 2. If offline, cache it for later
      console.warn('Network offline. Saving location ping locally.');
     // this.cacheLocally(vehicleData);
      await this.saveToDexie(vehicleData.companyId, vehicleData);
    }
}

private async saveToDexie(companyId: string, geoData:OfflineGpsPing ): Promise<void> {
    await this.offlineDb.gpsPings.add({
      companyId: companyId,
      latitude: geoData.latitude,
      longitude: geoData.longitude,
      timestamp: new Date().toISOString(),
      speed:geoData.speed,
      vehicleId:geoData.vehicleId
    });
  }
// Check if connection is actively connected
  public get isConnected(): boolean {
    return this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected;
  }




  // Loop through and sync all backed-up locations
 public async syncOfflineData(): Promise<void> {
  if (!this.isConnected) return;

  const cachedPings = await this.offlineDb.gpsPings.toArray();
  if (cachedPings.length === 0) return;

  console.log(`Syncing ${cachedPings.length} cached location points at once...`);

  // 1. Grab the companyId from the first item (assuming they all belong to the same fleet)
  const companyId = cachedPings[0].companyId;

  // 2. Map the entire array to strip 'id' and 'companyId'
  const bulkData = cachedPings.map(({ id, companyId, ...rest }) => rest);

  try {
    // 3. Invoke a bulk hub method or an API endpoint once
    await this.hubConnection.invoke('SendBulkVehicleUpdates', companyId, bulkData);

    // 4. Clear cache only after a successful batch response
    await this.offlineDb.gpsPings.clear();
  } catch (err) {
    console.error('Failed batch syncing points', err);
  }
}
  // Inside your SignalRService
public async sendGpsUpdate(imei: string, lat: number, lng: number, speed: number): Promise<void> {
  if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
    // Invokes a method on the C# Hub named "BroadcastSimulatedLocation"
    await this.hubConnection.invoke('BroadcastSimulatedLocation', {
      imei: imei,
      latitude: lat,
      longitude: lng,
      speed: speed,
      timestamp: Date.now()
    });
  }
}

 async start(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Disconnected) {
     let companyId =this.authService.getCompanyId()

await this.hubConnection.start()
    .then(() => {
      console.log('SignalR Connection Started!');

      // CALL THE HUB METHOD IMMEDIATELY AFTER CONNECTING!
      this.hubConnection.invoke('JoinCompanyGroup', companyId)
        .then(() => console.log(`Successfully joined company group: ${companyId}`))
        .catch(err =>
          {
            console.error('Error joining company group:', err)
             throw err;
          }
          );
    })
    .catch(err => {
      console.log('Error while starting connection: ' + err)
 throw err;
    });
    }
  }

  async stop(): Promise<void> {
    if (this.hubConnection.state === signalR.HubConnectionState.Connected) {
      await this.hubConnection.stop();
      console.log('SignalR disconnected');
    }
  }

  // Inside your SignalRService class:
onGpsUpdateReceived(callback: (data:GpsUpdate) => void) {
  this.hubConnection.on('ReceiveVehicleUpdate', callback);
  console.log(callback,"received data")
}

// And add the cleanup method for ngOnDestroy:
offGpsUpdateReceived() {
  this.hubConnection.off('ReceiveVehicleUpdate');
}
}
