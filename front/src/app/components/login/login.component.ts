import { Component } from '@angular/core';
import { Router } from '@angular/router';

//Services
import { AuthService } from 'src/app/services/auth.service';

//Toast
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  signUpData: any = { perfil: "Usuario" };
  loginData: any = {};
  errorMessage: string = "";

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
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const signupButton = document.getElementById('signup-button');
    const loginButton = document.getElementById('login-button');
    const userForms = document.getElementById('user_options-forms');

    signupButton?.addEventListener('click', () => {
      userForms?.classList.remove('bounceRight');
      userForms?.classList.add('bounceLeft');
      }, false);

    loginButton?.addEventListener('click', () => {
      userForms?.classList.remove('bounceLeft');
      userForms?.classList.add('bounceRight');
      }, false);
  }

  onSignUp(): void {
    const valido = this.validarCamposRegistro();

    if (valido.success) {
      if (this.signUpData.perfil === 'Empresa') {
        this.signUpData.empresa = {
          nombre: this.signUpData.nombreEmpresa || '',
        };
      }

      this.authService.register(this.signUpData).subscribe((response) => {        
        if (response.success) {
          Swal.fire({
            ...this.swalConfig.success,
            title: response.message
          });

          this.signUpData = { perfil: 'Usuario' };
          const checkbox = document.getElementById('chk') as HTMLInputElement;
          checkbox.checked = false;
        } else {
          Swal.fire({
            ...this.swalConfig.error,
            title: response.message || 'Ocurrió un error en el servidor'
          });
        }
      });
    } else {
      Swal.fire({
        ...this.swalConfig.error,
        title: valido.message
      });
    }
  }

  onLogin(): void {
    const valido = this.validarCamposLogin();

    if (valido.success) {
      this.authService.login(this.loginData.username, this.loginData.password).subscribe(
        (response) => {
          if (response.success) {
            this.loginData = {};
            this.router.navigate(['/app/home']);
          } else {
            Swal.fire({
              ...this.swalConfig.error,
              title: response.message || 'Ocurrió un error'
            });
          }
        },
        (error) => {
          Swal.fire({
            ...this.swalConfig.error,
            title: 'Ocurrió un error en el servidor' + error
          });
        }
      ); 
    } else {
      Swal.fire({
        ...this.swalConfig.error,
        title: valido.message
      });
    }
    
  }

  validarCamposRegistro(): any {
    if (!this.signUpData.username || this.signUpData.username == "") {
      return { success: false, message: 'El campo "Usuario" es obligaorio' };
    }
    
    if (!this.signUpData.email || this.signUpData.email == "") {
      return { success: false, message: 'El campo "Email" es obligaorio' };
    }
    
    if (!this.signUpData.password || this.signUpData.password == "") {
      return { success: false, message: 'El campo "Contraseña" es obligaorio' };
    }

    if (this.signUpData.password.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres'}
    }

    if (!this.signUpData.perfil) {
      return { success: false, message: 'Debe seleccionar un perfil (Usuario o Empresa)' };
    }

    if (this.signUpData.perfil === 'Empresa' && !this.signUpData.nombreEmpresa) {
      return { success: false, message: 'Debe especificar un nombre de empresa' };
    }
    
    return { success: true, message: 'Registro exitoso. Ahora puedes iniciar sesión' };
  }

  validarCamposLogin(): any {
    if (!this.loginData.username || this.loginData.username == "") {
      return { success: false, message: 'El campo "Usuario" es obligatorio' };
    }

    if (!this.loginData.password || this.loginData.password == "") {
      return { success: false, message: 'El campo "Contraseña" es obligatorio' };
    }

    return { success: true, message: '' };
  }
}
