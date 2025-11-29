import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faBroomWide, faCheck, faCheckCircle } from '@fortawesome/pro-solid-svg-icons';
import { ModalController } from '@ionic/angular';
import { TareasService } from '../../tareas.service';

interface FiltroOpcion {
  nombre: string;
  seleccionado: boolean;
}

@Component({
  selector: 'app-modal-filtros',
  templateUrl: './modal-filtros.component.html',
  styleUrls: ['./modal-filtros.component.scss'],
})
export class ModalFiltrosComponent implements OnInit {
  // Iconos FontAwesome
  public faCheck = faCheck;
  public faBroomWide = faBroomWide;
  public faCheckCircle = faCheckCircle;

  // Props recibidas del componente padre
  @Input() selectedTab: string = 'mis-tareas';
  @Input() esAdmin: boolean = false;

  // Propiedades para los filtros (modo select)
  filtroEstado: string = '';
  filtroDepartamento: string = '';
  filtroTurno: string = '';
  filtroRol: string = '';
  filtroPrioridad: string = '';
  filtroProgreso: string = '';
  filtroEstadoActivo: string = '';
  filtroCategoria: string = ''; // Filtro específico para tareas sin asignar
  filtroCargo: string = ''; // Filtro para cargo

  // Opciones disponibles para los selects
  estados = ['Disponible', 'Ocupado', 'No disponible'];
  departamentos = ['Todas', 'Sede centro', 'Sucursal Norte', 'Sucursal Sur'];
  turnos = ['Mañana', 'Tarde', 'Noche'];
  roles = ['Todos', 'Reportes', 'Supervisión', 'Reuniones', 'Aprobaciones', 'Recursos Humanos', 'Seguridad', 'Finanzas', 'Planificación', 'Capacitación', 'Proveedores'];
  cargos = ['Todos', 'Gerente', 'Supervisor', 'Jefe de Área', 'Coordinador'];
  prioridades = ['Todos', 'Alta', 'Media', 'Baja'];
  progresos = ['Todos', 'Pendiente', 'En progreso', 'Completada'];
  estadosActivos = ['Todos', 'Activo', 'Inactivo'];

  // Filtros para el modo lista (tareas-sin-asignar)
  listadoCategorias: FiltroOpcion[] = [
    { nombre: 'Todos', seleccionado: true },
    { nombre: 'Almacenes', seleccionado: false },
    { nombre: 'Limpieza', seleccionado: false },
    { nombre: 'Operaciones', seleccionado: false },
    { nombre: 'Cocina', seleccionado: false },
    { nombre: 'Servicio', seleccionado: false },
    { nombre: 'Administración', seleccionado: false },
    { nombre: 'Eventos', seleccionado: false },
    { nombre: 'Mantenimiento', seleccionado: false },
    { nombre: 'Logística', seleccionado: false },
    { nombre: 'Otros', seleccionado: false }
  ];

  constructor(
    private modalController: ModalController,
    public tareasService: TareasService,
    private router: Router
  ) { }

  ngOnInit() {}

  // Getter para determinar el modo de filtro
  get esModoLista(): boolean {
    return this.selectedTab === 'tareas-sin-asignar';
  }

  // Getter para determinar si usar selectores
  get esModoSelect(): boolean {
    return this.esAdmin || this.selectedTab === 'mis-tareas';
  }

  // Verificar si estamos en el apartado de tarea-info
  get esTareaInfo(): boolean {
    return this.router.url.includes('/tareas/tarea-info') || this.router.url.includes('tarea-info');
  }

  // Método para alternar selección en modo lista
  toggleSeleccion(index: number) {
    // Si selecciona "Todos", deseleccionar todos los demás
    if (index === 0) {
      this.listadoCategorias.forEach((item, i) => {
        item.seleccionado = i === 0;
      });
    } else {
      // Si selecciona otra opción, deseleccionar "Todos"
      this.listadoCategorias[0].seleccionado = false;
      this.listadoCategorias[index].seleccionado = !this.listadoCategorias[index].seleccionado;
      
      // Si no hay nada seleccionado, seleccionar "Todos"
      const haySeleccionados = this.listadoCategorias.slice(1).some(item => item.seleccionado);
      if (!haySeleccionados) {
        this.listadoCategorias[0].seleccionado = true;
      }
    }
  }

  // Cerrar modal sin aplicar filtros
  cerrarModal() {
    this.modalController.dismiss();
  }

  // Método alias para cancel (compatibilidad)
  cancel() {
    this.cerrarModal();
  }

  // Aplicar filtros y cerrar modal
  aplicarFiltros() {
    let filtros: any = {
      filtrosAplicados: true
    };

    if (this.esModoLista) {
      // Modo lista: enviar categorías seleccionadas
      const categoriasSeleccionadas = this.listadoCategorias
        .filter(item => item.seleccionado && item.nombre !== 'Todos')
        .map(item => item.nombre);
      
      filtros.categorias = categoriasSeleccionadas;
      filtros.todasCategorias = this.listadoCategorias[0].seleccionado;
    } else {
      // Modo select: enviar valores de selectores
      filtros.estado = this.filtroEstado;
      filtros.departamento = this.filtroDepartamento;
      filtros.turno = this.filtroTurno;
      filtros.cargo = this.filtroCargo;
      filtros.prioridad = this.filtroPrioridad;
      filtros.progreso = this.filtroProgreso;
      filtros.estadoActivo = this.filtroEstadoActivo;
      filtros.categoria = this.filtroCategoria;
    }

    this.modalController.dismiss(filtros, 'filtros');
  }

  // Limpiar todos los filtros
  limpiarFiltros() {
    if (this.esModoLista) {
      // Limpiar filtros modo lista
      this.listadoCategorias.forEach((item, index) => {
        item.seleccionado = index === 0; // Solo "Todos" seleccionado
      });
    } else {
      // Limpiar filtros modo select
      this.filtroEstado = '';
      this.filtroDepartamento = '';
      this.filtroTurno = '';
      this.filtroCargo = '';
      this.filtroPrioridad = '';
      this.filtroProgreso = '';
      this.filtroEstadoActivo = '';
      this.filtroCategoria = '';
    }
  }
}
