import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'customDateFormat'
})
export class CustomDateFormatPipe implements PipeTransform {

  transform(value: string, ...args: unknown[]): string {
    const datePipe = new DatePipe('en-US');
    const date = new Date(value);

    return datePipe.transform(date, 'MMM d, y, HH:mm:ss')!;
  }
}

