import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController } from 'ionic-angular';
/*import { UsuarioProvider } from '../../providers/usuario/usuario';
import { Usuario } from '../../providers/usuario/usuario-class';*/

/**
 * Generated class for the UsuariosPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-usuarios',
  templateUrl: 'usuarios.html',
})
export class UsuariosPage {

  usuarios: any[];
  clave2: string;

  /*constructor(public navCtrl: NavController, public navParams: NavParams, usuario: UsuarioProvider, public modalCtrl: ModalController) {
    this.usuarios = usuario.getUsuarios();
  }*/

  ionViewDidLoad() {
    console.log('ionViewDidLoad UsuariosPage');
  }

  agregar(){
    //this.navCtrl.push('DetalleUsuarioPage', new Usuario(null, null, null, null, null, true));
  }

}
