import { Component, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';

//Services
import { GeneralService } from 'src/app/services/general.service';
import { UsuarioService } from 'src/app/services/usuario.service';

//Toast
import Swal from 'sweetalert2';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  perfil: any = {}
  provincias: any[] = [];
  esEmpresa: boolean = false;

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
    private generalService: GeneralService,
    private usuarioService: UsuarioService
  ) {}

  ngOnInit(): void {
    this.usuarioService.obtenerUsuario().subscribe(
      data => { this.perfil = data; this.esEmpresa = this.perfil.Perfil_Id === 3 },
      error => { console.log('Error al obtener el usuario' + error) }
    );

    this.generalService.obtenerDatosAuxiliares('Aux_Provincias').subscribe(
      data => { this.provincias = data },
      error => { console.log('Error al obtener las provincias', error) }
    )
  }


  onSubmit(form: any) {
    if (form.valid) {
      this.usuarioService.actualizarUsuario(this.perfil).subscribe((response) => {
        if (response.success) {
          Swal.fire({
            ...this.swalConfig.success,
            title: response.message
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