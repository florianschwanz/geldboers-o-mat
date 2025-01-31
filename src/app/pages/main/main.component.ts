import { Component, inject, OnInit } from '@angular/core';
import { Theme, ThemeService } from '../../core/ui/services/theme.service';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, combineLatestWith, first } from 'rxjs';
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
import { MatButton } from '@angular/material/button';
import { environment } from '../../../environments/environment';

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
  /** Name */
  name: string;
  /** Image path */
  image: string;
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
    MatButton,
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
  data: Party[] = [
    {
      name: 'CDU',
      image: 'assets/images/party-cdu.png',
      color: 'rgb(0, 0, 0)',
      changesIncomeGroups: [0.1, 0.1, 0.3, 0.6, 1.1, 1.8, 2.4, 3.2, 4.4, 5.1],
    },
    {
      name: 'SPD',
      image: 'assets/images/party-spd.png',
      color: 'rgb(227, 0, 15)',
      changesIncomeGroups: [1.9, 2.4, 3.1, 2.8, 2.5, 2.6, 2.3, 1.7, 1.0, -3.4],
    },
    {
      name: 'Bündnis 90/Die Grünen',
      image: 'assets/images/party-gruene.png',
      color: 'rgb(0, 152, 68)',
      changesIncomeGroups: [0.9, 2.8, 3.9, 3.6, 3.1, 2.1, 1.4, 0.7, -0.1, -3.8],
    },
    {
      name: 'FDP',
      image: 'assets/images/party-fdp.png',
      color: 'rgb(255, 204, 0)',
      changesIncomeGroups: [-2.1, -0.2, 1.4, 2.3, 3.7, 5.5, 6.8, 8.2, 9.8, 8.1],
    },
    {
      name: 'Die Linke',
      image: 'assets/images/party-linke.png',
      color: 'rgb(197, 30, 58)',
      changesIncomeGroups: [
        29.7, 12.4, 8.5, 6.4, 6.4, 6.7, 5.5, 2.7, -3.0, -27.0,
      ],
    },
    {
      name: 'AfD',
      image: '',
      color: 'rgb(0, 152, 215)',
      changesIncomeGroups: [0.0, 0.2, 1.1, 1.7, 2.8, 4.9, 6.1, 6.7, 7.7, 7.7],
    },
    {
      name: 'BSW',
      image: 'assets/images/party-bsw.png',
      color: 'rgb(255, 165, 0)',
      changesIncomeGroups: [0.5, 1.4, 3.0, 2.8, 2.9, 3.0, 2.3, 1.3, 0.1, -2.2],
    },
  ];

  //
  // Selections
  //

  selectedIncomeGroupIndexSubject = new BehaviorSubject<number>(-1);
  selectedPartiesSubject = new BehaviorSubject<Map<string, boolean>>(
    new Map<string, boolean>(),
  );

  //
  // Bar Chart
  //

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

  /** App name */
  appName = environment.appName;
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

    this.handleSelections();

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

  /**
   * Handles user selection
   * @private
   */
  private handleSelections() {
    this.selectedIncomeGroupIndexSubject
      .pipe(combineLatestWith(this.selectedPartiesSubject))
      .subscribe(([incomeGroupIndex, parties]) => {
        const dataSorted = this.data
          .slice()
          .filter((party: Party) => this.isPartySelected(parties, party))
          .sort(
            (a: Party, b: Party) =>
              b.changesIncomeGroups[incomeGroupIndex] -
              a.changesIncomeGroups[incomeGroupIndex],
          );

        this.initializeIncomeGroupLabels(dataSorted);
        this.initializeIncomeGroupDatasets(dataSorted, incomeGroupIndex);
        this.initializeIncomeGroupSuggestedMinMax(dataSorted, incomeGroupIndex);
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
  private initializeIncomeGroupLabels(data: Party[]) {
    this.incomeGroupLabels = data.map((party) => party.name);
  }

  /**
   * Initialize suggested min-max for income group
   * @param data data
   * @param selectedIncomeGroupIndex selected income group index
   * @private
   */
  private initializeIncomeGroupSuggestedMinMax(
    data: Party[],
    selectedIncomeGroupIndex: number,
  ) {
    const values = data.map(
      (party) => party.changesIncomeGroups[selectedIncomeGroupIndex],
    );
    const padding = 2.5;

    this.xSuggestedMinMax =
      Math.max(Math.abs(Math.max(...values)), Math.abs(Math.min(...values))) +
      padding;
  }

  /** Initializes datasets for income group
   *
   * @param data data
   * @param selectedIncomeGroupIndex selected income group index
   * @private
   */
  private initializeIncomeGroupDatasets(
    data: Party[],
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
        data: data.map((party) =>
          selectedIncomeGroupIndex != -1
            ? party.changesIncomeGroups[selectedIncomeGroupIndex]
            : 0,
        ),
        backgroundColor: data.map((party) => party.color),
        borderColor: data.map((_) => 'transparent'),
        borderWidth: 1,
      },
    ];
  }

  /**
   * Determines if a given party is selected
   * @param parties parties
   * @param party party
   */
  isPartySelected(parties: Map<string, boolean>, party: Party) {
    return !parties.has(party.name) || parties.get(party.name);
  }

  //
  // Actions
  //

  /**
   * Handles change of income group
   * @param event event
   */
  onIncomeGroupChanged(event: MatSelectChange | MatButtonToggleChange) {
    this.selectedIncomeGroupIndexSubject.next(event.value);
  }

  /**
   * Handles click on party button
   * @param parties parties
   * @param party party
   */
  onPartyToggled(parties: Map<string, boolean>, party: Party) {
    const selectedParties = this.selectedPartiesSubject.value;
    selectedParties.set(party.name, !this.isPartySelected(parties, party));

    this.selectedPartiesSubject.next(selectedParties);
  }
}
