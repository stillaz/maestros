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
      this.afs.collection<any>(grupo).valueChanges().subscribe(opciones => {
        let resultado = opciones ? opciones.filter(opcion => opcion.negocio.find(negocio => negocio == this.empresa.negocio)) : null;
        resolve(resultado);
      });
    });
  }

  agregarPredeterminados(grupo: string) {
    this.updateDataPredeterminado(grupo).then(data => {
      if (data && data[0]) {
        let batch = this.afs.firestore.batch();
        data.forEach(opcion => {
          let opcionDoc = this.empresaDoc.collection(grupo).doc(opcion.id);
          opcion.idempresa = this.empresa.id;
          batch.set(opcionDoc.ref, opcion);
        });

        batch.commit().then(() => {
          this.alertCtrl.create({
            title: grupo + ' registrados',
            message: 'Se ha registrado los ' + grupo,
            buttons: [{
              text: 'OK'
            }],
          }).present();
        });
      } else {
        this.alertCtrl.create({
          title: 'Registrar ' + grupo,
          message: 'No hay ' + grupo + 'registrados para ' + this.empresa.negocio,
          buttons: [{
            text: 'OK'
          }],
        }).present();
      }
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

  private actualizarServicioPerfil(idperfil, servicios) {
    this.empresaDoc.collection('perfiles/').doc(idperfil).update({ servicios: servicios }).then(() => {
      this.alertCtrl.create({
        title: 'Perfil actualizado',
        message: 'Se ha registrado los servicios al perfil',
        buttons: [{
          text: 'OK'
        }],
      }).present();
    });
  }

  private agregarServiciosAlert(perfil) {
    let agregarServiciosAlert = this.alertCtrl.create();
    agregarServiciosAlert.setTitle('Agregar servicios');
    agregarServiciosAlert.setMessage('Selecciona los servicios para agregar al perfil');
    this.opciones[0].datos.forEach(servicios => {
      agregarServiciosAlert.addInput({
        type: 'checkbox',
        label: servicios.nombre,
        value: servicios,
        checked: perfil.servicios.some(servicio => servicio.id === servicios.id)
      });
    });

    agregarServiciosAlert.addButton({
      text: 'Cancelar',
      role: 'cancel'
    });

    agregarServiciosAlert.addButton({
      text: 'Guardar',
      handler: data => {
        this.actualizarServicioPerfil(perfil.id, data);
      }
    });

    agregarServiciosAlert.present();
  }

  serviciosPerfil(dato) {
    if (!dato.servicios || !dato.servicios[0]) {
      this.alertCtrl.create({
        title: 'Agregar servicios',
        message: '¿Desea agregar los servicios predefinidos para el perfil?',
        buttons: [{
          text: 'No',
          handler: () => {
            if (this.opciones[0].datos[0]) {
              this.agregarServiciosAlert(dato);
            }
          }
        }, {
          text: 'Si',
          handler: () => {
            this.updateDataPredeterminado('servicios').then(data => {
              let servicios = [];
              dato.grupo.forEach(grupoPerfil => {
                let encontrados = data.filter(servicio =>
                  servicio.grupo.some(grupo => grupo === grupoPerfil)
                );
                servicios.push.apply(servicios, encontrados);
              });

              this.actualizarServicioPerfil(dato.id, servicios);
            });
          }
        }]
      }).present();
    } else {
      this.agregarServiciosAlert(dato);
    }
  }

}
