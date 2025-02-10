import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Theme, ThemeService } from './core/ui/services/theme.service';
import { Meta } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { getBrowserLang, TranslocoModule } from '@jsverse/transloco';

/**
 * Displays app component
 */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AsyncPipe, RouterLink, TranslocoModule],
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
  /** Overlay container */
  private overlayContainer = inject(OverlayContainer);
  /** Change detector */
  private changeDetector = inject(ChangeDetectorRef);
  /** Meta service */
  private meta = inject(Meta);

  /** Language */
  lang = getBrowserLang();

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
}
