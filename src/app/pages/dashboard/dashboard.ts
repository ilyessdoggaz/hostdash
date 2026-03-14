import { Component, AfterViewInit, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, ActivatedRoute, RouterLink, RouterLinkActive } from "@angular/router";
import { Auth } from "../../services/auth";
import { VehicleService } from "../../services/vehicle.service";
import { IotService, VehiclePing } from "../../services/iot.service";
import { forkJoin, map as rxjsMap, of } from "rxjs";
import { catchError, map } from "rxjs/operators";

declare const google: any;

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class Dashboard implements AfterViewInit, OnInit {
  public hostProfile: any = null;
  public currentUser: any = null;
  public vehicles: any[] = [];
  public totalEarn = '0.000';
  public availableCount = 0;
  public rentedCount = 0;

  public auth = inject(Auth);
  public router = inject(Router);
  public route = inject(ActivatedRoute);
  private vehicleService = inject(VehicleService);
  private iotService = inject(IotService);

  private map: any;
  private markers: Map<string, any> = new Map();
  private infoWindows: Map<string, any> = new Map();
  private readonly TUNISIA_CENTER = { lat: 33.8869, lng: 9.5375 };

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    const storedProfile = localStorage.getItem('hostProfile');
    if (storedProfile) {
      this.hostProfile = JSON.parse(storedProfile);
    } else {
      const storedInfo = localStorage.getItem('tempRegistrationInfo');
      const info = storedInfo ? JSON.parse(storedInfo) : null;
      this.hostProfile = {
        agencyName: (this.currentUser as any)?.agencyName || info?.agencyName || ''
      };
    }
    this.loadVehicleStats();
  }

  loadVehicleStats() {
    // Fetch both active and archived vehicles to show everything on the map
    forkJoin({
      active: this.vehicleService.getMyVehicles(),
      archived: this.vehicleService.getArchivedVehicles()
    }).pipe(
      rxjsMap(results => {
        const activeList = (results.active || []).map(v => ({ ...v, isArchived: false }));
        const archivedList = (results.archived || []).map(v => ({ ...v, isArchived: true }));
        return [...activeList, ...archivedList];
      })
    ).subscribe({
      next: (allVehicles: any[]) => {
        this.vehicles = allVehicles;
        // Calculate stats for ACTIVE (non-archived) fleet only
        const activeFleet = this.vehicles.filter(v => !v.isArchived);

        // availableCount and rentedCount are based on the active fleet
        this.availableCount = activeFleet.filter(v =>
          v.status && String(v.status).toUpperCase() === 'AVAILABLE'
        ).length;

        this.rentedCount = activeFleet.filter(v =>
          v.status && String(v.status).toUpperCase() === 'RENTED'
        ).length;

        // For totalEarn, using a placeholder for now since there's no backend field for it yet
        this.totalEarn = '0.000';

        if (this.map && this.vehicles.length > 0) {
          this.loadVehicleMarkers();
        }
      },
      error: (err: any) => console.error('[Dashboard] Error loading vehicle stats:', err)
    });
  }

  ngAfterViewInit() {
    this.loadGoogleMaps();
  }

  private loadGoogleMaps() {
    if (typeof google !== "undefined" && google.maps) {
      this.initMap();
      return;
    }
    const apiKey = "AIzaSyAYulgRVgsSypvjULhmPRCvtNozLJXfPfM";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;
    (window as any).initMap = () => this.initMap();
    document.head.appendChild(script);
  }

  private initMap() {
    const mapElement = document.getElementById("google-map");
    if (!mapElement) return;
    this.map = new google.maps.Map(mapElement, {
      center: this.TUNISIA_CENTER,
      zoom: 7,
      mapTypeId: "roadmap",
      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
    });
    // Add markers once map is ready if vehicles are already loaded
    if (this.vehicles.length > 0) {
      this.loadVehicleMarkers();
    }
  }

  private loadVehicleMarkers() {
    if (!this.map || !this.vehicles.length) return;

    // Filter vehicles that have a vincode to avoid index mismatch
    const vehiclesWithVin = this.vehicles.filter(v => v.vincode);
    if (vehiclesWithVin.length === 0) return;

    const trackerRequests = vehiclesWithVin.map(vehicle =>
      this.iotService.getLastPosition(vehicle.vincode).pipe(
        map((ping: any) => ({ vehicle, ping })),
        catchError(() => of({ vehicle, ping: null }))
      )
    );

    forkJoin(trackerRequests).subscribe((results: any) => {
      results.forEach((res: any) => {
        if (res.ping && res.ping.latitude && res.ping.longitude) {
          this.addMarker(res.vehicle, res.ping);
        }
      });

      // After all markers are added, check if we need to focus on one
      this.route.queryParams.subscribe(params => {
        const targetVin = params['vin'];
        if (targetVin && this.markers.has(targetVin)) {
          const marker = this.markers.get(targetVin);
          const infoWindow = this.infoWindows.get(targetVin);

          this.map.setCenter(marker.getPosition());
          this.map.setZoom(15);
          infoWindow.open(this.map, marker);
        }
      });
    });
  }

  private addMarker(vehicle: any, ping: VehiclePing) {
    const status = vehicle.status?.toUpperCase();
    const color = status === 'AVAILABLE' ? '#10B981' : (status === 'RENTED' ? '#EF4444' : '#6B7280');

    let lat = ping.latitude;
    let lng = ping.longitude;

    // Check if any existing marker has the exact same position
    let offsetMultiplier = 0;
    for (const [vincode, existingMarker] of this.markers.entries()) {
      const pos = existingMarker.getPosition();
      if (pos && pos.lat() === lat && pos.lng() === lng) {
        offsetMultiplier++;
      }
    }

    if (offsetMultiplier > 0) {
      // Offset by approx 11 meters per overlapping marker
      lat += (offsetMultiplier * 0.0001);
      lng += (offsetMultiplier * 0.0001);
    }

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: this.map,
      title: `${vehicle.brand} ${vehicle.model}`,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: color,
        fillOpacity: 1,
        strokeWeight: 2,
        strokeColor: "#FFFFFF"
      }
    });

    if (vehicle.vincode) {
      this.markers.set(vehicle.vincode, marker);
    }

    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 10px; color: #1F2937;">
          <h3 style="margin: 0 0 5px 0;">${vehicle.brand} ${vehicle.model}</h3>
          <p style="margin: 0 0 10px 0; font-size: 14px;">${vehicle.matricule}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="background: ${color}; color: white; padding: 2px 8px; border-radius: 12px; font-size: 12px;">${vehicle.status}</span>
            <a href="/vehicle-details/${vehicle.id}" style="color: #3B82F6; text-decoration: none; font-size: 12px; font-weight: 600;">View Details →</a>
          </div>
        </div>
      `
    });

    if (vehicle.vincode) {
      this.infoWindows.set(vehicle.vincode, infoWindow);
    }

    marker.addListener("click", () => {
      infoWindow.open(this.map, marker);
    });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
