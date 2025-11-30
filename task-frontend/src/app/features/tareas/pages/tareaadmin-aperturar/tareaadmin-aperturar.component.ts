import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';

import { ModalFormComponent } from '../modal-form/modal-form.component';
@Component({
  selector: 'app-tareaadmin-aperturar',
  standalone:false,
  templateUrl: './tareaadmin-aperturar.component.html',
  styleUrls: ['./tareaadmin-aperturar.component.scss'],
})
export class TareaadminAperturarComponent implements OnInit {
  public tareaSeleccionada: any = {};
  public comentario: string = '';
  public archivosAdjuntos: File[] = [];

  constructor(
    private location: Location,
    private route: ActivatedRoute,
    private router: Router,
    private toastController: ToastController,
    private modalcontroller: ModalController
  ) {}

  ngOnInit() {
    this.obtenerParametrosTarea();
  }

  // Obtener parámetros de la tarea seleccionada
  obtenerParametrosTarea() {
    this.route.queryParams.subscribe(params => {
      this.tareaSeleccionada = {
        id: params['tareaId'],
        titulo: params['titulo'],
        estado: params['estado'],
        categoria: params['categoria'],
        sucursal: params['sucursal'],
        responsable: params['responsable'],
        horaprogramada: params['horaprogramada'],
        horainicio: params['horainicio'],
        horafin: params['horafin']
      };
    });
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
  // Método para regresar
  goBack() {
    this.location.back();
  }

  // Método para agregar archivos
  agregarArchivo() {
    console.log('Agregar archivo');
    // Aquí iría la lógica para abrir el selector de archivos
  }

  // Método para eliminar archivo
  eliminarArchivo(index: number) {
    console.log('Eliminar archivo', index);
    // Aquí iría la lógica para eliminar el archivo
  }

  // Métodos para el modal de reapertura/edición
  async abrirModalReapertura() {
    if (this.tareaSeleccionada?.estado === 'Pendiente') {
      console.log('Navegando a editar tarea pendiente...');
      // Navegar al apartado de crear tarea para editar
      this.router.navigate(['/tareas/crear-tarea'], {
        queryParams: {
          edit: true,
          tareaId: this.tareaSeleccionada.id,
          titulo: this.tareaSeleccionada.titulo,
          estado: this.tareaSeleccionada.estado,
          categoria: this.tareaSeleccionada.categoria,
          responsable: this.tareaSeleccionada.responsable
        }
      });
    } else {
      console.log('Abriendo modal de reapertura para tarea completada...');
      
      const modal = await this.modalcontroller.create({
        component: ModalFormComponent,
        initialBreakpoint: 0.52,
        breakpoints: [0, 1],
        cssClass: 'modalamedias',
        componentProps: {
          tarea: this.tareaSeleccionada,
          accion: 'reaperturar'
        }
      });

      await modal.present();

      const { data, role } = await modal.onWillDismiss();
      
      if (role === 'confirm' && data?.reaperturada) {
        console.log('Modal confirmado con datos:', data);
        
        // Procesar los datos del modal
        if (data.reasignarTarea) {
          console.log('Reasignando tarea a:', data.cargoSeleccionado, data.usuarioSeleccionado);
        }
        
        // Mostrar mensaje de éxito
        this.mostrarToast('Tarea reaperturada exitosamente', 'success');
      } else {
        console.log('Modal cerrado sin confirmar');
      }
    }
  }

  // Obtener texto del botón según el estado
  get textoBotonAccion(): string {
    return this.tareaSeleccionada?.estado === 'Pendiente' ? 'Editar tarea' : 'Reaperturar tarea';
  }

  // Obtener color del botón según el estado
  get colorBotonAccion(): string {
    return this.tareaSeleccionada?.estado === 'Pendiente' ? 'warning' : 'primary';
  }

  // Método para mostrar toast
  async mostrarToast(mensaje: string, color: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      color: color,
      position: 'bottom'
    });
    toast.present();
  }

  // Método para reapturar tarea
  reapturarTarea() {
    console.log('Reapturar tarea', this.tareaSeleccionada);
    console.log('Comentario:', this.comentario);
    // Aquí iría la lógica para reapturar la tarea
  }
}
