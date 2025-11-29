import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { format } from 'date-fns';
import { Observable, of, Subject } from 'rxjs';
import { EndpointUtil } from '../core/utils/endpoint';

// Interfaces para tipado
export interface tareaadmin{
  id: string;
  titulo: string;
  estado: 'Pendiente' | 'En progreso' | 'Completada';
  fechaAsignacion: string;
  horaprogramada: string
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

@Injectable({
  providedIn: 'root'
})
export class TareasService {

  // Subject para notificar cambios en subtareas
  private subtareasActualizadasSubject = new Subject<void>();
  public subtareasActualizadas$ = this.subtareasActualizadasSubject.asObservable();
  public apartadoadmin = true;
  
  // Usuario actual del sistema
  public usuarioActual = 'Juan Pérez'; // En producción esto vendría del servicio de autenticación
  
  // Subject para cambios en el título de subtareas
  private tituloSubtareasSubject = new Subject<string>();
  public tituloSubtareas$ = this.tituloSubtareasSubject.asObservable();

  // Almacén de subtareas por tarea ID
  private subtareasPorTarea: { [tareaId: string]: any[] } = {};

  // Datos mock para pruebas
  // ...existing code...

  // Datos mock para pruebas
  public tareasadmin: TareaAdmin[] = [
    new TareaAdmin({
      id: '001',
      titulo: 'Revisar reportes de ventas del día',
      estado: 'Completada',
      fechaAsignacion: '2025-28-11',
      horaprogramada: '08:00',
      Categoria: 'Operaciones',
      horainicio: '08:00',
      horafin: '10:00',
      sucursal: 'Sede Centro',
      Tarea: [
        {
          id: 'admin-1-sub-1',
          titulo: 'Recopilar datos de ventas',
          completada: true,
          progreso: 100,
          estado: 'Completada',
          totalSubtareas: 0,
          subtareasCompletadas: 0,
          estadodetarea: 'Activo',
          fechaAsignacion: '2025-09-05',
          Categoria: 'Reportes',
          horainicio: '08:00',
          horafin: '08:30',
          Prioridad: 'Alta',
          descripcion: 'Recopilar y compilar todos los datos de ventas del día anterior',
          usuarioasignado: 'Carmen Rosales',
        },
        {
          id: 'admin-1-sub-2',
          titulo: 'Generar gráficos de análisis',
          completada: true,
          progreso: 100,
          estado: 'Completada',
          totalSubtareas: 0,
          subtareasCompletadas: 0,
          estadodetarea: 'Activo',
          fechaAsignacion: '2025-09-05',
          Categoria: 'Reportes',
          horainicio: '08:30',
          horafin: '09:00',
          Prioridad: 'Media',
          descripcion: 'Crear gráficos visuales para presentar los datos de ventas',
          usuarioasignado: 'Carlos Martinez',
        }
      ]
    }),
    new TareaAdmin({
      id: '002',
      titulo: 'Supervisar inventario de cocina',
      estado: 'En progreso',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '10:30',
      Categoria: 'Operaciones',
      horainicio: '10:30',
      horafin: '12:30',
      sucursal: 'Sede Centro',
      Tarea: [
        {
          id: 'admin-2-sub-1',
          titulo: 'Contar ingredientes principales',
          completada: false,
          progreso: 100,
          estado: 'Pendiente',
          totalSubtareas: 0,
          subtareasCompletadas: 0,
          estadodetarea: 'Activo',
          fechaAsignacion: '2025-09-05',
          Categoria: 'Inventario',
          horainicio: '10:30',
          horafin: '11:00',
          Prioridad: 'Alta',
          descripcion: 'Contar todos los ingredientes principales de la cocina',
          usuarioasignado: 'Luis Gómez'
        },
        {
          id: 'admin-2-sub-2',
          titulo: 'Verificar fechas de vencimiento',
          completada: false,
          progreso: 0,
          estado: 'En progreso',
          totalSubtareas: 0,
          subtareasCompletadas: 0,
          estadodetarea: 'Activo',
          fechaAsignacion: '2025-09-05',
          Categoria: 'Inventario',
          horainicio: '11:00',
          horafin: '11:30',
          Prioridad: 'Alta',
          descripcion: 'Revisar las fechas de vencimiento de todos los productos',
          usuarioasignado: 'Ana Fernández'
        },
        {
          id: 'admin-2-sub-3',
          titulo: 'Actualizar sistema de inventario',
          completada: false,
          progreso: 0,
          estado: 'Pendiente',
          totalSubtareas: 0,
          subtareasCompletadas: 0,
          estadodetarea: 'Activo',
          fechaAsignacion: '2025-09-05',
          Categoria: 'Inventario',
          horainicio: '11:30',
          horafin: '12:30',
          Prioridad: 'Media',
          descripcion: 'Actualizar el sistema con los datos del inventario realizado',
          usuarioasignado: 'Miguel Torres'
        }
      ]
    }),
    new TareaAdmin({
      id: '003',
      titulo: 'Revision de area almacen',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '14:00',
      Categoria: 'Almacenes',
      horainicio: '14:00',
      horafin: '15:30',
      sucursal: 'Sede Centro',
       Tarea: [
        {
          id: 'admin-2-sub-1',
          titulo: 'Contar ingredientes principales',
          completada: false,
          progreso: 0,
          estado: 'Pendiente',
          totalSubtareas: 0,
          subtareasCompletadas: 0,
          estadodetarea: 'Activo',
          fechaAsignacion: '2025-09-05',
          Categoria: 'Inventario',
          horainicio: '10:30',
          horafin: '11:00',
          Prioridad: 'Alta',
          descripcion: 'Contar todos los ingredientes principales de la cocina',
          usuarioasignado: 'Luis Gómez'
        },
        {
          id: 'admin-2-sub-2',
          titulo: 'Verificar fechas de vencimiento',
          completada: false,
          progreso: 0,
          estado: 'Pendiente',
          totalSubtareas: 0,
          subtareasCompletadas: 0,
          estadodetarea: 'Activo',
          fechaAsignacion: '2025-09-05',
          Categoria: 'Inventario',
          horainicio: '11:00',
          horafin: '11:30',
          Prioridad: 'Alta',
          descripcion: 'Revisar las fechas de vencimiento de todos los productos',
          usuarioasignado: 'Ana Fernández'
        },
      ]
    }),
    new TareaAdmin({
      id: '004',
      titulo: 'Limpieza en area de cocina',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '09:00',
      Categoria: 'Limpieza',
      horainicio: '09:00',
      horafin: '11:00',
      sucursal: 'Sucursal 1'
    }),
    new TareaAdmin({
      id: '005',
      titulo: 'Evaluación de desempeño del personal',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '15:00',
      Categoria: 'Operaciones',
      horainicio: '15:00',
      horafin: '17:00',
      sucursal: 'Sucursal 2'
    }),
    new TareaAdmin({
      id: '006',
      titulo: 'Revisar cumplimiento de protocolos de seguridad',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '11:00',
      Categoria: 'Operaciones',
      horainicio: '11:00',
      horafin: '13:00',
      sucursal: 'Sucursal 1'
    }),
    new TareaAdmin({
      id: '007',
      titulo: 'Análisis de costos operativos',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '16:00',
      Categoria: 'Operaciones',
      horainicio: '16:00',
      horafin: '18:00',
      sucursal: 'Sede Centro'
    }),
    new TareaAdmin({
      id: '008',
      titulo: 'Planificación de menú semanal',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '13:00',
      Categoria: 'Operaciones',
      horainicio: '13:00',
      horafin: '14:30',
      sucursal: 'Surcursal 1'
    }),
    new TareaAdmin({
      id: '009',
      titulo: 'Supervisar capacitación de nuevos empleados',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '10:00',
      Categoria: 'Operaciones',
      horainicio: '10:00',
      horafin: '12:00',
      sucursal: 'Sucursal 2'
    }),
    new TareaAdmin({
      id: '010',
      titulo: 'Reunión con proveedores estratégicos',
      estado: 'Pendiente',
      fechaAsignacion: '2025-09-05',
      horaprogramada: '17:00',
      Categoria: 'Operaciones',
      horainicio: '17:00',
      horafin: '18:30',
      sucursal: 'Sucursal 2'
    })
  ];

