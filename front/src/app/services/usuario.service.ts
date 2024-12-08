import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

//Services
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {
  private apiURL = 'http://localhost:3000/api/usuarios';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  obtenerUsuario(): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}` || '');

    return this.http.get<any>(`${this.apiURL}/perfil`, { headers });
  }

  actualizarUsuario(perfil: any): Observable<any> {
    const token = this.authService.getToken();
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}` || '');

    return this.http.put<any>(`${this.apiURL}/perfil`, perfil, { headers });
  }
}