import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-sub-tareas-page',
  standalone: false,
  templateUrl: './sub-tareas-page.component.html',
  styleUrls: ['./sub-tareas-page.component.scss'],
})
export class SubTareasPageComponent implements OnInit, OnDestroy {
  tareaId: string = '';
  tarea: any = null;
  subTareas: any[] = [];
  private subscriptions: Subscription = new Subscription();
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    // Obtener el ID de la tarea desde los parámetros de la ruta
    this.subscriptions.add(
      this.route.params.subscribe(params => {
        if (params['id']) {
          this.tareaId = params['id'];
          this.loadTarea();
        }
      })
    );
  }

  loadTarea(): void {
    this.isLoading = true;
    // TODO: Implementar servicio para cargar la tarea
    // this.tareasService.getTareaById(this.tareaId).subscribe(...)
    setTimeout(() => {
      this.tarea = {
        id: this.tareaId,
        titulo: 'Tarea de ejemplo',
        descripcion: 'Descripción de la tarea'
      };
      this.loadSubTareas();
      this.isLoading = false;
    }, 500);
  }

  loadSubTareas(): void {
    // TODO: Implementar servicio para cargar sub-tareas
    // this.tareasService.getSubTareas(this.tareaId).subscribe(...)
    this.subTareas = [];
  }

  async crearSubTarea(): Promise<void> {
    // TODO: Abrir modal para crear sub-tarea
  }

  async editarSubTarea(subTarea: any): Promise<void> {
    // TODO: Abrir modal para editar sub-tarea
  }

  async eliminarSubTarea(subTarea: any): Promise<void> {
    // TODO: Implementar eliminación de sub-tarea
  }

  volver(): void {
    this.router.navigate(['/tareas']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
