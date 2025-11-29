import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  faAngleLeft,
  faAngleRight,
  faBars,
  faCalendar,
  faCheck,
  faClock,
  faFlag,
  faLayerGroup,
  faListCheck,
  faSliders,
  faSpinner,
  faStore,
  faTasks,
  faUsers
} from '@fortawesome/pro-regular-svg-icons';
import { ModalController } from '@ionic/angular';
import { addDays, addWeeks, endOfWeek, format, isAfter, isSameDay, startOfWeek, subWeeks } from 'date-fns';
import { CONFIRMATION_MODAL } from '../core/constants';
import { ToastService } from '../core/services/toast.service';
import { ModalConfirmationComponent } from '../ui/modal-confirmation/modal-confirmation.component';
import { ToastConfig } from '../ui/toast-notificacion/toast-notificacion.component';
import { ModalFormComponent } from './modal-form/modal-form.component';
import { ModalFiltrosAdminComponent } from './pages/modal-filtros-admin/modal-filtros-admin.component';
import { ModalFiltrosComponent } from './pages/modal-filtros/modal-filtros.component';
import { Tarea, tareaadmin, TareasService } from './tareas.service';
@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
})
export class TareasPage implements OnInit, OnDestroy {
  public faAngleLeft = faAngleLeft;
  public faAngleRight = faAngleRight;
  public faUsers = faUsers;
  public faTasks = faTasks;
  public faBars = faBars;
  public faCalendar = faCalendar;
  public faClock = faClock;
  public faSpinner = faSpinner;
  public faCheck = faCheck;
  public faSliders = faSliders;
  public faStore = faStore;
  public faLayerGroup = faLayerGroup;
  public faListCheck = faListCheck;
  public faFlag = faFlag;

  searchTerm = '';
  selectedTab: string = 'mis-tareas';
  filtroTareas: string = 'todos';
  filtroscategoria: string='todos' // Control para los tabs: 'todos', 'pendientes', 'finalizadas'
  
  // Filtros aplicados desde el modal
  filtrosActivos: any = {};
  
  // Copias originales de las tareas para filtrado
  tareasDiaSeleccionadoOriginal: Tarea[] = [];
  tareasadminOriginal: tareaadmin[] = [];
  
  tareasadmin: tareaadmin[] = [];

  // Variables para selección múltiple de tareas
  tareasSeleccionadas: Set<string> = new Set();
  modoSeleccion: boolean = false;

  // Variables para animación de tareas añadidas
  tareaRecienAnadida: string = ''; // ID de la tarea que se acaba de añadir

    // Propiedades para toast dinámico
  mostrarToast: boolean = false;
  duracionToast: number = 0; // Duración en milisegundos (0 = no auto-cerrar)
  configToast: ToastConfig = {
    tipo: 'exito',
    mensaje: '',
    icono: 'checkmark-circle',
    botonTexto: 'Deshacer',
    mostrarBoton: true,
    mostrarCerrar: true
  };
  tareaIniciadaId: string = ''; // Para poder deshacer la acción de iniciar
  tareaFinalizadaId: string = ''; // Para poder deshacer la acción de finalizar
  tareaAnteriorCompletadaId: string = ''; // Para restaurar la tarea que se completó automáticamente

  // Variables del calendario
  dia: Date = new Date();
  diaString: string = '';
  fechaMaxString: string = '';
  hoy: Date = new Date();
  nroSemana: number = 1;
  vercontent=true;
  // Variables del widget de estadísticas
  tareasRealizadas: number = 0;
  totalTareas: number = 0;
  porcentajeAvance: number = 0;
  // Variables para el círculo de progreso
  circumference: number = 100.48; // 2 * π * 16 (radio del círculo)
  strokeDashoffset: number = 70.34; // Calculado según el porcentaje
  colorProgreso: string = '#ef4444'; // Color dinámico según el porcentaje
  
  // Variables de datos dinámicos
  tareasDiaSeleccionado: Tarea[] = [];
  mostrarEmpty: boolean = false;
  mostrarEmptyAdmin: boolean = false; // Estado vacío específico para modo admin
  cargandoTareas: boolean = false;
  
  // Variables reactivas simuladas (en un caso real usarías observables)
  vm = {
    diaSeleccionado: new Date(),
    semana: [] as any[],
    puedeAvanzarSemana: true,
    tareaLoading: true, // Inicializar en true para mostrar loading
    tareaLoadingAdmin: true // Loading específico para modo admin
  };
  
  constructor(
    public tareasService: TareasService,
    private router: Router,
    private route: ActivatedRoute,
    private modalcontroller: ModalController,
    public toastService: ToastService // <-- Agrega el servicio ToastService aquí, cambia 'any' por el tipo correcto si lo tienes

  ) {
    this.inicializarCalendario();
    this.updateCircularProgress();
  }

