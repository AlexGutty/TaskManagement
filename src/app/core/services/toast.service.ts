import { Injectable } from '@angular/core';

export interface ToastConfig {
  tipo: 'exito' | 'informacion' | 'advertencia' | 'error';
  mensaje: string;
  icono?: string;
  botonTexto?: string;
  mostrarBoton?: boolean;
  mostrarCerrar?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  constructor() { }

  success(mensaje: string): void {
    this.mostrarToast({
      tipo: 'exito',
      mensaje,
      icono: 'checkmark-circle',
      mostrarCerrar: true
    });
  }

  error(mensaje: string): void {
    this.mostrarToast({
      tipo: 'error',
      mensaje,
      icono: 'close-circle',
      mostrarCerrar: true
    });
  }

  info(mensaje: string): void {
    this.mostrarToast({
      tipo: 'informacion',
      mensaje,
      icono: 'information-circle',
      mostrarCerrar: true
    });
  }

  warning(mensaje: string): void {
    this.mostrarToast({
      tipo: 'advertencia',
      mensaje,
      icono: 'warning',
      mostrarCerrar: true
    });
  }

  private mostrarToast(config: ToastConfig): void {
    // Implementación del toast - integrar con Ionic Toast Controller o componente personalizado
    console.log('Toast:', config);
  }
}
