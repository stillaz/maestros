import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, AlertController, ViewController, ModalController, Platform } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { PerfilOptions } from '../../interfaces/perfil-options';
import { finalize } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ServicioOptions } from '../../interfaces/servicio-options';
import firebase from 'firebase';

/**
 * Generated class for the DetallePerfilPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detalle-perfil',
  templateUrl: 'detalle-perfil.html',
})
export class DetallePerfilPage {

  todo: FormGroup;
  nuevo: boolean = true;
  mobile: boolean;
  filePathData: string;
  perfil: PerfilOptions;
  servicios: ServicioOptions[];
  idempresa: string;
  grupos: string[];
  negocios: string[];
  filePathServicios: string;

  private perfilDoc: AngularFirestoreDocument<PerfilOptions>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public plt: Platform,
    private storage: AngularFireStorage,
    private camera: Camera,
  ) {
    this.mobile = !plt.is('core');
    this.idempresa = this.navParams.get('idempresa');
    this.perfil = this.navParams.get('perfil');
    this.updateGrupos();
    this.updateNegocios();
    this.cargar();
  }

  updateGrupos() {
    this.afs.doc<any>('clases/Grupos').valueChanges().subscribe(data => {
      if (data) {
        this.grupos = data.data;
      }
    });
  }

  updateNegocios() {
    this.afs.doc<any>('clases/Negocios').valueChanges().subscribe(data => {
      if (data) {
        this.negocios = data.data;
      }
    });
  }

  form() {
    this.todo = this.formBuilder.group({
      id: [this.perfil.id, Validators.required],
      nombre: [this.perfil.nombre, Validators.required],
      imagen: [this.perfil.imagen],
      servicios: [this.perfil.servicios],
      grupo: [this.perfil.grupo, Validators.required],
      negocio: [this.perfil.negocio, Validators.required]
    });
  }

  cargar() {
    if (!this.perfil) {
      this.perfil = {
        id: this.afs.createId(),
        nombre: null,
        imagen: null,
        servicios: null,
        activo: true,
        idempresa: null,
        grupo: null,
        negocio: null
      };
    }

    this.filePathData = this.idempresa ? 'negocios/' + this.idempresa + '/perfiles/' + this.perfil.id : 'perfiles/' + this.perfil.id;
    this.filePathServicios = this.idempresa ? 'negocios/' + this.idempresa + '/servicios/' : 'servicios/';
    this.updateServicios();
    this.perfilDoc = this.afs.doc<PerfilOptions>(this.filePathData);
    this.perfilDoc.valueChanges().subscribe(data => {
      if (data) {
        this.perfil = data;

        this.nuevo = false;
      }
    });

    this.form();
  }

  sacarFoto() {
    let cameraOptions: CameraOptions = {
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      targetWidth: 1000,
      targetHeight: 1000,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.CAMERA,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions).then((imageData) => {
      let imagen = "data:image/jpeg;base64," + imageData;
      let fileRef = this.storage.ref(this.filePathData);
      fileRef.putString(imagen, firebase.storage.StringFormat.DATA_URL).then(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      });
    }).catch(err => alert('Upload Failed' + err));
  }

  cargarImagen() {
    let cameraOptions: CameraOptions = {
      quality: 50,
      encodingType: this.camera.EncodingType.JPEG,
      destinationType: this.camera.DestinationType.DATA_URL,
      sourceType: this.camera.PictureSourceType.PHOTOLIBRARY,
      mediaType: this.camera.MediaType.PICTURE,
      correctOrientation: true
    }

    this.camera.getPicture(cameraOptions).then((imageData) => {
      let imagen = "data:image/jpeg;base64," + imageData;
      let fileRef = this.storage.ref(this.filePathData);
      fileRef.putString(imagen, firebase.storage.StringFormat.DATA_URL).then(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      });
    }).catch(err => alert('Upload Failed' + err));
  }

  seleccionarImagen(event) {
    let imagen = event.target.files[0];
    let fileRef = this.storage.ref(this.filePathData);
    let task = this.storage.upload(this.filePathData, imagen);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      })
    ).subscribe();
  }

  updateServicios() {
    let serviciosCollection: AngularFirestoreCollection<ServicioOptions>;
    serviciosCollection = this.afs.collection<ServicioOptions>(this.filePathServicios);
    serviciosCollection.valueChanges().subscribe(data => {
      if (data) {
        this.servicios = data;
      } else {
        this.servicios = [];
      }
    });
  }

  compareFn(p1: ServicioOptions, p2: ServicioOptions): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  guardar() {
    this.perfil = this.todo.value;
    if (this.idempresa) {
      this.perfil.idempresa = this.idempresa;
    }
    this.perfilDoc.set(this.perfil);
    let alert = this.nuevo ? this.alertCtrl.create({
      title: 'Perfil registrado',
      message: 'El perfil ha sido registrado exitosamente',
      buttons: ['OK']
    }) : this.alertCtrl.create({
      title: 'Perfil actualizado',
      message: 'El perfil ha sido actualizado exitosamente',
      buttons: ['OK']
    });;

    alert.present();
    this.viewCtrl.dismiss();
  }

  cerrar() {
    this.viewCtrl.dismiss();
  }

  genericAlert(title: string, message: string) {
    let alert = this.alertCtrl.create({
      title: title,
      message: message,
      buttons: [{
        text: 'OK',
        handler: () => {
          this.viewCtrl.dismiss();
        }
      }]
    });
    alert.present();
  }

  eliminar() {
    let perfil: PerfilOptions = this.todo.value;
    let alert = this.alertCtrl.create({
      title: 'Eliminar perfil',
      message: '¿Desea eliminar el perfil ' + perfil.nombre,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Si',
          handler: () => {
            this.perfilDoc.delete().then(() => {
              if (perfil.imagen) {
                this.storage.ref(this.filePathData).delete();
              }
              this.genericAlert('Eliminar perfil', 'El perfil ha sido eliminado');
            });
          }
        }
      ]
    });
    alert.present();
  }

}
