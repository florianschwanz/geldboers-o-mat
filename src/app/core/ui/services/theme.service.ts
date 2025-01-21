import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Enum containing available themes
 */
export enum Theme {
  LIGHT = 'theme-light',
  DARK = 'theme-dark',
}

/**
 * Handles current theme
 */
@Injectable({
  providedIn: 'root',
})
// @ts-ignore
export class ThemeService {
  /** Subject providing theme selected by user */
  // @ts-ignore
  themeSubject = new BehaviorSubject<Theme>(Theme.LIGHT);

  /**
   * Switches theme
   * @param theme new theme
   */
  switchTheme(theme: Theme) {
    this.themeSubject.next(theme);
  }
}
