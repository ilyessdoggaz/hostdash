import { Component, OnInit, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RelaisService } from '../../services/relais.service';
import { PointDeRelais } from '../../models/relais.model';
import { NotificationService } from '../../services/notification.service';
import { finalize } from 'rxjs/operators';

declare const google: any;

@Component({
    selector: 'app-point-de-relais',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './point-de-relais.html',
    styleUrl: './point-de-relais.css'
})
export class PointDeRelaisPage implements OnInit, AfterViewInit {
    public points: PointDeRelais[] = [];
    public loading = true;
    public isSubmitting = false;
    public showMap = false;

    public newPoint = {
        name: '',
        latitude: 0,
        longitude: 0
    };

    private map: any;
    private marker: any;
    private readonly TUNISIA_CENTER = { lat: 33.8869, lng: 9.5375 };

    private relaisService = inject(RelaisService);
    private notificationService = inject(NotificationService);
    private location = inject(Location);
    private cdr = inject(ChangeDetectorRef);

    ngOnInit() {
        this.loadPoints();
    }

    goBack() {
        this.location.back();
    }

    ngAfterViewInit() {
        // Map will be initialized when "Pick on Map" is clicked
    }

    loadPoints() {
        this.loading = true;
        this.relaisService.getPoints()
            .pipe(finalize(() => {
                this.loading = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (data) => this.points = data,
                error: (err) => this.notificationService.showToast(err, 'error')
            });
    }

    openMapPicker() {
        this.showMap = true;
        this.cdr.detectChanges();
        setTimeout(() => this.initMap(), 100);
    }

    closeMapPicker() {
        this.showMap = false;
        this.cdr.detectChanges();
    }

    private initMap() {
        const mapElement = document.getElementById('picker-map');
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

    private updateMarker(lat: number, lng: number) {
        if (this.marker) {
            this.marker.setPosition({ lat, lng });
        } else {
            this.marker = new google.maps.Marker({
                position: { lat, lng },
                map: this.map,
                animation: google.maps.Animation.DROP
            });
        }
        this.newPoint.latitude = lat;
        this.newPoint.longitude = lng;
        this.cdr.detectChanges();
    }

    savePoint() {
        if (!this.newPoint.name || !this.newPoint.latitude) {
            this.notificationService.showToast('Please provide a name and select a location on the map', 'error');
            return;
        }

        this.isSubmitting = true;
        this.relaisService.addPoint(this.newPoint)
            .pipe(finalize(() => {
                this.isSubmitting = false;
                this.cdr.detectChanges();
            }))
            .subscribe({
                next: (point) => {
                    this.notificationService.showToast('Point de Relais added successfully', 'success');
                    this.points.push(point);
                    this.resetForm();
                    this.showMap = false;
                },
                error: (err) => this.notificationService.showToast(err, 'error')
            });
    }

    deletePoint(id: string) {
        if (!confirm('Are you sure you want to delete this point?')) return;

        this.relaisService.deletePoint(id).subscribe({
            next: () => {
                this.notificationService.showToast('Point deleted', 'success');
                this.points = this.points.filter(p => p.id !== id);
                this.cdr.detectChanges();
            },
            error: (err) => this.notificationService.showToast(err, 'error')
        });
    }

    private resetForm() {
        this.newPoint = { name: '', latitude: 0, longitude: 0 };
        if (this.marker) {
            this.marker.setMap(null);
            this.marker = null;
        }
    }
}
