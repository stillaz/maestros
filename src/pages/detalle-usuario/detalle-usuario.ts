import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, ActionSheetController, AlertController, ViewController } from 'ionic-angular';
import { UsuarioOptions } from '../../interfaces/usuario-options';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from 'angularfire2/storage';
import { finalize } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { PerfilOptions } from '../../interfaces/perfil-options';
import { AngularFireAuth } from 'angularfire2/auth';
import firebase from 'firebase';

/**
 * Generated class for the DetalleUsuarioPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */
@IonicPage()
@Component({
  selector: 'page-detalle-usuario',
  templateUrl: 'detalle-usuario.html',
})
export class DetalleUsuarioPage {

  usuario: UsuarioOptions;
  mobile: boolean;
  private usuarioDoc: AngularFirestoreDocument<UsuarioOptions>;
  nuevo: boolean = true;
  todo: FormGroup;
  perfiles: PerfilOptions[];
  filePathData: string;
  idempresa: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public plt: Platform,
    private afs: AngularFirestore,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private camera: Camera,
    public actionSheetCtrl: ActionSheetController,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    private afa: AngularFireAuth
  ) {
    this.mobile = !plt.is('core');
    this.usuario = this.navParams.get('usuario');
    this.updateUsuario();
    this.updatePerfiles();
  }

  updateUsuario() {
    if (!this.usuario) {
      this.usuario = {
        id: null,
        nombre: null,
        telefono: null,
        email: null,
        imagen: null,
        activo: true,
        perfiles: [],
        idempresa: this.idempresa
      };
    } else {
      this.filePathData = 'negocios/' + this.idempresa + '/usuarios/' + this.usuario.id;
      this.usuarioDoc = this.afs.doc<UsuarioOptions>(this.filePathData);
      this.usuarioDoc.valueChanges().subscribe(data => {
        if (data) {
          this.usuario = data;

          this.nuevo = false;
        }
      });
    }

    this.form();
  }

  updatePerfiles() {
    let perfilesCollection: AngularFirestoreCollection<PerfilOptions>;
    perfilesCollection = this.afs.collection<PerfilOptions>('perfiles');
    perfilesCollection.valueChanges().subscribe(data => {
      this.perfiles = data;
    });
  }

  form() {
    this.todo = this.formBuilder.group({
      id: [this.usuario.id],
      nombre: [this.usuario.nombre, Validators.required],
      telefono: [this.usuario.telefono, Validators.required],
      email: [this.usuario.email, Validators.required],
      clave: [''],
      perfiles: [this.usuario.perfiles, Validators.required],
      imagen: [this.usuario.imagen],
      activo: [this.usuario.activo, Validators.required]
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

  compareFn(p1: PerfilOptions, p2: PerfilOptions): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  guardar() {
    let usuario = this.todo.value;
    this.usuario = {
      id: usuario.id,
      nombre: usuario.nombre,
      telefono: usuario.telefono,
      email: usuario.email,
      imagen: usuario.imagen,
      activo: true,
      perfiles: this.todo.value.perfiles,
      idempresa: this.idempresa
    };

    if (this.nuevo) {
      this.afa.auth.createUserWithEmailAndPassword(usuario.email, usuario.clave).then(data => {
        if (data) {
          let id = data.user.uid;
          let filePathData = 'usuarios/' + id;
          this.usuarioDoc = this.afs.doc<UsuarioOptions>(filePathData);
          this.usuario.id = id;
          this.usuarioDoc.set(this.usuario);
          let alert = this.alertCtrl.create({
            title: 'Usuario registrado',
            message: 'El usuario ha sido registrado exitosamente',
            buttons: ['OK']
          });
          alert.present();
          this.viewCtrl.dismiss();
        }
      });
    } else {
      this.usuarioDoc.set(this.usuario);
      let alert = this.alertCtrl.create({
        title: 'Usuario actualizado',
        message: 'El usuario ha sido actualizado exitosamente',
        buttons: ['OK']
      });
      alert.present();
      this.viewCtrl.dismiss();
    }
  }

  cerrar() {
    this.viewCtrl.dismiss();
  }
}
