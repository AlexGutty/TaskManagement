# 📋 Task Management - Angular 20

Sistema de gestión de tareas desarrollado con **Angular 20** (standalone: false) e **Ionic Framework**.

## 🏗️ Arquitectura

Este proyecto implementa una arquitectura escalable basada en las mejores prácticas de Angular:

```
src/app/
├── 🔧 core/           # Servicios singleton, guards, interceptors
├── 🎯 features/       # Módulos de características (tareas, usuarios, etc.)
└── 🔄 shared/         # Componentes, directivas y pipes compartidos
```

**📖 Ver documentación completa**: [ARCHITECTURE.md](./ARCHITECTURE.md)

## ✨ Features Implementados

### 📊 Gestión de Tareas
- ✅ Vista de tareas por día/semana
- ✅ Filtros avanzados (categoría, estado, prioridad)
- ✅ Tareas administrativas y personales
- ✅ Sistema de subtareas
- ✅ Asignación de tareas a usuarios
- ✅ Estados: Pendiente, En Progreso, Completada, Cerrada
- ✅ Prioridades: Baja, Media, Alta

### 🎨 UI/UX
- Diseño responsive con Ionic
- Skeletons para carga de datos
- Toasts de notificación
- Modales para filtros y acciones
- Animaciones de estado

## 🚀 Inicio Rápido

### Requisitos
- Node.js 18+
- npm 9+
- Angular CLI 20+
- Ionic CLI 7+

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>

# Instalar dependencias
npm install

# Ejecutar en desarrollo
ionic serve
# o
ng serve
```

## 📁 Estructura del Feature "Tareas"

```
features/tareas/
├── components/              # Componentes UI
│   ├── creartarea/         # Formulario crear tarea
│   ├── equipos/            # Vista de equipos
│   ├── mis-tareas/         # Lista mis tareas
│   ├── modal-form/         # Modal genérico
│   └── sub-tareas/         # Componente subtareas
├── pages/                   # Páginas principales
│   ├── tareas.page.ts      # Página principal
│   ├── modal-filtros/      # Modal filtros usuario
│   ├── modal-filtros-admin/# Modal filtros admin
│   ├── subtarea-info/      # Detalle subtarea
│   ├── tareaadmin-aperturar/ # Aperturar tarea admin
│   └── tareas-info/        # Detalle tarea
├── models/                  # Modelos de datos
│   ├── tarea.model.ts
│   └── tarea-admin.model.ts
├── services/                # Servicios
│   └── tareas.service.ts
├── tareas.module.ts
└── tareas-routing.module.ts
```

## 🔧 Tecnologías

- **Angular 20** - Framework principal
- **Ionic 7** - UI Components
- **RxJS** - Programación reactiva
- **date-fns** - Manejo de fechas
- **FontAwesome** - Iconos
- **TypeScript** - Lenguaje

## 📝 Convenciones de Código

### Nomenclatura
- **Componentes**: PascalCase (ej: `TareasPage`)
- **Servicios**: PascalCase + Service (ej: `TareasService`)
- **Interfaces**: PascalCase (ej: `Tarea`)
- **Constantes**: UPPER_SNAKE_CASE (ej: `CONFIRMATION_MODAL`)
- **Variables**: camelCase (ej: `tareasFiltradas`)

### Imports
Usar barrel exports para imports limpios:

```typescript
// ✅ Correcto
import { TareasService, Tarea, TareaAdmin } from '@features/tareas';
import { ToastService, CONFIRMATION_MODAL } from '@core';

// ❌ Incorrecto
import { TareasService } from '../../features/tareas/services/tareas.service';
```

## 🧪 Testing

```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

## 📦 Build

```bash
# Development
ng build

# Production
ng build --configuration=production

# Ionic
ionic build --prod
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/NuevaCaracteristica`)
3. Commit cambios (`git commit -m 'Add: nueva característica'`)
4. Push a la rama (`git push origin feature/NuevaCaracteristica`)
5. Abrir Pull Request

### Commits Semánticos

- `feat:` Nueva característica
- `fix:` Corrección de bug
- `docs:` Documentación
- `style:` Formato, punto y coma, etc
- `refactor:` Refactorización de código
- `test:` Añadir tests
- `chore:` Mantenimiento

## 📄 Licencia

[MIT License](LICENSE)

## 👥 Autores

- Tu Nombre - [GitHub](https://github.com/tuusuario)

## 🔗 Enlaces

- [Documentación Angular](https://angular.io)
- [Documentación Ionic](https://ionicframework.com)
- [Guía de Estilo Angular](https://angular.io/guide/styleguide)
