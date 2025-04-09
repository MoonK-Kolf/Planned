import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Services
import { InstalacionService } from 'src/app/services/instalacion.service';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-instalaciones',
  templateUrl: './instalaciones.component.html',
  styleUrls: ['./instalaciones.component.scss']
})
export class InstalacionesComponent implements OnInit{
  esEmpresa: boolean = false;
  instalaciones: any[] = [];
  instalacionesFiltradas: any[] = [];

  tiposInstalacion: any[] = [];
  subtiposFiltrados: any[] = [];

  filtroTipo: number | null = null;
  filtroSubtipo: number | null = null;

  constructor(
    private instalacionService: InstalacionService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esEmpresa = this.userProfileService.esEmpresa;

    this.cargarDatos();
}

  cargarDatos(): void {
    this.instalacionService.obtenerInstalacionesEmpresa().subscribe((response) => {
      if (response.success) {
        this.instalaciones = response.data;
        this.instalacionesFiltradas = [...this.instalaciones];
      } else {
        console.error(response.message);
      }
    });

    // Tipos
    this.instalacionService.obtenerTiposInstalacion().subscribe((response) => {
      if (response.success) {
        this.tiposInstalacion = response.data;
      } else {
        console.error(response.message);
      }
    });
  }

  abrirInstalacion(instalacion: any): void {
    this.router.navigate(['/app/instalaciones', instalacion.Instalacion_Id]);
  }

  crearInstalacion(): void {
    this.router.navigate(['/app/instalaciones/nuevo']);
  }

  toggleHover(event: any) {
    event.currentTarget.classList.toggle('hover');
  }

  filtrarInstalaciones(): void {
    this.instalacionesFiltradas = this.instalaciones.filter(instalacion => {
      const coincideTipo = this.filtroTipo ? instalacion.TipoInstalacion_Id === this.filtroTipo : true;
      const coincideSubtipo = this.filtroSubtipo ? instalacion.SubtipoInstalacion_Id === this.filtroSubtipo : true;
      return coincideTipo && coincideSubtipo;
    });
  }

  resetearFiltros(): void {
    this.filtroTipo = null;
    this.filtroSubtipo = null;
    this.instalacionesFiltradas = [...this.instalaciones];
    this.subtiposFiltrados = [];
  }

  onTipoChange(): void {
    if (this.filtroTipo) {
      this.instalacionService.obtenerSubtiposInstalacion(this.filtroTipo).subscribe((response) => {
        if (response.success) {
          this.subtiposFiltrados = response.data;
          this.filtroSubtipo = null;
          this.filtrarInstalaciones();
        } else {
          console.error(response.message);
          this.subtiposFiltrados = [];
          this.filtroSubtipo = null;
          this.filtrarInstalaciones();
        }
      });
    } else {
      this.subtiposFiltrados = [];
      this.filtroSubtipo = null;
      this.filtrarInstalaciones();
    }
  }

  onSubtipoChange(): void {
    this.filtrarInstalaciones();
  }
}
