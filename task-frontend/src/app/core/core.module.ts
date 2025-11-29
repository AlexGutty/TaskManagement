import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

/**
 * CoreModule - Singleton services, guards, interceptors
 * Este módulo debe importarse SOLO una vez en AppModule
 */
@NgModule({
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Los servicios con providedIn: 'root' no necesitan declararse aquí
    // Agregar guards, interceptors, etc.
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule ya fue importado. Importar solo en AppModule.');
    }
  }
}
