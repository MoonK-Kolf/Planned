import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { InstalacionService } from 'src/app/services/instalacion.service';
import { ReservasService } from 'src/app/services/reservas.service';

// Models
import { InstalacionHorario } from 'src/app/models/instalacion-horario.model';
import { Instalacion } from 'src/app/models/instalacion.model';
import { Reserva } from 'src/app/models/reserva.model';

// Toast
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reservar',
  templateUrl: './reservar.component.html',
  styleUrls: ['./reservar.component.scss']
})
export class ReservarComponent implements OnInit {
  instalacionId: number = 0;
  instalacion: Instalacion | null = null;
  horariosDisponibles: InstalacionHorario[] = [];
  selectedHorario: InstalacionHorario | null = null;
  fechaReserva: string = '';
  minDate: string = '';

  swalConfig: any = {
    success: {
      icon: "success",
      showConfirmButton: false,
      timer: 1500,
    },
    error: {
      icon: "error",
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      timer: 1500
    }
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private instalacionService: InstalacionService,
    private reservasService: ReservasService
  ) { }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.instalacionId = idParam ? +idParam : 0;
    this.cargarInstalacion();
    this.setMinDate();
  }

  // Establecer la fecha mínima para la reserva como el día actual
  setMinDate(): void {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    this.minDate = `${year}-${month}-${day}`;
  }

  cargarInstalacion(): void {
    this.instalacionService.obtenerInstalacionPorId(this.instalacionId).subscribe(
      data => { this.instalacion = data.data },
      error => { console.error('Error al cargar la instalación', error) }
    );
  }

  // Llamado cuando cambia la fecha de reserva
  onFechaChange(): void {
    if (this.fechaReserva) {
      this.cargarHorariosDisponibles();
    } else {
      this.horariosDisponibles = [];
      this.selectedHorario = null;
    }
  }

  cargarHorariosDisponibles(): void {
    this.reservasService.getHorariosDisponibles(this.instalacionId, this.fechaReserva).subscribe((response) => {
      if (response.success) {
        this.horariosDisponibles = response.horariosDisponibles;
      } else {
        console.error(response.message);
      }
    });
  }

  validarObligatorios(): any {
    if (!this.instalacion) {
      return { success: false, message: "Instalación no encontrada." }
    }

    if (!this.selectedHorario) {
      return { success: false, message: "Por favor, selecciona un horario." }
    }

    if (!this.fechaReserva) {
      return { success: false, message: "Por favor, selecciona una fecha para la reserva." }
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const reservaDate = new Date(this.fechaReserva).setHours(0, 0, 0, 0);
    if (reservaDate < today) {
      return { success: false, message: "Introduzca una fecha válida." }
    }

    return { success: true }
  }

  reservar(): void {
    const valido = this.validarObligatorios();

    if (!valido.success) {
      Swal.fire({
        ...this.swalConfig.error,
        title: valido.message
      });
    } 

    const reserva: Reserva = {
      Instalacion_Id: this.instalacionId,
      FechaReserva: this.fechaReserva,
      HoraInicio: this.selectedHorario?.HoraInicio || "",
      HoraFin: this.selectedHorario?.HoraFin ||""
    };

    this.reservasService.crearReserva(reserva).subscribe(
      response => {
        if (response.success) {
          Swal.fire({
            ...this.swalConfig.success,
            title: response.message
          }).then(() => {
            this.router.navigate(['/app/home']);
          });
        } else {
          Swal.fire({
            ...this.swalConfig.error,
            title: response.message || 'Ocurrió un error en el servidor'
          });
        }
      },
      error => {
        console.error('Error al crear la reserva:', error);
        Swal.fire('Error', error.error.message || 'Error al crear la reserva.', 'error');
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/app/home']);
  }
}