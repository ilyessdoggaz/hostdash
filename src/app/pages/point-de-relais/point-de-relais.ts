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
    public isEditing = false;
    public editingId: string | null = null;

    public newPoint = {
        name: '',
        latitude: 0,
        longitude: 0,
        address: ''
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
        this.isEditing = false;
        this.editingId = null;
        this.resetForm();
        this.map = null;
        this.marker = null;
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
        this.newPoint.latitude = lat;
        this.newPoint.longitude = lng;
        this.reverseGeocode(lat, lng);
        this.cdr.detectChanges();
    }

    private reverseGeocode(lat: number, lng: number) {
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results: any, status: any) => {
            if (status === 'OK' && results[0]) {
                this.newPoint.address = results[0].formatted_address;
                this.cdr.detectChanges();
            }
        });
    }

    editPoint(point: PointDeRelais) {
        this.isEditing = true;
        this.editingId = point.id;
        this.newPoint = {
            name: point.name,
            latitude: point.latitude,
            longitude: point.longitude,
            address: point.address
        };
        this.openMapPicker();
        setTimeout(() => {
            if (this.map) {
                const pos = { lat: point.latitude, lng: point.longitude };
                this.map.setCenter(pos);
                this.map.setZoom(15);
                this.updateMarker(point.latitude, point.longitude);
            }
        }, 300);
    }

    savePoint() {
        if (!this.newPoint.name || !this.newPoint.latitude) {
            this.notificationService.showToast('Please provide a name and select a location on the map', 'error');
            return;
        }

        this.isSubmitting = true;
        const isEditMode = this.isEditing && !!this.editingId;
        const currentEditingId = this.editingId;

        const request = isEditMode
            ? this.relaisService.updatePoint(currentEditingId!, this.newPoint)
            : this.relaisService.addPoint(this.newPoint);

        request.pipe(finalize(() => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
        }))
        .subscribe({
            next: (returnedPoint) => {
                this.notificationService.showToast(
                    isEditMode ? 'Point updated successfully' : 'Point de Relais added successfully',
                    'success'
                );
                if (isEditMode && currentEditingId) {
                    // Use the locally-known editingId to find the point — more reliable
                    // than using returnedPoint.id which may differ in id/_id format
                    const index = this.points.findIndex(
                        p => p.id === currentEditingId || (p as any)._id === currentEditingId
                    );
                    if (index !== -1) {
                        // Merge the API response with the form data to ensure UI reflects latest state
                        this.points = [
                            ...this.points.slice(0, index),
                            { ...this.points[index], ...returnedPoint, id: currentEditingId, ...this.newPoint },
                            ...this.points.slice(index + 1)
                        ];
                    } else {
                        console.warn('[PointDeRelaisPage] updatePoint: could not find point in list, reloading.');
                        this.loadPoints();
                    }
                } else {
                    this.points = [...this.points, returnedPoint];
                }
                this.closeMapPicker();
            },
            error: (err) => this.notificationService.showToast(err, 'error')
        });
    }

    deactivatePoint(id: string) {
        if (!id) {
            console.error('[PointDeRelaisPage] Cannot deactivate point: ID is missing');
            this.notificationService.showToast('Error: Missing point ID', 'error');
            return;
        }

        console.log('[PointDeRelaisPage] Deactivate request for ID:', id);
        
        if (!confirm('Are you sure you want to deactivate this relay point?')) {
            return;
        }

        this.isSubmitting = true;
        this.relaisService.deactivatePoint(id).subscribe({
            next: (updatedPoint) => {
                this.isSubmitting = false;
                console.log('[PointDeRelaisPage] Deactivation success:', updatedPoint);
                this.notificationService.showToast('Point deactivated successfully', 'success');
                
                // Find index using normalized ID
                const index = this.points.findIndex(p => p.id === id);
                
                if (index !== -1) {
                    // Create a new array reference to ensure change detection
                    const newPoints = [...this.points];
                    newPoints[index] = { 
                        ...this.points[index], 
                        ...(updatedPoint || {}), 
                        active: false 
                    };
                    this.points = newPoints;
                    console.log('[PointDeRelaisPage] Updated local state for point:', id);
                } else {
                    console.warn('[PointDeRelaisPage] Could not find point in local list, reloading all points');
                    this.loadPoints();
                }
                this.cdr.detectChanges();
            },
            error: (err) => {
                this.isSubmitting = false;
                console.error('[PointDeRelaisPage] Server error during deactivation:', err);
                this.notificationService.showToast(err || 'Failed to deactivate point. Please try again.', 'error');
                this.cdr.detectChanges();
            }
        });
    }

    private resetForm() {
        this.newPoint = { name: '', latitude: 0, longitude: 0, address: '' };
        if (this.marker) {
            this.marker.setMap(null);
            this.marker = null;
        }
    }
}
