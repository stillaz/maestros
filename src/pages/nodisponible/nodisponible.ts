import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from '../../../node_modules/angularfire2/firestore';

/**
 * Generated class for the NodisponiblePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-nodisponible',
  templateUrl: 'nodisponible.html',
})
export class NodisponiblePage {

  idempresa: string;
  noDisponibleCollection: AngularFirestoreCollection;
  noDisponible: any[];
  filePath: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    public alertCtrl: AlertController,
  ) {
    this.idempresa = this.navParams.get('idempresa');
    this.filePath = 'negocios/' + this.idempresa + '/indisponibilidades';
    this.noDisponibleCollection = this.afs.collection(this.filePath);
    this.updateHorarioNoDisponible();
  }

  genericAlert(titulo: string, mensaje: string) {
    let mensajeAlert = this.alertCtrl.create({
      title: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    mensajeAlert.present();
  }

  updateHorarioNoDisponible() {
    this.noDisponibleCollection.valueChanges().subscribe(data => {
      this.noDisponible = data;
    });
  }

  eliminar(noDisponible) {
    let noDisponibleDoc = this.noDisponibleCollection.doc(noDisponible.id);
    noDisponibleDoc.delete().then(() => {
      this.genericAlert('Hora de no disponibilidad', 'La hora de no disponibilidad ha sido eliminada');
    }).catch(err => this.genericAlert('Hora de no disponibilidad', err));
  }

}
