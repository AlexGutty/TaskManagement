import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

/**
 * SharedModule - Componentes, directivas y pipes reutilizables
 * Este módulo puede importarse en múltiples feature modules
 */
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FontAwesomeModule
  ],
  declarations: [
    // Agregar componentes compartidos aquí
  ],
  exports: [
    // Re-exportar módulos comunes para que los feature modules no tengan que importarlos
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    FontAwesomeModule,
    // Exportar componentes compartidos
  ]
})
export class SharedModule { }
