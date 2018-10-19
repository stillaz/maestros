import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AngularFirestore } from 'angularfire2/firestore';
import { AngularFireAuth } from 'angularfire2/auth';
import { UsuarioOptions } from '../interfaces/usuario-options';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage: any = 'LogueoPage';

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen, afa: AngularFireAuth, afs: AngularFirestore) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      afa.auth.onAuthStateChanged(user => {
        if (user) {
          afs.doc<UsuarioOptions>('usuarios/' + user.uid).valueChanges().subscribe(data => {
            if (data && data.perfiles.some(perfil => perfil.nombre === 'SA')) {
              this.rootPage = 'EmpresaPage';
            } else {
              alert('No fue posible conectar con el servidor.');
              this.rootPage = 'LogueoPage';
            }
          });
        } else {
          this.rootPage = 'LogueoPage';
        }
      });
    });
  }
}