  public tareasignar: Tarea[] = [];
// ...existing code...
  public tareasMock: Tarea[] = [
    {
      id: '1',
      titulo: 'Verificar el stock actual de rollos de tickets en el sistema o físicamente en el almacén erificar el stock actual de rollos de tickets en el sistema o físicamente en el almacén',
      descripcion: 'Realizar un conteo completo de todos los productos en el almacén, verificar el estado de los materiales y actualizar el sistema de inventario con las cantidades exactas encontradas.',
      completada: false,
      estado: 'Cerrada',
      progreso: 100,
      totalSubtareas: 4,
      subtareasCompletadas: 0,
      estadodetarea: 'Activo',
      fechaAsignacion: '2025-11-28',
      Categoria: 'Inventario',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Media',
      usuarioasignado: 'Juan Pérez'
    },
    {
      id: '2',
      titulo: 'Verificar stock de productos críticos',
      descripcion: 'Revisar los niveles de stock de productos críticos para la operación del restaurante, identificar productos con stock bajo y generar alertas para reposición inmediata.',
      completada: false,
      progreso: 0,
      estado: 'Completada',
      totalSubtareas: 4,
      subtareasCompletadas: 0,
      estadodetarea: 'Activo',
      fechaAsignacion: '2025-11-28',
      Categoria: 'Inventario',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Alta',
      usuarioasignado: 'Juan Pérez'
    },
    {
      id: '3',
      titulo: 'Preparar reporte mensual de ventas',
      descripcion: 'Compilar y analizar los datos de ventas del mes anterior, generar gráficos de rendimiento, identificar tendencias y preparar un reporte ejecutivo para la gerencia.',
      completada: false,
      progreso: 75,
      estado: 'En progreso',
      totalSubtareas: 5,
      subtareasCompletadas: 3,
      estadodetarea: 'Activo',
      fechaAsignacion: '2025-11-28',
      Categoria: 'Informes',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Alta',
      usuarioasignado: 'Juan Pérez'
    },
    {
      id: '4',
      titulo: 'Capacitación de nuevo personal',
      descripcion: 'Diseñar e implementar un programa de capacitación integral para el nuevo personal, incluyendo protocolos de seguridad, procedimientos operativos y estándares de calidad del restaurante.',
      completada: false,
      progreso: 50,
      estado: 'Pendiente',
      totalSubtareas: 6,
      subtareasCompletadas: 3,
      estadodetarea: 'Activo',
      Categoria: 'Capacitación',
      fechaAsignacion: '2025-09-05',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Media',
      usuarioasignado: 'Juan Pérez'
    },
    {
      id: '5',
      titulo: 'Capacitación de nuevo personal',
      descripcion: 'Completar la evaluación final del programa de capacitación y certificar al nuevo personal en los procedimientos básicos de operación y atención al cliente.',
      completada: false,
      progreso: 100,
      estado: 'Pendiente',
      totalSubtareas: 6,
      subtareasCompletadas: 6,
      estadodetarea: 'Activo',
      Categoria: 'Capacitación',
      fechaAsignacion: '2025-09-05',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Baja'
      // Sin usuarioasignado - aparece en "sin asignar"
    },
    {
      id: '6',
      titulo: 'Revisar correos importantes',
      descripcion: 'Revisar y responder la correspondencia electrónica prioritaria, incluyendo comunicaciones de proveedores, clientes importantes y notificaciones corporativas.',
      completada: false,
      progreso: 0,
      estado: 'Pendiente',
      totalSubtareas: 0,
      subtareasCompletadas: 0,
      estadodetarea: 'Activo',
      Categoria: 'Personal',
      fechaAsignacion: '2025-09-05',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Media'
      // Sin usuarioasignado - aparece en "sin asignar"
    },
    {
      id: '7',
      titulo: 'Llamar al proveedor de materiales',
      descripcion: 'Contactar al proveedor principal de materiales para confirmar la entrega programada, negociar precios de productos estacionales y resolver cualquier inconveniente con pedidos pendientes.',
      completada: false,
      progreso: 0,
      estado: 'Pendiente',
      totalSubtareas: 0,
      subtareasCompletadas: 0,
      estadodetarea: 'Activo',
      Categoria: 'Personal',
      fechaAsignacion: '2025-09-05',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Alta'
      // Sin usuarioasignado - aparece en "sin asignar"
    },
    {
      id: '8',
      titulo: 'Llamar al proveedor de materiales',
      descripcion: 'Realizar seguimiento a la orden de compra pendiente, verificar disponibilidad de productos específicos y coordinar horarios de entrega para la próxima semana.',
      completada: false,
      progreso: 0,
      estado: 'Pendiente',
      totalSubtareas: 5,
      subtareasCompletadas: 0,
      estadodetarea: 'Activo',
      Categoria: 'Personal',
      fechaAsignacion: '2025-09-05',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Baja'
      // Sin usuarioasignado - aparece en "sin asignar"
    },
    {
      id: '9',
      titulo: 'Llamar al proveedor de materiales',
      descripcion: 'Establecer comunicación con proveedores alternativos para asegurar continuidad en el suministro, comparar precios y evaluar la calidad de productos ofrecidos.',
      completada: false,
      estado: 'Pendiente',
      progreso: 0,
      totalSubtareas: 5,
      subtareasCompletadas: 0,
      estadodetarea: 'Activo',
      Categoria: 'Personal',
      fechaAsignacion: '2025-09-05',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Media'
      // Sin usuarioasignado - aparece en "sin asignar"
    },
    {
      id: '10',
      titulo: 'Llamar al proveedor de materiales',
      descripcion: 'Establecer comunicación con proveedores alternativos para asegurar continuidad en el suministro, comparar precios y evaluar la calidad de productos ofrecidos.',
      completada: false,
      estado: 'Cerrada',
      progreso: 0,
      totalSubtareas: 5,
      subtareasCompletadas: 0,
      estadodetarea: 'Activo',
      Categoria: 'Personal',
      fechaAsignacion: '2025-09-05',
      horainicio: '09:00',
      horafin: '11:00',
      Prioridad: 'Media',
      usuarioasignado: 'Juan Pérez'
    }
  ];
  public subtareas: any[] = [
        {
          id: 'sub-1',
          titulo: 'Sub tarea N°01',
          asignado: 'Romina Aparicio',
          descripcion:'A',
          completada: false
        },
        {
          id: 'sub-2',
          titulo: 'Sub tarea N°02', 
          asignado: 'Carlos Mendez',
          descripcion:'E',

          completada: false
        },
        {
          id: 'sub-3',
          titulo: 'Sub tarea N°03',
          asignado: 'Ana García',
          descripcion:'I',
          completada: false
        },
        {
          id: 'sub-4',
          titulo: 'Sub tarea N°04',
          asignado: 'Ana García',
          descripcion:'O',
          completada: false
        },
        {
          id: 'sub-5',
          titulo: 'Sub tarea N°05',
          asignado: 'Ana García',
          descripcion:'U',
          completada: false
        },
      ];

