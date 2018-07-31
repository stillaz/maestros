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
        grupo: 'Horarios',
        datos: [],
        page: 'HorarioPage'
      },
      {
        grupo: 'Servicios',
        datos: [],
        page: 'DetalleServicioPage'
      },
      {
        grupo: 'Perfiles',
        datos: [],
        page: 'DetallePerfilPage'
      },
      {
        grupo: 'Usuarios',
        datos: [],
        page: 'DetalleUsuarioPage'
      },
    ]
  }

  configurarHorario() {
    if (this.empresa && !this.empresa.configuracion) {
      this.alertCtrl.create({
        title: 'Configuración de horarios',
        message: '¿El negocio no tiene un horario configurado, desea asignarlo?',
        buttons: [{
          text: 'No',
          role: 'cancel'
        }, {
          text: 'Si',
          handler: () => {
            this.navCtrl.push('HorarioPage', {
              idempresa: this.empresa.id
            });
          }
        }]
      }).present();
    }
  }

  updateNegocio() {
    this.empresaDoc.valueChanges().subscribe(data => {
      this.empresa = data;
      if (data) {
        if (!this.empresa.configuracion) {
          this.configurarHorario();
        }

        this.servicioCollecion = this.empresaDoc.collection('servicios');
        this.servicioCollecion.valueChanges().subscribe(servicios => {
          this.opciones[1].datos = servicios;
        });

        this.perfilCollecion = this.empresaDoc.collection('perfiles');
        this.perfilCollecion.valueChanges().subscribe(perfiles => {
          this.opciones[2].datos = perfiles;
        });

        this.usuarioCollecion = this.empresaDoc.collection('usuarios');
        this.usuarioCollecion.valueChanges().subscribe(usuarios => {
          this.opciones[3].datos = usuarios;
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

  crear(grupo) {
    let nombreGrupo = grupo.grupo;
    let col = nombreGrupo.toLowerCase();
    if (nombreGrupo === 'Usuarios') {
      this.ver(grupo.page, null);
    } else if (this.opciones.find(opcion => opcion.grupo === nombreGrupo).datos.length === 0) {
      this.alertCtrl.create({
        title: 'Agregar ' + col,
        message: '¿Desea agregar los ' + col + ' predefinidos?',
        buttons: [{
          text: 'No',
          handler: () => {
            this.ver(grupo.page, null);
          }
        }, {
          text: 'Si',
          handler: () => {
            this.agregarPredeterminados(col)
          }
        }]
      }).present();
    } else {
      this.ver(grupo.page, null);
    }
  }

  ver(grupo, data) {
    this.navCtrl.push(grupo.page, {
      idempresa: this.empresa.id,
      servicio: data
    });
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
    this.opciones[1].datos.forEach(servicios => {
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
            if (this.opciones[1].datos[0]) {
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

  editar() {
    this.navCtrl.push('DetalleEmpresaPage', {
      empresa: this.empresa
    });
  }

}
