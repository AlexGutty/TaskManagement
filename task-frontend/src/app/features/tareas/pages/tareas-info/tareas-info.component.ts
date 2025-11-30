import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faFlag,
  faSliders,
} from '@fortawesome/pro-regular-svg-icons';
import { AlertController, LoadingController, ModalController } from '@ionic/angular';
import { ToastConfig } from '../../ui/toast-notificacion/toast-notificacion.component';
import { ModalFormComponent } from '../modal-form/modal-form.component';
import { ModalFiltrosComponent } from '../pages/modal-filtros/modal-filtros.component';
import { Tarea, TareaAdmin, TareasService } from '../tareas.service';
import { ModalFiltrosAdminComponent } from '../pages/modal-filtros-admin/modal-filtros-admin.component';

interface Empleado {
  id: string;
  nombre: string;
  apellido: string;
  rol: string;
  departamento: string;
  estado: 'Disponible' | 'Ocupado' | 'No disponible';
  tareasActivas: number;
  horasSemanales: number;
  ultimaActividad: string;
  turno: string;
  experiencia: string;
  calificacion: number;
  prioridadAsignacion?: 'Alta' | 'Media' | 'Baja';
}

interface TareaDisponible {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  duracionEstimada: string;
  categoria: string;
}

@Component({
  selector: 'app-tareas-info',
  standalone:false,
  templateUrl: './tareas-info.component.html',
  styleUrls: ['./tareas-info.component.scss'],
})
export class TareasInfoComponent implements OnInit {
  public tareaAdminSeleccionada: TareaAdmin | null = null;
  public subtareas: Tarea[] = [];
  
  // Variables de estado
  searchTerm: string = '';
  rolSeleccionado: string = 'Todos';
  cargandoEmpleados: boolean = true;
  empleadosSeleccionados: string[] = [];
  tareasSeleccionadas: string[] = [];
  public faSliders = faSliders;
  
  // Datos
  empleados: Empleado[] = [];
  empleadosFiltrados: Empleado[] = [];
  tareasDisponibles: TareaDisponible[] = [];
  rolesDisponibles: string[] = ['Todos', 'Chef', 'Mesero', 'Barista', 'Cajero', 'Limpieza'];
  public faFlag = faFlag;

  // Propiedades para toast dinámico
  mostrarToastComponent: boolean = false;
  duracionToast: number = 3000; // Duración en milisegundos
  configToast: ToastConfig = {
    tipo: 'exito',
    mensaje: '',
    icono: 'checkmark-circle',
    botonTexto: '',
    mostrarBoton: false,
    mostrarCerrar: true
  };

  // Getter para acceder a apartadoadmin del servicio
  get isApartadoAdmin(): boolean {
    return this.tareasService.apartadoadmin;
  }

  // Función para determinar si una subtarea está activa
  isSubtareaActiva(subtarea: Tarea): boolean {
    // Una subtarea está activa si está en progreso o completada
    // Una subtarea está inactiva si está pendiente o cerrada
    return subtarea.estado === 'En progreso' || subtarea.estado === 'Completada';
  }

  constructor(
    private location: Location,
    private alertController: AlertController,
    private tareasService: TareasService,
    private loadingController: LoadingController,
    private modalcontroller: ModalController,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.obtenerParametrosTarea();
    this.cargarDatos();
  }

  // Se ejecuta cada vez que la vista se muestra (ideal para toast)
  ionViewDidEnter() {
    this.verificarOperacionExito();
  }

  // Verificar si hay una operación exitosa en localStorage
  private verificarOperacionExito() {
    const operacionExito = localStorage.getItem('tareaOperacionExito');
    if (operacionExito) {
      try {
        const data = JSON.parse(operacionExito);
        // Verificar que no sea muy antiguo (más de 5 segundos)
        if (Date.now() - data.timestamp < 5000) {
          const mensaje = data.operacion === 'editada' 
            ? '¡Se ha actualizado la tarea con éxito!'
            : '¡Se ha creado la tarea con éxito!';
          
          // Mostrar toast después de un pequeño delay
          setTimeout(() => {
            this.mostrarToastPersonalizado(mensaje, 'exito');
          }, 100);
        }
        
        // Limpiar localStorage después de usarlo
        localStorage.removeItem('tareaOperacionExito');
      } catch (error) {
        console.error('Error al parsear operación exitosa:', error);
        localStorage.removeItem('tareaOperacionExito');
      }
    }
  }

