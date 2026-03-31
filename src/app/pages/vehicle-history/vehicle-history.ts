import { Component, AfterViewInit, OnInit, inject, ChangeDetectorRef } from "@angular/core";
import { CommonModule, Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { IotService, VehiclePing } from "../../services/iot.service";
import { VehicleService } from "../../services/vehicle.service";
import { Vehicle } from "../../models/vehicle.model";
import { finalize } from 'rxjs/operators';

declare const google: any;

@Component({
  selector: "app-vehicle-history",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./vehicle-history.html",
  styleUrl: "./vehicle-history.css",
})
export class VehicleHistory implements AfterViewInit, OnInit {
  public vehicle: Vehicle | null = null;
  public history: VehiclePing[] = [];
  public lastPing: VehiclePing | null = null;
  public loading = true;
  public error: string | null = null;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private iotService = inject(IotService);
  private vehicleService = inject(VehicleService);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  private map: any;
  private markers: any[] = [];
  private historyPath: any;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadVehicleAndHistory(id);
    } else {
      this.error = 'No vehicle ID provided';
      this.loading = false;
    }
  }

  loadVehicleAndHistory(id: string) {
    this.loading = true;
    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        this.vehicle = vehicle;
        if (vehicle && vehicle.vincode) {
          this.fetchHistory(vehicle.vincode);
        } else {
          this.error = 'Could not find vehicle details or VIN code.';
          this.loading = false;
          this.cdr.detectChanges();
        }
      },
      error: (err) => {
        this.error = typeof err === 'string' ? err : 'Failed to load vehicle details.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  fetchHistory(vincode: string) {
    this.iotService.getPositionHistory(vincode)
      .pipe(finalize(() => {
        this.loading = false;
        this.cdr.detectChanges();
        if (this.history.length > 0) {
          this.initMap();
        }
      }))
      .subscribe({
        next: (data) => {
          this.history = data || [];
          if (this.history.length > 0) {
            this.lastPing = this.history[0]; // Assuming sorted by timestamp desc
          }
        },
        error: (err) => {
          console.error('[VehicleHistory] Error:', err);
          // Don't set error = err here, maybe there's just no history yet
        }
      });
  }

  ngAfterViewInit() {
    this.loadGoogleMaps();
  }

  private loadGoogleMaps() {
    if (typeof google !== "undefined" && google.maps) {
      if (this.history.length > 0) this.initMap();
      return;
    }
    const apiKey = "AIzaSyAYulgRVgsSypvjULhmPRCvtNozLJXfPfM";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapHistory`;
    script.async = true;
    script.defer = true;
    (window as any).initMapHistory = () => this.initMap();
    document.head.appendChild(script);
  }

  private initMap() {
    const mapElement = document.getElementById("history-map");
    if (!mapElement || !this.history.length) return;

    const center = { lat: this.history[0].latitude, lng: this.history[0].longitude };

    this.map = new google.maps.Map(mapElement, {
      center: center,
      zoom: 12,
      mapTypeId: "roadmap",
      styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }],
    });

    this.drawHistory();
  }

  private drawHistory() {
    if (!this.map || !this.history.length) return;

    const pathCoords = this.history.map(ping => ({
      lat: ping.latitude,
      lng: ping.longitude
    }));

    // Draw markers
    this.history.forEach((ping, index) => {
      const isLast = index === 0;
      const marker = new google.maps.Marker({
        position: { lat: ping.latitude, lng: ping.longitude },
        map: this.map,
        title: `Ping at ${new Date(ping.timestamp).toLocaleString()}`,
        icon: isLast ? undefined : {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 5,
          fillColor: "#EF4444",
          fillOpacity: 0.8,
          strokeWeight: 1,
          strokeColor: "#FFFFFF"
        }
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div style="color: #1F2937; padding: 5px;">
            <strong>${isLast ? 'Last Position' : 'History Point'}</strong><br>
            Time: ${new Date(ping.timestamp).toLocaleString()}<br>
            Speed: ${ping.speed || 0} km/h
          </div>
        `
      });

      marker.addListener("click", () => {
        infoWindow.open(this.map, marker);
      });

      this.markers.push(marker);
    });

    // Draw path line
    this.historyPath = new google.maps.Polyline({
      path: pathCoords,
      geodesic: true,
      strokeColor: "#EF4444",
      strokeOpacity: 1.0,
      strokeWeight: 3,
      map: this.map
    });

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    pathCoords.forEach(coord => bounds.extend(coord));
    this.map.fitBounds(bounds);
  }

  goBack() {
    this.location.back();
  }
}
