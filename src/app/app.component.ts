import { Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe, UpperCasePipe } from '@angular/common';
import { Theme, ThemeService } from './core/ui/services/theme.service';
import { Meta } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import {
  getBrowserLang,
  TranslocoModule,
  TranslocoService,
} from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../environments/environment';

/**
 * Displays app component
 */
@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    AsyncPipe,
    RouterLink,
    TranslocoModule,
    MatButtonModule,
    UpperCasePipe,
  ],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  //
  // Injections
  //

  /** Theme service */
  public themeService = inject(ThemeService);
  /** Transloco service */
  private translocoService = inject(TranslocoService);
  /** Overlay container */
  private overlayContainer = inject(OverlayContainer);
  /** Meta service */
  private meta = inject(Meta);

  /** App name */
  appName = environment.appName;
  /** Language */
  lang = getBrowserLang();

  /** Environment */
  env = environment;

  //
  // Lifecycle hooks
  //

  /**
   * Handles on-init phase
   */
  ngOnInit() {
    this.initializeTheme();
    this.initializeThemeSubscription();
  }

  //
  // Initialization
  //

  /**
   * Initializes theme
   */
  private initializeTheme() {
    this.overlayContainer
      .getContainerElement()
      .classList.add(this.themeService.themeSubject.value);
  }

  /**
   * Initializes theme subscription
   */
  private initializeThemeSubscription() {
    this.themeService.themeSubject.subscribe((theme) => {
      // Theme menus and dialogs
      const overlayContainerClasses =
        this.overlayContainer.getContainerElement().classList;
      const themeClassesToRemove = Array.from(overlayContainerClasses).filter(
        (item: string) => item.includes('theme'),
      );
      if (themeClassesToRemove.length) {
        overlayContainerClasses.remove(...themeClassesToRemove);
      }
      overlayContainerClasses.add(theme);

      switch (theme) {
        case Theme.LIGHT: {
          this.meta.updateTag({ content: '#FFFFFF' }, 'name=theme-color');
          break;
        }
        case Theme.DARK: {
          this.meta.updateTag({ content: '#212121' }, 'name=theme-color');
          break;
        }
      }
    });
  }

  //
  // Actions
  //

  /**
   * Handles click on share button
   */
  onShareClicked() {
    if (navigator.share) {
      this.translocoService
        .load(this.translocoService.getActiveLang())
        .subscribe(() => {
          navigator
            .share({
              title: this.appName,
              text: this.translocoService.translate(
                'pages.main.terms.share',
                {},
                this.lang,
              ),
              url: 'https://geldbörs-o-mat.de',
            })
            .then(() => {});
        });
    }
  }

  //
  // Helpers
  //

  /**
   * Determines if Web share API is available
   */
  canShare() {
    return 'canShare' in navigator && navigator.canShare();
  }
}
