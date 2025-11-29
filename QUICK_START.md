# 🚀 Quick Start - Arquitectura Escalable

## ✅ Lo que se ha implementado

Tu proyecto ahora tiene una estructura **profesional y escalable** siguiendo las mejores prácticas de Angular.

## 📋 Antes vs Después

### ❌ Antes (Todo en una carpeta)
```
tareas/
├── components/
├── pages/
├── tareas.service.ts (con todos los modelos dentro)
├── tareas.module.ts
└── tareas.page.ts
```

### ✅ Ahora (Arquitectura Escalable)
```
src/app/
├── core/           → Servicios globales, constantes, utils
├── features/       → Módulos de características
│   └── tareas/
└── shared/         → Componentes reutilizables
```

## 🎯 Cómo usar la nueva estructura

### 1️⃣ Importar Modelos

```typescript
// ✅ Forma correcta (con barrel exports)
import { Tarea, TareaAdmin, ResumenTareas } from '../models';

// ⚠️ También funciona (más explícito)
import { Tarea } from '../models/tarea.model';
import { TareaAdmin } from '../models/tarea-admin.model';
```

### 2️⃣ Importar Servicios

```typescript
// Desde el mismo feature
import { TareasService } from '../services/tareas.service';

// Desde Core (una vez configurados los path aliases)
import { ToastService } from '@core/services';
import { CONFIRMATION_MODAL } from '@core/constants';
```

### 3️⃣ Crear un nuevo componente en el feature

```bash
# Componente
ng generate component features/tareas/components/nueva-tarea

# Página
ng generate component features/tareas/pages/lista-tareas

# Servicio
ng generate service features/tareas/services/notificaciones
```

### 4️⃣ Crear un nuevo Feature Module

```bash
# Crear el módulo
ng generate module features/usuarios --routing

# Crear la estructura
mkdir -p src/app/features/usuarios/{components,pages,models,services}

# Crear archivos barrel
echo "export * from './usuario.model';" > src/app/features/usuarios/models/index.ts
```

## 🔧 Configuración Recomendada

### tsconfig.json (Path Aliases)

Agrega esto en `compilerOptions`:

```json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@core/*": ["src/app/core/*"],
      "@features/*": ["src/app/features/*"],
      "@shared/*": ["src/app/shared/*"],
      "@env/*": ["src/environments/*"]
    }
  }
}
```

Después podrás importar así:

```typescript
import { ToastService } from '@core/services';
import { TareasService } from '@features/tareas/services';
import { SharedModule } from '@shared';
```

## 📦 Estructura de un Feature Completo

Ejemplo: Feature "Usuarios"

```
features/usuarios/
├── components/
│   ├── usuario-card/
│   │   ├── usuario-card.component.ts
│   │   ├── usuario-card.component.html
│   │   └── usuario-card.component.scss
│   └── index.ts
├── pages/
│   ├── usuarios-list/
│   ├── usuario-detail/
│   └── index.ts
├── models/
│   ├── usuario.model.ts
│   ├── rol.model.ts
│   └── index.ts
├── services/
│   └── usuarios.service.ts
├── usuarios.module.ts
├── usuarios-routing.module.ts
└── index.ts
```

## 🎨 Componentes Shared

Para componentes que se usan en múltiples features:

```bash
# Crear componente shared
ng generate component shared/components/custom-button

# Declarar en shared.module.ts
@NgModule({
  declarations: [CustomButtonComponent],
  exports: [CustomButtonComponent]  // ← Importante exportar
})
export class SharedModule { }

# Usar en cualquier feature
// En el module del feature
imports: [SharedModule]

// En el template
<app-custom-button (click)="guardar()">Guardar</app-custom-button>
```

## 🔐 Guards y Interceptors

### Crear un Guard

```bash
ng generate guard core/guards/auth

# Usar en routing
{
  path: 'admin',
  canActivate: [AuthGuard],
  loadChildren: () => import('./features/admin/admin.module')
}
```

### Crear un Interceptor

```bash
ng generate interceptor core/interceptors/auth

# Registrar en core.module.ts
providers: [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
```

## 🧪 Testing

```typescript
// Probar un servicio del feature
import { TestBed } from '@angular/core/testing';
import { TareasService } from './services/tareas.service';

describe('TareasService', () => {
  let service: TareasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TareasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
```

## 📋 Checklist para nuevos Features

- [ ] Crear carpeta en `features/`
- [ ] Crear subcarpetas: `components/`, `pages/`, `models/`, `services/`
- [ ] Crear `feature.module.ts` y `feature-routing.module.ts`
- [ ] Crear archivos `index.ts` (barrel exports)
- [ ] Configurar lazy loading en app-routing
- [ ] Documentar en README del feature

## 💡 Mejores Prácticas

### ✅ DO (Hacer)

1. **Modelos en archivos separados**
   ```typescript
   // ✅ models/usuario.model.ts
   export interface Usuario { ... }
   ```

2. **Usar barrel exports**
   ```typescript
   // ✅ models/index.ts
   export * from './usuario.model';
   export * from './rol.model';
   ```

3. **Servicios con providedIn**
   ```typescript
   // ✅
   @Injectable({ providedIn: 'root' })
   export class UsuariosService { }
   ```

4. **Componentes pequeños y reutilizables**

### ❌ DON'T (No hacer)

1. **Modelos en servicios**
   ```typescript
   // ❌ No definir interfaces dentro del servicio
   export class UsuariosService {
     // ❌
     interface Usuario { ... }
   }
   ```

2. **Imports relativos profundos**
   ```typescript
   // ❌
   import { Usuario } from '../../../../core/models/usuario';

   // ✅
   import { Usuario } from '@core/models';
   ```

3. **Lógica de negocio en componentes shared**

## 📚 Recursos

- 📖 [ARCHITECTURE.md](./ARCHITECTURE.md) - Documentación completa
- 📖 [README.md](./README.md) - Información general del proyecto
- 🔗 [Angular Style Guide](https://angular.io/guide/styleguide)
- 🔗 [Angular Architecture](https://angular.io/guide/architecture)

## 🆘 Ayuda Rápida

### ¿Dónde pongo...?

| Elemento | Ubicación |
|----------|-----------|
| Servicio global | `core/services/` |
| Servicio de feature | `features/nombre/services/` |
| Modelo global | `core/models/` |
| Modelo de feature | `features/nombre/models/` |
| Componente reutilizable | `shared/components/` |
| Componente específico | `features/nombre/components/` |
| Página | `features/nombre/pages/` |
| Constante global | `core/constants/` |
| Guard | `core/guards/` |
| Interceptor | `core/interceptors/` |
| Pipe compartido | `shared/pipes/` |

## 🎉 Resultado

Tu proyecto ahora es:
- ✅ **Escalable**: Fácil agregar nuevos features
- ✅ **Mantenible**: Código organizado y fácil de encontrar
- ✅ **Testeable**: Módulos bien definidos
- ✅ **Profesional**: Siguiendo estándares de la industria
- ✅ **Documentado**: README y ARCHITECTURE.md completos

---

**¿Preguntas?** Revisa [ARCHITECTURE.md](./ARCHITECTURE.md) para más detalles.
