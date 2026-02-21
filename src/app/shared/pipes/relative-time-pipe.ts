import { Pipe, PipeTransform } from '@angular/core';

/**
 * Transforms an ISO date string into a human-readable relative time.
 * Usage: {{ content.createdAt | relativeTime }}
 * Results:
 * - Less than 1 min  → "À l'instant"
 * - Less than 1 hour → "Il y a 23 min"
 * - Less than 24h    → "Il y a 3h"
 * - Yesterday         → "Hier à 14h30"
 * - Older             → "20/02/2026" 
 */
@Pipe({
  name: 'relativeTime',
})
export class RelativeTimePipe implements PipeTransform {

  transform(value: string | null | undefined): string {
    if(!value) return '';

    const date = new Date(value);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs/60_000);
    const diffHours = Math.floor(diffMs/3_600_000);
    
    //Less than 1 minute
    if(diffMin < 1) {
      return "À l'instant"
    }

    //Les than 1 hour
    if(diffMin < 60) {
      return `Il y a ${diffMin} min` 
    }

    // Less than 24 hours
    if (diffHours < 24) {
      return `Il y a ${diffHours}h`;
    }

    // Yesterday
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      return `Hier à ${hours}h${minutes}`;
    }

    // Older — format dd/mm/yyyy
    return date.toLocaleDateString('fr-FR');
  }

}
