import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    if (!this.email) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Por favor, ingresa tu correo electrónico.'
      });
      return;
    }

    this.authService.forgotPassword(this.email).subscribe(
      (response) => {
        if (response.success) {
          Swal.fire({
            icon: 'success',
            title: 'Correo enviado',
            text: 'Hemos enviado un enlace para restablecer tu contraseña al correo proporcionado.'
          }).then(() => {
            setTimeout(() => {
              this.router.navigate(['/login']);
            }, 200);
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.message || 'Ocurrió un error al procesar tu solicitud.'
          });
        }
      },
      (error) => {
        console.error('Error en forgotPassword:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Ocurrió un error en el servidor.'
        });
      }
    );
  }
}
