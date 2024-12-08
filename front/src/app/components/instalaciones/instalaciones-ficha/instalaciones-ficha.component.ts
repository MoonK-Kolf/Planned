import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Services
import { InstalacionService } from 'src/app/services/instalacion.service';

// Interfaces
import { InstalacionHorario } from 'src/app/models/instalacion-horario.model';

// Toast
import Swal from 'sweetalert2';

@Component({
  selector: 'app-instalaciones-ficha',
  templateUrl: './instalaciones-ficha.component.html',
  styleUrls: ['./instalaciones-ficha.component.scss']
})
export class InstalacionesFichaComponent implements OnInit {
  ID: number = 0;
  instalacion: any = {};
  horarios: InstalacionHorario[] = [];

  tiposInstalacion: any[] = [];
  subtiposInstalacion: any[] = [];

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
    private instalacionService: InstalacionService
  ) {}

  ngOnInit(): void {
    this.ID = +this.route.snapshot.paramMap.get('id')!;
    if (this.ID) {
      this.cargarInstalacion();

    } else {
      this.instalacion = {
        Instalacion: '',
        TipoInstalacion_Id: null,
        SubtipoInstalacion_Id: null,
        Telefono: '',
        Capacidad: null,
        Precio: null,
        Direccion: '',
        Observaciones: '',
        Cod_Emp: null
      };
      this.horarios = this.inicializarHorarios();
    }

    this.cargarTiposInstalacion();
  }

  inicializarHorarios(): InstalacionHorario[] {
    const diasSemana = [1, 2, 3, 4, 5, 6, 7];
    return diasSemana.map(dia => ({
      Dia: dia,
      HoraInicio: '',
      HoraFin: '',
      Cerrado: false
    }));
  }

  cargarInstalacion(): void {
    this.instalacionService.obtenerInstalacionPorId(this.ID).subscribe((response) => {
      if (response.success) {
        this.instalacion = response.data;

        if (this.instalacion.TipoInstalacion_Id) {
          this.cargarSubtiposInstalacion(this.instalacion.TipoInstalacion_Id);
        }

        this.cargarHorarios();
      } else {
        console.error(response.message);
        Swal.fire({
          ...this.swalConfig.error,
          title: response.message
        });
      }
    });
  }

  cargarHorarios(): void {
    this.instalacionService.obtenerHorariosPorInstalacion(this.ID).subscribe((response) => {
      if (response.success) {
        this.horarios = response.data.map((h: any) => ({
          Dia: h.Dia,
          HoraInicio: h.HoraInicio,
          HoraFin: h.HoraFin,
          Cerrado: (h.HoraInicio === '00:00:00' && h.HoraFin === '00:00:00') ? true : false
        }));
      } else {
        console.error(response.message);
      }
    });
  }

  cargarTiposInstalacion(): void {
    this.instalacionService.obtenerTiposInstalacion().subscribe((response) => {
      if (response.success) {
        this.tiposInstalacion = response.data;
      } else {
        console.error(response.message);
      } 
    });
  }

  cargarSubtiposInstalacion(tipoId: number): void {
    if (!tipoId) {
      this.subtiposInstalacion = [];
      return;
    }

    this.instalacionService.obtenerSubtiposInstalacion(tipoId).subscribe((response) => {
      if (response.success) {
        this.subtiposInstalacion = response.data;
      } else {
        console.error(response.message);
      } 
    });
  }

  onTipoInstalacionChange(): void {
    if (this.instalacion.TipoInstalacion_Id) {
      this.instalacion.SubtipoInstalacion_Id = null;
      this.cargarSubtiposInstalacion(this.instalacion.TipoInstalacion_Id);
    } else {
      this.subtiposInstalacion = [];
      this.instalacion.SubtipoInstalacion_Id = null;
    }
  }

  guardarInstalacion(): void {
    const valido = this.validarObligatorios();

    if (!valido.success) {
      Swal.fire({
        ...this.swalConfig.error,
        title: valido.message
      });

    } else {
      if (this.ID) {
        this.instalacionService.actualizarInstalacion(this.ID, this.instalacion, this.horarios).subscribe((response) => {
          if (response.success) {
            Swal.fire({
              ...this.swalConfig.success,
              title: response.message
            }).then(() => {
              this.router.navigate(['/app/instalaciones']);
            });
          } else {
            Swal.fire({
              ...this.swalConfig.error,
              title: response.message || 'Ocurrió un error en el servidor'
            });
          }
        });

      } else {
        this.instalacionService.crearInstalacion(this.instalacion, this.horarios).subscribe((response) => {
          if (response.success) {
            Swal.fire({
              ...this.swalConfig.success,
              title: response.message
            }).then(() => {
              this.router.navigate(['/app/instalaciones']);
            });
          } else {
            Swal.fire({
              ...this.swalConfig.error,
              title: response.message || 'Ocurrió un error en el servidor'
            });
          }
        });
      }
    }
  }

  eliminarInstalacion(): void {
    Swal.fire({
      title: '¿Estás seguro?',
      text: "Esta acción no se puede deshacer.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.instalacionService.eliminarInstalacion(this.ID).subscribe(
          response => {
            Swal.fire({
              ...this.swalConfig.success,
              title: response.message
            }).then(() => {
              this.router.navigate(['/app/instalaciones']);
            });
          },
          error => {
            console.error(error);
            Swal.fire({
              ...this.swalConfig.error,
              title: error.error || 'Error al eliminar la instalación'
            });
          }
        ); 
      }
    });
  }

  validarObligatorios(): any {
    // Validar campos obligatorios
    const requiredFields = ['Instalacion', 'TipoInstalacion_Id', 'SubtipoInstalacion_Id', 'Telefono', 'Capacidad', 'Precio', 'Direccion'];
    for (let field of requiredFields) {
      if (!this.instalacion[field]) {
        return { success: false, message: `El campo ${field} es obligatorio`};
      }
    }

    // Validar horarios
    for (let horario of this.horarios) {
      if (!horario.Cerrado) {
        if (!horario.HoraInicio || !horario.HoraFin) {
          return { success: false, message: `Todos los campos de horario deben estar completos para el día ${this.obtenerDiaNombre(horario.Dia)}.`};
        }

        if (horario.HoraFin <= horario.HoraInicio) {
          return { success: false, message: `En el día ${this.obtenerDiaNombre(horario.Dia)}, la Hora de Fin debe ser posterior a la Hora de Inicio.`};
        }
      }
    }

    return { success: true };
  }

  toggleCerrado(index: number): void {
    if (this.horarios[index].Cerrado) {
      this.horarios[index].HoraInicio = '00:00';
      this.horarios[index].HoraFin = '00:00';
    } else {
      this.horarios[index].HoraInicio = '';
      this.horarios[index].HoraFin = '';
    }
  }

  obtenerDiaNombre(dia: number): string {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[dia - 1] || 'Día Desconocido';
  }

  goBack(): void {
    this.router.navigate(['/app/instalaciones']);
  }
}