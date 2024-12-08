import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'diaNombre'
})
export class DiaNombrePipe implements PipeTransform {

  transform(value: number): string {
    const dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
    return dias[value - 1] || 'Día Desconocido';
  }
}
