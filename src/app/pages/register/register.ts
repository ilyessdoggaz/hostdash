import { Component, OnInit, ChangeDetectorRef } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { Auth } from "../../services/auth";

declare const google: any;


@Component({
  selector: "app-register",
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: "./register.html",
  styleUrl: "./register.css",
})
export class Register implements OnInit {
  // Agency Info
  agencyName = "";
  agencyCity = "";
  agencyAddress = "";
  agencyZip = "";
  agencyLatitude = 0;
  agencyLongitude = 0;
  logoPreview: string | null = null;
  logoFile: File | null = null;

  // Map state
  showMap = false;
  map: any;
  marker: any;
  private readonly TUNISIA_CENTER = { lat: 33.8869, lng: 9.5375 };

  // Manager Info
  managerFirstName = "";
  managerLastName = "";
  managerPhone = "";

  // Authentication
  email = "";
  password = "";
  confirmPassword = "";
  cinPassport = "";

  // Legal Info
  legalName = "";
  legalRc = "";
  legalTaxId = "";
  rneNumber = "";
  patenteNumber = "";

  // Validation errors
  errors: { [key: string]: string } = {};
  error = "";

  // Tunisia cities list
  readonly tunisiaCities = [
    "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte",
    "Gabes", "Ariana", "Gafsa", "Monastir", "Ben Arous",
    "Kasserine", "Medenine", "Nabeul", "Tataouine", "Beja",
    "Le Kef", "Mahdia", "Sidi Bouzid", "Jendouba", "Tozeur",
    "La Manouba", "Siliana", "Zaghouan", "Kebili"
  ];

  // Tunisia ZIP codes (4 digits, starting with valid prefixes)
  readonly zipPattern = /^\d{4}$/;

  // Tunisia phone pattern (8 digits)
  readonly phonePattern = /^\d{8}$/;

  // Tunisia RC pattern (Registre du Commerce)
  readonly rcPattern = /^[A-Za-z]?\d{6,8}$/;

  // Tunisia Tax ID pattern (Matricule Fiscal)
  readonly taxIdPattern = /^\d{7}[A-Z]\d{3}$/;

  currentUser: any; // Added for ngOnInit

  constructor(private auth: Auth, private router: Router, private cdr: ChangeDetectorRef) {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    this.currentUser = this.auth.getCurrentUser();

    // If we only have a token and email (from backend login), look for extra info in local storage
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

  validate(): boolean {
    this.errors = {};
    let isValid = true;

    // Agency Name validation
    if (!this.agencyName || this.agencyName.length < 3) {
      this.errors["agencyName"] = "Agency name must be at least 3 characters";
      isValid = false;
    }

    // City validation - must be in Tunisia
    if (!this.agencyCity) {
      this.errors["agencyCity"] = "City is required";
      isValid = false;
    } else if (!this.tunisiaCities.some(city =>
      city.toLowerCase() === this.agencyCity.toLowerCase()
    )) {
      this.errors["agencyCity"] = "Please enter a valid Tunisia city";
      isValid = false;
    }

    // Address validation - must be auto-filled from map selection
    if (!this.agencyAddress || this.agencyAddress.length < 10) {
      this.errors["agencyAddress"] = "Please select your agency location on the map to auto-fill the address";
      isValid = false;
    }

    // Location validation - coordinates are required
    if (!this.agencyLatitude || !this.agencyLongitude) {
      this.errors["agencyAddress"] = "Please select your agency location on the map";
      isValid = false;
    }

    // ZIP code validation - Tunisia uses 4 digits
    if (!this.agencyZip) {
      this.errors["agencyZip"] = "ZIP code is required";
      isValid = false;
    } else if (!this.zipPattern.test(this.agencyZip)) {
      this.errors["agencyZip"] = "ZIP code must be 4 digits (e.g., 1000)";
      isValid = false;
    }

    // Manager First Name
    if (!this.managerFirstName || this.managerFirstName.length < 2) {
      this.errors["managerFirstName"] = "First name must be at least 2 characters";
      isValid = false;
    }

    // Manager Last Name
    if (!this.managerLastName || this.managerLastName.length < 2) {
      this.errors["managerLastName"] = "Last name must be at least 2 characters";
      isValid = false;
    }

    // Phone validation - Tunisia format
    if (!this.managerPhone) {
      this.errors["managerPhone"] = "Phone number is required";
      isValid = false;
    } else if (!this.phonePattern.test(this.managerPhone)) {
      this.errors["managerPhone"] = "Phone must be 8 digits (e.g., 04469164)";
      isValid = false;
    }

    // Email validation
    if (!this.email) {
      this.errors["email"] = "Email is required";
      isValid = false;
    } else if (!this.isValidEmail(this.email)) {
      this.errors["email"] = "Please enter a valid email address";
      isValid = false;
    }

    // Password validation
    if (!this.password) {
      this.errors["password"] = "Password is required";
      isValid = false;
    } else if (this.password.length < 8) {
      this.errors["password"] = "Password must be at least 8 characters";
      isValid = false;
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.password)) {
      this.errors["password"] = "Password must contain uppercase, lowercase, and number";
      isValid = false;
    }

    // Confirm password
    if (this.password !== this.confirmPassword) {
      this.errors["confirmPassword"] = "Passwords do not match";
      isValid = false;
    }

    // Legal Information validation (if provided)
    if (this.legalName && this.legalName.length < 3) {
      this.errors["legalName"] = "Legal name must be at least 3 characters";
      isValid = false;
    }

    if (this.legalRc && !this.rcPattern.test(this.legalRc)) {
      this.errors["legalRc"] = "Invalid RC number (6-8 digits, optional letter prefix)";
      isValid = false;
    }

    if (!this.legalTaxId) {
      this.errors["legalTaxId"] = "Tax ID (Matricule Fiscale) is required";
      isValid = false;
    } else if (!this.taxIdPattern.test(this.legalTaxId)) {
      this.errors["legalTaxId"] = "Invalid Tax ID format (7 digits + 1 letter + 3 digits, e.g., 1234567A001)";
      isValid = false;
    }

    if (!this.cinPassport) {
      this.errors["cinPassport"] = "CIN or Passport is required";
      isValid = false;
    }

    if (!this.rneNumber) {
      this.errors["rneNumber"] = "RNE Number is required";
      isValid = false;
    }

    if (!this.patenteNumber) {
      this.errors["patenteNumber"] = "Patente Number is required";
      isValid = false;
    }

    return isValid;
  }

