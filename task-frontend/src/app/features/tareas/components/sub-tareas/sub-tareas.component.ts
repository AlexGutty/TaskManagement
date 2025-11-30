import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';

@Component({
  selector: 'app-sub-tareas',
  standalone: false,
  templateUrl: './sub-tareas.component.html',
  styleUrls: ['./sub-tareas.component.scss'],
})
export class SubTareasComponent implements OnInit {
  @Input() subTareas: any[] = [];
  @Input() tareaId: string = '';
  @Output() onCrear = new EventEmitter<void>();
  @Output() onEditar = new EventEmitter<any>();
  @Output() onEliminar = new EventEmitter<any>();
  @Output() onToggleCompletado = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {
    // Inicialización del componente
  }

  crearSubTarea(): void {
    this.onCrear.emit();
  }

  editarSubTarea(subTarea: any): void {
    this.onEditar.emit(subTarea);
  }

  eliminarSubTarea(subTarea: any): void {
    this.onEliminar.emit(subTarea);
  }

  toggleCompletado(subTarea: any): void {
    this.onToggleCompletado.emit(subTarea);
  }

  getProgresoTotal(): number {
    if (!this.subTareas || this.subTareas.length === 0) {
      return 0;
    }
    const completadas = this.subTareas.filter(st => st.completado).length;
    return Math.round((completadas / this.subTareas.length) * 100);
  }

  getPrioridadClass(prioridad: string): string {
    switch(prioridad?.toLowerCase()) {
      case 'alta': return 'prioridad-alta';
      case 'media': return 'prioridad-media';
      case 'baja': return 'prioridad-baja';
      default: return '';
    }
  }
}
