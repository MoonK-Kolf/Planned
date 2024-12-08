import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

//Services
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class InstalacionService {
  private apiURL = 'http://localhost:3000/api/instalaciones';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  obtenerInstalaciones(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(this.apiURL, { headers });
  }

  obtenerInstalacionesEmpresa(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/empresa`, { headers });
  }

  obtenerInstalacionPorId(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/${id}`, { headers });
  }

  obtenerTiposInstalacion(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/tipos`, { headers });
  }

  obtenerSubtiposInstalacion(tipoId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/tipos/${tipoId}/subtipos`, { headers });
  }

  obtenerHorariosPorInstalacion(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/${id}/horarios`, { headers });
  }

  crearInstalacion(instalacion: any, horarios: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(this.apiURL, { instalacion, horarios }, { headers });
  }

  actualizarInstalacion(id: number, instalacion: any, horarios: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiURL}/${id}`, { instalacion, horarios }, { headers });
  }

  eliminarInstalacion(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiURL}/${id}`, { headers });
  }
}