  // Estados originales para poder restaurar cuando se desmarca una tarea
  private estadosOriginales: { [key: string]: { progreso: number, subtareasCompletadas: number } } = {
    '1': { progreso: 100, subtareasCompletadas: 4 },
    '2': { progreso: 0, subtareasCompletadas: 0 },
    '3': { progreso: 75, subtareasCompletadas: 3 },
    '4': { progreso: 50, subtareasCompletadas: 3 },
    '5': { progreso: 80, subtareasCompletadas: 5 }, // Estado original antes de completarse
    '6': { progreso: 0, subtareasCompletadas: 0 }, // Tarea sin subtareas
    '7': { progreso: 0, subtareasCompletadas: 0 },
    '8': { progreso: 0, subtareasCompletadas: 0 },
    '9': { progreso: 0, subtareasCompletadas: 0 }  // Tarea sin subtareas

  };

  constructor(private http: HttpClient) { }

  // Método para obtener tareas por fecha
  getTareasPorFecha(fecha: Date): Observable<Tarea[]> {
    const fechaString = format(fecha, 'yyyy-MM-dd');
    const tareasDia = this.tareasMock.filter(tarea => tarea.fechaAsignacion === fechaString);
    return of(tareasDia);
  }

  // Método para obtener mis tareas (asignadas al usuario actual)
  getMisTareasPorFecha(fecha: Date): Observable<Tarea[]> {
    const fechaString = format(fecha, 'yyyy-MM-dd');
    const misTareas = this.tareasMock.filter(tarea => 
      tarea.fechaAsignacion === fechaString && 
      tarea.usuarioasignado === this.usuarioActual
    );
    return of(misTareas);
  }

