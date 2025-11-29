# Arquitectura del Proyecto - Task Management

## 📁 Estructura de Carpetas

Este proyecto sigue una arquitectura escalable basada en las mejores prácticas de Angular con módulos no standalone.

```
src/app/
├── core/                       # Módulos singleton y servicios globales
│   ├── constants/              # Constantes globales de la aplicación
│   │   ├── confirmation-modal.constant.ts
│   │   └── index.ts
│   ├── guards/                 # Route guards (canActivate, canDeactivate, etc.)
│   ├── interceptors/           # HTTP interceptors
│   ├── models/                 # Interfaces y modelos globales
│   │   └── index.ts
│   ├── services/               # Servicios singleton globales
│   │   ├── toast.service.ts
│   │   └── index.ts
│   ├── utils/                  # Utilidades y helpers
│   │   ├── endpoint.util.ts
│   │   └── index.ts
│   ├── core.module.ts          # Módulo core (importar solo en AppModule)
│   └── index.ts                # Barrel export
│
├── features/                   # Módulos de características
│   └── tareas/                 # Feature: Gestión de Tareas
│       ├── components/         # Componentes específicos del feature
│       │   ├── creartarea/
│       │   ├── equipos/
│       │   ├── mis-tareas/
│       │   ├── modal-form/
│       │   ├── sub-tareas/
│       │   └── index.ts
│       ├── pages/              # Páginas/Containers
│       │   ├── tareas.page.ts
│       │   ├── modal-filtros/
│       │   ├── modal-filtros-admin/
│       │   ├── subtarea-info/
│       │   ├── tareaadmin-aperturar/
│       │   ├── tareas-info/
│       │   └── index.ts
│       ├── models/              # Modelos específicos del feature
│       │   ├── tarea.model.ts
│       │   ├── tarea-admin.model.ts
│       │   └── index.ts
│       ├── services/            # Servicios específicos del feature
│       │   └── tareas.service.ts
│       ├── tareas.module.ts     # Módulo del feature
│       ├── tareas-routing.module.ts
│       └── index.ts
│
└── shared/                     # Componentes, directivas y pipes compartidos
    ├── components/             # Componentes reutilizables (botones, cards, etc.)
    ├── directives/             # Directivas compartidas
    ├── pipes/                  # Pipes compartidos
    ├── shared.module.ts        # Módulo compartido
    └── index.ts
```

## 📋 Principios de Arquitectura

### 1. **Core Module**
- **Propósito**: Contiene servicios singleton, guards, interceptors y configuración global
- **Importación**: Solo se importa UNA VEZ en `AppModule`
- **Servicios**: Usar `providedIn: 'root'` para servicios singleton
- **Ejemplo de uso**:
  ```typescript
  import { ToastService } from '@core/services';
  import { CONFIRMATION_MODAL } from '@core/constants';
  import { EndpointUtil } from '@core/utils';
  ```

### 2. **Features Module**
- **Propósito**: Contiene la lógica de negocio específica de cada feature
- **Organización**:
  - `components/`: Componentes UI específicos del feature
  - `pages/`: Containers o páginas principales
  - `models/`: Interfaces y modelos del dominio
  - `services/`: Servicios específicos del feature
- **Lazy Loading**: Cada feature puede cargarse de forma diferida
- **Ejemplo de uso**:
  ```typescript
  import { Tarea, TareaAdmin } from '@features/tareas/models';
  import { TareasService } from '@features/tareas/services';
  ```

### 3. **Shared Module**
- **Propósito**: Componentes, directivas y pipes reutilizables en toda la app
- **Importación**: Se importa en múltiples feature modules
- **Contenido**: Elementos UI genéricos (botones, cards, modales, etc.)
- **Ejemplo de uso**:
  ```typescript
  import { SharedModule } from '@shared';
  ```

## 🎯 Reglas y Mejores Prácticas

### ✅ DO (Hacer)

1. **Core Module**:
   - ✅ Usar para servicios singleton globales
   - ✅ Implementar guards y interceptors aquí
   - ✅ Definir constantes globales
   - ✅ Crear utilidades compartidas

2. **Feature Modules**:
   - ✅ Mantener features autocontenidos y cohesivos
   - ✅ Usar lazy loading cuando sea posible
   - ✅ Separar componentes de presentación y containers (pages)
   - ✅ Crear modelos específicos del dominio