  // Obtener parámetros de la tarea seleccionada
  obtenerParametrosTarea() {
    this.route.queryParams.subscribe(params => {
      if (params['tareaId']) {
        this.tareaAdminSeleccionada = this.tareasService.obtenerTareaAdminPorId(params['tareaId']) || null;
        if (this.tareaAdminSeleccionada && this.tareaAdminSeleccionada.Tarea) {
          this.subtareas = this.tareaAdminSeleccionada.Tarea;
        }
      }
    });
  }

  // Cargar datos iniciales
  async cargarDatos() {
    this.cargandoEmpleados = true;
    
    // Simular carga de datos
    setTimeout(() => {
      this.empleadosFiltrados = [...this.empleados];
      this.cargandoEmpleados = false;
    }, 1500);
  }

  // Obtener subtareas completadas
  get tareasCompletadas(): Tarea[] {
    return this.subtareas.filter(tarea => tarea.completada);
  }

  // Obtener subtareas pendientes
  get tareasListaPendientes(): Tarea[] {
    return this.subtareas.filter(tarea => !tarea.completada);
  }

  // Obtener subtareas en proceso (si estado admin es "En progreso" y hay subtareas empezadas)
  get tareasListaEnProceso(): Tarea[] {
    return this.subtareas.filter(tarea => 
      tarea.estado === 'En progreso' || (tarea.progreso > 0 && !tarea.completada)
    );
  }

  // Obtener información sobre el progreso total
  get progresoGeneral(): { completadas: number; total: number; porcentaje: number } {
    if (!this.tareaAdminSeleccionada) {
      return { completadas: 0, total: 0, porcentaje: 0 };
    }
    return {
      completadas: this.tareaAdminSeleccionada.subtareasCompletadas,
      total: this.tareaAdminSeleccionada.totalSubtareas,
      porcentaje: this.tareaAdminSeleccionada.totalSubtareas > 0 
        ? (this.tareaAdminSeleccionada.subtareasCompletadas / this.tareaAdminSeleccionada.totalSubtareas) * 100 
        : 0
    };
  }

  // Métodos para completar/descompletar subtareas
  completarSubtarea(subtareaId: string): void {
    if (this.tareaAdminSeleccionada) {
      this.tareasService.completarSubtareaAdmin(this.tareaAdminSeleccionada.id, subtareaId);
      // Actualizar la lista local de subtareas
      if (this.tareaAdminSeleccionada.Tarea) {
        this.subtareas = this.tareaAdminSeleccionada.Tarea;
      }
    }
  }

  descompletarSubtarea(subtareaId: string): void {
    if (this.tareaAdminSeleccionada) {
      this.tareasService.descompletarSubtareaAdmin(this.tareaAdminSeleccionada.id, subtareaId);
      // Actualizar la lista local de subtareas
      if (this.tareaAdminSeleccionada.Tarea) {
        this.subtareas = this.tareaAdminSeleccionada.Tarea;
      }
    }
  }

  // Método para navegar a subtarea individual
  navegarASubtarea(subtarea: Tarea) {
    this.router.navigate(['/tareas/subtarea-info'], {
      queryParams: {
        tareaId: subtarea.id,
        titulo: subtarea.titulo,
        estado: subtarea.estado,
        categoria: subtarea.Categoria,
        horainicio: subtarea.horainicio,
        horafin: subtarea.horafin,
        descripcion: subtarea.descripcion,
        prioridad: subtarea.Prioridad,
        completada: subtarea.completada,
        progreso: subtarea.progreso,
        fechaAsignacion: subtarea.fechaAsignacion,
        fromTab: 'tareas-admin', // Indicar que viene de tareas admin
        tareaAdminId: this.tareaAdminSeleccionada?.id // ID de la tarea admin padre
      }
    });
  }

  navegarACrearTarea() {
    this.router.navigate(['/tareas/crear-tarea'], {
      replaceUrl: false,
      skipLocationChange: false
    }).catch(error => {
      console.error('Error al navegar:', error);
      this.mostrarToastPersonalizado('Error al abrir el formulario de crear tarea', 'error');
    });
  }

