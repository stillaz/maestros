import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalleEmpresaPage } from './detalle-empresa';

@NgModule({
  declarations: [
    DetalleEmpresaPage,
  ],
  imports: [
    IonicPageModule.forChild(DetalleEmpresaPage),
  ],
})
export class DetalleEmpresaPageModule {}
