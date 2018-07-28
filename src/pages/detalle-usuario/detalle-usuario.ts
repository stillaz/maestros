import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform, ActionSheetController, AlertController, ViewController } from 'ionic-angular';
import { UsuarioOptions } from '../../interfaces/usuario-options';
import { AngularFirestore, AngularFirestoreDocument, AngularFirestoreCollection } from 'angularfire2/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from 'angularfire2/storage';
import { finalize } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { FileChooser } from '@ionic-native/file-chooser';
import { PerfilOptions } from '../../interfaces/perfil-options';
import { AngularFireAuth } from 'angularfire2/auth';

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

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public modalCtrl: ModalController,
    public plt: Platform,
    private afs: AngularFirestore,
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private camera: Camera,
    private filePath: FilePath,
    public fileChooser: FileChooser,
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
        perfiles: []
      };
    } else {
      let filePathData = 'usuarios/' + this.usuario.id;
      this.usuarioDoc = this.afs.doc<UsuarioOptions>(filePathData);
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

  seleccionarImagen(event) {
    this.usuario = this.todo.value;
    let filePathData = 'usuarios/' + this.usuario.id;
    let imagen = event.target.files[0];
    let fileRef = this.storage.ref(filePathData);
    let task = this.storage.upload(filePathData, imagen);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      })
    ).subscribe();
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
      this.usuario = this.todo.value;
      let filePathData = 'usuarios/' + this.usuario.id;
      let imagen = "data:image/jpeg;base64," + imageData;
      let fileRef = this.storage.ref(filePathData);
      let task = fileRef.putString(filePathData, imagen);
      task.snapshotChanges().pipe(
        finalize(() => {
          fileRef.getDownloadURL().subscribe(data => {
            this.todo.patchValue({ imagen: data });
          });
        })
      ).subscribe();
    }, (err) => {
      alert(err);
    });
  }

  cargarImagen() {
    this.usuario = this.todo.value;
    let filePathData = 'usuarios/' + this.usuario.id;
    this.fileChooser.open().then(uri => {
      this.filePath.resolveNativePath(uri)
        .then((imagen) => {
          let fileRef = this.storage.ref(filePathData);
          let task = this.storage.upload(filePathData, imagen);
          task.snapshotChanges().pipe(
            finalize(() => {
              fileRef.getDownloadURL().subscribe(data => {
                this.todo.patchValue({ imagen: data });
              });
            })
          ).subscribe();
        })
    })
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
      perfiles: this.todo.value.perfiles
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
