import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Subscription } from 'rxjs';
import { DriverDashboardStats, CurrentTripInfo, GpsUpdate, OfflineGpsPing } from '../../../Data/data-interface';
import { AuthService } from '../../../Services/auth.service';
import { DriverService } from '../../../Services/driver.service';
import { SignalRService } from '../../../Services/signalr.service';
import { TripService } from '../../../Services/trip.service';
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './driver-dashboard.component.html',
  styleUrls: ['./driver-dashboard.component.scss']
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  stats: DriverDashboardStats | null = null;
  currentTrip: CurrentTripInfo | null = null;
  isLoading = true;
  isShiftActive = false;
  errorMessage = '';
  liveLocation: GpsUpdate | null = null;
  licenseNumber:string =''
  driverName=''
  TripStatus :string="Loading"
  private gpsSubscription: Subscription | null = null;
cdr =inject(ChangeDetectorRef)
  locationWatchId: any;
  constructor(
    private driverService: DriverService,
    private tripService:TripService,
    private signalRService: SignalRService,
    private authService: AuthService,

    private toast:ToastrService
  ) {


  }

  async ngOnInit(): Promise<void> {
  this.licenseNumber =this.authService.getLicenseNumber()!

  //console.log(this.licenseNumber)
    await this.loadDashboardData();
  }

get greetings(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good Morning";
  } else if (hour < 17) {
    return "Good Afternoon";
  } else {
    return "Good Evening";
  }
}
CompleteDelivery =false
  incrementDelivery(): void {
    if(this.isShiftActive==false){
      this.toast.warning("Trip has not started")
      return
    }
    this.CompleteDelivery =true
//console.log(this.currentTrip)
  if (!this.currentTrip) return;
  const newCount = (this.currentTrip.deliveriesComplete || 0) + 1;
  this.tripService.updateDeliveries(this.currentTrip.id, newCount).subscribe(() => {
    this.currentTrip!.deliveriesComplete = newCount ;
     this.CompleteDelivery =false
     this.cdr.detectChanges()
    // Optionally reload dashboard or update local
  });
}
  async loadDashboardData(): Promise<void> {
    this.isLoading = true;
    this.errorMessage = '';
    try {
      const [stats, trip] = await Promise.all([
        this.driverService.getDashboardStats(this.licenseNumber).toPromise(),
        this.driverService.getCurrentTrip(this.licenseNumber).toPromise()
      ]);
    //  console.log(stats,"driver stats")
      this.stats = stats!;
    //  console.log(stats)
      this.currentTrip = trip || null;
      this.TripStatus =this.currentTrip?.status || "Loading"
      console.log(trip,"Current Trip")
      this.cdr.detectChanges()
    } catch (err) {
      console.error(err,"Error");
      this.errorMessage = 'Failed to load dashboard data. Please refresh.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges()
    }
  }
  async loadCurrentTrip(){
   try {
      const [trip] = await Promise.all([

        this.driverService.getCurrentTrip(this.licenseNumber).toPromise()
      ]);
    //  console.log(stats)

      this.currentTrip = trip || null;
      this.TripStatus =this.currentTrip?.status || "Loading"
      console.log(trip)
      this.cdr.detectChanges()
    } catch (err) {
      console.error(err,"Error");
      this.errorMessage = 'Failed to load dashboard data. Please refresh.';
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges()
    }
}
  async toggleShift(): Promise<void> {
    if(this.isMaintenanceDue==true){
        this.toast.info("Your Vehicle Should be Under Maintenance,Kindly Contact Your Adminstrator","Trip Service")
      return;
    }
     if( !this.currentTrip?.status){
      this.toast.warning("You have no Current Trip set up by the Administrator","Trip Service")
      return;
    }
    this.isShiftActive = !this.isShiftActive;
    if (this.isShiftActive) {
      await this.startLiveTracking();
    } else {
      await this.stopLiveTracking();
    }
  }
