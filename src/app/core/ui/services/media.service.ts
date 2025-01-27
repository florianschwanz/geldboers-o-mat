import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from '@angular/cdk/layout';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Enum containing media sizes
 */
export enum Media {
  UNDEFINED,
  SMALL,
  MEDIUM,
  LARGE,
}

/**
 * Handles screen size and breakpoints
 */
@Injectable({
  providedIn: 'root',
})
export class MediaService {
  //
  // Injections
  //

  /** Breakpoint observer */
  public breakpointObserver = inject(BreakpointObserver);

  //
  // Subjects
  //

  /** Subject publishing medium */
  public mediaSubject = new BehaviorSubject<Media>(Media.UNDEFINED);

  /**
   * Constructor
   */
  constructor() {
    this.initializeSize();
    this.initializeBreakpointObservers();
  }

  /**
   * Initializes size
   */
  private initializeSize() {
    const innerWidth = window.innerWidth;

    if (innerWidth < 960) {
      this.notify(Media.SMALL);
    } else if (innerWidth >= 960 && innerWidth < 1280) {
      this.notify(Media.MEDIUM);
    } else if (innerWidth > 1280) {
      this.notify(Media.LARGE);
    }
  }

  /**
   * Initializes breakpoints
   */
  private initializeBreakpointObservers() {
    this.breakpointObserver
      .observe([Breakpoints.Small, Breakpoints.HandsetPortrait])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.notify(Media.SMALL);
        }
      });
    this.breakpointObserver
      .observe([Breakpoints.Medium])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.notify(Media.MEDIUM);
        }
      });
    this.breakpointObserver
      .observe([Breakpoints.Large])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.notify(Media.LARGE);
        }
      });
  }

  //
  // Notification
  //

  /**
   * Informs subscribers that something has changed
   */
  private notify(media: Media) {
    this.mediaSubject.next(media);
  }
}
