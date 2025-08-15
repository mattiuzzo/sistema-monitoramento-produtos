// src/app/pipes/date-format.pipe.ts

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dateFormat',
  standalone: true // Marca o pipe como standalone
})
export class DateFormatPipe implements PipeTransform {
  transform(dateString: string | undefined): string {
    if (!dateString || dateString.length !== 8) {
      return dateString || '';
    }
    const year = dateString.substring(0, 4);
    const month = dateString.substring(4, 6);
    const day = dateString.substring(6, 8);
    //return `${day}/${month}/${year}`;
    return `${day}/${month}`;
  }
}