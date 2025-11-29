export class EndpointUtil {
  // URL base de la API - ajustar según el entorno
  static readonly urlBase = '/api'; // Cambiar por la URL real de tu backend

  // Endpoints específicos
  static readonly endpoints = {
    tareas: {
      misTareas: `${EndpointUtil.urlBase}/tareas/mis-tareas`,
      equipo: (equipoId: string) => `${EndpointUtil.urlBase}/tareas/equipo/${equipoId}`,
      equipos: `${EndpointUtil.urlBase}/tareas/equipos`,
    }
  };
}
