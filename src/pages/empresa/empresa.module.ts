import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EmpresaPage } from './empresa';

@NgModule({
  declarations: [
    EmpresaPage,
  ],
  imports: [
    IonicPageModule.forChild(EmpresaPage),
  ],
})
export class EmpresaPageModule {}