  // Método para obtener tareas sin asignar
  getTareasSinAsignarPorFecha(fecha: Date): Observable<Tarea[]> {
    const fechaString = format(fecha, 'yyyy-MM-dd');
    const tareasSinAsignar = this.tareasMock.filter(tarea => 
      tarea.fechaAsignacion === fechaString && 
      !tarea.usuarioasignado
    );
    return of(tareasSinAsignar);
  }

  // Método para asignar tareas seleccionadas al usuario actual
  asignarTareasAUsuario(tareasIds: string[]): Observable<boolean> {
    tareasIds.forEach(tareaId => {
      const tarea = this.tareasMock.find(t => t.id === tareaId);
      if (tarea) {
        tarea.usuarioasignado = this.usuarioActual;
      }
    });
    return of(true);
  }

  // Método para obtener una tarea por ID
  getTareaPorId(tareaId: string): Tarea | undefined {
    return this.tareasMock.find(tarea => tarea.id === tareaId);
  }

  // Método para obtener resumen de tareas por fecha
  getResumenTareasPorFecha(fecha: Date): Observable<ResumenTareas> {
    const fechaString = format(fecha, 'yyyy-MM-dd');
    const tareasDia = this.tareasMock.filter(tarea => tarea.fechaAsignacion === fechaString);
    
    const totalTareas = tareasDia.length;
    const tareasCompletadas = tareasDia.filter(t => t.completada).length;
    const tareasEnProgreso = tareasDia.filter(t => !t.completada && t.progreso > 0).length;
    const porcentajeAvance = totalTareas > 0 ? Math.round((tareasCompletadas / totalTareas) * 100) : 0;

    const resumen: ResumenTareas = {
      totalTareas,
      tareasCompletadas,
      tareasEnProgreso,
      porcentajeAvance
    };

    return of(resumen);
  }