  private isValidEmail(email: string): boolean {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  }

  openMapPicker() {
    this.showMap = true;
    this.cdr.detectChanges();
    setTimeout(() => this.loadGoogleMaps(), 100);
  }

  closeMapPicker() {
    this.showMap = false;
    this.map = null;
    this.marker = null;
    this.cdr.detectChanges();
  }

  private initMap() {
    const mapElement = document.getElementById('register-map');
    if (!mapElement) return;

    this.map = new google.maps.Map(mapElement, {
      center: this.TUNISIA_CENTER,
      zoom: 7,
      mapTypeId: 'roadmap',
      styles: [{ featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] }]
    });

    this.map.addListener('click', (event: any) => {
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();
      this.updateMarker(lat, lng);
    });
  }

  private loadGoogleMaps() {
    if (typeof google !== "undefined" && google.maps) {
      this.initMap();
      return;
    }
    const apiKey = "AIzaSyAYulgRVgsSypvjULhmPRCvtNozLJXfPfM";
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMapRegister`;
    script.async = true;
    script.defer = true;
    (window as any).initMapRegister = () => this.initMap();
    document.head.appendChild(script);
  }

  private updateMarker(lat: number, lng: number) {
    if (this.marker) {
      this.marker.setPosition({ lat, lng });
    } else {
      this.marker = new google.maps.Marker({
        position: { lat, lng },
        map: this.map,
        animation: google.maps.Animation.DROP,
        draggable: true
      });

      this.marker.addListener('dragend', (e: any) => {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        this.updateMarkerCoords(newLat, newLng);
      });
    }
    this.updateMarkerCoords(lat, lng);
  }

  private updateMarkerCoords(lat: number, lng: number) {
    this.agencyLatitude = lat;
    this.agencyLongitude = lng;
    this.reverseGeocode(lat, lng);
    this.cdr.detectChanges();
  }

  private reverseGeocode(lat: number, lng: number) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
      if (status === 'OK' && results[0]) {
        this.agencyAddress = results[0].formatted_address;
        this.cdr.detectChanges();
      }
    });
  }

  onLogoSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        this.errors['logo'] = 'Please select a valid image file (JPEG, JPG, or PNG)';
        this.cdr.detectChanges();
        return;
      }

      // Clear any previous errors
      delete this.errors['logo'];

      // Store file reference
      this.logoFile = file;

      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoPreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  removeLogo(event: Event) {
    event.stopPropagation(); // Prevent triggering file input click
    this.logoPreview = null;
    this.logoFile = null;
    delete this.errors['logo'];
    this.cdr.detectChanges();
  }

  register() {
    // Clear previous errors and any existing auth session
    this.error = "";
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("pendingEmail");

    // Validate all fields
    if (!this.validate()) {
      this.error = "Please correct the errors below";
      return;
    }

    const payload = {
      agencyName: this.agencyName,
      city: this.agencyCity,
      address: this.agencyAddress,
      zipCode: this.agencyZip,
      latitude: this.agencyLatitude,
      longitude: this.agencyLongitude,
      matriculeFiscale: this.legalTaxId,
      rneNumber: this.rneNumber,
      patenteNumber: this.patenteNumber,
      firstName: this.managerFirstName,
      lastName: this.managerLastName,
      cinPassport: this.cinPassport,
      phone: this.managerPhone,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
      logo: ""
    };

    console.log("Submitting registration to backend:", payload);

    this.auth
      .register(payload)
      .subscribe({
        next: (res: any) => {
          console.log("Registration success! Full response:", res);

          // Store metadata for personalized dashboard and OTP verification
          localStorage.setItem("pendingEmail", this.email);
          localStorage.setItem("pendingAction", "register");
          localStorage.setItem("tempRegistrationInfo", JSON.stringify({
            firstName: this.managerFirstName,
            lastName: this.managerLastName,
            agencyName: this.agencyName
          }));

          const successMsg = res.message || "Registration successful!";
          console.log("Navigating to OTP with message:", successMsg);

          // Explicitly navigate to /otp
          this.router.navigate(["/otp"], {
            queryParams: { message: successMsg }
          }).then(success => {
            if (success) console.log("Navigation to OTP successful");
            else console.error("Navigation to OTP failed");
          });
        },
        error: (err) => {
          console.error("Registration request failed HTTP Error:", err);

          // err is now a string thanks to the improved handleError in AuthService
          this.error = typeof err === 'string' ? err : "Registration failed. Please try again.";

          if (this.error.includes("connect to backend")) {
            this.error = "Cannot connect to backend. Please ensure Spring Boot is running on port 8080.";
          }
        },
      });
  }
}
