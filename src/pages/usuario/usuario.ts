import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, ActionSheetController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { UsuarioOptions } from '../../interfaces/usuario-options';
import { PerfilOptions } from '../../interfaces/perfil-options';

/**
 * Generated class for the UsuarioPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-usuario',
  templateUrl: 'usuario.html',
})
export class UsuarioPage {

  usuarios: UsuarioOptions[];
  perfilSeleccion: PerfilOptions = {
    id: null,
    nombre: 'Todos los perfiles',
    imagen: null,
    servicios: null,
    activo: null,
    idempresa: null
  };
  perfiles: PerfilOptions[];

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    private afs: AngularFirestore,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.updatePerfiles();
  }

  ionViewDidEnter() {
    this.initialUpdate();
  }

  initialUpdate() {
    let usuariosCollection: AngularFirestoreCollection<UsuarioOptions>;
    usuariosCollection = this.afs.collection<UsuarioOptions>('usuarios');
    usuariosCollection.valueChanges().subscribe(data => {
      if (data) {
        this.usuarios = data;
        this.perfilSeleccion = {
          id: null,
          nombre: 'Todos los perfiles',
          imagen: null,
          servicios: null,
          activo: null,
          idempresa: null
        };
      }
    });
  }

  updatePerfiles() {
    let perfilesCollection: AngularFirestoreCollection<PerfilOptions>;
    perfilesCollection = this.afs.collection<PerfilOptions>('perfiles');
    perfilesCollection.valueChanges().subscribe(data => {
      if (data) {
        this.perfiles = data;
      }
    });
  }

  crear() {
    this.navCtrl.push('DetalleUsuarioPage');
  }

  ver(usuario: UsuarioOptions) {
    this.navCtrl.push('DetalleUsuarioPage', {
      usuario: usuario
    });
  }

  filtrosPerfiles() {
    let filtros: any = [];
    let todosPerfiles: PerfilOptions = {
      id: null,
      nombre: 'Todos los perfiles',
      imagen: null,
      servicios: null,
      activo: null,
      idempresa: null
    }
    filtros.push({
      text: todosPerfiles.nombre, handler: () => {
        this.initialUpdate();
        this.perfilSeleccion = todosPerfiles;
      }
    });

    this.perfiles.forEach(perfil => {
      filtros.push({
        text: perfil.nombre,
        handler: () => {
          let usuariosCollection: AngularFirestoreCollection<UsuarioOptions>;
          usuariosCollection = this.afs.collection<UsuarioOptions>('usuarios');
          usuariosCollection.valueChanges().subscribe(data => {
            if (data) {
              this.usuarios = data.filter(usuario => usuario.perfiles.some(item => item.id === perfil.id));
            }
            this.perfilSeleccion = perfil;
          });
        }
      });
    });

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Perfiles',
      buttons: filtros,
      cssClass: 'actionSheet1'
    });
    actionSheet.present();
  }

}
