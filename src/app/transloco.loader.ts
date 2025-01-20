import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { PlatformLocation } from '@angular/common';
import {
  Translation,
  TRANSLOCO_LOADER,
  TranslocoLoader,
} from '@jsverse/transloco';

/**
 * Http loader
 */
@Injectable({ providedIn: 'root' })
export class HttpLoader implements TranslocoLoader {
  //
  // Injections
  //

  /** HTTP client */
  private http = inject(HttpClient);
  /** Platform location */
  private platformLocation = inject(PlatformLocation);

  /**
   * Retrieves translation
   * @param langPath language path
   */
  getTranslation(langPath: string) {
    return this.http.get<Translation>(
      `${
        window.location.origin
      }${this.platformLocation.getBaseHrefFromDOM()}assets/i18n/${langPath}.json`,
    );
  }
}

/**
 * Transloco loader
 */
export const translocoLoader = {
  provide: TRANSLOCO_LOADER,
  useClass: HttpLoader,
};
