import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token');

    if (!this.token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Token de restablecimiento inválido.'
      });
      this.router.navigate(['/login']);
    }
  }

  validarObligatorios(): any {
    if (!this.newPassword || !this.confirmPassword) {
      return { success: false, message: 'Por favor, completa todos los campos'}
    }

    if (this.newPassword !== this.confirmPassword) {
      return { success: false, message: 'Las contraseñas no coinciden'}
    }

    if (this.newPassword.length < 6) {
      return { success: false, message: 'La contraseña debe tener al menos 6 caracteres'}
    }

    if (!this.token) {
      return { success: false, message: 'Token de restablecimiento inválido'}
    }

    if (!this.newPassword || !this.confirmPassword) {
      return { success: false, message: 'Por favor, completa todos los campos'}
    }

    if (!this.newPassword || !this.confirmPassword) {
      return { success: false, message: 'Por favor, completa todos los campos'}
    }
    
    if (!this.newPassword || !this.confirmPassword) {
      return { success: false, message: 'Por favor, completa todos los campos'}
    }

    return { success: true}
  }

  onSubmit(): void {
    const valido = this.validarObligatorios();
    
    if (!valido.success) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: valido.message
      });
    } else {
      this.authService.resetPassword(this.token || '', this.newPassword).subscribe(
        (response) => {
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Contraseña restablecida',
              text: 'Tu contraseña ha sido restablecida exitosamente. Puedes iniciar sesión ahora.'
            }).then(() => {
              this.router.navigate(['/login']);
            });
          } else {
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: response.message || 'Ocurrió un error al restablecer tu contraseña.'
            });
          }
        },
        (error) => {
          console.error('Error en resetPassword:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Ocurrió un error en el servidor.'
          });
        }
      );
    }
  }
}
