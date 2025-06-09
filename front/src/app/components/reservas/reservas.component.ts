import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

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
      state('collapsed', style({ 
        height: '0px', 
        minHeight: '0',
        opacity: '0',
        padding: '0',
        margin: '0',
        border: 'none'
      })),
      state('expanded', style({ 
        height: '*',
        opacity: '1'
      })),
      transition('expanded <=> collapsed', [
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
    ]),
  ]
})
export class ReservasComponent implements OnInit {
  reservas: Reserva[] = [];
  displayedColumns: string[] = ['Reserva_Id', 'Instalacion', 'FechaReserva', 'HoraInicio', 'HoraFin', 'Observaciones', 'acciones'];
  dataSource = new MatTableDataSource<Reserva>();
  expandedElement: Reserva | null = null;
  loading: boolean = false;
  error: string = '';

  constructor(
    private reservasService: ReservasService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading = true;
    this.reservasService.getReservasUsuario().subscribe(
      data => {
        if (data.success) {
          this.reservas = data.reservas.sort((a, b) => 
            new Date(b.FechaReserva).getTime() - new Date(a.FechaReserva).getTime()
          );
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
    if (!fecha) return '';
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return new Date(fecha).toLocaleDateString('es-ES', options);
  }

  formatHora(hora: string): string {
    if (!hora) return '';
    const [hours, minutes] = hora.split(':');
    return `${hours}:${minutes}`;
  }

  // Método para verificar si una reserva es pasada
  isReservaPasada(fecha: string, hora: string): boolean {
    const ahora = new Date();
    const [hours, minutes] = hora.split(':');
    const fechaReserva = new Date(fecha);
    fechaReserva.setHours(+hours, +minutes);
    
    return fechaReserva < ahora;
  }

  eliminarReserva(reservaId: number): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmar cancelación',
        message: '¿Estás seguro de que quieres cancelar esta reserva?',
        confirmText: 'Cancelar reserva',
        cancelText: 'Volver'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loading = true;
        this.reservasService.eliminarReserva(reservaId).subscribe({
          next: (response) => {
            if (response.success) {
              this.snackBar.open('Reserva cancelada correctamente', 'Cerrar', {
                duration: 3000
              });
              this.cargarReservas(); // Recargar la lista de reservas
            } else {
              this.error = response.message || 'Error al cancelar la reserva';
              this.snackBar.open(this.error, 'Cerrar', {
                duration: 3000
              });
            }
          },
          error: (err) => {
            console.error('Error al eliminar reserva:', err);
            this.snackBar.open('Error al cancelar la reserva', 'Cerrar', {
              duration: 3000
            });
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        });
      }
    });
  }
}
