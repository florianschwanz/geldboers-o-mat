import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Represents an example household
 */
export enum ExampleHousehold {
  OTHER,
  SINGLE,
  SINGLE_PARENT_WITH_ONE_CHILD,
  SINGLE_PARENT_WITH_TWO_CHILDREN,
  SINGLE_EARNER_COUPLE_WITHOUT_CHILDREN,
  SINGLE_EARNER_COUPLE_WITH_TWO_CHILDREN,
}

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
  /** Subject providing the selected example household  */
  exampleHouseholdSubject = new BehaviorSubject<ExampleHousehold>(
    ExampleHousehold.OTHER,
  );
  /** Subject providing the selected income group index */
  incomeGroupIndexSubject = new BehaviorSubject<number>(-1);
  /** Subject providing the selected income group index for example household */
  incomeGroupExampleHouseholdIndexSubject = new BehaviorSubject<number>(-1);
  /** Subject providing the selected time format */
  timeFormatSubject = new BehaviorSubject<TimeFormat>(TimeFormat.MONTHLY);
  /** Subject providing the selected parties */
  partiesSubject = new BehaviorSubject<Map<string, boolean>>(
    new Map<string, boolean>(),
  );
}
