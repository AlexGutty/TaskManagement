import { Location } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { faFlag, faXmark } from '@fortawesome/pro-regular-svg-icons';
import { ActionSheetController, AlertController, ModalController } from '@ionic/angular';
import { CONFIRMATION_MODAL } from 'src/app/core/constants';
import { ModalConfirmationComponent } from 'src/app/ui/modal-confirmation/modal-confirmation.component';
import { ToastConfig } from 'src/app/ui/toast-notificacion/toast-notificacion.component';
import { ModalFormComponent } from '../../modal-form/modal-form.component';
import { Tarea, TareaAdmin, TareasService } from '../../tareas.service';
;
@Component({
  selector: 'app-subtarea-info',
  standalone:false,
  templateUrl: './subtarea-info.component.html',
  styleUrls: ['./subtarea-info.component.scss'],
})
export class SubtareaInfoComponent implements OnInit {
  @Input() tarea: Tarea | null = null;
  @Input() tareaadmin: TareaAdmin | null = null;
  
  
  tareaId: string = '';
  fromTab: string = ''; // Nueva propiedad para rastrear el tab de origen
  comentario: string = '';
  archivosSubidos: any[] = [];
  mostrarAnimacionExito: boolean = false; // Propiedad para controlar la animación de parpadeo
  public faFlag = faFlag;
  public faXmark = faXmark;
  // Propiedades para toast personalizado
  mostrarToastComponent: boolean = false;
  configToast: ToastConfig = {
    tipo: 'exito',
    mensaje: '',
    mostrarBoton: false,
    mostrarCerrar: true
  };
  duracionToast: number = 3000;

  // Variables para manejar el deshacer
  private estadoAnterior!: 'Pendiente' | 'En progreso' | 'Completada' | 'Cerrada' | 'Activo' | 'Inactiva';
  private tareaAnteriorCompletadaId: string = '';

