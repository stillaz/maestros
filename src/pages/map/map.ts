import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, ViewController } from 'ionic-angular';
import { Geolocation } from '@ionic-native/geolocation';

declare var google: any;

@Component({
  selector: 'page-map',
  templateUrl: 'map.html'
})
export class MapPage {

  @ViewChild('map') mapElement: ElementRef;
  map: any;
  marker: any;
  geocoder: any;
  infowindow: any;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    private geolocation: Geolocation,
    public viewCtrl: ViewController
  ) {
    platform.ready().then(() => {
      this.initMap();
    });
  }

  initMap() {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.geocoder = new google.maps.Geocoder;
      this.infowindow = new google.maps.InfoWindow;
      let mylocation = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      this.map = new google.maps.Map(this.mapElement.nativeElement, {
        zoom: 15,
        center: mylocation,
        streetViewControl: false,
        mapTypeControl: false
      });

      this.map.addListener('click', data => {
        this.showMap(null);
        this.geoCode(data.latLng);
      });
    });
    let watch = this.geolocation.watchPosition();

    watch.subscribe((data) => {
      let updatelocation = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
      //let image = 'assets/imgs/blue-bike.png';
      this.geoCode(updatelocation);
    });
  }

  geoCode(location) {
    this.geocoder.geocode({ 'location': location }, (results, status) => {
      if (status === 'OK') {
        this.setMarker(location, null);
        if (results[0]) {
          this.infowindow.setContent(results[0].formatted_address);
          this.infowindow.open(this.map, this.marker);
        } else {
          this.infowindow.setContent('Sin datos');
          this.infowindow.open(this.map, this.marker);
        }
      } else {
        this.infowindow.setContent('Sin datos');
        this.infowindow.open(this.map, this.marker);
      }
    });
  }

  setMarker(location, image) {
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: image
    });

    this.showMap(this.map);
  }

  showMap(map) {
    this.marker.setMap(map);
  }

  guardar() {
    this.viewCtrl.dismiss({
      latLng: { latitude: this.marker.position.lat(), longitude: this.marker.position.lng() },
      direccion: this.infowindow.content
    });
  }

  cerrar() {
    this.viewCtrl.dismiss();
  }

}