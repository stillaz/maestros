import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ModalController, Platform } from 'ionic-angular';
import { UsuarioOptions } from '../../interfaces/usuario-options';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from 'angularfire2/storage';
import { finalize } from 'rxjs/operators';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { FilePath } from '@ionic-native/file-path';
import { FileChooser } from '@ionic-native/file-chooser';

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
  filePathData: string;
  private usuarioDoc: AngularFirestoreDocument<UsuarioOptions>;
  nuevo: boolean = true;
  todo: FormGroup;

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
    public fileChooser: FileChooser
  ) {
    this.mobile = !plt.is('core');
    this.usuario = this.navParams.get('usuario');
    this.updateUsuario();
  }

  updateUsuario() {
    if (!this.usuario) {
      this.usuario = {
        id: null,
        nombre: null,
        telefono: null,
        email: null,
        clave: null,
        imagen: null,
        googleUser: null,
        activo: true,
        perfiles: null
      };
    } else {
      this.filePathData = 'usuarios/' + this.usuario.id;
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

  form() {
    this.todo = this.formBuilder.group({
      id: [this.usuario.id, Validators.required],
      nombre: [this.usuario.nombre, Validators.required],
      telefono: [this.usuario.telefono, Validators.required],
      email: [this.usuario.email, Validators.required],
      clave: [this.usuario.clave, Validators.required],
      perfiles: [this.usuario.perfiles, Validators.required],
      imagen: [this.usuario.imagen],
      activo: [this.usuario.activo, Validators.required]
    });
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
      let task = fileRef.putString(this.filePathData, imagen);
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
    this.fileChooser.open().then(uri => {
      this.filePath.resolveNativePath(uri)
        .then((imagen) => {
          let fileRef = this.storage.ref(this.filePathData);
          let task = this.storage.upload(this.filePathData, imagen);
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
}
