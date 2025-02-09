import { Component } from '@angular/core';
import { getBrowserLang, TranslocoModule } from '@jsverse/transloco';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';

/**
 * Displays imprint page
 */
@Component({
  selector: 'app-imprint',
  imports: [TranslocoModule, RouterLink],
  templateUrl: './imprint.component.html',
  standalone: true,
  styleUrl: './imprint.component.scss',
})
export class ImprintComponent {
  /** Language */
  lang = getBrowserLang();

  //
  // Constants
  //

  /** App name */
  appName = environment.appName;
}
