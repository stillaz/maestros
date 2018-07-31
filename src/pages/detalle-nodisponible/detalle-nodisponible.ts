import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController } from 'ionic-angular';
import { FormGroup, FormBuilder, Validators } from '../../../node_modules/@angular/forms';
import moment from 'moment';
import { AngularFirestoreDocument, AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { EmpresaOptions } from '../../interfaces/empresa-options';

/**
 * Generated class for the DetalleNodisponiblePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-detalle-nodisponible',
  templateUrl: 'detalle-nodisponible.html',
})
export class DetalleNodisponiblePage {

  repetir = [
    { id: 0, dia: 'Lunes' },
    { id: 1, dia: 'Martes' },
    { id: 2, dia: 'Miércoles' },
    { id: 3, dia: 'Jueves' },
    { id: 4, dia: 'Viernes' },
    { id: 5, dia: 'Sábado' },
    { id: 6, dia: 'Domingo' },
  ];
  todo: FormGroup;
  noDisponibilidad;
  fechaMinima = moment(new Date()).locale('es').format('YYYY-MM-DD');
  fechaMaxima = moment(new Date()).add(1, 'year').locale('es').format('YYYY-MM-DD');
  empresaDoc: AngularFirestoreDocument<EmpresaOptions>;
  filePath: string;
  idempresa: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private formBuilder: FormBuilder,
    private afs: AngularFirestore,
    public alertCtrl: AlertController
  ) {
    this.idempresa = this.navParams.get('idempresa');
    this.filePath = 'negocios/' + this.idempresa + '/indisponibilidades/';
    this.empresaDoc = this.afs.doc(this.filePath);
    this.repetir.splice(0, 0, { id: 10, dia: 'Todos los días' });
    this.repetir.splice(0, 0, { id: -1, dia: 'No repetir' });
    this.updateData();
    this.form();
  }

  genericAlert(titulo: string, mensaje: string) {
    let mensajeAlert = this.alertCtrl.create({
      title: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    mensajeAlert.present();
  }

  updateData() {
    if (!this.noDisponibilidad) {
      this.noDisponibilidad = {};
      this.noDisponibilidad.fechaDesde = new Date();
      this.noDisponibilidad.fechaHasta = new Date();
      this.noDisponibilidad.todoDia = false;
      this.noDisponibilidad.indefinido = false;
      this.noDisponibilidad.horaDesde = null;
      this.noDisponibilidad.horaHasta = null;
      this.noDisponibilidad.repetir = this.repetir[0];
      this.noDisponibilidad.descripcion = null;
    }
  }

  form() {
    this.todo = this.formBuilder.group({
      id: [this.noDisponibilidad.id],
      fechaDesde: [this.noDisponibilidad.fechaDesde.toISOString(), Validators.required],
      fechaHasta: [this.noDisponibilidad.fechaHasta.toISOString()],
      todoDia: [this.noDisponibilidad.todoDia],
      indefinido: [this.noDisponibilidad.indefinido],
      horaDesde: [this.noDisponibilidad.horaDesde],
      horaHasta: [this.noDisponibilidad.horaHasta],
      repetir: [this.noDisponibilidad.repetir, Validators.required],
      descripcion: [this.noDisponibilidad.descripcion, Validators.required]
    });
  }

  validarTodoDia() {
    if (this.todo.value.todoDia) {
      this.todo.patchValue({
        fechaHasta: this.todo.value.fechaDesde,
        horaDesde: null,
        horaHasta: null,
        indefinido: false,
        repetir: this.repetir[0]
      });
    }
  }

  validarIndefinido() {
    if (this.todo.value.indefinido) {
      this.todo.patchValue({
        fechaHasta: null,
        todoDia: false,
        repetir: this.repetir[1]
      });
    } else {
      this.todo.patchValue({
        fechaHasta: this.todo.value.fechaDesde,
        repetir: this.repetir[0]
      });
    }
  }

  compareFn(p1: any, p2: any): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  guardar() {
    this.noDisponibilidad = this.todo.value;
    this.noDisponibilidad.id = this.noDisponibilidad.id ? this.noDisponibilidad.id : this.afs.createId();
    let noDisponibilidadDoc = this.afs.doc(this.filePath + this.noDisponibilidad.id);
    noDisponibilidadDoc.set(this.noDisponibilidad).then(() => {
      this.genericAlert('Horario no disponible', 'Se ha registrado éxitosamente');
      this.navCtrl.pop();
    });
  }

  cancelar() {
    this.navCtrl.pop();
  }

}
