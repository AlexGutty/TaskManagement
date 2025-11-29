import { Tarea } from './tarea.model';

export interface tareaadmin {
  id: string;
  titulo: string;
  estado: 'Pendiente' | 'En progreso' | 'Completada';
  fechaAsignacion: string;
  horaprogramada: string;
  Categoria: string;
  horainicio: string;
  horafin: string;
  sucursal: string;
  Tarea?: Tarea[]; // Array de subtareas
  // Propiedades calculadas automáticamente
  get totalSubtareas(): number;
  get subtareasCompletadas(): number;
}

// Clase que implementa la lógica de tareaadmin
export class TareaAdmin implements tareaadmin {
  id: string;
  titulo: string;
  estado: 'Pendiente' | 'En progreso' | 'Completada';
  fechaAsignacion: string;
  horaprogramada: string;
  Categoria: string;
  horainicio: string;
  horafin: string;
  sucursal: string;
  Tarea?: Tarea[];

  constructor(data: Partial<tareaadmin>) {
    this.id = data.id || '';
    this.titulo = data.titulo || '';
    this.estado = data.estado || 'Pendiente';
    this.fechaAsignacion = data.fechaAsignacion || '';
    this.horaprogramada = data.horaprogramada || '';
    this.Categoria = data.Categoria || '';
    this.horainicio = data.horainicio || '';
    this.horafin = data.horafin || '';
    this.sucursal = data.sucursal || '';
    this.Tarea = data.Tarea || [];
  }

  get totalSubtareas(): number {
    return this.Tarea ? this.Tarea.length : 0;
  }

  get subtareasCompletadas(): number {
    return this.Tarea ? this.Tarea.filter(t => t.estado === 'Completada').length : 0;
  }
}
