import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreDocument, AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { EmpresaOptions } from '../../interfaces/empresa-options';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  pages: any[] = [
    { title: 'Empresas', component: 'EmpresaPage', icon: 'alert' },
    { title: 'Perfiles', component: 'PerfilPage', icon: 'alert' },
    { title: 'Servicios', component: 'ServicioPage', icon: 'alert' },
    { title: 'Usuarios', component: 'UsuarioPage', icon: 'alert' }
  ];

  empresaDoc: AngularFirestoreDocument<EmpresaOptions>;
  empresa: EmpresaOptions;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore
  ) {
    let idnegocio = this.navParams.get('id');
    this.empresaDoc = this.afs.doc('negocios/' + idnegocio);
  }

  updateNegocio() {
    this.empresaDoc.valueChanges().subscribe(data => {
      this.empresa = data;
    });
  }

  openPage(page) {
    this.navCtrl.push(page.component);
  }

}
