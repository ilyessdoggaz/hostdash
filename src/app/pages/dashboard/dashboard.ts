import { Component, AfterViewInit, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Auth } from "../../services/auth";
import { VehicleService } from "../../services/vehicle.service";

declare const google: any;

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class Dashboard implements AfterViewInit, OnInit {
  public hostProfile: any = null;
  public currentUser: any = null;
  public vehicles: any[] = [];
  public availableCount = 0;
  public rentedCount = 0;

  public auth = inject(Auth);
  public router = inject(Router);
  private vehicleService = inject(VehicleService);

  private map: any;
  private readonly TUNISIA_CENTER = { lat: 33.8869, lng: 9.5375 };

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();
    const storedProfile = localStorage.getItem('hostProfile');
    if (storedProfile) {
      this.hostProfile = JSON.parse(storedProfile);
    }
    this.loadVehicleStats();
  }

  loadVehicleStats() {
    this.vehicleService.getMyVehicles().subscribe({
      next: (vehicles: any[]) => {
        this.vehicles = vehicles || [];
        this.availableCount = this.vehicles.filter(v => v.status === 'AVAILABLE').length;
        this.rentedCount = this.vehicles.filter(v => v.status === 'RENTED').length;
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
    // Map initialized without markers or lines per user request
  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}