  // Métodos originales (pueden usar endpoints reales cuando estén disponibles)
  getMisTareas(): Observable<any> {
    return this.http.get(`${EndpointUtil.urlBase}/tareas/mis-tareas`);
  }

  getTareasEquipo(equipoId: string): Observable<any> {
    return this.http.get(`${EndpointUtil.urlBase}/tareas/equipo/${equipoId}`);
  }

  getEquipos(): Observable<any> {
    return this.http.get(`${EndpointUtil.urlBase}/tareas/equipos`);
  }

  // Método para marcar tarea como completada
  completarTarea(tareaId: string): Observable<boolean> {
    const tarea = this.tareasMock.find(t => t.id === tareaId);
    if (tarea) {
      tarea.completada = true;
      tarea.progreso = 100;
      tarea.subtareasCompletadas = tarea.totalSubtareas;
    }
    return of(true);
  }

  // Método para toggle de completar/descompletar tarea
  toggleCompletarTarea(tareaId: string, nuevoEstado: boolean): Observable<boolean> {
    const tarea = this.tareasMock.find(t => t.id === tareaId);
    if (tarea) {
      tarea.completada = nuevoEstado;
      if (nuevoEstado) {
        // Si se marca como completada
        tarea.progreso = 100;
        tarea.subtareasCompletadas = tarea.totalSubtareas;
      } else {
        // Si se desmarca, volver al estado original
        const estadoOriginal = this.estadosOriginales[tareaId];
        if (estadoOriginal) {
          tarea.progreso = estadoOriginal.progreso;
          tarea.subtareasCompletadas = estadoOriginal.subtareasCompletadas;
        }
      }
    }
    return of(true);
  }

