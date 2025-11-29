import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreartareaComponent } from './components/creartarea/creartarea.component';
import { ModalFormComponent } from './components/modal-form/modal-form.component';
import { SubtareaInfoComponent } from './pages/subtarea-info/subtarea-info.component';
import { TareaadminAperturarComponent } from './pages/tareaadmin-aperturar/tareaadmin-aperturar.component';
import { TareasInfoComponent } from './pages/tareas-info/tareas-info.component';
import { TareasPage } from './pages/tareas.page';


const routes: Routes = [
  {
    path: '',
    component: TareasPage
  },
  {
    path: 'subtarea-info',
    component: SubtareaInfoComponent,
  },
  {
    path: 'tarea-info',
    component: TareasInfoComponent,
  },
  {
    path: 'tarea-reapertura',
    component: TareaadminAperturarComponent,
  },
  {
    path: 'tarea-re',
    component: ModalFormComponent,
  },
  {
    path: 'crear-tarea',
    component: CreartareaComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TareasPageRoutingModule {}
