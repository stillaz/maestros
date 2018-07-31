import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreCollection, AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { EmpresaOptions } from '../../interfaces/empresa-options';
import { AngularFireAuth } from '../../../node_modules/angularfire2/auth';

/**
 * Generated class for the EmpresaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-empresa',
  templateUrl: 'empresa.html',
})
export class EmpresaPage {

  empresasCollection: AngularFirestoreCollection<EmpresaOptions>;
  empresas: EmpresaOptions[];

  pages = [
    { title: 'Servicios', component: 'ServicioPage', icon: 'timer' },
    { title: 'Perfiles', component: 'PerfilPage', icon: 'contacts' },
    { title: 'Usuarios', component: 'UsuarioPage', icon: 'contact' }
  ];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    private afa: AngularFireAuth
  ) {
    this.empresasCollection = this.afs.collection<EmpresaOptions>('negocios');
    this.updateEmpresas();
  }

  updateEmpresas() {
    this.empresasCollection.valueChanges().subscribe(data => {
      this.empresas = data;
    });
  }

  crear() {
    this.navCtrl.push('DetalleEmpresaPage');
  }

  ver(id: string) {
    this.navCtrl.push('MenuEmpresaPage', {
      idempresa: id
    });
  }

  irA(page: string) {
    this.navCtrl.push(page);
  }

  salir() {
    this.afa.auth.signOut();
  }

}
