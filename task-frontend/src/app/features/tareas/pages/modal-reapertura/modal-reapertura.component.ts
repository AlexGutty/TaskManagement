import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-modal-reapertura',
  standalone:false,
  templateUrl: './modal-reapertura.component.html',
  styleUrls: ['./modal-reapertura.component.scss'],
})
export class ModalReaperturaComponent implements OnInit {

  @Input() tarea: any;
  
  motivoReapertura: string = '';
  observaciones: string = '';
  prioridadNueva: string = '';
  fechaVencimientoNueva: string = '';

  motivosReapertura = [
    'Información incompleta',
    'Cambio en los requerimientos',
    'Error en la ejecución anterior',
    'Solicitud del cliente',
    'Revisión necesaria',
    'Otros'
  ];

  prioridades = [
    { valor: 'baja', texto: 'Baja' },
    { valor: 'media', texto: 'Media' },
    { valor: 'alta', texto: 'Alta' }
  ];

  constructor(
    private modalController: ModalController
  ) { }

  ngOnInit() {
    // Inicializar con los valores actuales de la tarea
    if (this.tarea) {
      this.prioridadNueva = this.tarea.Prioridad?.toLowerCase() || 'media';
      this.fechaVencimientoNueva = this.tarea.fechaVencimiento || '';
    }
  }

  // Cerrar modal sin reaperturar
  cerrarModal() {
    this.modalController.dismiss();
  }

  // Confirmar reapertura
  confirmarReapertura() {
    if (!this.motivoReapertura || this.motivoReapertura.trim() === '') {
      // TODO: Mostrar toast de error
      return;
    }

    const datosReapertura = {
      reaperturaConfirmada: true,
      motivo: this.motivoReapertura,
      observaciones: this.observaciones,
      prioridadNueva: this.prioridadNueva,
      fechaVencimientoNueva: this.fechaVencimientoNueva,
      fechaReapertura: new Date().toISOString(),
      tareaId: this.tarea?.id
    };

    this.modalController.dismiss(datosReapertura, 'reapertura');
  }

  // Validar si se puede confirmar la reapertura
  get puedeConfirmar(): boolean {
    return !!(this.motivoReapertura && this.motivoReapertura.trim() !== '');
  }
}
