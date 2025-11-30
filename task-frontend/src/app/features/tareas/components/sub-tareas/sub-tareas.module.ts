import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SubTareasRoutingModule } from './sub-tareas-routing.module';
import { SubTareasPageComponent } from './sub-tareas-page.component';
import { SubTareasComponent } from './sub-tareas.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SubTareasRoutingModule
  ],
  declarations: [
    SubTareasPageComponent,
    SubTareasComponent
  ],
  exports: [
    SubTareasComponent
  ]
})
export class SubTareasModule { }
