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
import {
  BarChartComponent,
  Dataset,
} from '../../components/bar-chart/bar-chart.component';
import {
  MatButtonToggle,
  MatButtonToggleChange,
  MatButtonToggleGroup,
} from '@angular/material/button-toggle';
import { Media, MediaService } from '../../core/ui/services/media.service';

/**
 * Represents an income group
 */
export type IncomeGroup = {
  /** Index */
  index: number;
  /** Text */
  selectText: string;
  /** Text */
  buttonToggleText: string;
};

/**
 * Represents a political party
 */
export type Party = {
  /** Color */
  color: string;
  /** Relative changes in income based on income groups */
  changesIncomeGroups: number[];
};

/**
 * Displays main component
 */
@Component({
  selector: 'app-main',
  imports: [
    TranslocoModule,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    BarChartComponent,
    MatButtonToggleGroup,
    MatButtonToggle,
  ],
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
  /** Media service */
  private mediaService = inject(MediaService);
  /** Transloco service */
  private translocoService = inject(TranslocoService);

  /** Language */
  lang = getBrowserLang();

  /** Available income groups */
  incomeGroups: IncomeGroup[] = [
    { index: 0, selectText: '1 - 10.000', buttonToggleText: '10T' },
    { index: 1, selectText: '10.001 - 20.000', buttonToggleText: '20T' },
    { index: 2, selectText: '20.001 - 30.000', buttonToggleText: '30T' },
    { index: 3, selectText: '30.001 - 40.000', buttonToggleText: '40T' },
    { index: 4, selectText: '40.001 - 55.000', buttonToggleText: '55T' },
    { index: 5, selectText: '55.001 - 80.000', buttonToggleText: '80T' },
    { index: 6, selectText: '80.001 - 100.000', buttonToggleText: '100T' },
    { index: 7, selectText: '100.001 - 150.000', buttonToggleText: '150T' },
    { index: 8, selectText: '150.001 - 250.000', buttonToggleText: '250T' },
    { index: 9, selectText: '250.001 - 2.000.000', buttonToggleText: '2Mio' },
  ];

  /** Data of parties */
  data = new Map<string, Party>([
    [
      'CDU',
      {
        color: 'rgb(0, 0, 0)',
        changesIncomeGroups: [0.1, 0.1, 0.3, 0.6, 1.1, 1.8, 2.4, 3.2, 4.4, 5.1],
      },
    ],
    [
      'SPD',
      {
        color: 'rgb(227, 0, 15)',
        changesIncomeGroups: [
          1.9, 2.4, 3.1, 2.8, 2.5, 2.6, 2.3, 1.7, 1.0, -3.4,
        ],
      },
    ],
    [
      'Grüne',
      {
        color: 'rgb(0, 152, 68)',
        changesIncomeGroups: [
          0.9, 2.8, 3.9, 3.6, 3.1, 2.1, 1.4, 0.7, -0.1, -3.8,
        ],
      },
    ],
    [
      'FDP',
      {
        color: 'rgb(255, 204, 0)',
        changesIncomeGroups: [
          -2.1, -0.2, 1.4, 2.3, 3.7, 5.5, 6.8, 8.2, 9.8, 8.1,
        ],
      },
    ],
    [
      'LINKE',
      {
        color: 'rgb(197, 30, 58)',
        changesIncomeGroups: [
          29.7, 12.4, 8.5, 6.4, 6.4, 6.7, 5.5, 2.7, -3.0, -27.0,
        ],
      },
    ],
    [
      'AfD',
      {
        color: 'rgb(0, 152, 215)',
        changesIncomeGroups: [0.0, 0.2, 1.1, 1.7, 2.8, 4.9, 6.1, 6.7, 7.7, 7.7],
      },
    ],
    [
      'BSW',
      {
        color: 'rgb(255, 165, 0)',
        changesIncomeGroups: [
          0.5, 1.4, 3.0, 2.8, 2.9, 3.0, 2.3, 1.3, 0.1, -2.2,
        ],
      },
    ],
  ]);

  /** Datasets for selected income group */
  incomeGroupDatasets: Dataset[] = [];
  /** Labels for selected income group */
  incomeGroupLabels: string[] = [];

  //
  // Media
  //

  /** Current medium */
  media: Media = Media.LARGE;
  /** Media enum */
  mediaEnum = Media;

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
    this.handleQueryParameters();
    this.initializeMedia();

    this.initializeIncomeGroupLabels(this.data);
    this.initializeIncomeGroupDatasets(this.data, -1);
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
  // Initialization
  //

  /**
   * Initializes media
   */
  private initializeMedia() {
    this.mediaService.mediaSubject.subscribe((media: Media) => {
      this.media = media;
    });

    this.media = this.mediaService.mediaSubject.value;
  }

  /**
   * Initialize labels for income group
   * @param data data
   * @private
   */
  private initializeIncomeGroupLabels(data: Map<string, Party>) {
    this.incomeGroupLabels = Array.from(data.keys());
  }

  /** Initializes datasets for income group
   *
   * @param data data
   * @param selectedIncomeGroupIndex
   * @private
   */
  private initializeIncomeGroupDatasets(
    data: Map<string, Party>,
    selectedIncomeGroupIndex: number,
  ) {
    this.incomeGroupDatasets = [
      {
        axis: 'y',
        label:
          selectedIncomeGroupIndex != -1
            ? this.translocoService.translate(
                'pages.main.labels.percentage-income-change',
                {},
                this.lang,
              )
            : '',
        data: Array.from(data.values()).map((party) =>
          selectedIncomeGroupIndex != -1
            ? party.changesIncomeGroups[selectedIncomeGroupIndex]
            : 0,
        ),
        backgroundColor: Array.from(data.values()).map((party) => party.color),
        borderColor: Array.from(data.values()).map((_) => 'transparent'),
        borderWidth: 1,
      },
    ];
  }

  //
  // Actions
  //

  /**
   * Handles change of income group
   * @param event event
   */
  onIncomeGroupChanged(event: MatSelectChange | MatButtonToggleChange) {
    const selectedIncomeGroupIndex = event.value;
    const dataSorted = new Map(
      [...this.data.entries()].sort(
        (a: [string, Party], b: [string, Party]) => {
          return (
            b[1].changesIncomeGroups[selectedIncomeGroupIndex] -
            a[1].changesIncomeGroups[selectedIncomeGroupIndex]
          );
        },
      ),
    );

    this.initializeIncomeGroupDatasets(dataSorted, selectedIncomeGroupIndex);
    this.initializeIncomeGroupLabels(dataSorted);
  }
}
