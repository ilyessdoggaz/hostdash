import { Component, AfterViewInit, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router } from "@angular/router";
import { Auth } from "../../services/auth";

declare const google: any;

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./dashboard.html",
  styleUrl: "./dashboard.css",
})
export class Dashboard implements AfterViewInit, OnInit {
  private map: any;
  private markers: any[] = [];
  public currentUser: any = null;

  // Tunisia center coordinates
  private readonly TUNISIA_CENTER = { lat: 33.8869, lng: 9.5375 };

  // Sample car locations in Tunisia
  private readonly carLocations = [
    { lat: 36.8065, lng: 10.1815, title: "Car 1: Tunis", status: "active" },
    { lat: 35.8256, lng: 10.6412, title: "Car 2: Sousse", status: "available" },
    { lat: 34.7406, lng: 10.7603, title: "Car 3: Sfax", status: "rented" },
    { lat: 36.4513, lng: 10.7357, title: "Car 4: Nabeul", status: "available" },
    { lat: 35.7673, lng: 10.8194, title: "Car 5: Monastir", status: "active" },
  ];

  constructor(private auth: Auth, private router: Router) { }

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();

    // Fallback to temp registration info for personalized feel
    if (this.currentUser && !this.currentUser.firstName) {
      const storedInfo = localStorage.getItem('tempRegistrationInfo');
      if (storedInfo) {
        const info = JSON.parse(storedInfo);
        this.currentUser.firstName = info.firstName;
        this.currentUser.lastName = info.lastName;
        this.currentUser.agencyName = info.agencyName;
      }
    }
  }

  ngAfterViewInit() {
    this.loadGoogleMaps();
  }

  private loadGoogleMaps() {
    // Check if Google Maps is already loaded
    if (typeof google !== "undefined" && google.maps) {
      this.initMap();
      return;
    }

    // Check for API key configuration
    const apiKey = "YOUR_API_KEY";
    if (apiKey === "YOUR_API_KEY") {
      console.warn(
        "⚠️ Google Maps API key not configured. Please update the API key in dashboard.ts to enable map features."
      );
      return; // Gracefully skip map initialization
    }

    // Load Google Maps script
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap`;
    script.async = true;
    script.defer = true;

    // Define global callback
    (window as any).initMap = () => {
      this.initMap();
    };

    script.onerror = () => {
      console.error("Failed to load Google Maps API. Please check your API key and internet connection.");
    };

    document.head.appendChild(script);
  }

  private initMap() {
    const mapElement = document.getElementById("google-map");
    if (!mapElement) return;

    // Create map centered on Tunisia
    this.map = new google.maps.Map(mapElement, {
      center: this.TUNISIA_CENTER,
      zoom: 7,
      mapTypeId: "roadmap",
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    });

    // Add markers for each car
    this.carLocations.forEach((car) => {
      this.addCarMarker(car);
    });

    // Add Tunisia boundary (approximate rectangle)
    this.addTunisiaBoundary();
  }

  private addCarMarker(car: any) {
    const markerColor =
      car.status === "active"
        ? "#10B981"
        : car.status === "available"
          ? "#4F46E5"
          : "#EF4444";

    const marker = new google.maps.Marker({
      position: { lat: car.lat, lng: car.lng },
      map: this.map,
      title: car.title,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: markerColor,
        fillOpacity: 1,
        strokeColor: "#FFFFFF",
        strokeWeight: 2,
      },
    });

    // Add info window
    const infoWindow = new google.maps.InfoWindow({
      content: `
        <div style="padding: 8px;">
          <h4 style="margin: 0 0 8px 0; color: #111827;">${car.title}</h4>
          <p style="margin: 0; color: #6B7280; font-size: 14px;">
            Status: <span style="color: ${markerColor}; font-weight: 600;">${car.status}</span>
          </p>
        </div>
      `,
    });

    marker.addListener("click", () => {
      infoWindow.open(this.map, marker);
    });

    this.markers.push(marker);
  }

  private addTunisiaBoundary() {
    // Approximate Tunisia boundary coordinates
    const tunisiaBounds = [
      { lat: 37.345, lng: 9.5 }, // North
      { lat: 37.2, lng: 11.0 }, // Northeast
      { lat: 36.8, lng: 11.6 }, // East
      { lat: 35.8, lng: 11.6 }, // Southeast
      { lat: 33.0, lng: 11.6 }, // South
      { lat: 30.2, lng: 9.5 }, // Southwest
      { lat: 32.0, lng: 7.5 }, // West
      { lat: 36.0, lng: 8.0 }, // Northwest
      { lat: 37.345, lng: 9.5 }, // Close loop
    ];

    const boundaryLine = new google.maps.Polyline({
      path: tunisiaBounds,
      geodesic: true,
      strokeColor: "#4F46E5",
      strokeOpacity: 0.3,
      strokeWeight: 2,
    });

    boundaryLine.setMap(this.map);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(["/login"]);
  }
}

