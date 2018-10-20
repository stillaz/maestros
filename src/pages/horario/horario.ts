import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, ModalController } from 'ionic-angular';
import { ConfiguracionOptions } from '../../interfaces/configuracion-options';
import { EmpresaOptions } from '../../interfaces/empresa-options';
import { AngularFirestoreDocument, AngularFirestore } from '../../../node_modules/angularfire2/firestore';
import { FormGroup, FormBuilder, ValidatorFn, AbstractControl, Validators } from '../../../node_modules/@angular/forms';

/**
 * Generated class for the HorarioPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-horario',
  templateUrl: 'horario.html',
})
export class HorarioPage {

  configuracion = {} as ConfiguracionOptions;
  empresaDoc: AngularFirestoreDocument<EmpresaOptions>;
  todo: FormGroup;
  read;
  idempresa: string;

  filePath: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private afs: AngularFirestore,
    public alertCtrl: AlertController,
    private formBuilder: FormBuilder,
    public modalCtrl: ModalController,
  ) {
    this.idempresa = this.navParams.get('idempresa');
    this.filePath = 'negocios/' + this.idempresa;
    this.empresaDoc = this.afs.doc(this.filePath);
    this.form();
    this.updateConfiguracion();
  }

  genericAlert(titulo: string, mensaje: string) {
    let mensajeAlert = this.alertCtrl.create({
      title: titulo,
      message: mensaje,
      buttons: ['OK']
    });

    mensajeAlert.present();
  }

  updateConfiguracion() {
    this.empresaDoc.valueChanges().subscribe(data => {
      if (data && data.configuracion) {
        this.configuracion = data.configuracion;
        this.form();
      }
    });
  }

  validarFechaFinMayor(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (this.isPresent(Validators.required(control))) return null;

      let fin = control.value;
      let inicio = this.todo.value.horaInicio ? this.todo.value.horaInicio : 9999999999999;

      return new Promise((resolve) => {
        resolve(Number(fin) <= Number(inicio) ? { validarFechaFinMayor: true } : null);
      });
    }
  }

  form() {
    this.todo = this.formBuilder.group({
      horaInicio: [this.configuracion.horaInicio, Validators.compose([Validators.required, Validators.min(0), Validators.max(24)])],
      horaFin: [this.configuracion.horaFin, Validators.compose([Validators.required, Validators.min(0), Validators.max(24)]), this.validarFechaFinMayor()],
      tiempoDisponibilidad: [this.configuracion.tiempoDisponibilidad, Validators.compose([Validators.required, Validators.min(1), Validators.max(60)])],
      tiempoAlerta: [this.configuracion.tiempoAlerta, Validators.compose([Validators.required, Validators.min(1), Validators.max(1440)])],
      diasNoDisponible: [this.configuracion.diasNoDisponible]
    });
  }

  isPresent(obj: any): boolean {
    return obj !== undefined && obj !== null;
  }

  guardar() {
    this.configuracion = this.todo.value;

    this.alertCtrl.create({
      title: 'Guardar configuración',
      message: '¿Desea guardar la configuración?',
      buttons: [{
        text: 'No',
        role: 'cancel'
      }, {
        text: 'Si',
        handler: () => {
          this.empresaDoc.update({ configuracion: this.configuracion }).then(() => {
            this.genericAlert('Guardar configuración', 'Configuración registrada');
            this.navCtrl.pop();
          }).catch(() => this.genericAlert('Guardar configuración', 'Ha ocurrido un error'));
        }
      }]
    }).present();
  }

  compareFn(p1: any, p2: any): boolean {
    return p1 && p2 ? p1.id === p2.id : p1 === p2;
  }

  agregarNoDisponible() {
    this.modalCtrl.create('DetalleNodisponiblePage', {
      idempresa: this.idempresa
    }).present();
  }

  irNoDisponible() {
    this.navCtrl.push('NodisponiblePage', {
      usuario: this.idempresa
    });
  }

  cancelar() {
    this.navCtrl.pop();
  }

}
