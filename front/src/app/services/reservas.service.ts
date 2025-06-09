import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Models
import { Reserva } from '../models/reserva.model';
import { InstalacionHorario } from '../models/instalacion-horario.model'; // Importar InstalacionHorario

// Services
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ReservasService {
  private reservasURL = 'http://localhost:3000/api/reservas';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders().set('Authorization', `Bearer ${token}`);
  }

  // Obtener horarios disponibles para una instalación en una fecha específica
  getHorariosDisponibles(instalacionId: number, fecha: string): Observable<any> {
    const headers = this.getHeaders();
    const params = new HttpParams().set('fecha', fecha);
    return this.http.get<{ success: boolean, horariosDisponibles: InstalacionHorario[] }>(
      `${this.reservasURL}/instalacion/${instalacionId}/disponibles`,
      { headers, params }
    );
  }

  // Crear una nueva reserva
  crearReserva(reserva: Reserva): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${this.reservasURL}`, reserva, { headers });
  }

  // Obtener reservas del usuario
  getReservasUsuario(): Observable<{ success: boolean, reservas: Reserva[] }> {
    const headers = this.getHeaders();
    return this.http.get<{ success: boolean, reservas: Reserva[] }>(`${this.reservasURL}/usuario`, { headers });
  }

  // Obtener una reserva por ID (para la ficha de reserva)
  getReservaPorId(id: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get<any>(`${this.reservasURL}/${id}`, { headers });
  }

  // Eliminar una reserva
  eliminarReserva(reservaId: number): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${this.reservasURL}/${reservaId}`, { headers });
  }
}