// Inside your component class
get isMaintenanceDue(): boolean {
  if (!this.stats?.nextMaintenanceDate) return false;

  const maintenanceDate = new Date(this.stats.nextMaintenanceDate);
  const today = new Date();

  // Reset hours so we are only comparing calendar dates
  today.setHours(0, 0, 0, 0);
  maintenanceDate.setHours(0, 0, 0, 0);

  // Returns true if the maintenance date is today or in the past
  return maintenanceDate <= today;
}
  private async startLiveTracking(): Promise<void> {
  //  console.log(this.currentTrip,"current trip")


      try{
      await this.signalRService.start();
      // Subscribe to live GPS updates
      this.gpsSubscription = this.signalRService.vehicleUpdateSubject$.subscribe(update => {
       if(update){
        this.liveLocation = update;
        this.cdr.detectChanges()
        this.UpdateCurrentTripStatus(this.currentTrip!.id)
       }
        // Optionally play sound or show notification
      //  console.log('Live location:', update);
      });
    }catch(error){
       this.toast.error('Could not connect to real‑time updates. Please refresh or try again later.');
        console.error('SignalR start failed:', error);
        // Optionally set a flag to hide real‑time features.
     this.isShiftActive = false;
     this.cdr.markForCheck()
         return
    }
try{
//console.log(this.currentTrip)
// 2. START SENDING THE DRIVER'S LOCATION TO THE SERVER
    if (navigator.geolocation) {
      // Watch the driver's movement
 const companyId = this.authService.getCompanyId() // Or wherever you get companyId
      this.locationWatchId = navigator.geolocation.watchPosition(
        async (position) => {
          const geoData :OfflineGpsPing = {
            vehicleId :this.currentTrip?.vehicleId!,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            speed: position.coords.speed!,
            timestamp: new Date().toISOString(),
            companyId:companyId!
          };

//console.log(geoData,"data")
          // Call your method here to broadcast to the backend group

          this.signalRService.sendVehicleLocation(geoData).catch(error =>{
 this.toast.error(error,"Data was not Sent to the Server");
 this.isShiftActive =false
 this.cdr.markForCheck()
})

        },
        (err) => {
          console.error('Error getting location', err)
  this.toast.error(err.message);
        },
        { enableHighAccuracy: true }
      );
    }





      if(this.currentTrip?.status =="Loading"){
         this.tripService.updateStatus(this.currentTrip.id,"In Transit").subscribe({
           next:()=>{
            this.loadCurrentTrip()
           }
         })
      }
    } catch (err) {
      console.error('SignalR start failed', err);
      this.isShiftActive = false;
      this.errorMessage = 'Could not start live tracking.';
    }
  }

  private async stopLiveTracking(): Promise<void> {
  // Check if there are outstanding deliveries
  if (this.currentTrip?.totalDeliveries !== this.currentTrip?.deliveriesComplete) {

    // Ask the driver if they really want to end the trip
    const result = await Swal.fire({
      title: 'End Trip?',
      text: 'You still have incomplete deliveries. Do you want to end this trip now?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, end it!',
      cancelButtonText: 'No, keep tracking'
    });

    // If they clicked "Cancel", halt execution
    if (!result.isConfirmed) {
       this.isShiftActive =true
       this.cdr.detectChanges()
      return;
    }
  }

  // Proceed with ending the trip if confirmed or if all deliveries were complete
  this.tripService.DriverEndTrips(this.currentTrip?.id).subscribe({
    next: async (response: any) => {
      this.gpsSubscription?.unsubscribe();
      this.gpsSubscription = null;
      await this.signalRService.stop();
      this.liveLocation = null;
      this.toast.success("Trip ended successfully");
    },
    error: (error: any) => {
      console.error(error);
      this.toast.error(error.error.message || "An Error occurred while trying to end the Trip");
    }
  });
}
updateStatus(tripstatus:any){
  this.tripService.UpdateTripStatus(this.currentTrip?.id!,tripstatus).subscribe(
  result =>{
    if(result.message){
this.TripStatus =tripstatus
    }
  },error =>{
    this.toast.error(error.error)
  }

)
}
UpdateCurrentTripStatus(tripId:string){
this.tripService.UpdateTripStatus(tripId,"In Transit").subscribe(
  result =>{
    if(result.message){
this.TripStatus ="In Transit"
    }
  },error =>{
    this.toast.error(error.error)
  }

)
}

  ngOnDestroy(): void {
    if (this.isShiftActive) {
      this.stopLiveTracking();
    }
  }

  // Helper for license status badge color
  getLicenseStatusClass(status: string): string {
    switch (status) {
      case 'Valid': return 'status-valid';
      case 'Expiring Soon': return 'status-warning';
      case 'Expired': return 'status-expired';
      default: return '';
    }
  }

  get tripStatusClass(): string {
  // If the shift isn't active, immediately apply the 'loading' class matching your SCSS
  if (!this.isShiftActive) {
    return 'loading';
  }

  // Otherwise, safely format the trip status
  return this.currentTrip?.status?.toLowerCase().replace(/\s+/g, '-') || '';
}
}
