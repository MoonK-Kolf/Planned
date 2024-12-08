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

  constructor(
    private instalacionService: InstalacionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.instalacionService.obtenerInstalaciones().subscribe((response) => {
      if (response.success) {
        this.instalaciones = response.data;
      } else {
        console.error(response.message);
      }
    });
  }

  reservar(instalacion: any): void {
    this.router.navigate(['/app/reservar', instalacion.Instalacion_Id]);
  }

  toggleHover(event: any) {
    event.currentTarget.classList.toggle('hover');
  }
}
