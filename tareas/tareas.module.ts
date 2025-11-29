import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';

import { TareasService } from './tareas.service';

// Componentes
import { UiModule } from '../ui/ui.module';
import { EquiposComponent } from './components/equipos/equipos.component';
import { MisTareasComponent } from './components/mis-tareas/mis-tareas.component';
import { CreartareaComponent } from './creartarea/creartarea.component';
import { ModalFormComponent } from './modal-form/modal-form.component';
import { ModalFiltrosComponent } from './pages/modal-filtros/modal-filtros.component';

import { ModalFiltrosAdminComponent } from './pages/modal-filtros-admin/modal-filtros-admin.component';
import { SubtareaInfoComponent } from './pages/subtarea-info/subtarea-info.component';
import { TareaadminAperturarComponent } from './tareaadmin-aperturar/tareaadmin-aperturar.component';
import { TareasInfoComponent } from './tareas-info/tareas-info.component';
import { TareasPageRoutingModule } from './tareas-routing.module';
import { TareasPage } from './tareas.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    TareasPageRoutingModule,
    UiModule
  ],
  declarations: [
    TareasPage,
    MisTareasComponent,
    ModalFiltrosComponent,
    ModalFiltrosAdminComponent,
    ModalFormComponent,
    EquiposComponent,
    SubtareaInfoComponent,
    TareasInfoComponent,
    TareaadminAperturarComponent,
    CreartareaComponent,
  ],
  providers: [
    TareasService,

  ],
})
export class TareasPageModule {}
