import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, Platform, ViewController, NavParams } from 'ionic-angular';
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
  imagen: string;
  watch: any;
  inicial: boolean = true;

  constructor(
    public navCtrl: NavController,
    public platform: Platform,
    private geolocation: Geolocation,
    public viewCtrl: ViewController,
    public navParams: NavParams
  ) {
    let negocio = this.navParams.get('negocio');
    switch (negocio) {
      case 'Barbería':
        this.imagen = 'assets/imgs/barberia-mark.png';
        break;
    }
    platform.ready().then(() => {
      this.initMap();
    });
  }

  initMap() {
    this.geocoder = new google.maps.Geocoder;
    this.infowindow = new google.maps.InfoWindow;
    let watch = this.geolocation.watchPosition();

    this.watch = watch.subscribe((data) => {
      let mylocation = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
      if (this.inicial) {
        this.map = new google.maps.Map(this.mapElement.nativeElement, {
          zoom: 15,
          center: mylocation,
          streetViewControl: false,
          mapTypeControl: false
        });
        this.inicial = false;
      }

      this.map.addListener('click', data => {
        this.showMap(null);
        this.geoCode(data.latLng);
      });

      let updatelocation = new google.maps.LatLng(data.coords.latitude, data.coords.longitude);
      this.geoCode(updatelocation);
    });
  }

  geoCode(location) {
    this.geocoder.geocode({ 'location': location }, (results, status) => {
      if (status === 'OK') {
        this.setMarker(location);
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

  setMarker(location) {
    this.marker = new google.maps.Marker({
      position: location,
      map: this.map,
      icon: this.imagen
    });

    this.showMap(this.map);
  }

  showMap(map) {
    this.marker.setMap(map);
  }

  guardar() {
    this.watch.unsubscribe();
    this.viewCtrl.dismiss({
      latLng: { latitude: this.marker.position.lat(), longitude: this.marker.position.lng() },
      direccion: this.infowindow.content
    });
  }

  cerrar() {
    this.watch.unsubscribe();
    this.viewCtrl.dismiss();
  }

}