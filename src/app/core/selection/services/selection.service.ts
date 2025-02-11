import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

// @ts-ignore
/**
 * Represents a time format
 */
export enum TimeFormat {
  MONTHLY,
  ANNUALLY,
}

/**
 * Handles user selections
 */
@Injectable({
  providedIn: 'root',
})
export class SelectionService {
  /** Subject providing the selected income group index */
  incomeGroupIndexSubject = new BehaviorSubject<number>(-1);
  /** Subject providing the selected time format */
  timeFormatSubject = new BehaviorSubject<TimeFormat>(TimeFormat.MONTHLY);
  /** Subject providing the selected parties */
  partiesSubject = new BehaviorSubject<Map<string, boolean>>(
    new Map<string, boolean>(),
  );
}
