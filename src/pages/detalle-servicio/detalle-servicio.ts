import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, AlertController, ViewController, ModalController, Platform } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { ServicioOptions } from '../../interfaces/servicio-options';
import { finalize } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera';
import firebase from 'firebase';

/**
 * Generated class for the DetalleServicioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detalle-servicio',
  templateUrl: 'detalle-servicio.html',
})
export class DetalleServicioPage {

  todo: FormGroup;
  nuevo: boolean = true;
  mobile: boolean;
  filePathData: string;
  public servicio: ServicioOptions;
  private servicioDoc: AngularFirestoreDocument<ServicioOptions>;
  idempresa: string;
  negocios: string[];
  grupos: string[];

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
    this.servicio = this.navParams.get('servicio');
    this.updateGrupos();
    this.updateNegocios();
    this.updateServicio();
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
      id: [this.servicio.id, Validators.required],
      nombre: [this.servicio.nombre, Validators.required],
      descripcion: [this.servicio.descripcion, Validators.required],
      duracion_MIN: [this.servicio.duracion_MIN, Validators.required],
      valor: [this.servicio.valor, Validators.required],
      grupo: [this.servicio.grupo, Validators.required],
      imagen: [this.servicio.imagen],
      negocio: [this.servicio.negocio, Validators.required]
    });
  }

  updateServicio() {
    if (!this.servicio) {
      this.servicio = {
        id: this.afs.createId(),
        nombre: null,
        descripcion: null,
        duracion_MIN: null,
        valor: null,
        grupo: null,
        imagen: null,
        activo: true,
        idempresa: null,
        negocio: null
      };
    }

    this.filePathData = this.idempresa ? 'negocios/' + this.idempresa + '/servicios/' + this.servicio.id : 'servicios/' + this.servicio.id;
    this.servicioDoc = this.afs.doc<ServicioOptions>(this.filePathData);
    this.servicioDoc.valueChanges().subscribe(data => {
      if (data) {
        this.servicio = data;

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

  guardar() {
    this.servicio = this.todo.value;
    if (this.idempresa) {
      this.servicio.idempresa = this.idempresa
    }
    this.servicioDoc.set(this.servicio);
    let alert = this.alertCtrl.create({
      title: 'Servicio registrado',
      message: 'El servicio ha sido registrado exitosamente',
      buttons: ['OK']
    });
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
    let servicio: ServicioOptions = this.todo.value;
    let alert = this.alertCtrl.create({
      title: 'Eliminar servicio',
      message: '¿Desea eliminar el servicio ' + servicio.nombre,
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Si',
          handler: () => {
            this.servicioDoc.delete().then(() => {
              if (servicio.imagen) {
                this.storage.ref(this.filePathData).delete();
              }
              this.genericAlert('Eliminar servicio', 'El servicio ha sido eliminado');
            });
          }
        }
      ]
    });
    alert.present();
  }

}
