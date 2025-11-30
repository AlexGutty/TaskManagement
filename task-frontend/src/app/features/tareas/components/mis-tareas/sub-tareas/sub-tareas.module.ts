import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { MisSubTareasRoutingModule } from './sub-tareas-routing.module';
import { MisSubTareasComponent } from './sub-tareas.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MisSubTareasRoutingModule
  ],
  declarations: [
    MisSubTareasComponent
  ],
  exports: [
    MisSubTareasComponent
  ]
})
export class MisSubTareasModule { }
