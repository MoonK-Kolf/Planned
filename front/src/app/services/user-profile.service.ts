import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UsuarioService } from './usuario.service';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private perfilSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public perfil$: Observable<any> = this.perfilSubject.asObservable();

  constructor(private usuarioService: UsuarioService) {}

  cargarPerfil(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.usuarioService.obtenerUsuario().subscribe(
        (data) => { 
          this.perfilSubject.next(data);
          resolve();
        },
        (error) => {
          console.error('Error al obtener el perfil del usuario', error);
          this.perfilSubject.next(null);
          reject(error);
        }
      );
    });
  }

  get esEmpresa(): boolean {
    const perfil = this.perfilSubject.value;
    return perfil && perfil.Perfil_Id === 3;
  }

  getPerfil(): any {
    return this.perfilSubject.value;
  }
}