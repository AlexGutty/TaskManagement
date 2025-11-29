export interface Tarea {
  id: string;
  titulo: string;
  completada: boolean;
  progreso: number; // 0-100
  estado: 'Pendiente' | 'En progreso' | 'Completada' | 'Cerrada' | 'Activo' | 'Inactiva';
  estadodetarea: 'Activo' | 'Inactiva';
  totalSubtareas: number;
  subtareasCompletadas: number;
  fechaAsignacion: string;
  fechaAsignacionTimestamp?: number; // Timestamp para ordenamiento
  fechaVencimiento?: string;
  Categoria: string;
  horainicio: string;
  horafin: string;
  Prioridad?: 'Baja' | 'Media' | 'Alta';
  descripcion: string;
  usuarioasignado?: string;
}

export interface ResumenTareas {
  totalTareas: number;
  tareasCompletadas: number;
  tareasEnProgreso: number;
  porcentajeAvance: number;
}
