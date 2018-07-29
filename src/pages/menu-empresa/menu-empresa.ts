import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { AngularFirestoreDocument, AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { EmpresaOptions } from '../../interfaces/empresa-options';

/**
 * Generated class for the MenuEmpresaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-menu-empresa',
  templateUrl: 'menu-empresa.html',
})
export class MenuEmpresaPage {

  empresaDoc: AngularFirestoreDocument<EmpresaOptions>;
  empresa: EmpresaOptions;
  opciones: any[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore
  ) {
    let idnegocio = this.navParams.get('idempresa');
    this.empresaDoc = this.afs.doc<EmpresaOptions>('negocios/' + idnegocio);
    this.updateNegocio();
    this.opciones = [
      {
        grupo: 'Servicios',
        datos: []
      },
      {
        grupo: 'Perfiles',
        datos: []
      },
      {
        grupo: 'Usuarios',
        datos: []
      },
    ]
  }

  updateNegocio() {
    this.empresaDoc.valueChanges().subscribe(data => {
      this.empresa = data;
    });
  }

  crear(grupo: string) {
    switch (grupo) {
      case 'Servicios': {
        this.navCtrl.push('DetalleServicioPage');
        break;
      }

      case 'Perfiles': {
        this.navCtrl.push('DetallePerfilPage');
        break;
      }

      case 'Usuarios': {
        this.navCtrl.push('DetalleUsuarioPage');
        break;
      }
    }
  }

  ver(grupo: string, data) {
    switch (grupo) {
      case 'Servicios': {
        this.navCtrl.push('DetalleServicioPage', {
          servicio: data
        });
        break;
      }

      case 'Perfiles': {
        this.navCtrl.push('DetallePerfilPage', {
          perfil: data
        });
        break;
      }

      case 'Usuarios': {
        this.navCtrl.push('DetalleUsuarioPage', {
          usuario: data
        });
        break;
      }
    }
  }

}