  // Método para mostrar toast personalizado
  mostrarToastPersonalizado(mensaje: string, tipo: 'exito' | 'informacion' | 'advertencia' | 'error' = 'exito') {
    this.configToast = {
      tipo: tipo,
      mensaje: mensaje,
      mostrarBoton: false,
      mostrarCerrar: true
    };
    
    this.duracionToast = 3000; // Auto-cerrar después de 3 segundos
    this.mostrarToastComponent = true;
  }

  // Método para cerrar el toast personalizado
  onCerrarToast() {
    this.mostrarToastComponent = false;
  }

  goBack() {
    this.location.back();
  }

  async openModalfiltro() {
    const modal = await this.modalcontroller.create({
      component: ModalFiltrosComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'modalamedias',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data && data.filtrosAplicados) {
      console.log('Filtros aplicados:', data);
      this.aplicarFiltros(data);
      
      // Mostrar toast de confirmación con mensaje dinámico según el modo
      const mensajeFiltro = this.isApartadoAdmin 
        ? '¡Actividad filtrada satisfactoriamente!'
        : '¡Tarea filtrada satisfactoriamente!';
      
      this.mostrarToastPersonalizado(mensajeFiltro, 'exito');
    }
  }
    async openModalfiltroadmin() {
    const modal = await this.modalcontroller.create({
      component: ModalFiltrosAdminComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'modalamedias',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data && data.filtrosAplicados) {
      console.log('Filtros aplicados:', data);
      this.aplicarFiltros(data);
      
      // Mostrar toast de confirmación con mensaje dinámico según el modo
      const mensajeFiltro = this.isApartadoAdmin 
        ? '¡Actividad filtrada satisfactoriamente!'
        : '¡Tarea filtrada satisfactoriamente!';
      
      this.mostrarToastPersonalizado(mensajeFiltro, 'exito');
    }
  }
  openmodalfiltronormaloadmin() {
    if(this.tareasService.apartadoadmin === false) {
      this.openModalfiltro();
    }
    else {
      this.openModalfiltroadmin();
    }
  }
  async openModalReapertura() {
    const modal = await this.modalcontroller.create({
      component: ModalFormComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'modalamedias',
    });

    await modal.present();
  }

  private aplicarFiltros(filtros: any) {
    console.log('Aplicando filtros:', filtros);
    // La lógica de filtrado iría aquí
    // El toast se muestra ahora en openModalfiltro()
  }

  async abrirModalReaperturar() {
    if (!this.tareaAdminSeleccionada) {
      this.mostrarToastPersonalizado('No hay tarea seleccionada', 'error');
      return;
    }

    const modal = await this.modalcontroller.create({
      component: ModalFormComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'modalamedias',
      componentProps: {
        tarea: this.tareaAdminSeleccionada,
        accion: 'reaperturar'
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data && data.reaperturada) {
      // Actualizar el estado de la tarea a "Pendiente" o "En progreso"
      if (this.tareaAdminSeleccionada) {
        this.tareaAdminSeleccionada.estado = 'Pendiente';
        this.mostrarToastPersonalizado('Tarea reaperturada correctamente', 'exito');
      }
    }
  }

  async abrirModalEditar(subtarea: Tarea) {
    // Navegar al modal de crear tarea en modo edición
    this.router.navigate(['/tareas/crear-tarea'], {
      queryParams: {
        edit: 'true',
        tareaId: subtarea.id,
        titulo: subtarea.titulo,
        descripcion: subtarea.descripcion,
        categoria: subtarea.Categoria,
        prioridad: subtarea.Prioridad,
        horainicio: subtarea.horainicio,
        horafin: subtarea.horafin
      }
    });
  }

  // Método para formatear el ID en formato 000
  getFormattedId(id: string | undefined): string {
    if (!id) return '000';
    
    // Extraer solo los números del ID
    const numeroMatch = id.match(/\d+/);
    if (numeroMatch) {
      const numero = parseInt(numeroMatch[0], 10);
      return numero.toString().padStart(3, '0');
    }
    
    return '000';
  }
}
