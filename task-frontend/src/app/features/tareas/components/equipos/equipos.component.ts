import { Component, OnDestroy, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';

interface Equipo {
  id: string;
  nombre: string;
  descripcion: string;
  miembros: any[];
  tareas: any[];
  activo: boolean;
}

@Component({
  selector: 'app-equipos',
  standalone: false,
  templateUrl: './equipos.component.html',
  styleUrls: ['./equipos.component.scss'],
})
export class EquiposComponent implements OnInit, OnDestroy {
  equipos: Equipo[] = [];
  equiposFiltrados: Equipo[] = [];
  isLoading: boolean = false;
  searchTerm: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(
    private modalController: ModalController
  ) {}

  ngOnInit(): void {
    this.loadEquipos();
  }

  loadEquipos(): void {
    this.isLoading = true;
    // TODO: Implementar servicio para cargar equipos
    // this.equiposService.getEquipos().subscribe(...)
    setTimeout(() => {
      this.equipos = [];
      this.equiposFiltrados = [...this.equipos];
      this.isLoading = false;
    }, 500);
  }

  filtrarEquipos(): void {
    if (!this.searchTerm.trim()) {
      this.equiposFiltrados = [...this.equipos];
      return;
    }

    const termino = this.searchTerm.toLowerCase();
    this.equiposFiltrados = this.equipos.filter(equipo =>
      equipo.nombre.toLowerCase().includes(termino) ||
      equipo.descripcion?.toLowerCase().includes(termino)
    );
  }

  async crearEquipo(): Promise<void> {
    // TODO: Abrir modal para crear equipo
  }

  async editarEquipo(equipo: Equipo): Promise<void> {
    // TODO: Abrir modal para editar equipo
  }

  async verDetalleEquipo(equipo: Equipo): Promise<void> {
    // TODO: Navegar a detalle del equipo o abrir modal
  }

  async eliminarEquipo(equipo: Equipo): Promise<void> {
    // TODO: Implementar eliminación de equipo
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
