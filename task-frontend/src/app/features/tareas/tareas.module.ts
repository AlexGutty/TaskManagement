import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IonicModule } from '@ionic/angular';

// Services
import { TareasService } from './services/tareas.service';

// Shared Module (comentado - implementar UiModule en shared si es necesario)
// import { UiModule } from '../../shared/modules/ui.module';

// Componentes
import { EquiposComponent } from './components/equipos/equipos.component';
import { MisTareasComponent } from './components/mis-tareas/mis-tareas.component';
import { CreartareaComponent } from './components/creartarea/creartarea.component';
import { ModalFormComponent } from './components/modal-form/modal-form.component';

// Pages
import { ModalFiltrosComponent } from './pages/modal-filtros/modal-filtros.component';
import { ModalFiltrosAdminComponent } from './pages/modal-filtros-admin/modal-filtros-admin.component';
import { SubtareaInfoComponent } from './pages/subtarea-info/subtarea-info.component';
import { TareaadminAperturarComponent } from './pages/tareaadmin-aperturar/tareaadmin-aperturar.component';
import { TareasInfoComponent } from './pages/tareas-info/tareas-info.component';
import { TareasPage } from './pages/tareas.page';

// Routing
import { TareasPageRoutingModule } from './tareas-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FontAwesomeModule,
    TareasPageRoutingModule,
    // UiModule // Descomentar cuando se implemente
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
    // TareasService ya tiene providedIn: 'root', no es necesario declararlo aquí
  ],
})
export class TareasPageModule {}
