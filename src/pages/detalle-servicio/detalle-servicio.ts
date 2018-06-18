import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicPage, NavController, NavParams, AlertController, ViewController, ModalController, Platform } from 'ionic-angular';
import { AngularFirestore, AngularFirestoreDocument } from 'angularfire2/firestore';
import { AngularFireStorage } from 'angularfire2/storage';
import { ServicioOptions } from '../../interfaces/servicio-options';
import { FileChooser } from '@ionic-native/file-chooser';
import { finalize } from 'rxjs/operators';

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

  filePath: string;

  public servicio: ServicioOptions;

  private servicioDoc: AngularFirestoreDocument<ServicioOptions>;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    public alertCtrl: AlertController,
    public viewCtrl: ViewController,
    private formBuilder: FormBuilder,
    public modalCtrl: ModalController,
    public plt: Platform,
    public fileChooser: FileChooser,
    private storage: AngularFireStorage
  ) {
    this.mobile = !plt.is('core');
    this.servicio = this.navParams.get('servicio');
    this.cargar();
  }

  form() {
    this.todo = this.formBuilder.group({
      id: [this.servicio.id, Validators.required],
      nombre: [this.servicio.nombre, Validators.required],
      descripcion: [this.servicio.descripcion, Validators.required],
      duracion_MIN: [this.servicio.duracion_MIN, Validators.required],
      valor: [this.servicio.valor, Validators.required],
      grupo: [this.servicio.grupo],
      imagen: [this.servicio.imagen],
      activo: [this.servicio.activo, Validators.required]
    });
  }

  cargar() {
    if (!this.servicio) {
      this.servicio = {
        id: new Date().getTime(),
        nombre: null,
        descripcion: null,
        duracion_MIN: null,
        valor: null,
        grupo: null,
        imagen: null,
        activo: true
      };
    }

    this.filePath = 'servicios/' + this.servicio.id;
    this.servicioDoc = this.afs.doc<ServicioOptions>(this.filePath);
    this.servicioDoc.valueChanges().subscribe(data => {
      if (data) {
        this.servicio = data;

        this.nuevo = false;
      }
    });

    this.form();
  }

  seleccionarImagen(event) {
    let imagen = event.target.files[0];
    this.uploadImage(imagen);
  }

  uploadImage(file) {
    let fileRef = this.storage.ref(this.filePath);
    let task = this.storage.upload(this.filePath, file);
    task.snapshotChanges().pipe(
      finalize(() => {
        fileRef.getDownloadURL().subscribe(data => {
          this.todo.patchValue({ imagen: data });
        });
      })
    ).subscribe();
  }

  cargarImagen() {
    this.fileChooser.open();
  }

  guardar() {
    this.servicio = this.todo.value;
    this.servicioDoc.set(this.servicio);
    let alert = this.alertCtrl.create({
      title: 'Servicio registrado',
      message: 'El servicio ha sido registrado exitosamente',
      buttons: ['OK']
    });
    alert.present();
    this.viewCtrl.dismiss();
  }

  menu() {
    let grupo = this.todo.value.grupo;
    let menu = this.modalCtrl.create('GruposServicioPage', { grupo: grupo });
    menu.present();
    menu.onDidDismiss(data => {
      this.todo.patchValue({ grupo: data });
    });
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
    let producto = this.todo.value;
    let alert = this.alertCtrl.create({
      title: 'Eliminar producto',
      message: '¿Desea eliminar el producto ' + producto.descripcion + ' ' + producto.marca + '?',
      buttons: [
        {
          text: 'No',
          role: 'cancel'
        },
        {
          text: 'Si',
          handler: () => {
            this.servicioDoc.delete().then(() => {
              this.storage.ref(this.filePath).delete();
              this.genericAlert('Eliminar producto', 'El producto ha sido eliminado');
            });
          }
        }
      ]
    });
    alert.present();
  }

}
