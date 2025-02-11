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
  /** Suggested min-max value on the x-axis */
  incomeGroupXSuggestedMinMax = 30;

  //
  // Bar Chart (federal budget)
  //

  /** Datasets for federal budgets */
  federalBudgetDatasets: Dataset[] = [];
  /** Labels for federal budgets */
  federalBudgetLabels: string[] = [];
  /** Suggested min value on the x-axis */
  federalBudgetYSuggestedMin = -100;
  /** Suggested max value on the x-axis */
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

  //
  // Constants
  //

  /** App name */
  appName = environment.appName;
  /** Query parameter theme */
  private QUERY_PARAM_THEME: string = 'theme';
  /** Query parameter income-group */
  private QUERY_PARAM_INCOME_GROUP: string = 'income-group';
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
    this.dataService.loadPartyData();
  }

  /**
   * Handles query parameters
   */
  private handleQueryParameters() {
    if (environment.useQueryParameters) {
      this.route.queryParams.pipe(first()).subscribe((queryParams) => {
        const theme = queryParams[this.QUERY_PARAM_THEME];
        this.themeService.switchTheme(theme ? theme : Theme.LIGHT);

        const incomeGroupIndex = +queryParams[this.QUERY_PARAM_INCOME_GROUP];
        const timeFormat = +queryParams[this.QUERY_PARAM_TIME_FORMAT];

        if (incomeGroupIndex != null && !isNaN(incomeGroupIndex)) {
          this.selectionService.incomeGroupIndexSubject.next(incomeGroupIndex);
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
          this.selectionService.timeFormatSubject,
          this.selectionService.partiesSubject,
        ),
        first(),
      )
      .subscribe(([parties, , , selectedParties]) => {
        this.updateQueryParameters();

        const partiesSelected = parties
          .slice()
          .filter((party: Party) =>
            this.isPartySelected(selectedParties, party),
          );

        const partiesSortedByFederalBudgetChange = partiesSelected.sort(
          (a: Party, b: Party) => b.changeFederalBudget - a.changeFederalBudget,
        );
        this.initializeFederalBudgetData(partiesSortedByFederalBudgetChange);
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
          this.selectionService.incomeGroupIndexSubject,
          this.selectionService.partiesSubject,
          this.selectionService.timeFormatSubject,
          this.translocoService.load(this.translocoService.getActiveLang()),
        ),
        debounceTime(200),
      )
      .subscribe(
        ([
          parties,
          selectedIncomeGroupIndex,
          selectedParties,
          selectedTimeFormat,
          ,
        ]) => {
          const partiesSelected = parties
            .slice()
            .filter((party: Party) =>
              this.isPartySelected(selectedParties, party),
            );

          const partiesSortedByIncomeChanges = partiesSelected.sort(
            (a: Party, b: Party) =>
              b.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex] -
              a.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex],
          );

          this.initializeIncomeGroupData(
            partiesSortedByIncomeChanges,
            selectedIncomeGroupIndex,
            selectedTimeFormat,
          );

          const partiesSortedByFederalBudgetChange = partiesSelected.sort(
            (a: Party, b: Party) =>
              b.changeFederalBudget - a.changeFederalBudget,
          );
          this.initializeFederalBudgetData(partiesSortedByFederalBudgetChange);
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
          this.dataService.partiesSubject,
          this.translocoService.load(this.translocoService.getActiveLang()),
        ),
        filter(([incomeGroups, parties]) => {
          return (
            incomeGroups != null &&
            incomeGroups.length > 0 &&
            parties != null &&
            parties.length > 0
          );
        }),
        first(),
      )
      .subscribe(([_, parties]) => {
        const partiesSelected = parties.slice();

        const partiesSortedByFederalBudgetChange = partiesSelected.sort(
          (a: Party, b: Party) => b.changeFederalBudget - a.changeFederalBudget,
        );

        this.initializeFederalBudgetData(partiesSortedByFederalBudgetChange);
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
   * @param selectedIncomeGroupIndex selected income group index
   * @param selectedTimeFormat selected time format
   * @private
   */
  private initializeIncomeGroupData(
    parties: Party[],
    selectedIncomeGroupIndex: number,
    selectedTimeFormat: TimeFormat,
  ) {
    this.incomeGroupLabels = parties.map((party) => party.name);

    let values: number[] = [];

    switch (selectedTimeFormat) {
      case TimeFormat.MONTHLY: {
        values = parties
          .map(
            (party) =>
              party.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex],
          )
          .map((value) => Math.floor(value / 12));
        break;
      }
      case TimeFormat.ANNUALLY: {
        values = parties.map(
          (party) =>
            party.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex],
        );
        break;
      }
    }

    const stretchFactor = this.getStretchFactor(
      this.mediaService.mediaSubject.value,
    );

    this.incomeGroupXSuggestedMinMax =
      Math.max(Math.abs(Math.max(...values)), Math.abs(Math.min(...values))) *
      stretchFactor;

    let label: string = '';
    let data: number[] = [];
    let dataContext: number[];
    let dataTitle: string;
    let dataUnit: string;

    switch (selectedTimeFormat) {
      case TimeFormat.MONTHLY: {
        label =
          selectedIncomeGroupIndex != -1
            ? this.translocoService.translate(
                'pages.main.labels.income-change-monthly',
                {},
                this.lang,
              )
            : '';
        data = parties
          .map((party) =>
            selectedIncomeGroupIndex != -1
              ? party.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex]
              : 0,
          )
          .map((value) => Math.floor(value / 12));
        break;
      }
      case TimeFormat.ANNUALLY: {
        label =
          selectedIncomeGroupIndex != -1
            ? this.translocoService.translate(
                'pages.main.labels.income-change-annually',
                {},
                this.lang,
              )
            : '';
        data = parties.map((party) =>
          selectedIncomeGroupIndex != -1
            ? party.changesIncomeAbsoluteAnnually[selectedIncomeGroupIndex]
            : 0,
        );
        break;
      }
    }

    dataContext = parties.map((party) =>
      selectedIncomeGroupIndex != -1
        ? party.changesIncomeRelative[selectedIncomeGroupIndex]
        : 0,
    );

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
  }

  /**
   * Initializes federal budget data
   * @param parties parties
   * @private
   */
  private initializeFederalBudgetData(parties: Party[]) {
    this.federalBudgetLabels = parties.map((party) => party.name);

    const values: number[] = parties.map((party) => party.changeFederalBudget);
    const stretchFactor = 1.75;

    this.federalBudgetYSuggestedMin = Math.min(...values) * stretchFactor;
    this.federalBudgetYSuggestedMax = Math.max(...values) * stretchFactor;

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
    this.selectionService.incomeGroupIndexSubject.next(event.value);
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
    if (environment.useQueryParameters) {
      this.router
        .navigate([], {
          relativeTo: this.route,
          queryParams: {
            [this.QUERY_PARAM_THEME]: this.themeService.themeSubject.value,
            [this.QUERY_PARAM_INCOME_GROUP]:
              this.selectionService.incomeGroupIndexSubject.value,
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
        return 2.5;
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
