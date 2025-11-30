import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

interface Tarea {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: string;
  estado: string;
  fechaVencimiento: Date;
  progreso: number;
  categoria: string;
}

@Component({
  selector: 'app-mis-tareas',
  standalone: false,
  templateUrl: './mis-tareas.component.html',
  styleUrls: ['./mis-tareas.component.scss'],
})
export class MisTareasComponent implements OnInit, OnDestroy {
  misTareas: Tarea[] = [];
  tareasFiltradas: Tarea[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  filtroEstado: string = 'todas'; // todas, pendiente, en-progreso, completado
  filtroPrioridad: string = 'todas'; // todas, alta, media, baja
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadMisTareas();
  }

  loadMisTareas(): void {
    this.isLoading = true;
    // TODO: Implementar servicio para cargar mis tareas
    // this.tareasService.getMisTareas().subscribe(...)
    setTimeout(() => {
      this.misTareas = [];
      this.aplicarFiltros();
      this.isLoading = false;
    }, 500);
  }

  aplicarFiltros(): void {
    let resultado = [...this.misTareas];

    // Filtro por búsqueda
    if (this.searchTerm.trim()) {
      const termino = this.searchTerm.toLowerCase();
      resultado = resultado.filter(tarea =>
        tarea.titulo.toLowerCase().includes(termino) ||
        tarea.descripcion?.toLowerCase().includes(termino)
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== 'todas') {
      resultado = resultado.filter(tarea =>
        tarea.estado.toLowerCase() === this.filtroEstado
      );
    }

    // Filtro por prioridad
    if (this.filtroPrioridad !== 'todas') {
      resultado = resultado.filter(tarea =>
        tarea.prioridad.toLowerCase() === this.filtroPrioridad
      );
    }

    this.tareasFiltradas = resultado;
  }

  verDetalleTarea(tarea: Tarea): void {
    this.router.navigate(['/tareas', tarea.id]);
  }

  async abrirFiltros(): Promise<void> {
    // TODO: Abrir modal de filtros
  }

  ordenarPor(criterio: string): void {
    // TODO: Implementar ordenamiento
  }

  getPrioridadClass(prioridad: string): string {
    switch(prioridad?.toLowerCase()) {
      case 'alta': return 'prioridad-alta';
      case 'media': return 'prioridad-media';
      case 'baja': return 'prioridad-baja';
      default: return '';
    }
  }

  getEstadoClass(estado: string): string {
    switch(estado?.toLowerCase()) {
      case 'completado': return 'estado-completado';
      case 'en progreso': return 'estado-en-progreso';
      case 'pendiente': return 'estado-pendiente';
      default: return '';
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
