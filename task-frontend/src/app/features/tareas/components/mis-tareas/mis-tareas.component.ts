import { Component, OnDestroy, OnInit } from '@angular/core';

@Component({
  selector: 'app-mis-tareas',
  standalone:false,
  templateUrl: './mis-tareas.component.html',
  styleUrls: ['./mis-tareas.component.scss'],
})
export class MisTareasComponent implements OnInit, OnDestroy {
  ngOnDestroy(): void {
  }
  ngOnInit(): void {
  }
}
