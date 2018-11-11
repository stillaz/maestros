import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Platform, AlertController, ViewController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GrupoOptions } from '../../interfaces/grupo-options';
import { AngularFirestoreDocument, AngularFirestore } from 'angularfire2/firestore';
import { CameraOptions, Camera } from '@ionic-native/camera';
import { AngularFireStorage } from 'angularfire2/storage';
import firebase from 'firebase';
import { finalize } from 'rxjs/operators';

/**
 * Generated class for the DetalleGrupoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detalle-grupo',
  templateUrl: 'detalle-grupo.html',
})
export class DetalleGrupoPage {

  public todo: FormGroup;
  private grupo: GrupoOptions;
  private filePathData: string;
  public nuevo: boolean = true;
  public mobile: boolean;
  private idempresa: string;

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public plt: Platform,
    private afs: AngularFirestore,
    private formBuilder: FormBuilder,
    public camera: Camera,
    private storage: AngularFireStorage,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController
  ) {
    this.mobile = !plt.is('core');
    this.idempresa = this.navParams.get('idempresa');
    this.grupo = this.navParams.get('data');
    this.updateGrupo();
  }

  updateGrupo() {
    if (!this.grupo) {
      this.grupo = {} as GrupoOptions;
    }

    this.filePathData = 'negocios/' + this.idempresa + '/grupos/';
    const grupoDoc: AngularFirestoreDocument<GrupoOptions> = this.afs.doc<GrupoOptions>(this.filePathData + this.grupo.id);
    grupoDoc.valueChanges().subscribe(data => {
      if (data) {
        this.grupo = data;

        this.nuevo = false;
      }
    });

    this.form();
  }

  form() {
    this.todo = this.formBuilder.group({
      nombre: [this.grupo.nombre, Validators.required],
      imagen: [this.grupo.imagen]
    });
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
      let fileRef = this.storage.ref(this.filePathData + this.todo.value.nombre);
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
      let fileRef = this.storage.ref(this.filePathData + this.todo.value.nombre);
      fileRef.putString(imagen, firebase.storage.StringFormat.DATA_URL).then(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      });
    }).catch(err => alert('Upload Failed' + err));
  }

  seleccionarImagen(event) {
    let imagen = event.target.files[0];
    let fileRef = this.storage.ref(this.filePathData + this.todo.value.nombre);
    let task = this.storage.upload(this.filePathData + this.todo.value.nombre, imagen);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      })
    ).subscribe();
  }

  guardar() {
    const grupo = this.todo.value;
    const id = grupo.nombre;
    const grupoDoc: AngularFirestoreDocument<GrupoOptions> = this.afs.doc<GrupoOptions>(this.filePathData + id);
    if (this.grupo && this.grupo.id !== id) {
      const grupoEliminarDoc: AngularFirestoreDocument<GrupoOptions> = this.afs.doc<GrupoOptions>(this.filePathData + this.grupo.id);
      grupoEliminarDoc.delete();
    }
    this.grupo = grupo;
    this.grupo.id = id;

    grupoDoc.set(this.grupo);
    this.alertCtrl.create({
      title: 'Grupo registrado',
      message: 'El grupo ha sido registrado exitosamente',
      buttons: ['OK']
    }).present();
    this.viewCtrl.dismiss();
  }

  eliminar() {
    this.alertCtrl.create({
      title: 'Eliminar servicio',
      message: '¿Desea eliminar el servicio ' + this.grupo.nombre,
      buttons: [{
        text: 'No',
        role: 'cancel'
      }, {
        text: 'Si',
        handler: () => {
          const filePathEliminar = this.filePathData + this.grupo.id;
          const grupoDoc: AngularFirestoreDocument<GrupoOptions> = this.afs.doc<GrupoOptions>(filePathEliminar);
          grupoDoc.delete().then(() => {
            if (this.grupo.imagen) {
              this.storage.ref(this.filePathData).delete();
            }
            this.alertCtrl.create({
              title: 'Grupo eliminado',
              message: 'El grupo ha sido eliminado exitosamente',
              buttons: ['OK']
            }).present();
            this.viewCtrl.dismiss();
          });
        }
      }]
    }).present();
  }

}
