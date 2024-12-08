import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';

// Services
import { ReservasService } from 'src/app/services/reservas.service';

// Models
import { Reserva } from 'src/app/models/reserva.model';

@Component({
  selector: 'app-reservas',
  templateUrl: './reservas.component.html',
  styleUrls: ['./reservas.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class ReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  displayedColumns: string[] = ['Reserva_Id', 'Instalacion', 'FechaReserva', 'HoraInicio', 'HoraFin', 'CreadoEn', 'acciones'];
  dataSource = new MatTableDataSource<Reserva>();
  expandedElement: Reserva | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(private reservasService: ReservasService) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    this.reservasService.getReservasUsuario().subscribe(
      data => {
        console.log("DATA", data);
        if (data.success) {
          this.reservas = data.reservas;
          this.dataSource.data = this.reservas;
        } else {
          this.error = 'Error al cargar tus reservas.';
        }
        this.loading = false;
      },
      error => {
        console.error('Error al obtener reservas del usuario:', error);
        this.error = 'No se pudieron cargar tus reservas.';
        this.loading = false;
      }
    );
  }

  toggleRow(row: Reserva): void {
    this.expandedElement = this.expandedElement === row ? null : row;
  }

  formatFecha(fecha: string): string {
    const date = new Date(fecha);
    return date.toLocaleDateString();
  }

  formatHora(hora: string): string {
    const [hours, minutes, seconds] = hora.split(':');
    const date = new Date();
    date.setHours(+hours, +minutes, +seconds);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
