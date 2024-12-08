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
  instalaciones: any[] = [];
  esEmpresa: boolean = false;

  constructor(
    private instalacionService: InstalacionService,
    private userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.esEmpresa = this.userProfileService.esEmpresa;

    if (this.esEmpresa) {
      this.instalacionService.obtenerInstalacionesEmpresa().subscribe((response) => {
        if (response.success) {
          this.instalaciones = response.data;
        } else {
          console.error(response.message);
        }
      });
    }
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
}
