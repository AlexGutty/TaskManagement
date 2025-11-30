import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mis-subtareas',
  standalone: false,
  templateUrl: './sub-tareas.component.html',
  styleUrls: ['./sub-tareas.component.scss'],
})
export class MisSubTareasComponent implements OnInit {
  @Input() subTareas: any[] = [];
  @Input() tareaId: string = '';
  @Output() onToggleCompletado = new EventEmitter<any>();
  @Output() onVerDetalle = new EventEmitter<any>();

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  toggleCompletado(subTarea: any): void {
    this.onToggleCompletado.emit(subTarea);
  }

  verDetalle(subTarea: any): void {
    this.onVerDetalle.emit(subTarea);
  }

  navegarASubTarea(subTarea: any): void {
    this.router.navigate(['/tareas', this.tareaId, 'sub-tareas', subTarea.id]);
  }

  getProgresoSubTarea(subTarea: any): number {
    if (!subTarea || !subTarea.total) {
      return 0;
    }
    return Math.round((subTarea.completadas / subTarea.total) * 100);
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
}
