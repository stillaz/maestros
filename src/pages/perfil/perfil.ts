import { Component } from '@angular/core';
import { IonicPage, NavController, ActionSheetController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { PerfilOptions } from '../../interfaces/perfil-options';

/**
 * Generated class for the PerfilPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-perfil',
  templateUrl: 'perfil.html',
})
export class PerfilPage {

  perfiles: PerfilOptions[];

  constructor(
    private afs: AngularFirestore,
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.initialUpdate();
  }

  initialUpdate() {
    let perfilCollection: AngularFirestoreCollection<PerfilOptions>;
    perfilCollection = this.afs.collection<PerfilOptions>('perfiles');
    perfilCollection.valueChanges().subscribe(data => {
      if (data) {
        this.perfiles = data;
      }
    });
  }

  crear() {
    this.navCtrl.push('DetallePerfilPage');
  }

  ver(perfil: PerfilOptions) {
    this.navCtrl.push('DetallePerfilPage', {
      perfil: perfil
    });
  }
}
