import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalleNodisponiblePage } from './detalle-nodisponible';

@NgModule({
  declarations: [
    DetalleNodisponiblePage,
  ],
  imports: [
    IonicPageModule.forChild(DetalleNodisponiblePage),
  ],
})
export class DetalleNodisponiblePageModule {}