3. **Shared Module**:
   - ✅ Componentes puramente presentacionales
   - ✅ Re-exportar módulos comunes (CommonModule, FormsModule, etc.)
   - ✅ Crear directivas y pipes reutilizables

4. **Imports**:
   - ✅ Usar barrel exports (`index.ts`) para imports limpios
   - ✅ Configurar path aliases en `tsconfig.json`:
     ```json
     {
       "compilerOptions": {
         "paths": {
           "@core/*": ["src/app/core/*"],
           "@features/*": ["src/app/features/*"],
           "@shared/*": ["src/app/shared/*"]
         }
       }
     }
     ```

### ❌ DON'T (No hacer)

1. **Core Module**:
   - ❌ NO importar CoreModule en feature modules
   - ❌ NO declarar componentes en CoreModule
   - ❌ NO importar CoreModule múltiples veces

2. **Feature Modules**:
   - ❌ NO crear dependencias circulares entre features
   - ❌ NO poner lógica compartida en un feature específico
   - ❌ NO mezclar concerns de diferentes features

3. **Shared Module**:
   - ❌ NO incluir servicios con estado en SharedModule
   - ❌ NO poner lógica de negocio en componentes shared
   - ❌ NO crear dependencias con features específicos

## 🔄 Flujo de Importación

```
AppModule
    │
    ├─── CoreModule (una sola vez)
    │       └─── Servicios singleton, Guards, Interceptors
    │
    └─── Feature Modules (múltiples)
            │
            ├─── SharedModule (importar según necesidad)
            │       └─── Componentes UI, Directivas, Pipes
            │
            └─── Servicios específicos del feature
```

## 📝 Ejemplos de Código

### Ejemplo 1: Crear un nuevo Feature

```typescript
// 1. Crear estructura
ng generate module features/usuarios --routing
ng generate component features/usuarios/pages/usuario-list
ng generate component features/usuarios/components/usuario-card
ng generate service features/usuarios/services/usuario

// 2. Estructura resultante
features/usuarios/
├── components/
│   └── usuario-card/
├── pages/
│   └── usuario-list/
├── models/
│   └── usuario.model.ts
├── services/
│   └── usuario.service.ts
├── usuarios.module.ts
└── usuarios-routing.module.ts
```

### Ejemplo 2: Usar servicios y constantes

```typescript
// En un componente
import { Component } from '@angular/core';
import { ToastService } from '@core/services';
import { CONFIRMATION_MODAL } from '@core/constants';
import { TareasService } from '@features/tareas/services';

@Component({
  selector: 'app-tarea-list',
  templateUrl: './tarea-list.component.html'
})
export class TareaListComponent {
  constructor(
    private toastService: ToastService,
    private tareasService: TareasService
  ) {}

  eliminarTarea() {
    // Usar constantes del core
    if (confirm(CONFIRMATION_MODAL.SI)) {
      this.tareasService.eliminar(id);
      this.toastService.success('Tarea eliminada');
    }
  }
}
```

### Ejemplo 3: Crear componente shared

```typescript
// shared/components/custom-button/custom-button.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-custom-button',
  template: `
    <ion-button [color]="color" (click)="handleClick()">
      <ng-content></ng-content>
    </ion-button>
  `
})
export class CustomButtonComponent {
  @Input() color: string = 'primary';
  @Output() clicked = new EventEmitter<void>();

  handleClick() {
    this.clicked.emit();
  }
}

// Exportar en shared.module.ts
declarations: [CustomButtonComponent],
exports: [CustomButtonComponent]

// Usar en cualquier feature
<app-custom-button color="success" (clicked)="guardar()">
  Guardar
</app-custom-button>
```

## 🚀 Escalabilidad

Esta arquitectura permite:

1. **Añadir nuevos features fácilmente**: Cada feature es independiente
2. **Lazy loading**: Cargar features bajo demanda
3. **Testing**: Módulos bien definidos facilitan el testing
4. **Mantenibilidad**: Separación clara de responsabilidades
5. **Trabajo en equipo**: Múltiples desarrolladores pueden trabajar en diferentes features

## 📚 Recursos

- [Angular Style Guide](https://angular.io/guide/styleguide)
- [Angular Architecture Patterns](https://angular.io/guide/architecture)
- [Feature Modules](https://angular.io/guide/feature-modules)
