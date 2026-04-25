import { inject, Injectable, signal } from '@angular/core';
import { TrackingService } from './Tracking.service';
import * as signalR from '@microsoft/signalr';
import * as L from 'leaflet';
@Injectable({
  providedIn: 'root'
})
export class RealTimeTrackingService {
private tracker = inject(TrackingService);
  private hubConnection!: signalR.HubConnection;
constructor() { }
// Signal to track connection status
  public isConnected = signal<boolean>(false);

  startConnection(deviceId: string) {
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://your-api-url.com/trackingHub') // Your .NET Hub URL
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.isConnected.set(true);
        console.log('SignalR Connected!');

        // Join a 'room' specific to this car so you don't see everyone's data
        this.hubConnection.invoke('JoinVehicleGroup', deviceId);
      })
      .catch((err: string) => console.error('Error while starting connection: ' + err));

    // LISTEN for the 'UpdateLocation' event from the .NET Controller
    this.hubConnection.on('UpdateLocation', (data: any) => {
      const newPos = L.latLng(data.lat, data.lng);

      // Feed the data into your existing geofencing logic
      // We assume your map component provides the fences to the service
      this.tracker.processMovementFromHardware(newPos);
    });
  }

  stopConnection() {
    this.hubConnection?.stop();
    this.isConnected.set(false);
  }
}
