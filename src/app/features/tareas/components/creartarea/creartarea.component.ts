import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faCaretDown } from '@fortawesome/pro-solid-svg-icons';
import { ModalController, PickerController } from '@ionic/angular';
import { BuscadorGeneralComponentComponent } from 'src/app/ui/buscador-general-component/buscador-general-component.component';

@Component({
  selector: 'app-creartarea',
  templateUrl: './creartarea.component.html',
  styleUrls: ['./creartarea.component.scss'],
})
export class CreartareaComponent  implements OnInit {

  // Propiedades del formulario
  nombreTarea: string = '';
  descripcionTarea: string = '';
  tipoAsignacion: string = 'cargo';
  cargoSeleccionado: string = 'Seleccionar cargo';
  cargoSeleccionadoObj: any = null;
  usuario: string = 'Seleccionar usuario';
  usuarioSeleccionado: any = null;
  subcategoria: string = '';
  orden: string = '1';
  prioridad: string = 'media';
  estadoActivo: boolean = true;
  public faCaretDown = faCaretDown;
  
  // Propiedad para determinar si estamos en modo edición
  modoEdicion: boolean = false;
  tareaId?: string; // ID de la tarea a editar

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private pickerController: PickerController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Verificar si estamos en modo edición
    this.route.queryParams.subscribe(params => {
      if (params['edit'] === 'true') {
        this.modoEdicion = true;
        this.tareaId = params['tareaId'];
        this.nombreTarea = params['titulo'] || '';
        this.descripcionTarea = params['descripcion'] || '';
        this.subcategoria = params['categoria'] || '';
        this.prioridad = params['prioridad']?.toLowerCase() || 'media';
        // Cargar otros parámetros según sea necesario
        console.log('Modo edición activado con datos:', params);
      }
    });
  }
  
  // Getter para obtener el título dinámicamente
  get titulo(): string {
    return this.modoEdicion ? 'Editar tarea' : 'Crear tarea';
  }
  
  // Método para establecer el modo edición y cargar datos de la tarea
  establecerModoEdicion(tarea: any) {
    this.modoEdicion = true;
    this.tareaId = tarea.id;
    this.nombreTarea = tarea.nombre || tarea.titulo || '';
    this.descripcionTarea = tarea.descripcion || '';
    this.tipoAsignacion = tarea.tipoAsignacion || 'cargo';
    this.cargoSeleccionado = tarea.cargo || '';
    this.subcategoria = tarea.subcategoria || '';
    this.orden = tarea.orden?.toString() || '1';
    this.prioridad = tarea.prioridad || 'media';
    this.estadoActivo = tarea.activo !== undefined ? tarea.activo : true;
  }

  goBack() {
    this.location.back();
  }

  // Método para volver con indicación de éxito
  goBackWithSuccess() {
    // Guardar información de éxito en localStorage temporalmente
    localStorage.setItem('tareaOperacionExito', JSON.stringify({
      operacion: this.modoEdicion ? 'editada' : 'creada',
      timestamp: Date.now()
    }));
    
    // Volver a la pantalla anterior
    this.location.back();
  }

  async crearTarea() {
    // Validar campos requeridos
    if (!this.nombreTarea.trim()) {
      console.log('Por favor ingrese el nombre de la tarea');
      return;
    }

    if (!this.descripcionTarea.trim()) {
      console.log('Por favor ingrese la descripción de la tarea');
      return;
    }

    if (!this.cargoSeleccionado) {
      console.log('Por favor seleccione un cargo');
      return;
    }

    if (!this.subcategoria) {
      console.log('Por favor seleccione una subcategoría');
      return;
    }

    // Crear objeto de la tarea
    const tareaData = {
      ...(this.modoEdicion && this.tareaId && { id: this.tareaId }),
      nombre: this.nombreTarea.trim(),
      descripcion: this.descripcionTarea.trim(),
      tipoAsignacion: this.tipoAsignacion,
      cargo: this.cargoSeleccionado,
      subcategoria: this.subcategoria,
      orden: parseInt(this.orden),
      prioridad: this.prioridad,
      activo: this.estadoActivo,
      ...(this.modoEdicion ? 
        { fechaModificacion: new Date().toISOString() } : 
        { fechaCreacion: new Date().toISOString() }
      )
    };

    console.log(this.modoEdicion ? 'Tarea editada:' : 'Nueva tarea creada:', tareaData);

    // Aquí puedes agregar la lógica para enviar la tarea al backend
    // Por ejemplo: 
    // if (this.modoEdicion) {
    //   await this.tareasService.editarTarea(tareaData);
    // } else {
    //   await this.tareasService.crearTarea(tareaData);
    // }

    // Mostrar toast de éxito (ahora será manejado por la pantalla anterior)
    console.log(this.modoEdicion ? 'Tarea editada exitosamente' : 'Tarea creada exitosamente');
    
    // Limpiar formulario
    this.limpiarFormulario();
    
    // Volver a la pantalla anterior con parámetro de éxito
    this.goBackWithSuccess();
  }

  private limpiarFormulario() {
    this.nombreTarea = '';
    this.descripcionTarea = '';
    this.tipoAsignacion = 'cargo';
    this.cargoSeleccionado = '';
    this.usuario = 'Seleccionar usuario';
    this.usuarioSeleccionado = null;
    this.subcategoria = '';
    this.orden = '1';
    this.prioridad = 'media';
    this.estadoActivo = true;
    this.modoEdicion = false;
    this.tareaId = undefined;
  }

  // Método para abrir modal de cargo/usuarios
  
  async abrirModalOrden() {
    // Crear opciones para el picker (números del 0 al 10)
    const opciones = [];
    for (let i = 0; i <= 10; i++) {
      opciones.push({
        text: i.toString(),
        value: i.toString()
      });
    }

    const picker = await this.pickerController.create({
      columns: [
        {
          name: 'orden',
          options: opciones,
          selectedIndex: parseInt(this.orden) || 1
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (value) => {
            this.orden = value.orden.value;
          }
        }
      ]
    });

    await picker.present();
  }

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
        mensajeAyuda: 'Selecciona el usuario para asignar la tarea.',
        mensajeVacio: 'No se encontraron usuarios disponibles',
        iconoVacio: 'people-outline',
        propiedadesBusqueda: ['nombre', 'cargo', 'email']
      },
      cssClass: 'fullscreen-modal'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm' && result.data?.item) {
        this.usuarioSeleccionado = result.data.item;
        this.usuario = result.data.item.nombre;
      }
    });

    await modal.present();
  }

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
        mensajeAyuda: 'Selecciona el cargo para asignar la tarea.',
        mensajeVacio: 'No se encontraron cargos disponibles',
        iconoVacio: 'briefcase-outline',
        propiedadesBusqueda: ['nombre', 'descripcion', 'departamento']
      },
      cssClass: 'fullscreen-modal modal-cargo-creartarea'
    });

    modal.onDidDismiss().then((result) => {
      if (result.role === 'confirm' && result.data?.item) {
        this.cargoSeleccionadoObj = result.data.item;
        this.cargoSeleccionado = result.data.item.nombre;
      }
    });

    await modal.present();
  }

  // Método para manejar el cambio del tipo de asignación
  onTipoAsignacionChange() {
    console.log('Tipo de asignación cambiado a:', this.tipoAsignacion);
    
    // Limpiar los campos dependiendo del tipo seleccionado
    if (this.tipoAsignacion === 'cargo') {
      // Si se selecciona "cargo", limpiar el usuario seleccionado
      this.usuario = 'Seleccionar usuario';
      this.usuarioSeleccionado = null;
      console.log('Limpiando usuario, mostrando cargo');
    } else if (this.tipoAsignacion === 'persona') {
      // Si se selecciona "persona", limpiar el cargo seleccionado
      this.cargoSeleccionado = '';
      console.log('Limpiando cargo, mostrando usuario');
    }
  }

}
