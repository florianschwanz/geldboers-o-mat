import { Component, inject, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { combineLatestWith, debounceTime, filter, first } from 'rxjs';
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
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { AsyncPipe } from '@angular/common';
import {
  ExampleHousehold,
  SelectionService,
  TimeFormat,
} from '../../core/selection/services/selection.service';
import { DataService, Party } from '../../core/data/services/data.service';
import { Theme, ThemeService } from '../../core/ui/services/theme.service';

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
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    AsyncPipe,
    RouterModule,
    RouterLink,
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
  /** Router */
  private router = inject(Router);
  /** Theme service */
  private themeService = inject(ThemeService);
  /** Media service */
  private mediaService = inject(MediaService);
  /** Transloco service */
  private translocoService = inject(TranslocoService);

  /** Data service */
  protected dataService = inject(DataService);
  /** Selection service */
  protected selectionService = inject(SelectionService);

  /** Language */
  lang = getBrowserLang();

  //
  // Bar Chart (income group)
  //

  /** Datasets for selected income group */
  incomeGroupDatasets: Dataset[] = [];
  /** Labels for selected income group */
  incomeGroupLabels: string[] = [];
  /** Suggested min value on the x-axis */
  incomeGroupXSuggestedMin = -30;
  /** Suggested max value on the x-axis */
  incomeGroupXSuggestedMax = 30;

  //
  // Bar Chart (federal budget)
  //

  /** Datasets for federal budgets */
  federalBudgetDatasets: Dataset[] = [];
  /** Labels for federal budgets */
  federalBudgetLabels: string[] = [];
  /** Suggested min value on the y-axis */
  federalBudgetYSuggestedMin = -100;
  /** Suggested max value on the y-axis */
  federalBudgetYSuggestedMax = 100;

  //
  // Media
  //

  /** Current medium */
  media: Media = Media.LARGE;
  /** Media enum */
  mediaEnum = Media;

  /** Time enum */
  timeEnum = TimeFormat;
  /** Example household enum */
  exampleHouseholdEnum = ExampleHousehold;

  /** Environment */
  env = environment;

  //
  // Constants
  //

  /** Query parameter theme */
  private QUERY_PARAM_THEME: string = 'theme';
  /** Query parameter example-household */
  private QUERY_PARAM_EXAMPLE_HOUSEHOLD: string = 'example-household';
  /** Query parameter income-group */
  private QUERY_PARAM_INCOME_GROUP: string = 'income-group';
  /** Query parameter income-group-example-household */
  private QUERY_PARAM_INCOME_GROUP_EXAMPLE_HOUSEHOLD: string =
    'income-group-example-household';
  /** Query parameter time-format */
  private QUERY_PARAM_TIME_FORMAT: string = 'time-format';

  //
  // Lifecycle hooks
  //

  /**
   * Handles on-init lifecycle phase
   */
  ngOnInit() {
    this.handleQueryParameters();
    this.handleServiceValues();

    this.initializeMedia();

    this.handleSelections();
    this.handleData();

    this.dataService.loadIncomeGroupData();
    this.dataService.loadIncomeGroupExampleHouseholdsData();
    this.dataService.loadPartyData();
  }

  /**
   * Handles query parameters
   */
  private handleQueryParameters() {
    if (environment.feature.queryParameters) {
      this.route.queryParams.pipe(first()).subscribe((queryParams) => {
        const theme = queryParams[this.QUERY_PARAM_THEME];
        this.themeService.switchTheme(theme ? theme : Theme.LIGHT);

        const exampleHousehold =
          +queryParams[this.QUERY_PARAM_EXAMPLE_HOUSEHOLD];
        const incomeGroupIndex = +queryParams[this.QUERY_PARAM_INCOME_GROUP];
        const incomeGroupExampleHouseholdIndex =
          +queryParams[this.QUERY_PARAM_INCOME_GROUP_EXAMPLE_HOUSEHOLD];
        const timeFormat = +queryParams[this.QUERY_PARAM_TIME_FORMAT];

        if (exampleHousehold != null && !isNaN(exampleHousehold)) {
          this.selectionService.exampleHouseholdSubject.next(exampleHousehold);
        }
        if (incomeGroupIndex != null && !isNaN(incomeGroupIndex)) {
          this.selectionService.incomeGroupIndexSubject.next(incomeGroupIndex);
        }
        if (
          incomeGroupExampleHouseholdIndex != null &&
          !isNaN(incomeGroupExampleHouseholdIndex)
        ) {
          this.selectionService.incomeGroupExampleHouseholdIndexSubject.next(
            incomeGroupExampleHouseholdIndex,
          );
        }
        if (timeFormat != null && !isNaN(timeFormat)) {
          this.selectionService.timeFormatSubject.next(timeFormat);
        }
      });
    }
  }

  /**
   * Handles initial service values (in case you come from another page)
   * @private
   */
  private handleServiceValues() {
    this.dataService.partiesSubject
      .pipe(
        combineLatestWith(
          this.selectionService.incomeGroupIndexSubject,
          this.selectionService.incomeGroupExampleHouseholdIndexSubject,
          this.selectionService.timeFormatSubject,
          this.selectionService.partiesSubject,
        ),
        first(),
      )
      .subscribe(([parties, , , , selectedParties]) => {
        this.initializeFederalBudgetData(parties, selectedParties);
        this.updateQueryParameters();
      });
  }

  /**
   * Handles user selection
   * @private
   */
  private handleSelections() {
    this.dataService.partiesSubject
      .pipe(
        filter((parties) => {
          return parties != null;
        }),
        combineLatestWith(
          this.selectionService.exampleHouseholdSubject,
          this.selectionService.incomeGroupIndexSubject,
          this.selectionService.incomeGroupExampleHouseholdIndexSubject,
          this.selectionService.timeFormatSubject,
          this.selectionService.partiesSubject,
          this.translocoService.load(this.translocoService.getActiveLang()),
        ),
        debounceTime(200),
      )
      .subscribe(
        ([
          parties,
          selectedExampleHousehold,
          selectedIncomeGroupIndex,
          selectedIncomeGroupExampleHouseholdIndex,
          selectedTimeFormat,
          selectedParties,
          ,
        ]) => {
          this.initializeIncomeGroupData(
            parties,
            selectedExampleHousehold,
            selectedIncomeGroupIndex,
            selectedIncomeGroupExampleHouseholdIndex,
            selectedTimeFormat,
            selectedParties,
          );
          this.initializeFederalBudgetData(parties, selectedParties);
        },
      );
  }

  /**
   * Handles data loading
   * @private
   */
  private handleData() {
    this.dataService.incomeGroupsSubject
      .pipe(
        combineLatestWith(
          this.dataService.incomeGroupsExampleHouseholdSubject,
          this.dataService.partiesSubject,
          this.translocoService.load(this.translocoService.getActiveLang()),
        ),
        filter(([incomeGroups, incomeGroupsExampleHousehold, parties]) => {
          return (
            incomeGroups != null &&
            incomeGroups.length > 0 &&
            incomeGroupsExampleHousehold != null &&
            incomeGroupsExampleHousehold.length > 0 &&
            parties != null &&
            parties.length > 0
          );
        }),
        first(),
      )
      .subscribe(([, , parties]) => {
        this.initializeFederalBudgetData(parties, new Map<string, boolean>());
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
   * Initializes income group data
   * @param parties parties
   * @param selectedExampleHousehold selected example household
   * @param selectedIncomeGroupIndex selected income group index
   * @param selectedIncomeGroupExampleHouseholdIndex selected income group index for example households
   * @param selectedTimeFormat selected time format
   * @param selectedParties selected parties
   * @private
   */
  private initializeIncomeGroupData(
    parties: Party[],
    selectedExampleHousehold: ExampleHousehold,
    selectedIncomeGroupIndex: number,
    selectedIncomeGroupExampleHouseholdIndex: number,
    selectedTimeFormat: TimeFormat,
    selectedParties: Map<string, boolean>,
  ) {
    parties = parties
      .slice()
      .filter((party: Party) => this.isPartySelected(selectedParties, party));

    let label: string = '';
    let data: number[] = [];
    let dataContext: number[];
    let dataTitle: string;
    let dataUnit: string;

    switch (selectedTimeFormat) {
      case TimeFormat.MONTHLY: {
        label = this.translocoService.translate(
          'pages.main.labels.income-change-monthly',
          {},
          this.lang,
        );
        break;
      }
      case TimeFormat.ANNUALLY: {
        label = this.translocoService.translate(
          'pages.main.labels.income-change-annually',
          {},
          this.lang,
        );
        break;
      }
    }

    switch (selectedExampleHousehold) {
      case ExampleHousehold.SINGLE: {
        parties = parties.sort(
          (a: Party, b: Party) =>
            b.changesIncomeSingle[selectedIncomeGroupExampleHouseholdIndex] -
            a.changesIncomeSingle[selectedIncomeGroupExampleHouseholdIndex],
        );
        data = parties.map(
          (party) =>
            party.changesIncomeSingle[selectedIncomeGroupExampleHouseholdIndex],
        );
        break;
      }
      case ExampleHousehold.SINGLE_PARENT_WITH_ONE_CHILD: {
        parties = parties.sort(
          (a: Party, b: Party) =>
            b.changesIncomeSingleParentWithOneChild[
              selectedIncomeGroupExampleHouseholdIndex
            ] -
            a.changesIncomeSingleParentWithOneChild[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        data = parties.map(
          (party) =>
            party.changesIncomeSingleParentWithOneChild[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        break;
      }
      case ExampleHousehold.SINGLE_PARENT_WITH_TWO_CHILDREN: {
        parties = parties.sort(
          (a: Party, b: Party) =>
            b.changesIncomeSingleParentWithTwoChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ] -
            a.changesIncomeSingleParentWithTwoChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        data = parties.map(
          (party) =>
            party.changesIncomeSingleParentWithTwoChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        break;
      }
      case ExampleHousehold.SINGLE_EARNER_COUPLE_WITHOUT_CHILDREN: {
        parties = parties.sort(
          (a: Party, b: Party) =>
            b.changesIncomeSingleEarnerCoupleWithoutChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ] -
            a.changesIncomeSingleEarnerCoupleWithoutChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        data = parties.map(
          (party) =>
            party.changesIncomeSingleEarnerCoupleWithoutChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        break;
      }
      case ExampleHousehold.SINGLE_EARNER_COUPLE_WITH_TWO_CHILDREN: {
        parties = parties.sort(
          (a: Party, b: Party) =>
            b.changesIncomeSingleEarnerCoupleWithTwoChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ] -
            a.changesIncomeSingleEarnerCoupleWithTwoChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        data = parties.map(
          (party) =>
            party.changesIncomeSingleEarnerCoupleWithTwoChildren[
              selectedIncomeGroupExampleHouseholdIndex
            ],
        );
        break;
      }
      case ExampleHousehold.OTHER: {
        parties = parties.sort(
          (a: Party, b: Party) =>
            b.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex] -
            a.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex],
        );
        data = parties.map(
          (party) =>
            party.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex],
        );
        break;
      }
    }

    // Divide by 12 if monthly is selected
    if (selectedTimeFormat === TimeFormat.MONTHLY) {
      data = data.map((value) => Math.floor(value / 12));
    }

    // Calculate min-max value
    if (this.media == Media.SMALL) {
      this.incomeGroupXSuggestedMin =
        Math.min(...data) *
        this.getStretchFactor(this.mediaService.mediaSubject.value);
      this.incomeGroupXSuggestedMax =
        Math.max(...data) *
        this.getStretchFactor(this.mediaService.mediaSubject.value);
    } else {
      this.incomeGroupXSuggestedMin =
        -Math.max(Math.abs(Math.max(...data)), Math.abs(Math.min(...data))) *
        this.getStretchFactor(this.mediaService.mediaSubject.value);
      this.incomeGroupXSuggestedMax =
        Math.max(Math.abs(Math.max(...data)), Math.abs(Math.min(...data))) *
        this.getStretchFactor(this.mediaService.mediaSubject.value);
    }

    // Set data context
    dataContext = parties.map((party) =>
      selectedExampleHousehold == ExampleHousehold.OTHER &&
      selectedIncomeGroupIndex != -1
        ? party.changesIncomeRelative[selectedIncomeGroupIndex]
        : 0,
    );

    // Set data title
    switch (selectedTimeFormat) {
      case TimeFormat.MONTHLY: {
        dataTitle = this.translocoService.translate(
          'pages.main.labels.income-change-monthly',
          {},
          this.lang,
        );
        break;
      }
      case TimeFormat.ANNUALLY: {
        dataTitle = this.translocoService.translate(
          'pages.main.labels.income-change-annually',
          {},
          this.lang,
        );
        break;
      }
    }

    dataUnit = this.translocoService.translate(
      'pages.main.terms.euros',
      {},
      this.lang,
    );

    this.incomeGroupDatasets = [
      {
        axis: 'y',
        label: label,
        data: data,
        dataContext: dataContext,
        dataTitle: dataTitle,
        dataUnit: dataUnit,
        backgroundColor: parties.map((party) => party.color),
        borderColor: parties.map((_) => 'transparent'),
        borderWidth: 1,
      },
    ];
    this.incomeGroupLabels = parties.map((party) => party.name);
  }

  /**
   * Initializes federal budget data
   * @param parties parties
   * @param selectedParties selected parties
   * @private
   */
  private initializeFederalBudgetData(
    parties: Party[],
    selectedParties: Map<string, boolean>,
  ) {
    parties = parties
      .slice()
      .filter((party: Party) => this.isPartySelected(selectedParties, party))
      .sort(
        (a: Party, b: Party) => b.changeFederalBudget - a.changeFederalBudget,
      );

    const label = this.translocoService.translate(
      'pages.main.labels.fiscal-impact-on-the-overall-federal-budget',
      {},
      this.lang,
    );
    const data = parties.map((party) => party.changeFederalBudget);
    const dataContext = parties.map(() => 0);
    const dataTitle = this.translocoService.translate(
      'pages.main.labels.fiscal-impact-on-the-overall-federal-budget',
      {},
      this.lang,
    );
    const dataUnit = this.translocoService.translate(
      'pages.main.terms.billion-euros',
      {},
      this.lang,
    );

    this.federalBudgetDatasets = [
      {
        axis: 'y',
        label: label,
        data: data,
        dataContext: dataContext,
        dataTitle: dataTitle,
        dataUnit: dataUnit,
        backgroundColor: parties.map((party) => party.color),
        borderColor: parties.map((_) => 'transparent'),
        borderWidth: 1,
      },
    ];
    this.federalBudgetLabels = parties.map((party) => party.name);
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
   * Handles example household change
   * @param event event
   */
  onExampleHouseholdChanged(event: MatSelectChange | MatButtonToggleChange) {
    this.selectionService.exampleHouseholdSubject.next(event.value);
    this.updateQueryParameters();
  }

  /**
   * Handles change of income group
   * @param event event
   */
  onIncomeGroupChanged(event: MatSelectChange | MatButtonToggleChange) {
    this.selectionService.incomeGroupIndexSubject.next(event.value);
    this.updateQueryParameters();
  }

  /**
   * Handles change of income group
   * @param event event
   */
  onIncomeGroupExampleHouseholdChanged(
    event: MatSelectChange | MatButtonToggleChange,
  ) {
    this.selectionService.incomeGroupExampleHouseholdIndexSubject.next(
      event.value,
    );
    this.updateQueryParameters();
  }

  /**
   * Handles time format change
   * @param event event
   */
  onTimeFormatChanged(event: MatSelectChange | MatButtonToggleChange) {
    this.selectionService.timeFormatSubject.next(event.value);
    this.updateQueryParameters();
  }

  /**
   * Handles click on party button
   * @param parties parties
   * @param party party
   */
  onPartyToggled(parties: Map<string, boolean>, party: Party) {
    const selectedParties = this.selectionService.partiesSubject.value;
    selectedParties.set(party.name, !this.isPartySelected(parties, party));

    this.selectionService.partiesSubject.next(selectedParties);
  }

  //
  // Helpers
  //

  /**
   * Updates query parameters
   */
  private updateQueryParameters() {
    if (environment.feature.queryParameters) {
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: {
            [this.QUERY_PARAM_THEME]: this.themeService.themeSubject.value,
            [this.QUERY_PARAM_EXAMPLE_HOUSEHOLD]:
              this.selectionService.exampleHouseholdSubject.value,
            [this.QUERY_PARAM_INCOME_GROUP]:
              this.selectionService.incomeGroupIndexSubject.value,
            [this.QUERY_PARAM_INCOME_GROUP_EXAMPLE_HOUSEHOLD]:
              this.selectionService.incomeGroupExampleHouseholdIndexSubject
                .value,
            [this.QUERY_PARAM_TIME_FORMAT]:
              this.selectionService.timeFormatSubject.value,
          },
        })
        .then(() => {});
    }
  }

  /**
   * Calculates stretch factor to make sure labels are displayed
   * @param media media
   * @private
   */
  private getStretchFactor(media: Media) {
    switch (media) {
      case Media.SMALL: {
        return 2.0;
      }
      case Media.MEDIUM: {
        return 1.5;
      }
      case Media.LARGE: {
        return 1.25;
      }
      default: {
        return 1.0;
      }
    }
  }
}
