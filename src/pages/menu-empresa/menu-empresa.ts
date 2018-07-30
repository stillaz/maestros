import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { AngularFirestoreDocument, AngularFirestore, AngularFirestoreCollection } from '../../../node_modules/angularfire2/firestore';
import { EmpresaOptions } from '../../interfaces/empresa-options';
import { ServicioOptions } from '../../interfaces/servicio-options';

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
  servicioCollecion: AngularFirestoreCollection<ServicioOptions>;
  perfilCollecion: AngularFirestoreCollection<ServicioOptions>;
  usuarioCollecion: AngularFirestoreCollection<ServicioOptions>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    public alertCtrl: AlertController
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
      if (data) {
        this.servicioCollecion = this.empresaDoc.collection('servicios');
        this.servicioCollecion.valueChanges().subscribe(servicios => {
          this.opciones[0].datos = servicios;
        });

        this.perfilCollecion = this.empresaDoc.collection('perfiles');
        this.perfilCollecion.valueChanges().subscribe(perfiles => {
          this.opciones[1].datos = perfiles;
        });

        this.usuarioCollecion = this.empresaDoc.collection('usuarios');
        this.usuarioCollecion.valueChanges().subscribe(usuarios => {
          this.opciones[2].datos = usuarios;
        });
      }
    });
  }

  updateDataPredeterminado(grupo) {
    return new Promise<any[]>(resolve => {
      this.afs.collection<any>(grupo).valueChanges().subscribe(data => {
        resolve(data);
      });
    });
  }

  agregarPredeterminados(grupo: string) {
    this.updateDataPredeterminado(grupo).then(data => {
      let batch = this.afs.firestore.batch();
      data.forEach(opcion => {
        let opcionDoc = this.empresaDoc.collection(grupo).doc(opcion.id);
        batch.set(opcionDoc.ref, opcion);
      });

      batch.commit().then(() => {
        this.alertCtrl.create({
          title: grupo + 's registrados',
          message: 'Se ha registrado los ' + grupo + 's.',
          buttons: [{
            text: 'OK'
          }],
        }).present();
      });
    });
  }

  irA(grupo) {
    switch (grupo) {
      case 'Servicios': {
        this.navCtrl.push('DetalleServicioPage', {
          idempresa: this.empresa.id
        });
        break;
      }

      case 'Perfiles': {
        this.navCtrl.push('DetallePerfilPage', {
          idempresa: this.empresa.id
        });
        break;
      }

      case 'Usuarios': {
        this.navCtrl.push('DetalleUsuarioPage', {
          idempresa: this.empresa.id
        });
        break;
      }
    }
  }

  crear(grupo: string) {
    let col = grupo.toLowerCase();
    if (grupo === 'Usuarios') {
      this.irA(grupo);
    } else if (this.opciones.find(opcion => opcion.grupo === grupo).datos.length === 0) {
      this.alertCtrl.create({
        title: 'Agregar ' + col,
        message: '¿Desea agregar los ' + col + ' predefinidos?',
        buttons: [{
          text: 'No',
          handler: () => {
            this.irA(grupo);
          }
        }, {
          text: 'Si',
          handler: () => {
            this.agregarPredeterminados(col)
          }
        }]
      }).present();
    } else {
      this.irA(grupo);
    }
  }

  ver(grupo: string, data) {
    switch (grupo) {
      case 'Servicios': {
        this.navCtrl.push('DetalleServicioPage', {
          idempresa: this.empresa.id,
          servicio: data
        });
        break;
      }

      case 'Perfiles': {
        this.navCtrl.push('DetallePerfilPage', {
          idempresa: this.empresa.id,
          perfil: data
        });
        break;
      }

      case 'Usuarios': {
        this.navCtrl.push('DetalleUsuarioPage', {
          idempresa: this.empresa.id,
          usuario: data
        });
        break;
      }
    }
  }

}
