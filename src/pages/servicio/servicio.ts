import { Component } from '@angular/core';
import { IonicPage, NavController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { ServicioOptions } from '../../interfaces/servicio-options';

/**
 * Generated class for the ServicioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-servicio',
  templateUrl: 'servicio.html',
})
export class ServicioPage {

  private serviciosCollection: AngularFirestoreCollection<ServicioOptions>;
  public grupoServicios: any[];

  constructor(private afs: AngularFirestore, public navCtrl: NavController) {
    this.serviciosCollection = this.afs.collection<ServicioOptions>('servicios');
    this.serviciosCollection.valueChanges().subscribe(data => {
      if (data) {
        this.updateServicios(data);
      }
    });
  }

  updateServicios(servicios: ServicioOptions[]) {
    let grupos = [];
    this.grupoServicios = [];
    servicios.forEach(servicio => {
      let grupo = servicio.grupo;
      if (grupos[grupo] === undefined) {
        grupos[grupo] = [];
      }
      grupos[grupo].push(servicio);
    });

    for (let grupo in grupos) {
      this.grupoServicios.push({ grupo: grupo, servicios: grupos[grupo] });
    }
  }

  crear() {
    this.navCtrl.push('DetalleServicioPage');
  }

  ver(servicio: ServicioOptions) {
    this.navCtrl.push('DetalleServicioPage', {
      servicio: servicio
    });
  }

}
