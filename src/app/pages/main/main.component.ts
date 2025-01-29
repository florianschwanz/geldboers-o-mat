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
  /** Texts for annual income  */
  annual: { selectText: string; buttonToggleText: string };
  /** Texts for monthly income  */
  monthly: { selectText: string; buttonToggleText: string };
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

  //
  // Data
  //

  /** Available income groups */
  incomeGroups: IncomeGroup[] = [
    {
      index: 0,
      annual: { selectText: '1 - 10.000', buttonToggleText: '10T' },
      monthly: { selectText: '1 - 833', buttonToggleText: '833' },
    },
    {
      index: 1,
      annual: { selectText: '10.001 - 20.000', buttonToggleText: '20T' },
      monthly: { selectText: '834 - 1.666', buttonToggleText: '1.666' },
    },
    {
      index: 2,
      annual: { selectText: '20.001 - 30.000', buttonToggleText: '30T' },
      monthly: { selectText: '1.667 - 2.500', buttonToggleText: '2.500' },
    },
    {
      index: 3,
      annual: { selectText: '30.001 - 40.000', buttonToggleText: '40T' },
      monthly: { selectText: '2.500 - 3.333', buttonToggleText: '3.333' },
    },
    {
      index: 4,
      annual: { selectText: '40.001 - 55.000', buttonToggleText: '55T' },
      monthly: { selectText: '3.334 - 4.583', buttonToggleText: '4.583' },
    },
    {
      index: 5,
      annual: { selectText: '55.001 - 80.000', buttonToggleText: '80T' },
      monthly: { selectText: '4.584 - 6.666', buttonToggleText: '6.666' },
    },
    {
      index: 6,
      annual: { selectText: '80.001 - 100.000', buttonToggleText: '100T' },
      monthly: { selectText: '6.667 - 8.333', buttonToggleText: '8.333' },
    },
    {
      index: 7,
      annual: { selectText: '100.001 - 150.000', buttonToggleText: '150T' },
      monthly: { selectText: '8.334 - 12.500', buttonToggleText: '12.5T' },
    },
    {
      index: 8,
      annual: { selectText: '150.001 - 250.000', buttonToggleText: '250T' },
      monthly: { selectText: '12.501 - 20.833', buttonToggleText: '20.8T' },
    },
    {
      index: 9,
      annual: { selectText: '250.001 - 2.000.000', buttonToggleText: '2Mio' },
      monthly: { selectText: '20.834 - 166.666', buttonToggleText: '166.6T' },
    },
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

  //
  // Selections
  //

  /** Index of the selected income group */
  selectedIncomeGroupIndex = -1;

  /** Datasets for selected income group */
  incomeGroupDatasets: Dataset[] = [];
  /** Labels for selected income group */
  incomeGroupLabels: string[] = [];
  /** Suggested min-max value on the x-axis */
  xSuggestedMinMax = 30;

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

  /**
   * Initialize suggested min-max for income group
   * @param data data
   * @param selectedIncomeGroupIndex selected income group index
   * @private
   */
  private initializeIncomeGroupSuggestedMinMax(
    data: Map<string, Party>,
    selectedIncomeGroupIndex: number,
  ) {
    const values = Array.from(data.values()).map(
      (party) => party.changesIncomeGroups[selectedIncomeGroupIndex],
    );

    this.xSuggestedMinMax = Math.max(
      Math.abs(Math.max(...values)),
      Math.abs(Math.min(...values)),
    );
  }

  /** Initializes datasets for income group
   *
   * @param data data
   * @param selectedIncomeGroupIndex selected income group index
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
    this.selectedIncomeGroupIndex = event.value;

    const dataSorted = new Map(
      [...this.data.entries()].sort(
        (a: [string, Party], b: [string, Party]) => {
          return (
            b[1].changesIncomeGroups[this.selectedIncomeGroupIndex] -
            a[1].changesIncomeGroups[this.selectedIncomeGroupIndex]
          );
        },
      ),
    );

    this.initializeIncomeGroupDatasets(
      dataSorted,
      this.selectedIncomeGroupIndex,
    );
    this.initializeIncomeGroupLabels(dataSorted);
    this.initializeIncomeGroupSuggestedMinMax(
      dataSorted,
      this.selectedIncomeGroupIndex,
    );
  }
}
