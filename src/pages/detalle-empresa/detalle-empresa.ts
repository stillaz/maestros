import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Modal, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '../../../node_modules/@angular/forms';
import { EmpresaOptions } from '../../interfaces/empresa-options';
import { AngularFirestoreDocument, AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { MapPage } from '../map/map';
import { DireccionOptions } from '../../interfaces/direccion-options';
import { CameraOptions, Camera } from '../../../node_modules/@ionic-native/camera';
import firebase from 'firebase';
import { AngularFireStorage } from '../../../node_modules/angularfire2/storage';
import { finalize } from 'rxjs/operators';

/**
 * Generated class for the DetalleEmpresaPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detalle-empresa',
  templateUrl: 'detalle-empresa.html',
})
export class DetalleEmpresaPage {

  todo: FormGroup;
  empresa: EmpresaOptions;
  empresaDoc: AngularFirestoreDocument<EmpresaOptions>;
  nuevo: boolean = true;
  mapa: Modal;
  filePathData: string;
  negocios: string[];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    public modalCtrl: ModalController,
    private camera: Camera,
    private storage: AngularFireStorage,
    public alertCtrl: AlertController
  ) {
    this.updateNegocios();
    this.updateEmpresa();
  }

  updateNegocios() {
    let negocioDoc: AngularFirestoreDocument<any> = this.afs.doc<any>('clases/Negocios');
    negocioDoc.valueChanges().subscribe(data => {
      if (data) {
        this.negocios = data.data;
      }
    });
  }

  updateEmpresa() {
    if (!this.empresa) {
      this.empresa = {} as EmpresaOptions;
      this.empresa.direccion = {} as DireccionOptions;
      this.empresa.id = this.afs.createId();
      this.form();
    }
    this.filePathData = 'negocios/' + this.empresa.id;
    this.empresaDoc = this.afs.doc<EmpresaOptions>(this.filePathData);
    this.empresaDoc.valueChanges().subscribe(data => {
      if (data) {
        this.empresa = data;

        this.nuevo = false;
        this.form();
      }
    });
  }

  form() {
    this.todo = this.formBuilder.group({
      negocio: [this.empresa.negocio, Validators.required],
      nombre: [this.empresa.nombre, Validators.required],
      telefono: [this.empresa.telefono, Validators.required],
      direccion: [this.empresa.direccion.direccion, Validators.required],
      imagen: [this.empresa.imagen, Validators.required],
      nombreRepresentante: [this.empresa.nombreRepresentante, Validators.required],
      telefonoRepresentante: [this.empresa.telefonoRepresentante, Validators.required],
      correoRepresentante: [this.empresa.correoRepresentante, Validators.required]
    });
  }

  maps() {
    this.mapa = this.modalCtrl.create(MapPage, {
      negocio: this.todo.value.negocio
    });
    this.mapa.onDidDismiss(data => {
      if (data) {
        this.empresa.direccion = data;
        this.todo.patchValue({ direccion: this.empresa.direccion.direccion });
      }
    });
    this.mapa.present();
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
    let negocio = this.todo.value;
    this.empresa.nombre = negocio.nombre;
    this.empresa.telefono = negocio.telefono;
    this.empresa.imagen = negocio.imagen;
    this.empresa.negocio = negocio.negocio;
    this.empresa.nombreRepresentante = negocio.nombreRepresentante;
    this.empresa.telefonoRepresentante = negocio.telefonoRepresentante;
    this.empresa.correoRepresentante = negocio.correoRepresentante;

    this.empresaDoc.set(this.empresa);

    let alert = this.nuevo ? this.alertCtrl.create({
      title: 'Usuario registrado',
      message: 'El usuario ha sido registrado exitosamente',
      buttons: ['OK']
    }) : this.alertCtrl.create({
      title: 'Usuario actualizado',
      message: 'El usuario ha sido actualizado exitosamente',
      buttons: ['OK']
    });
    alert.present();
    this.navCtrl.pop();
  }
}