  // Método para actualizar el progreso de subtareas
  actualizarProgresoSubtareas(tareaId: string, subtareasCompletadas: number, totalSubtareas: number): Observable<boolean> {
    const tarea = this.tareasMock.find(t => t.id === tareaId);
    if (tarea) {
      tarea.subtareasCompletadas = subtareasCompletadas;
      tarea.totalSubtareas = totalSubtareas;
      tarea.progreso = totalSubtareas > 0 ? Math.round((subtareasCompletadas / totalSubtareas) * 100) : 0;
      tarea.completada = subtareasCompletadas === totalSubtareas && totalSubtareas > 0;
      
      // Notificar que las subtareas han sido actualizadas
      this.notificarCambioSubtareas();
    }
    return of(true);
  }

  // Método para notificar cambios en subtareas
  public notificarCambioSubtareas() {
    this.subtareasActualizadasSubject.next();
  }

  // Método para obtener una tarea específica por ID
  obtenerTareaPorId(tareaId: string): Observable<Tarea | undefined> {
    const tarea = this.tareasMock.find(t => t.id === tareaId);
    return of(tarea);
  }

  // Método para obtener una tarea admin específica por ID
  obtenerTareaAdminPorId(tareaId: string): TareaAdmin | undefined {
    return this.tareasadmin.find(t => t.id === tareaId);
  }

  // Método para completar subtarea admin
  completarSubtareaAdmin(tareaAdminId: string, subtareaId: string): void {
    const tareaAdmin = this.tareasadmin.find(t => t.id === tareaAdminId);
    if (tareaAdmin && tareaAdmin.Tarea) {
      const subtarea = tareaAdmin.Tarea.find(s => s.id === subtareaId);
      if (subtarea) {
        subtarea.completada = true;
        subtarea.estado = 'Completada';
        subtarea.progreso = 100;
        
        // Los totales se actualizan automáticamente por los getters
        console.log(`Subtarea completada. Total: ${tareaAdmin.totalSubtareas}, Completadas: ${tareaAdmin.subtareasCompletadas}`);
      }
    }
  }

  // Método para descompletar subtarea admin
  descompletarSubtareaAdmin(tareaAdminId: string, subtareaId: string): void {
    const tareaAdmin = this.tareasadmin.find(t => t.id === tareaAdminId);
    if (tareaAdmin && tareaAdmin.Tarea) {
      const subtarea = tareaAdmin.Tarea.find(s => s.id === subtareaId);
      if (subtarea) {
        subtarea.completada = false;
        subtarea.estado = 'Pendiente';
        subtarea.progreso = 0;
        
        // Los totales se actualizan automáticamente por los getters
        console.log(`Subtarea descompletada. Total: ${tareaAdmin.totalSubtareas}, Completadas: ${tareaAdmin.subtareasCompletadas}`);
      }
    }
  }

  // Método para guardar subtareas de una tarea específica
  guardarSubtareas(tareaId: string, subtareas: any[]): void {
    this.subtareasPorTarea[tareaId] = [...subtareas]; // Crear una copia
    console.log('Subtareas guardadas para tarea', tareaId, this.subtareasPorTarea[tareaId]);
  }

  // Método para obtener subtareas de una tarea específica
  obtenerSubtareas(tareaId: string): any[] {
    const subtareasGuardadas = this.subtareasPorTarea[tareaId];
    console.log('Subtareas obtenidas para tarea', tareaId, subtareasGuardadas);
    
    // Si no hay subtareas guardadas, devolver las por defecto
    if (!subtareasGuardadas) {
      return this.subtareas;
    }
    
    return [...subtareasGuardadas]; // Devolver una copia
  }

  // Método para actualizar una subtarea específica
  actualizarSubtarea(tareaId: string, subtareaIndex: number, completada: boolean): void {
    if (this.subtareasPorTarea[tareaId]) {
      this.subtareasPorTarea[tareaId][subtareaIndex].completada = completada;
    }
  }
}
