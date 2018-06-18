import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalleUsuarioPage } from './detalle-usuario';

@NgModule({
  declarations: [
    DetalleUsuarioPage,
  ],
  imports: [
    IonicPageModule.forChild(DetalleUsuarioPage),
  ],
  exports: [
    DetalleUsuarioPage
  ]
})
export class DetalleUsuarioPageModule {}
