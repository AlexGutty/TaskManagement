import { Component, Input, OnInit } from '@angular/core';
import { faCircleChevronRight } from '@fortawesome/pro-regular-svg-icons';
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons';
import { ModalController } from '@ionic/angular';
import { BuscadorGeneralComponentComponent } from 'src/app/ui/buscador-general-component/buscador-general-component.component';

@Component({
  selector: 'app-modal-form',
  standalone:false,
  templateUrl: './modal-form.component.html',
  styleUrls: ['./modal-form.component.scss'],
})
export class ModalFormComponent implements OnInit {

  public faCircleChevronRight = faCircleChevronRight;
  public faCaretDown = faCaretDown;
  @Input() tarea: any;
  @Input() accion: string = '';

  // Propiedades del formulario
  public motivo: string = '';
  public reasignarTarea: boolean = false;
  public cargoSeleccionado: string = '';
  public usuarioSeleccionado: string = '';

  constructor(private modalController: ModalController) { }

  ngOnInit() {}

  // Método cuando cambia el toggle
  onToggleChange() {
    if (!this.reasignarTarea) {
      // Si se desactiva el toggle, limpiar las selecciones
      this.cargoSeleccionado = '';
      this.usuarioSeleccionado = '';
    }
  }

  // Método para cerrar el modal
  onDismiss() {
    this.modalController.dismiss();
  }

  // Método para cancelar
  cancelar() {
    this.modalController.dismiss();
  }

  // Método para confirmar y enviar datos
  confirmar() {
    const data = {
      reaperturaConfirmada: true,
      motivo: this.motivo,
      reasignarTarea: this.reasignarTarea,
      cargoSeleccionado: this.cargoSeleccionado,
      usuarioSeleccionado: this.usuarioSeleccionado,
      reaperturada: true
    };
    
    this.modalController.dismiss(data, 'confirm');
  }

  // Validar si se puede confirmar
  get puedeConfirmar(): boolean {
    return !!(this.motivo && this.motivo.trim() !== '');
  }

  // Método para abrir modal de selección de cargo
  async abrirModalCargo() {
    // Datos de cargos disponibles
    const cargos = [
      { id: 'cajero', nombre: 'Cajero', descripcion: 'Encargado de caja y cobros', departamento: 'Ventas' },
      { id: 'chef', nombre: 'Chef', descripcion: 'Responsable de cocina', departamento: 'Cocina' },
      { id: 'mesero', nombre: 'Mesero', descripcion: 'Atención al cliente en mesas', departamento: 'Servicio' },
      { id: 'barista', nombre: 'Barista', descripcion: 'Preparación de bebidas', departamento: 'Bebidas' },
      { id: 'limpieza', nombre: 'Limpieza', descripcion: 'Mantenimiento y limpieza', departamento: 'Operaciones' },
      { id: 'supervisor', nombre: 'Supervisor', descripcion: 'Supervisión de operaciones', departamento: 'Administración' }
    ];

    const modal = await this.modalController.create({
      component: BuscadorGeneralComponentComponent,
      componentProps: {
        items: cargos,
        titulo: 'Seleccionar Cargo',
        placeholder: 'Buscar cargo...',
        mensajeAyuda: 'Selecciona el cargo para reasignar la tarea.',
        mensajeVacio: 'No se encontraron cargos disponibles',
        iconoVacio: 'briefcase-outline',
        propiedadesBusqueda: ['nombre', 'descripcion', 'departamento']
      },
      cssClass: 'fullscreen-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm' && result.data?.item) {
        this.cargoSeleccionado = result.data.item.nombre;
      }
    });

    await modal.present();
  }

  // Método para abrir modal de selección de usuario
  async abrirModalUsuario() {
    // Datos de usuarios disponibles
    const usuarios = [
      { id: '1', nombre: 'Juan Pérez', cargo: 'Cajero', email: 'juan.perez@restaurant.com' },
      { id: '2', nombre: 'María García', cargo: 'Chef', email: 'maria.garcia@restaurant.com' },
      { id: '3', nombre: 'Carlos López', cargo: 'Mesero', email: 'carlos.lopez@restaurant.com' },
      { id: '4', nombre: 'Ana Martín', cargo: 'Barista', email: 'ana.martin@restaurant.com' },
      { id: '5', nombre: 'Luis Rodríguez', cargo: 'Limpieza', email: 'luis.rodriguez@restaurant.com' },
      { id: '6', nombre: 'Carmen Sánchez', cargo: 'Supervisor', email: 'carmen.sanchez@restaurant.com' }
    ];

    const modal = await this.modalController.create({
      component: BuscadorGeneralComponentComponent,
      componentProps: {
        items: usuarios,
        titulo: 'Seleccionar Usuario',
        placeholder: 'Buscar usuario...',
        mensajeAyuda: 'Selecciona el usuario para reasignar la tarea.',
        mensajeVacio: 'No se encontraron usuarios disponibles',
        iconoVacio: 'people-outline',
        propiedadesBusqueda: ['nombre', 'cargo', 'email']
      },
      cssClass: 'fullscreen-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm' && result.data?.item) {
        this.usuarioSeleccionado = result.data.item.nombre;
      }
    });

    await modal.present();
  }
}
