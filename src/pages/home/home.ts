import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  pages: any[] = [
    { title: 'Servicios', component: 'ServicioPage', icon: 'alert' },
    { title: 'Perfiles', component: 'PerfilPage', icon: 'alert' }
  ];

  constructor(public navCtrl: NavController) {

  }

  openPage(page){
    this.navCtrl.push(page.component);
  }

}
