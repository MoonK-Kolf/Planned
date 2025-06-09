import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

//Services
import { InstalacionService } from 'src/app/services/instalacion.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit{
  instalaciones: any[] = [];
  instalacionesFiltradas: any[] = [];

  tiposInstalacion: any[] = [];
  subtiposFiltrados: any[] = [];

  filtroTipo: number | null = null;
  filtroSubtipo: number | null = null;

  constructor(
    private instalacionService: InstalacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(): void {
    this.instalacionService.obtenerInstalaciones().subscribe((response) => {
      if (response.success) {
        this.instalaciones = response.data.map((inst: any, index: any) => ({
        ...inst,
        imagenUrl: this.generarImagenDeporte(inst, index)
      }));
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

  generarImagenDeporte(instalacion: any, index: number): string {
    const tema = encodeURIComponent(instalacion.SubtipoInstalacion || 'deporte');
    return `https://picsum.photos/seed/fitness${index}/500/500`;
  }

  reservar(instalacion: any): void {
    this.router.navigate(['/app/reservar', instalacion.Instalacion_Id]);
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
