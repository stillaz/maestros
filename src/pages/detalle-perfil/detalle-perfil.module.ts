import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetallePerfilPage } from './detalle-perfil';

@NgModule({
  declarations: [
    DetallePerfilPage,
  ],
  imports: [
    IonicPageModule.forChild(DetallePerfilPage),
  ],
})
export class DetallePerfilPageModule {}