  ngOnInit() {
    // Verificar si hay un parámetro tab en la URL
    this.route.queryParams.subscribe(params => {
      if (params['tab']) {
        this.selectedTab = params['tab'];
      }
      
      // Verificar si hay una tarea recién añadida para mostrar animación
      if (params['tareaAnadida']) {
        this.activarAnimacionTareaAnadida(params['tareaAnadida']);
      }
    });
    
    this.cargarTareasDelDia();
    
    // Inicializar copia original de tareas administrativas
    this.tareasadminOriginal = [...this.tareasService.tareasadmin];
    
    // Escuchar cambios en subtareas desde otras pantallas
    this.subscribirACambiosSubtareas();
  }
  
  
  ngOnDestroy() {
    // Limpiar suscripciones si existen
    if (this.subtareasSubscription) {
      this.subtareasSubscription.unsubscribe();
    }
  }

  private subtareasSubscription: any;

  inicializarCalendario() {
    this.hoy = new Date();
    this.dia = new Date();
    this.vm.diaSeleccionado = new Date();
    this.diaString = format(this.dia, 'yyyy-MM-dd');
    this.fechaMaxString = format(addDays(this.hoy, 30), 'yyyy-MM-dd');
    this.actualizarSemana();
  }

  // Método para cargar tareas del día seleccionado
  cargarTareasDelDia() {
    this.cargandoTareas = true;
    this.vm.tareaLoading = true;
    this.vm.tareaLoadingAdmin = true;
    this.mostrarEmpty = false;
    this.mostrarEmptyAdmin = false;
    
    // Limpiar selecciones al cambiar de día
    this.tareasSeleccionadas.clear();
    
    // Simular un delay de 1 segundo para mostrar el skeleton SOLO en carga inicial
    setTimeout(() => {
      if (this.tareasService.apartadoadmin) {
        // Modo admin - usar las tareas admin del servicio
        this.cargarTareasAdmin();
      } else {
        // Modo normal - cargar todas las tareas del día (luego se filtran por tab)
        this.tareasService.getTareasPorFecha(this.vm.diaSeleccionado).subscribe({
          next: (tareas) => {
            this.tareasDiaSeleccionado = tareas;
            this.tareasDiaSeleccionadoOriginal = [...tareas]; // Guardar copia original
            this.actualizarMostrarEmpty();
            this.cargandoTareas = false;
            this.vm.tareaLoading = false;
            
            // Actualizar contador basado en subtareas
            this.actualizarContadorBasadoEnSubtareas();
          },
          error: (error) => {
            console.error('Error cargando tareas:', error);
            this.mostrarEmpty = true;
            this.cargandoTareas = false;
            this.vm.tareaLoading = false;
          }
        });
      }
    }, 1000);
  }

  // Método específico para cargar tareas en modo admin
  private cargarTareasAdmin() {
    // Aplicar filtros de búsqueda a las tareas admin
    const tareasFiltradas = this.filtrarTareasAdmin(this.tareasService.tareasadmin);
    this.mostrarEmptyAdmin = tareasFiltradas.length === 0;
    this.cargandoTareas = false;
    this.vm.tareaLoadingAdmin = false;
  }

  // Método para filtrar tareas admin según la búsqueda
  private filtrarTareasAdmin(tareas: any[]): any[] {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      return tareas;
    }
    
