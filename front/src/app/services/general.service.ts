import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GeneralService {
  private apiURL = 'http://localhost:3000/api/general';

  constructor(
    private http: HttpClient
  ) {}

  obtenerDatosAuxiliares(tabla: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiURL}/${tabla}`);
  }
}