import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SubTareasPageComponent } from './sub-tareas-page.component';

const routes: Routes = [
  {
    path: '',
    component: SubTareasPageComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SubTareasRoutingModule { }
