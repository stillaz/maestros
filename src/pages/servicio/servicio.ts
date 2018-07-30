import { Component } from '@angular/core';
import { IonicPage, NavController, ActionSheetController } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { ServicioOptions } from '../../interfaces/servicio-options';

/**
 * Generated class for the ServicioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-servicio',
  templateUrl: 'servicio.html',
})
export class ServicioPage {

  grupoServicios: any[];
  grupoSeleccion: string;
  grupos: any[] = [];
  servicios: ServicioOptions[];

  constructor(
    private afs: AngularFirestore,
    public navCtrl: NavController,
    public actionSheetCtrl: ActionSheetController
  ) {
    this.initialUpdate();
  }

  ionViewWillEnter() {
    this.grupoSeleccion = 'Todos los grupos';
  }

  initialUpdate() {
    let serviciosCollection: AngularFirestoreCollection<ServicioOptions>;
    serviciosCollection = this.afs.collection<ServicioOptions>('servicios');
    serviciosCollection.valueChanges().subscribe(data => {
      this.servicios = data;
      this.grupoServicios = [];
      if (data) {
        this.loadGrupos().then(grupos => {
          if (grupos) {
            grupos.forEach(grupo => {
              this.updateServicios(grupo);
            });
          }
        });
        this.grupoSeleccion = 'Todos los grupos';
      }
    });
  }

  loadGrupos() {
    return new Promise<string[]>(resolve => {
      this.afs.doc<any>('clases/Grupos').valueChanges().subscribe(data => {
        resolve(data ? data.data : null);
      });
    });
  }

  updateServicios(grupo) {
    let serviciosEncontrados = this.servicios.filter(servicio => servicio.grupo.find(grupoServicio => grupoServicio === grupo));
    if (serviciosEncontrados[0]) {
      if (!this.grupos.find(item => item === grupo)) this.grupos.push(grupo);
      this.grupoServicios.push({ grupo: grupo, servicios: serviciosEncontrados });
    }
  }

  crear() {
    this.navCtrl.push('DetalleServicioPage');
  }

  ver(servicio: ServicioOptions) {
    this.navCtrl.push('DetalleServicioPage', {
      servicio: servicio
    });
  }

  filtrosGrupos() {
    let filtros: any = [];
    filtros.push({
      text: 'Todos los grupos', handler: () => {
        this.initialUpdate();
        this.grupoSeleccion = 'Todos los grupos';
      }
    });

    this.grupos.forEach(grupo => {
      filtros.push({
        text: grupo,
        handler: () => {
          this.grupoServicios = [];
          this.updateServicios(grupo);
          this.grupoSeleccion = grupo;
        }
      });
    });

    let actionSheet = this.actionSheetCtrl.create({
      title: 'Grupos',
      buttons: filtros,
      cssClass: 'actionSheet1'
    });
    actionSheet.present();
  }

}