    const termino = this.searchTerm.toLowerCase().trim();
    return tareas.filter(tarea => 
      tarea.titulo?.toLowerCase().includes(termino) ||
      tarea.Categoria?.toLowerCase().includes(termino) ||
      tarea.sucursal?.toLowerCase().includes(termino)
    );
  }

  // Método para recargar datos sin skeleton (para updates rápidos)
  private recargarDatosRapido() {
    // Cargar tareas del día sin delay
    this.tareasService.getTareasPorFecha(this.vm.diaSeleccionado).subscribe({
      next: (tareas) => {
        this.tareasDiaSeleccionado = tareas;
        this.tareasDiaSeleccionadoOriginal = [...tareas]; // Guardar copia original
        this.actualizarMostrarEmpty();
        
        // Actualizar contador basado en subtareas
        this.actualizarContadorBasadoEnSubtareas();
      }
    });
  }

  // Método para actualizar el estado mostrarEmpty basado en tareas filtradas
  private actualizarMostrarEmpty() {
    if (this.tareasService.apartadoadmin) {
      this.mostrarEmptyAdmin = this.filtrarTareasAdmin(this.tareasService.tareasadmin).length === 0;
    } else {
      this.mostrarEmpty = this.tareasFiltradas.length === 0;
    }
  }

  // Método que se ejecuta cuando se selecciona un día del calendario
  seleccionarDia(fecha: Date) {
    this.vm.diaSeleccionado = fecha;
    this.dia = fecha;
    this.cargarTareasDelDia();
  }

  actualizarSemana() {
    const inicioSemana = startOfWeek(this.dia, { weekStartsOn: 1 });
    const finSemana = endOfWeek(this.dia, { weekStartsOn: 1 });
    
    this.vm.semana = [];
    
    for (let i = 0; i < 7; i++) {
      const dia = addDays(inicioSemana, i);
      this.vm.semana.push({
        fecha: dia,
        habilitado: !isAfter(dia, this.hoy)
      });
    }
    
    // Corregir la lógica: Solo deshabilitar si la siguiente semana empieza después de hoy
    const inicioProximaSemana = startOfWeek(addWeeks(this.dia, 1), { weekStartsOn: 1 });
    this.vm.puedeAvanzarSemana = !isAfter(inicioProximaSemana, this.hoy);
    
    // Calcular número de semana del año
    const inicioAno = new Date(this.dia.getFullYear(), 0, 1);
    const dias = Math.floor((this.dia.getTime() - inicioAno.getTime()) / (24 * 60 * 60 * 1000));
    this.nroSemana = Math.ceil((dias + inicioAno.getDay() + 1) / 7);
  }

  verSemanaAnterior() {
    this.dia = subWeeks(this.dia, 1);
    this.actualizarSemana();
    // Al cambiar de semana, recargar con skeleton
    this.cargarTareasDelDia();
  }

  verSemanaSiguiente() {
    if (this.vm.puedeAvanzarSemana) {
      this.dia = addWeeks(this.dia, 1);
      this.actualizarSemana();
      // Al cambiar de semana, recargar con skeleton
      this.cargarTareasDelDia();
    }
  }

  isSameDay(fecha1: Date, fecha2: Date): boolean {
    return isSameDay(fecha1, fecha2);
  }

  // Método para cuando cambie el día desde el datetime
  onDiaChange() {
    if (this.diaString) {
      this.dia = new Date(this.diaString);
      this.actualizarSemana();
      this.seleccionarDia(this.dia);
    }
  }

  openModalcalendario() {
    // Aquí puedes abrir un modal del calendario si es necesario
    console.log('Abrir modal calendario');
  }
   async openModalfiltroAdmin() {
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
      // Guardar los filtros activos
      this.filtrosActivos = data;
      
      // Aplicar filtros inmediatamente
      this.aplicarFiltrosATareasAdmin();
      
      // Mostrar toast de confirmación
      this.mostrarToastSimple('¡Actividad filtrada satisfactoriamente!', 'exito');
    } else if (data === null) {
      // Modal cancelado, limpiar filtros
      this.limpiarFiltros();
    }
    
    }

  // Método para abrir el modal de filtros usando el modal controller
  async abrirModalFiltro() {
    const modal = await this.modalcontroller.create({
      component: ModalFiltrosComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'modalamedias',
      componentProps: {
        selectedTab: this.selectedTab,
        esAdmin: this.tareasService.apartadoadmin
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data && data.filtrosAplicados) {
      console.log('Filtros aplicados:', data);
      // Guardar los filtros activos
      this.filtrosActivos = data;
      
      // Aplicar filtros inmediatamente
      this.aplicarFiltrosATareas();
      
      // Mostrar toast de confirmación con mensaje dinámico según el modo
      const mensajeFiltro = this.tareasService.apartadoadmin 
        ? '¡Actividad filtrada satisfactoriamente!'
        : '¡Tarea filtrada satisfactoriamente!';
      
      this.mostrarToastSimple(mensajeFiltro, 'exito');
    } else if (data === null) {
      // Modal cancelado, limpiar filtros
      this.limpiarFiltros();
    }
  }

  // Método para abrir el modal de reapertura usando el modal controller
  async abrirModalReapertura(tarea: any) {
    const modal = await this.modalcontroller.create({
      component: ModalFormComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'modalamedias',
      componentProps: {
        tarea: tarea
      }
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    
    if (data && data.reaperturaConfirmada) {
      console.log('Reapertura confirmada:', data);
      // Aquí puedes implementar la lógica para reaperturar la tarea
      // Por ejemplo: actualizar el estado de la tarea, enviar a un servicio, etc.
      
      // Recargar tareas
      this.cargarTareasDelDia();
    }
  }

  // Método para aplicar filtros a las tareas
  aplicarFiltrosATareas() {
    // Recargar tareas con filtros aplicados
    if (this.selectedTab === 'mis-tareas') {
      this.filtrarMisTareas();
    } else if (this.selectedTab === 'tareas-sin-asignar') {
      this.filtrarTareasSinAsignar();
    } else if (this.tareasService.apartadoadmin === true) {
      this.aplicarFiltrosATareasAdmin();
    }
  }

  // Filtrar mis tareas
  filtrarMisTareas() {
    let tareasFiltradas = [...this.tareasDiaSeleccionadoOriginal];

    if (this.filtrosActivos.categoria && this.filtrosActivos.categoria !== '') {
      tareasFiltradas = tareasFiltradas.filter(tarea => 
        tarea.Categoria?.toLowerCase() === this.filtrosActivos.categoria.toLowerCase()
      );
    }

    if (this.filtrosActivos.progreso && this.filtrosActivos.progreso !== '') {
      tareasFiltradas = tareasFiltradas.filter(tarea => 
        tarea.estado?.toLowerCase() === this.filtrosActivos.progreso.toLowerCase()
      );
    }

    this.tareasDiaSeleccionado = tareasFiltradas;
  }

  // Filtrar tareas sin asignar
  filtrarTareasSinAsignar() {
    let tareasFiltradas = [...this.tareasDiaSeleccionadoOriginal];

    if (this.filtrosActivos.categoria && this.filtrosActivos.categoria !== '') {
      tareasFiltradas = tareasFiltradas.filter(tarea => 
        tarea.Categoria?.toLowerCase() === this.filtrosActivos.categoria.toLowerCase()
      );
    }

    // Filtrar solo tareas sin asignar
    tareasFiltradas = tareasFiltradas.filter(tarea => 
      !tarea.usuarioasignado || tarea.usuarioasignado === null
    );

    this.tareasDiaSeleccionado = tareasFiltradas;
  }

  // Filtrar tareas administrativas con filtros aplicados
  aplicarFiltrosATareasAdmin() {
    // Solo aplicar filtros si estamos en modo admin
    if (!this.tareasService.apartadoadmin) {
      return;
    }

    let tareasAdminFiltradas = [...this.tareasadminOriginal];

    // Filtro por sucursal/departamento
    if (this.filtrosActivos.departamento && this.filtrosActivos.departamento !== '') {
      tareasAdminFiltradas = tareasAdminFiltradas.filter(tarea => 
        tarea.sucursal === this.filtrosActivos.departamento
      );
    }

    // Filtro por categoría
    if (this.filtrosActivos.categoria && this.filtrosActivos.categoria !== '') {
      tareasAdminFiltradas = tareasAdminFiltradas.filter(tarea => 
        tarea.Categoria?.toLowerCase().includes(this.filtrosActivos.categoria.toLowerCase())
      );
    }

    // Filtro por estado/progreso
    if (this.filtrosActivos.progreso && this.filtrosActivos.progreso !== '') {
      tareasAdminFiltradas = tareasAdminFiltradas.filter(tarea => 
        tarea.estado?.toLowerCase().includes(this.filtrosActivos.progreso.toLowerCase())
      );
    }

    // Actualizar las tareas mostradas y el estado vacío
    this.tareasadmin = tareasAdminFiltradas;
    this.mostrarEmptyAdmin = tareasAdminFiltradas.length === 0;
    
    console.log('Filtros aplicados a tareas admin:', this.filtrosActivos);
    console.log('Tareas filtradas:', tareasAdminFiltradas.length);
  }

  // Limpiar filtros y restaurar tareas originales
  limpiarFiltros() {
    this.filtrosActivos = {};
    
    if (this.tareasService.apartadoadmin) {
      // Modo admin: restaurar tareas admin originales
      this.tareasadmin = [...this.tareasadminOriginal];
      this.mostrarEmptyAdmin = this.tareasadmin.length === 0;
    } else {
      // Modo normal: restaurar tareas del día
      this.tareasDiaSeleccionado = [...this.tareasDiaSeleccionadoOriginal];
      this.actualizarMostrarEmpty();
    }
    
    console.log('Filtros limpiados');
  }
  
  // Método para actualizar el progreso circular
  updateCircularProgress() {
    if (this.totalTareas > 0) {
      this.porcentajeAvance = Math.round((this.tareasRealizadas / this.totalTareas) * 100);
    } else {
      this.porcentajeAvance = 0;
    }
    
    // Calcular stroke-dashoffset para mostrar el progreso
    this.strokeDashoffset = this.circumference * (100 - this.porcentajeAvance) / 100;
    
    // Actualizar color según el porcentaje
    this.updateColorProgreso();
  }

  // Método para actualizar el color según el porcentaje
  updateColorProgreso() {
    if (this.porcentajeAvance === 100) {
      this.colorProgreso = '#3b82f6'; // Azul para 100%
    } else if (this.porcentajeAvance > 50) {
      this.colorProgreso = '#22c55e'; // Verde para más de 50%
    } else if (this.porcentajeAvance >= 25) {
      this.colorProgreso = '#f59e0b'; // Amarillo para 25-50%
    } else {
      this.colorProgreso = '#ef4444'; // Rojo para menos de 25%
    }
  }

  // Método para actualizar las estadísticas de tareas
  updateEstadisticas(realizadas: number, total: number) {
    this.tareasRealizadas = realizadas;
    this.totalTareas = total;
    this.updateCircularProgress();
  }

  // Método para suscribirse a cambios en subtareas
  private subscribirACambiosSubtareas() {
    // Escuchar eventos de cambios en subtareas
    this.tareasService.subtareasActualizadas$.subscribe(() => {
      this.actualizarContadorBasadoEnSubtareas();
    });
  }
  // Método para actualizar contador basado en el progreso de subtareas
  private actualizarContadorBasadoEnSubtareas() {
    let tareasCompletadas = 0;
    let totalTareas = this.tareasDiaSeleccionado.length;

    this.tareasDiaSeleccionado.forEach(tarea => {
      if (tarea.totalSubtareas > 0) {
        // Para tareas con subtareas, se considera completada si todas las subtareas están completadas
        if (tarea.subtareasCompletadas === tarea.totalSubtareas) {
          tareasCompletadas++;
        }
      } else {
        // Para tareas sin subtareas, usar el estado directo
        if (tarea.completada) {
          tareasCompletadas++;
        }
      }
    });

    this.tareasRealizadas = tareasCompletadas;
    this.totalTareas = totalTareas;
    this.updateCircularProgress();
  }

  // Método público para actualizar una tarea específica desde sub-tareas
  public actualizarProgresoTarea(tareaId: string, subtareasCompletadas: number, totalSubtareas: number) {
    const tarea = this.tareasDiaSeleccionado.find(t => t.id === tareaId);
    if (tarea) {
      tarea.subtareasCompletadas = subtareasCompletadas;
      tarea.totalSubtareas = totalSubtareas;
      
      // Marcar la tarea principal como completada si todas las subtareas están completadas
      tarea.completada = subtareasCompletadas === totalSubtareas && totalSubtareas > 0;
      
      this.actualizarContadorBasadoEnSubtareas();
    }
  }

  // Método para manejar click en tarea (navegar a subtarea-info)
  completarTarea(tareaId: string) {
    // Verificar si el día seleccionado es anterior al presente
    if (this.esDiaAnteriorAlPresente()) {
      console.log('No se pueden modificar tareas de días anteriores');
      return; // No hacer nada si es un día anterior
    }

    const tarea = this.tareasDiaSeleccionado.find(t => t.id === tareaId);
    if (tarea) {
      // Navegar a la pantalla de subtarea-info
      this.router.navigate(['/tareas/subtarea-info'], { 
        queryParams: { 
          tareaId: tarea.id,
          fromTab: this.selectedTab  // Pasar información del tab actual
        } 
      });
    }
  }

  // Método específico para toggle del estado de completado (usado por el botón)
  toggleTareaCompletada(tareaId: string) {
    // Verificar si el día seleccionado es anterior al presente
    if (this.esDiaAnteriorAlPresente()) {
      console.log('No se pueden modificar tareas de días anteriores');
      return; // No hacer nada si es un día anterior
    }

    const tarea = this.tareasDiaSeleccionado.find(t => t.id === tareaId);
    if (tarea) {
      const nuevoEstado = !tarea.completada;
      
      this.tareasService.toggleCompletarTarea(tareaId, nuevoEstado).subscribe({
        next: () => {
          this.recargarDatosRapido(); // Usar recarga rápida sin skeleton
        }
      });
    }
  }

  // Método para verificar si el día seleccionado es anterior al presente
  private esDiaAnteriorAlPresente(): boolean {
    const hoy = new Date();
    const diaSeleccionado = this.vm.diaSeleccionado;
    
    // Normalizar las fechas para comparar solo año, mes y día (sin hora)
    const hoyNormalizado = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const diaSeleccionadoNormalizado = new Date(diaSeleccionado.getFullYear(), diaSeleccionado.getMonth(), diaSeleccionado.getDate());
    
    return diaSeleccionadoNormalizado < hoyNormalizado;
  }

  // Método público para verificar si las tareas están deshabilitadas (para usar en template)
  get tareasDeshabilitadas(): boolean {
    return this.esDiaAnteriorAlPresente();
  }

  // Método para manejar el click del botón de completar con verificación de fecha
  onBotonCompletarClick(tareaId: string, event: Event) {
    if (!this.tareasDeshabilitadas) {
      this.toggleTareaCompletada(tareaId);
      event.stopPropagation();
    }
  }

  // Método para obtener el estado visual de la tarea
  getEstadoTarea(tarea: Tarea) {
    if (tarea.completada) {
      return 'Variant25'; // Completada
    } else {
      return 'Variant24'; // En progreso
    }
  }
  obtenerTareasPorCategoria(){
    let tareas:Tarea[];
    switch(this.filtroscategoria){
      case 'todos':
        tareas = this.tareasDiaSeleccionado;
        break;
      default:
        tareas = this.tareasDiaSeleccionado.filter(m => m.Categoria?.toLowerCase().includes(this.filtroscategoria.toLowerCase()));
        break;
    }
  }

  // Método para obtener el color del border según el estado
  getBorderColor(tarea: Tarea): string {
    // if (tarea.completada) {
    //   return '#e4e4e4'; // Gris para completadas
    // } else {
    //   return '#f2a626'; // Amarillo para no completadas
    // }
    switch (tarea.estado) {
      case 'Completada':
        return '#6DC560'; // Gris para Completada
      case 'Pendiente':
        return '#f2a626'; // Amarillo para Pendiente
      case 'En progreso':
        return '#1859C4';
        case 'Cerrada':
        return '#C7C7C7'; // Azul para en progreso
      default:
        return '#DDD'; // Gris por defecto
    }
  }

  // Método para obtener el color del border para tareas admin
  getBorderColorAdmin(tarea: tareaadmin): string {
    switch (tarea.estado) {
      case 'Completada':
        return '#6DC560'; // Verde para completadas
      case 'Pendiente':
        return '#F59E0B'; // Naranja para pendientes
      case 'En progreso':
        return '#3B82F6'; // Azul para en progreso
      default:
        return '#DDD'; // Gris por defecto
    }
  }

   
  // Método trackBy para optimizar el rendimiento del ngFor
  trackByTareaId(index: number, tarea: Tarea): string {
    return tarea.id;
  }

  // Método trackBy para tareas admin
  trackByTareaAdminId(index: number, tarea: tareaadmin): string {
    return tarea.id;
  }

  // Método para cambiar el filtro de tareas
  cambiarFiltroTareas(filtro: string) {
    this.filtroTareas = filtro;
    console.log('Filtro cambiado a:', filtro);
  }

  // Método para obtener tareas filtradas según el tab seleccionado y búsqueda

  get tareasFiltradas(): Tarea[] {
    let tareasFiltradas: Tarea[] = [];
    
    // Primero filtrar por tab
    switch (this.selectedTab) {
      case 'tareas-sin-asignar':
        // Mostrar tareas que NO tienen usuario asignado
        tareasFiltradas = this.tareasDiaSeleccionado.filter(tarea => !tarea.usuarioasignado);
        break;
      case 'mis-tareas':
        // Mostrar tareas asignadas al usuario actual
        tareasFiltradas = this.tareasDiaSeleccionado.filter(tarea => 
          tarea.usuarioasignado === this.tareasService.usuarioActual
        );
        break;
      case 'todos':
      default:
        tareasFiltradas = this.tareasDiaSeleccionado;
        break;
    }
    

    // Luego filtrar por término de búsqueda
    if (this.searchTerm && this.searchTerm.trim() !== '') {
      const termino = this.searchTerm.toLowerCase().trim();
      tareasFiltradas = tareasFiltradas.filter(tarea => 
        tarea.titulo.toLowerCase().includes(termino)
      );
    }
    
    // Ordenar según la lógica especificada
    tareasFiltradas.sort((a, b) => {
      // Definir orden de estados
      const estadoOrden = {
        'En progreso': 1,    // Primero
        'Pendiente': 2,      // Segundo (pero se ordena por prioridad)
        'Completada': 3,     // Tercero
        'Cerrada': 4,         // Cuarto
        'Activo': 5,         // Quinto
        'Inactiva': 6         // Último
               // Último
      };
      
      // Definir orden de prioridades
      const prioridadOrden = { 'Alta': 1, 'Media': 2, 'Baja': 3 };
      
      const estadoA = estadoOrden[a.estado] || 5;
      const estadoB = estadoOrden[b.estado] || 5;
      
      // Si los estados son diferentes, ordenar por estado
      if (estadoA !== estadoB) {
        return estadoA - estadoB;
      }
      
      // Si ambos son "Pendiente", ordenar por prioridad
      if (a.estado === 'Pendiente' && b.estado === 'Pendiente') {
        const prioridadA = prioridadOrden[a.Prioridad || 'Baja'];
        const prioridadB = prioridadOrden[b.Prioridad || 'Baja'];
        return prioridadA - prioridadB;
      }
      
      // Para estados iguales (que no sean Pendiente), mantener orden original
      return 0;
    });
    
    return tareasFiltradas;
  }

  // Getter para obtener tareas admin filtradas
  get tareasAdminFiltradas(): any[] {
    // Si estamos en modo admin, usar las tareas ya filtradas
    if (this.tareasService.apartadoadmin) {
      return this.filtrarTareasAdmin(this.tareasadmin.length > 0 ? this.tareasadmin : this.tareasService.tareasadmin);
    }
    return this.filtrarTareasAdmin(this.tareasService.tareasadmin);
  }

  // Método para obtener el conteo de tareas por tipo
  getConteoTareas(tipo: string): number {
    switch (tipo) {
      case 'todos':
        return this.tareasDiaSeleccionado.length;
      case 'pendientes':
        return this.tareasDiaSeleccionado.filter(tarea => !tarea.completada).length;
      case 'finalizadas':
        return this.tareasDiaSeleccionado.filter(tarea => tarea.completada).length;
      default:
        return 0;
    }
  }

  // Método para obtener el texto del estado vacío según el filtro
  getTextoVacio(): string {
    switch (this.filtroTareas) {
      case 'pendientes':
        return 'No tienes tareas pendientes';
      case 'finalizadas':
        return 'No tienes tareas finalizadas';
      case 'todos':
      default:
        return 'No tienes tareas nuevas';
    }
  }

  // Método para obtener la descripción del estado vacío según el filtro
  getDescripcionVacio(): string {
    switch (this.filtroTareas) {
      case 'pendientes':
        return '¡Genial! Has completado todas tus tareas pendientes.';
      case 'finalizadas':
        return 'Aún no has completado ninguna tarea. ¡Comienza ahora!';
      case 'todos':
      default:
        return 'Aún no se te ha asignado una nueva tarea. Pronto se te asignará una.';
    }
  }
  public async openModalIniciar(tareaId?: string, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar que se dispare el click de la fila
    }

    if (tareaId) {
      console.log('Iniciando tarea directamente:', tareaId);
      
      // Limpiar variables de acción anterior (finalizar) para evitar conflictos
      this.tareaFinalizadaId = '';
      
      // Primero, completar cualquier tarea que esté actualmente en progreso
      const tareaEnProgreso = this.tareasDiaSeleccionado.find(t => t.estado === 'En progreso');
      if (tareaEnProgreso) {
        tareaEnProgreso.estado = 'Completada';
        this.tareaAnteriorCompletadaId = tareaEnProgreso.id; // Guardar para poder restaurar
        console.log('Tarea anterior completada automáticamente:', tareaEnProgreso.id);
      } else {
        this.tareaAnteriorCompletadaId = ''; // No hay tarea anterior
      }
      
      // Luego, actualizar el estado de la nueva tarea a "En progreso"
      const tarea = this.tareasDiaSeleccionado.find(t => t.id === tareaId);
      if (tarea) {
        tarea.estado = 'En progreso';
        this.tareaIniciadaId = tareaId; // Guardar para poder deshacer
        console.log('Tarea iniciada exitosamente');
        
        // Mostrar toast con botón "Deshacer"
        this.mostrarToastIniciar(tareaEnProgreso);

        // Recargar datos para reflejar los cambios
        this.recargarDatosRapido();
      }
    }
  }

  // Método para mostrar el toast de iniciar tarea
  private mostrarToastIniciar(tareaAnteriorCompletada?: Tarea) {
    const mensaje = tareaAnteriorCompletada 
      ? 'Tarea anterior completada. Nueva tarea iniciada exitosamente'
      : 'Iniciando tarea...';

    this.configToast = {
      tipo: 'informacion',
      mensaje: mensaje,
      mostrarBoton: true,
      botonTexto: 'Deshacer',
      mostrarCerrar: true
    };
    
    this.duracionToast = 0; // No auto-cerrar para toasts con botón deshacer
    this.mostrarToast = true;
  }

  // Método para manejar el clic del botón del toast (detecta automáticamente la acción)
  public onBotonToastClick() {
    if (this.tareaIniciadaId) {
      this.onDeshacerIniciarTarea();
    } else if (this.tareaFinalizadaId) {
      this.onDeshacerFinalizarTarea();
    }
  }

  // Método para manejar el clic del botón "Deshacer"
  public onDeshacerIniciarTarea() {
    if (this.tareaIniciadaId) {
      // 1. Restaurar la tarea iniciada a "Pendiente"
      const tareaIniciada = this.tareasDiaSeleccionado.find(t => t.id === this.tareaIniciadaId);
      if (tareaIniciada) {
        tareaIniciada.estado = 'Pendiente';
        console.log('Tarea iniciada restaurada a Pendiente:', this.tareaIniciadaId);
      }
      
      // 2. Restaurar la tarea anterior que se completó automáticamente
      if (this.tareaAnteriorCompletadaId) {
        const tareaAnterior = this.tareasDiaSeleccionado.find(t => t.id === this.tareaAnteriorCompletadaId);
        if (tareaAnterior) {
          tareaAnterior.estado = 'En progreso';
          console.log('Tarea anterior restaurada a En progreso:', this.tareaAnteriorCompletadaId);
        }
      }
      
      // 3. Limpiar variables y ocultar toast
      this.mostrarToast = false;
      this.tareaIniciadaId = '';
      this.tareaAnteriorCompletadaId = '';
      
      // 4. Recargar datos
      this.recargarDatosRapido();
      
      // 5. Mostrar toast de confirmación
      this.mostrarToastSimple('Acción deshecha - Estados restaurados', 'exito');
    }
  }

  // Método para cerrar el toast
  public onCerrarToast() {
    this.mostrarToast = false;
    this.tareaIniciadaId = '';
    this.tareaFinalizadaId = '';
    this.tareaAnteriorCompletadaId = '';
  }

  // Método para mostrar toast de finalización
  private mostrarToastFinalizar() {
    this.configToast = {
      tipo: 'exito',
      mensaje: 'Tarea finalizada exitosamente',
      mostrarBoton: true,
      botonTexto: 'Deshacer',
      mostrarCerrar: true
    };
    
    this.duracionToast = 0; // No auto-cerrar para toasts con botón deshacer
    this.mostrarToast = true;
  }

  // Método para manejar el clic del botón "Deshacer" para finalización
  public onDeshacerFinalizarTarea() {
    if (this.tareaFinalizadaId) {
      const tarea = this.tareasDiaSeleccionado.find(t => t.id === this.tareaFinalizadaId);
      if (tarea) {
        tarea.estado = 'En progreso'; // Volver al estado anterior
        tarea.completada = false;
        tarea.progreso = 50; // O el progreso que tenía antes
        console.log('Finalización de tarea deshecha:', this.tareaFinalizadaId);
        
        // Ocultar toast
        this.mostrarToast = false;
        this.tareaFinalizadaId = '';
        
        // Recargar datos
        this.recargarDatosRapido();
        
        // Mostrar toast de confirmación
        this.mostrarToastSimple('Finalización deshecha', 'exito');
      }
    }
  }

  // Método auxiliar para mostrar toasts simples
  private mostrarToastSimple(mensaje: string, tipo: 'exito' | 'informacion' | 'advertencia' | 'error' = 'informacion') {
    this.configToast = {
      tipo: tipo,
      mensaje: mensaje,
      mostrarBoton: false,
      mostrarCerrar: true
    };
    
    this.duracionToast = 3000; // Auto-cerrar después de 3 segundos
    this.mostrarToast = true;
  }

    public async openModalAignar(event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar que se dispare el click de la fila
    }

    const modal = await this.modalcontroller.create({
      component: ModalConfirmationComponent,
      cssClass: 'promo',
      componentProps: {
        title: "¿Desea iniciar la tarea?",
        message: "Una vez iniciada, deberás completarla.",
        btnCancelTxt: "Cancelar",
        btnOkTxt: "Confirmar",
        isIniciar: true,
      }
    });
    await modal.present();
    modal.onDidDismiss().then(async (data) => {
      if (data?.data?.opcion == CONFIRMATION_MODAL.SI) {
            const mensaje = 'Iniciando tarea'

    this.configToast = {
      tipo: 'exito',
      mensaje: mensaje,
      mostrarBoton: false,
      botonTexto: 'Deshacer',
      mostrarCerrar: true
    };
    
    this.duracionToast = 3000; // No auto-cerrar para toasts con botón deshacer
    this.mostrarToast = true;
    if (this.tareasSeleccionadas.size === 0) {
      return;
    }

    const tareasIds = Array.from(this.tareasSeleccionadas);
    const numeroTareas = this.tareasSeleccionadas.size;
    
    this.tareasService.asignarTareasAUsuario(tareasIds).subscribe({
      next: (exito) => {
        if (exito) {
          // Mostrar toast de confirmación
          
          // Limpiar selecciones
          this.tareasSeleccionadas.clear();
          
          // Recargar datos para reflejar los cambios
          this.recargarDatosRapido();
          this.selectedTab = 'mis-tareas';
          
        }
      },
      error: (error) => {
        console.error('Error asignando tareas:', error);
        // Mostrar toast de error
        this.toastService.error('Error al añadir las tareas. Inténtalo de nuevo.');
      }
    });
    }
    });
  }
  public async openModalFinalizar(tareaId?: string, event?: Event) {
    if (event) {
      event.stopPropagation(); // Evitar que se dispare el click de la fila
    }

    if (tareaId) {
      // Limpiar variables de acción anterior (iniciar) para evitar conflictos
      this.tareaIniciadaId = '';
      this.tareaAnteriorCompletadaId = '';
      
      // Finalizar directamente sin modal de confirmación
      const tarea = this.tareasDiaSeleccionado.find(t => t.id === tareaId);
      if (tarea) {
        // Cambiar estado a "Completada"
        tarea.estado = 'Completada';
        tarea.completada = true;
        tarea.progreso = 100;
        
        this.tareaFinalizadaId = tareaId; // Guardar para poder deshacer
        this.mostrarToastFinalizar();
        
        console.log('Tarea finalizada directamente:', tareaId);
        this.recargarDatosRapido();
      }
    }
  }

  // Método para navegar a tareas-info desde admin
  navegarATareaInfo(tarea: tareaadmin) {
    this.router.navigate(['/tareas/tarea-info'], {
      queryParams: {
        tareaId: tarea.id,
        titulo: tarea.titulo,
        estado: tarea.estado,
        categoria: tarea.Categoria,
        sucursal: tarea.sucursal,
        horaprogramada: tarea.horaprogramada,
        horainicio: tarea.horainicio,
        horafin: tarea.horafin
      }
    });
  }

  // Método para manejar la búsqueda
  onSearchBarInput(event: any) {
    const query = event.target.value;
    this.searchTerm = query;
    // Actualizar el estado vacío cuando cambie la búsqueda
    this.actualizarMostrarEmpty();
  }

  // ========== MÉTODOS PARA SELECCIÓN MÚLTIPLE ==========

  // Método para alternar selección de una tarea
  toggleSeleccionTarea(tareaId: string, event: Event) {
    event.stopPropagation(); // Evitar que se dispare el click de la fila

    if (this.tareasSeleccionadas.has(tareaId)) {
      this.tareasSeleccionadas.delete(tareaId);
    } else {
      this.tareasSeleccionadas.add(tareaId);
    }
  }

  // Método para verificar si una tarea está seleccionada
  isTareaSeleccionada(tareaId: string): boolean {
    return this.tareasSeleccionadas.has(tareaId);
  }

  // Getter para verificar si hay tareas seleccionadas
  get hayTareasSeleccionadas(): boolean {
    return this.tareasSeleccionadas.size > 0;
  }

  // Getter para obtener el número de tareas seleccionadas
  get numeroTareasSeleccionadas(): number {
    return this.tareasSeleccionadas.size;
  }

  // Método para asignar tareas seleccionadas al usuario actual


  // Método para cambiar de tab (limpiar selecciones al cambiar)
  segmentChanged(event: any) {
    this.selectedTab = event.detail.value;
    this.tareasSeleccionadas.clear(); // Limpiar selecciones al cambiar de tab
  }

  // Método para activar animación de tarea recién añadida
  private activarAnimacionTareaAnadida(tareaId: string) {
    this.tareaRecienAnadida = tareaId;
    
    // Desactivar la animación después de 2 segundos
    setTimeout(() => {
      this.tareaRecienAnadida = '';
    }, 2000);
  }

  // Método para refrescar datos
  refreshData(event?: any) {
    // Recargar datos según el contexto
    if (this.tareasService.apartadoadmin) {
      // Recargar tareas admin
      this.cargarTareasAdmin();
    } else {
      // Recargar tareas normales
      this.cargarTareasDelDia();
    }
    
    // Completar el evento de refresh si existe
    if (event && event.target) {
      setTimeout(() => {
        event.target.complete();
      }, 1500);
    }
  }

  // Método para manejar infinite scroll
  onIonInfinite(event: any) {
    // Por ahora, como no hay paginación implementada, simplemente completamos el evento
    // En el futuro, aquí se puede agregar la lógica de paginación
    setTimeout(() => {
      if (event && event.target) {
        event.target.complete();
      }
    }, 500);
  }
}