  // Getter para acceder a apartadoadmin del servicio
  get isApartadoAdmin(): boolean {
    return this.tareasService.apartadoadmin;
  }
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private alertController: AlertController,
    private modalController: ModalController,
    private actionSheetController: ActionSheetController,
    public tareasService: TareasService
  ) { }

  ngOnInit() {
    // Obtener query parameters para el tareaId y fromTab
    this.route.queryParams.subscribe(params => {
      this.tareaId = params['tareaId'] || '';
      this.fromTab = params['fromTab'] || ''; // Capturar el tab de origen
      
      // Si viene de tareas admin, construir la tarea desde los parámetros
      if (this.fromTab === 'tareas-admin') {
        this.construirTareaDesdeParametros(params);
      } else {
        // Cargar datos de la tarea desde el servicio
        this.cargarTarea();
      }
    });
  }

  // Método para construir la tarea desde los parámetros de navegación
  construirTareaDesdeParametros(params: any) {
    this.tarea = {
      id: params['tareaId'] || '',
      titulo: params['titulo'] || '',
      estado: params['estado'] || 'Pendiente',
      Categoria: params['categoria'] || '',
      estadodetarea: params['estadodetarea'] || 'Activo',
      horainicio: params['horainicio'] || '',
      horafin: params['horafin'] || '',
      descripcion: params['descripcion'] || '',
      Prioridad: params['prioridad'] || 'Media',
      completada: params['completada'] === 'true',
      progreso: parseInt(params['progreso']) || 0,
      fechaAsignacion: params['fechaAsignacion'] || '',
      totalSubtareas: 0,
      subtareasCompletadas: 0
    };
    this.tareaadmin = {
      id: params['tareaId'] || '',
      titulo: params['titulo'] || '',
      estado: params['estado'] || 'Pendiente',
      fechaAsignacion: params['fechaAsignacion'] || '',
      Categoria: params['categoria'] || '',
      horainicio: params['horainicio'] || '',
      horafin: params['horafin'] || '',
      horaprogramada: params['horaprogramada'] || '',
      sucursal: params['sucursal'] || '',
      totalSubtareas: 0,
      subtareasCompletadas: 0
    };
    console.log('Tarea admin construida desde parámetros:', this.tareaadmin);
    console.log('Tarea normal construida desde parámetros:', this.tarea);
  }

  construirTareaAdminDesdeParametros(params: any) {
    this.tareaadmin = {
      id: params['tareaId'] || '',
      titulo: params['titulo'] || '',
      estado: params['estado'] || 'Pendiente',
      fechaAsignacion: params['fechaAsignacion'] || '',
      Categoria: params['categoria'] || '',
      horainicio: params['horainicio'] || '',
      horafin: params['horafin'] || '',
      horaprogramada: params['horaprogramada'] || '',
      sucursal: params['sucursal'] || '',
      totalSubtareas: 0,
      subtareasCompletadas: 0
    };
    console.log('Tarea admin construida desde parámetros:', this.tareaadmin);
  }

  // Método para cargar los datos de la tarea
  cargarTarea() {
    if (this.tareaId) {
      let observable;
      
      // Buscar la tarea según el tab de origen
      if (this.fromTab === 'tareas-sin-asignar') {
        observable = this.tareasService.getTareasSinAsignarPorFecha(new Date());
      } else {
        observable = this.tareasService.getMisTareasPorFecha(new Date());
      }
      
      observable.subscribe(tareas => {
        this.tarea = tareas.find(t => t.id === this.tareaId) || null;
        if (!this.tarea) {
          // Si no se encuentra en el tab específico, buscar en todas las tareas
          this.tareasService.getTareasPorFecha(new Date()).subscribe(todasTareas => {
            this.tarea = todasTareas.find(t => t.id === this.tareaId) || null;
            if (!this.tarea) {
              console.error('Tarea no encontrada');
            }
          });
        }
      });
    }
  }

  // Método para volver atrás
  goBack() {
    this.location.back();
  }

  // Método para subir archivo
  async subirArchivo() {
    // Verificar límite máximo de 5 imágenes
    if (this.archivosSubidos.length >= 5) {
      this.mostrarToastPersonalizado('Máximo 5 imágenes permitidas', 'advertencia');
      return;
    }

    const actionSheet = await this.actionSheetController.create({
      header: 'Seleccionar imagen',
      buttons: [
        {
          text: 'Tomar foto',
          icon: 'camera',
          handler: () => {
            this.tomarFoto();
          }
        },
        {
          text: 'Elegir de galería',
          icon: 'images',
          handler: () => {
            this.elegirDeGaleria();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });

    await actionSheet.present();
  }

  // Método para tomar foto con la cámara
  async tomarFoto() {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera,
        quality: 90
      });

      if (capturedPhoto) {
        this.agregarImagenSubida(capturedPhoto.webPath || '', 'foto');
      }
    } catch (error) {
      console.error('Error al tomar foto:', error);
      this.mostrarToastPersonalizado('Error al acceder a la cámara', 'error');
    }
  }

  // Método para elegir imagen de la galería
  async elegirDeGaleria() {
    try {
      const capturedPhoto = await Camera.getPhoto({
        resultType: CameraResultType.Uri,
        source: CameraSource.Photos,
        quality: 90
      });

      if (capturedPhoto) {
        this.agregarImagenSubida(capturedPhoto.webPath || '', 'galeria');
      }
    } catch (error) {
      console.error('Error al elegir de galería:', error);
      this.mostrarToastPersonalizado('Error al acceder a la galería', 'error');
    }
  }

  // Método para agregar imagen al array
  agregarImagenSubida(imagenUrl: string, origen: string) {
    const nuevaImagen = {
      id: Date.now(),
      src: imagenUrl,
      nombre: `IMG_${Date.now()}`,
      origen: origen,
      tipo: 'imagen'
    };

    this.archivosSubidos.push(nuevaImagen);
    this.mostrarToastPersonalizado('Imagen agregada exitosamente', 'exito');
  }

  // Método para eliminar archivo
  async eliminarArchivo(archivo: any) {
    this.openModalEliminarArchivo(archivo);
  }

  // Modal para confirmar eliminación de archivo
  public async openModalEliminarArchivo(archivo: any) {
    const modal = await this.modalController.create({
      component: ModalConfirmationComponent,
      cssClass: 'promo',
      componentProps: {
        title: "¿Desea eliminar este archivo?",
        message: `Eliminarás este archivo de forma permanente.`,
        btnCancelTxt: "Cancelar",
        btnOkTxt: "Eliminar",
        isDelete: true,
      }
    });
    await modal.present();
    modal.onDidDismiss().then(async (data) => {
      if (data?.data?.opcion == CONFIRMATION_MODAL.SI) {
        console.log('Confirmando eliminación de archivo:', archivo.nombre);
        // Eliminar el archivo del array
        this.archivosSubidos = this.archivosSubidos.filter(a => a.id !== archivo.id);
        this.mostrarToastPersonalizado('Archivo eliminado exitosamente', 'exito');
      } 
    });
  }

  // Confirmar finalización
  async confirmarFinalizacion() {
    if (this.tarea) {
      // Actualizar el estado de la tarea a finalizada
      this.tareasService.toggleCompletarTarea(this.tarea.id, true).subscribe({
        next: () => {
          this.mostrarToastPersonalizado('Tarea finalizada exitosamente', 'exito');
          this.goBack();
        },
        error: (error) => {
          console.error('Error al finalizar tarea:', error);
          this.mostrarToastPersonalizado('Error al finalizar la tarea', 'error');
        }
      });
    }
  }

  public async openModalTerminar() {
    // Verificar si hay comentarios o archivos como evidencia
    const tieneComentario = this.comentario && this.comentario.trim().length > 0;
    const tieneArchivos = this.archivosSubidos && this.archivosSubidos.length > 0;
    
    let modalTitle = "¿Desea finalizar la tarea?";
    let modalMessage = "Una vez completada, no podrás volver a editar.";
    let boleanwar=true;
    let boleanevi=false;
    // Si no hay evidencias (comentarios ni archivos)
    if (!tieneComentario && !tieneArchivos) {
      modalTitle = "¿Deseas finalizar la tarea sin evidencias?";
      modalMessage = "Recuerda que una vez finalizada no podrás editarla.";
      boleanevi = true;
      boleanwar = false;
    }

    const modal = await this.modalController.create({
      component: ModalConfirmationComponent,
      cssClass: 'promo',
      
      componentProps: {
        title: modalTitle,
        message: modalMessage,
        btnCancelTxt: "Cancelar",
        btnOkTxt: "Confirmar",
        isWarning: boleanwar,
        isWarningEvi: boleanevi 
      }
    });
    await modal.present();
    modal.onDidDismiss().then(async (data) => {
      if (data?.data?.opcion == CONFIRMATION_MODAL.SI) {
        console.log('Confirmando finalización de tarea:');
        this.confirmarFinalizacion();
      } 
    });
  }

  // Modal para iniciar tarea sin asignar
  public async openModalIniciarTarea() {
    const modal = await this.modalController.create({
      component: ModalConfirmationComponent,
      cssClass: 'promo',
      componentProps: {
        title: "¿Desea iniciar la tarea?",
        message: "Una vez iniciada, deberás completarla para finalizar el proceso.",
        btnCancelTxt: "Cancelar",
        btnOkTxt: "Iniciar",
        btnColor: "primary",
        isIniciar: true,
      }
    });
    await modal.present();
    modal.onDidDismiss().then(async (data) => {
      if (data?.data?.opcion == CONFIRMATION_MODAL.SI) {
        console.log('Confirmando inicio de tarea:');
        this.iniciarTarea();
      } 
    });
  }

  // Método para iniciar tarea
  async iniciarTarea() {
    if (this.tarea) {
      // Cambiar el estado de la tarea a "En progreso" y asignarla al usuario actual
      this.tarea.estado = 'En progreso';
      this.tarea.usuarioasignado = this.tareasService.usuarioActual; // Asignar al usuario actual
      this.mostrarToastPersonalizado('Tarea iniciada exitosamente', 'exito');
      // Aquí puedes agregar lógica adicional para actualizar en el servicio
    }
  }

  public async openModalEliminar() {
    // Verificar si hay comentarios o archivos como evidencia

    let modalTitle = "¿Desea eliminar la tarea?";
    let modalMessage = "Una vez completada, no podrás volver a editar.";
    
    // Si no hay evidencias (comentarios ni archivos
    modalTitle = "¿Deseas eliminar la tarea sin evidencias?";
    modalMessage = "Recuerda que una vez eliminada no podrás recuperarla.";
          

    const modal = await this.modalController.create({
      component: ModalConfirmationComponent,
      cssClass: 'promo',
      componentProps: {
        title: modalTitle,
        message: modalMessage,
        btnCancelTxt: "Cancelar",
        btnOkTxt: "Confirmar",
        btnColor: "",
        isDeleteTarea: true,
      }
    });
    await modal.present();
    modal.onDidDismiss().then(async (data) => {
      if (data?.data?.opcion == CONFIRMATION_MODAL.SI) {
        console.log('Confirmando finalización de tarea:');
        this.confirmarFinalizacion();
      } 
    });
  }

  // Método para manejar click del botón según el contexto
  handleButtonClick() {
    if (this.isApartadoAdmin) {
      // Lógica para apartado admin
      if (this.tarea?.estado === 'Completada') {
        this.reaperturarTarea();
      } else if (this.tarea?.estado === 'Pendiente') {
        this.editarTarea();
      }
    } else {
      // Lógica original para usuarios normales
      if (this.fromTab === 'tareas-sin-asignar') {
        this.anadirTareaAMiLista();
      } else {
        if (this.tarea?.estado === 'Pendiente') {
          this.iniciarTareaSinModal();
        } else {
          this.finalizarTareaSinModal();
        }
      }
    }
  }

  // Método para reaperturar tarea (solo admin)
  async reaperturarTarea() {
    if (!this.tarea) {
      this.mostrarToastPersonalizado('No hay tarea seleccionada', 'error');
      return;
    }

    const modal = await this.modalController.create({
      component: ModalFormComponent,
      initialBreakpoint: 1,
      breakpoints: [0, 1],
      cssClass: 'modalamedias',
      componentProps: {
        tarea: this.tarea,
        accion: 'reaperturar'
      }
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();
    
    if (role === 'confirm' && data?.reaperturada) {
      console.log('Datos de reapertura:', data);
      
      // Aquí implementarías la lógica de reapertura con los datos del modal
      if (data.reasignarTarea) {
        console.log('Reasignando tarea a:', data.cargoSeleccionado, data.usuarioSeleccionado);
      }
      
      this.mostrarToastPersonalizado('Tarea reaperturada exitosamente', 'exito');
      
      // Opcional: regresar a la pantalla anterior
      this.goBack();
    }
  }

  // Método para editar tarea (solo admin)
  editarTarea() {
    // Navegar al modal de crear tarea en modo edición
    this.router.navigate(['/tareas/crear-tarea'], {
      queryParams: {
        edit: 'true',
        tareaId: this.tarea?.id,
        titulo: this.tarea?.titulo,
        descripcion: this.tarea?.descripcion,
        categoria: this.tarea?.Categoria,
        prioridad: this.tarea?.Prioridad
      }
    });
  }

  async anadirTareaAMiLista() {
    if (!this.tarea) {
      return;
    }

    // Usar el mismo servicio que se usa en la página principal
    this.tareasService.asignarTareasAUsuario([this.tareaId]).subscribe({
      next: (exito) => {
        if (exito) {
          // Mostrar toast de confirmación
          this.mostrarToastPersonalizado('Tarea añadida exitosamente a tu lista', 'exito');
          
          // Navegar al tab "mis-tareas" después de un pequeño delay
          setTimeout(() => {
            this.navegarAMisTareas();
          }, 500);
        }
      },
      error: (error) => {
        console.error('Error asignando tarea:', error);
        this.mostrarToastPersonalizado('Error al añadir la tarea. Inténtalo de nuevo.', 'error');
      }
    });
  }

  // Método para activar la animación de éxito
  private activarAnimacionExito() {
    this.mostrarAnimacionExito = true;
    
    // Desactivar la animación después de que termine (1.5s)
    setTimeout(() => {
      this.mostrarAnimacionExito = false;
    }, 1500);
  }

  // Método para navegar al tab mis-tareas
  private navegarAMisTareas() {
    this.router.navigate(['/tareas'], { 
      queryParams: { 
        tab: 'mis-tareas',
        tareaAnadida: this.tareaId // Pasar el ID de la tarea añadida
      }
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

  // Métodos para la lógica de botones según apartadoadmin
  shouldShowFooter(): boolean {
    if (!this.tarea) return false;
    
    if (this.isApartadoAdmin) {
      // En modo admin: solo mostrar footer si NO está en progreso
      return this.tarea.estado !== 'En progreso' && this.tarea.estado !== 'Cerrada';
    } else {
      // En modo normal: lógica original
      return this.tarea.estado !== 'Cerrada' && this.tarea.estado !== 'Completada';
    }
  }

  getButtonText(): string {
    console.log('isApartadoAdmin:', this.tareaadmin?.estado);
    if (!this.tarea) return '';
    
    if (this.isApartadoAdmin) {
      // Lógica para apartado admin
      switch (this.tarea.estado) {
        case 'Completada':
          return 'Reaperturar';
        default:
          return 'Editar tarea';
      }
    } else {
      // Lógica original para usuarios normales
      if (this.fromTab === 'tareas-sin-asignar') {
        return 'Agregar';
      }
      
      if (this.tarea.completada) {
        return 'Tarea Completada';
      }
      
      if (this.tarea.estado === 'Pendiente' && !this.tarea.completada) {
        return 'Iniciar Tarea';
      }
      
      if (this.tarea.estado !== 'Pendiente' && !this.tarea.completada) {
        return 'Finalizar Tarea';
      }
      
      return '';
    }
  }

  getButtonColor(): string {
    if (!this.tarea) return 'primary';
    
    if (this.isApartadoAdmin) {
      switch (this.tarea.estado) {
        case 'Completada':
          return 'primary'; // Color azul para reaperturar
        case 'Pendiente':
          return 'primary'; // Color azul para editar
        default:
          return 'primary';
      }
    } else {
      return 'primary'; // Color por defecto para usuarios normales
    }
  }

  isButtonDisabled(): boolean {
    if (!this.tarea) return true;
    
    if (this.isApartadoAdmin) {
      // En modo admin, nunca deshabilitar (ya se controla con shouldShowFooter)
      return false;
    } else {
      // Lógica original
      return this.tarea.completada && this.fromTab !== 'tareas-sin-asignar';
    }
  }

  // Método para iniciar tarea sin modal
  iniciarTareaSinModal() {
    if (this.tarea) {
      // Guardar estado anterior para poder deshacer
      this.estadoAnterior = this.tarea.estado;
      
      // Buscar si hay una tarea actualmente en progreso y completarla automáticamente
      if (this.tareasService.apartadoadmin) {
        // Para apartado admin - buscar en tareas admin
        const tareaEnProgreso = this.tareasService.tareasadmin.find((t: any) => t.estado === 'En progreso' && t.id !== this.tarea!.id);
        if (tareaEnProgreso) {
          tareaEnProgreso.estado = 'Completada';
          this.tareaAnteriorCompletadaId = tareaEnProgreso.id;
          console.log('Tarea anterior completada automáticamente (admin):', tareaEnProgreso.id);
        }
      } else {
        // Para apartado normal - buscar en tareas normales usando el servicio
        this.tareasService.getTareasPorFecha(new Date()).subscribe(tareasDia => {
          const tareaEnProgreso = tareasDia.find((t: any) => t.estado === 'En progreso' && t.id !== this.tarea!.id);
          if (tareaEnProgreso) {
            tareaEnProgreso.estado = 'Completada';
            this.tareaAnteriorCompletadaId = tareaEnProgreso.id;
            console.log('Tarea anterior completada automáticamente:', tareaEnProgreso.id);
          }
        });
      }
      
      // Cambiar el estado de la tarea actual a "En progreso"
      this.tarea.estado = 'En progreso';
      this.tarea.usuarioasignado = this.tareasService.usuarioActual;
      
      // Guardar información para el deshacer en localStorage
      localStorage.setItem('accionDeshacer', JSON.stringify({
        tipo: 'iniciar',
        tareaId: this.tarea.id,
        tareaAnteriorCompletadaId: this.tareaAnteriorCompletadaId
      }));
      
      // Mostrar toast con botón deshacer
      this.mostrarToastConDeshacer('Tarea iniciada exitosamente', 'iniciar');
    }
  }

  // Método para finalizar tarea sin modal
  finalizarTareaSinModal() {
    if (this.tarea) {
      // Guardar estado anterior para poder deshacer
      this.estadoAnterior = this.tarea.estado;
      
      // Actualizar el estado de la tarea a finalizada
      this.tareasService.toggleCompletarTarea(this.tarea.id, true).subscribe({
        next: () => {
          this.tarea!.estado = 'Completada';
          
          // Guardar información para el deshacer
          localStorage.setItem('accionDeshacer', JSON.stringify({
            tipo: 'finalizar',
            tareaId: this.tarea!.id
          }));
          
          // Mostrar toast con botón deshacer
          this.mostrarToastConDeshacer('Tarea finalizada exitosamente', 'finalizar');
        },
        error: (error) => {
          console.error('Error al finalizar tarea:', error);
          this.mostrarToastPersonalizado('Error al finalizar la tarea', 'error');
        }
      });
    }
  }

  // Método para mostrar toast con botón deshacer
  mostrarToastConDeshacer(mensaje: string, accion: 'iniciar' | 'finalizar') {
    this.configToast = {
      tipo: 'exito',
      mensaje: mensaje,
      mostrarBoton: true,
      mostrarCerrar: true,
      botonTexto: 'Deshacer'
    };
    
    this.duracionToast = 5000; // Más tiempo para dar oportunidad de deshacer
    this.mostrarToastComponent = true;
  }

  // Método para manejar clic en botón deshacer
  onBotonToast() {
    const datosDeshacer = localStorage.getItem('accionDeshacer');
    
    if (this.tarea && datosDeshacer) {
      try {
        const datos = JSON.parse(datosDeshacer);
        
        if (datos.tipo === 'iniciar') {
          // 1. Restaurar la tarea actual a su estado anterior
          this.tarea.estado = this.estadoAnterior;
          this.tarea.usuarioasignado = '';
          
          // 2. Restaurar la tarea anterior que se completó automáticamente
          if (datos.tareaAnteriorCompletadaId) {
            if (this.tareasService.apartadoadmin) {
              // Buscar en tareas admin
              const tareaAnterior = this.tareasService.tareasadmin.find((t: any) => t.id === datos.tareaAnteriorCompletadaId);
              if (tareaAnterior) {
                tareaAnterior.estado = 'En progreso';
                console.log('Tarea anterior restaurada a En progreso (admin):', datos.tareaAnteriorCompletadaId);
              }
            } else {
              // Buscar en tareas normales
              this.tareasService.getTareasPorFecha(new Date()).subscribe(tareasDia => {
                const tareaAnterior = tareasDia.find((t: any) => t.id === datos.tareaAnteriorCompletadaId);
                if (tareaAnterior) {
                  tareaAnterior.estado = 'En progreso';
                  console.log('Tarea anterior restaurada a En progreso:', datos.tareaAnteriorCompletadaId);
                }
              });
            }
          }
          
          this.mostrarToastPersonalizado('Acción deshecha', 'informacion');
          
        } else if (datos.tipo === 'finalizar') {
          // Deshacer finalizar tarea
          this.tareasService.toggleCompletarTarea(this.tarea.id, false).subscribe({
            next: () => {
              this.tarea!.estado = this.estadoAnterior;
              this.mostrarToastPersonalizado('Acción deshecha', 'informacion');
            },
            error: (error) => {
              console.error('Error al deshacer:', error);
              this.mostrarToastPersonalizado('Error al deshacer la acción', 'error');
            }
          });
        }
      } catch (error) {
        console.error('Error al parsear datos de deshacer:', error);
        this.mostrarToastPersonalizado('Error al deshacer la acción', 'error');
      }
    }
    
    // Limpiar localStorage y cerrar toast
    localStorage.removeItem('accionDeshacer');
    this.mostrarToastComponent = false;
  }
}
