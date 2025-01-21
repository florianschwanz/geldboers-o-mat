import { Component, inject, OnInit } from '@angular/core';
import { Theme, ThemeService } from '../../core/ui/services/theme.service';
import { ActivatedRoute } from '@angular/router';
import { first } from 'rxjs';
import {
  getBrowserLang,
  TranslocoModule,
  TranslocoService,
} from '@jsverse/transloco';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import {
  MatOption,
  MatSelect,
  MatSelectChange,
} from '@angular/material/select';

/**
 * Represents an income group
 */
export type IncomeGroup = {
  /** Index */
  index: number;
  /** Text */
  text: string;
};

/**
 * Displays main component
 */
@Component({
  selector: 'app-main',
  imports: [TranslocoModule, MatFormField, MatLabel, MatSelect, MatOption],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss',
  standalone: true,
})
export class MainComponent implements OnInit {
  //
  // Injections
  //

  /** Activated route */
  private route = inject(ActivatedRoute);
  /** Theme service */
  private themeService = inject(ThemeService);
  /** Transloco service */
  private translocoService = inject(TranslocoService);

  /** Language */
  lang = getBrowserLang();

  /** Available income groups */
  incomeGroups: IncomeGroup[] = [
    { index: 0, text: '1 - 10.000' },
    { index: 1, text: '10.001 - 20.000' },
    { index: 2, text: '20.001 - 30.000' },
    { index: 3, text: '30.001 - 40.000' },
    { index: 4, text: '40.001 - 55.000' },
    { index: 5, text: '55.001 - 80.000' },
    { index: 6, text: '80.001 - 100.000' },
    { index: 7, text: '100.001 - 150.000' },
    { index: 8, text: '150.001 - 250.000' },
    { index: 9, text: '250.001 - 2.000.000' },
  ];

  //
  // Constants
  //

  /** Query parameter theme */
  private QUERY_PARAM_THEME: string = 'theme';

  //
  // Lifecycle hooks
  //

  /**
   * Handles on-init lifecycle phase
   */
  ngOnInit() {
    // Handle query parameters
    this.handleQueryParameters();
  }

  /**
   * Handles query parameters
   */
  private handleQueryParameters() {
    this.route.queryParams.pipe(first()).subscribe((queryParams) => {
      const theme = queryParams[this.QUERY_PARAM_THEME];
      this.themeService.switchTheme(theme ? theme : Theme.LIGHT);
    });
  }

  //
  // Actions
  //

  /**
   * Handles change of income group
   * @param event event
   */
  onIncomeGroupChanged(event: MatSelectChange) {}
}
