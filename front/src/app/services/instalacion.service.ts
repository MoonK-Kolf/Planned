import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

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
    return this.http.get<any>(this.apiURL, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerInstalacionesEmpresa(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/empresa`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerInstalacionPorId(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerTiposInstalacion(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/tipos`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerSubtiposInstalacion(tipoId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/tipos/${tipoId}/subtipos`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  obtenerHorariosPorInstalacion(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.apiURL}/${id}/horarios`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  crearInstalacion(instalacion: any, horarios: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(this.apiURL, { instalacion, horarios }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  actualizarInstalacion(id: number, instalacion: any, horarios: any[]): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${this.apiURL}/${id}`, { instalacion, horarios }, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  eliminarInstalacion(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${this.apiURL}/${id}`, { headers }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any) {
    console.error('Error en la solicitud:', error);
    return throwError(error);
  }
}