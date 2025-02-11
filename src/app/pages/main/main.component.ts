import { Component, inject, OnInit } from '@angular/core';
import { Theme, ThemeService } from '../../core/ui/services/theme.service';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterModule,
} from '@angular/router';
import { combineLatestWith, filter, first } from 'rxjs';
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
  // Bar Chart
  //

  /** Title of x-axis */
  xTitle: string = '';
  /** Unit of x-axis */
  xUnit: string = '';
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

  /**
   * Handles initial serice values (in case you come from another page)
   * @private
   */
  private handleServiceValues() {
    this.selectionService.incomeGroupIndexSubject
      .pipe(
        combineLatestWith(
          this.selectionService.timeFormatSubject,
          this.selectionService.partiesSubject,
        ),
        first(),
      )
      .subscribe(() => {
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
          this.selectionService.incomeGroupIndexSubject,
          this.selectionService.partiesSubject,
          this.selectionService.timeFormatSubject,
        ),
      )
      .subscribe(
        ([
          parties,
          selectedIncomeGroupIndex,
          selectedParties,
          selectedTimeFormat,
        ]) => {
          let dataSorted = parties
            .slice()
            .filter((party: Party) =>
              this.isPartySelected(selectedParties, party),
            );

          dataSorted = dataSorted.sort(
            (a: Party, b: Party) =>
              b.changesAbsoluteAnnually[selectedIncomeGroupIndex] -
              a.changesAbsoluteAnnually[selectedIncomeGroupIndex],
          );

          this.initializeTitle(selectedTimeFormat);
          this.initializeIncomeGroupLabels(dataSorted);
          this.initializeIncomeGroupDatasets(
            dataSorted,
            selectedIncomeGroupIndex,
            selectedTimeFormat,
          );
          this.initializeIncomeGroupSuggestedMinMax(
            dataSorted,
            selectedIncomeGroupIndex,
            selectedTimeFormat,
          );
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
        combineLatestWith(this.dataService.partiesSubject),
        filter(([incomeGroups, parties]) => {
          return incomeGroups != null && parties != null;
        }),
        first(),
      )
      .subscribe(([_, parties]) => {
        this.initializeTitle(this.selectionService.timeFormatSubject.value);
        this.initializeIncomeGroupLabels(parties);
        this.initializeIncomeGroupDatasets(
          parties,
          -1,
          this.selectionService.timeFormatSubject.value,
        );
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
   * Initializes axis title and unit
   * @param selectedTimeFormat selected time format
   * @private
   */
  private initializeTitle(selectedTimeFormat: TimeFormat) {
    this.translocoService
      .load(this.translocoService.getActiveLang())
      .subscribe(() => {
        switch (selectedTimeFormat) {
          case TimeFormat.MONTHLY: {
            this.xTitle = this.translocoService.translate(
              'pages.main.labels.absolute-income-change-monthly',
              {},
              this.lang,
            );
            this.xUnit = '€';
            break;
          }
          case TimeFormat.ANNUALLY: {
            this.xTitle = this.translocoService.translate(
              'pages.main.labels.absolute-income-change-annually',
              {},
              this.lang,
            );
            this.xUnit = '€';
            break;
          }
        }
      });
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
   * @param selectedTimeFormat selected time format
   * @private
   */
  private initializeIncomeGroupSuggestedMinMax(
    data: Party[],
    selectedIncomeGroupIndex: number,
    selectedTimeFormat: TimeFormat,
  ) {
    let values: number[] = [];

    switch (selectedTimeFormat) {
      case TimeFormat.MONTHLY: {
        values = data
          .map(
            (party) => party.changesAbsoluteAnnually[selectedIncomeGroupIndex],
          )
          .map((value) => Math.floor(value / 12));
        break;
      }
      case TimeFormat.ANNUALLY: {
        values = data.map(
          (party) => party.changesAbsoluteAnnually[selectedIncomeGroupIndex],
        );
        break;
      }
    }

    let strechFactor = 1;

    switch (this.mediaService.mediaSubject.value) {
      case Media.SMALL: {
        strechFactor = 2.5;
        break;
      }
      case Media.MEDIUM: {
        strechFactor = 1.5;
        break;
      }
      case Media.LARGE: {
        strechFactor = 1.25;
        break;
      }
    }

    this.xSuggestedMinMax =
      Math.max(Math.abs(Math.max(...values)), Math.abs(Math.min(...values))) *
      strechFactor;
  }

  /** Initializes datasets for income group
   *
   * @param parties parties
   * @param selectedIncomeGroupIndex selected income group index
   @param selectedTimeFormat selected results format
   * @private
   */
  private initializeIncomeGroupDatasets(
    parties: Party[],
    selectedIncomeGroupIndex: number,
    selectedTimeFormat: TimeFormat,
  ) {
    let label: string = '';
    let data: number[] = [];
    let dataContext: number[] = [];

    switch (selectedTimeFormat) {
      case TimeFormat.MONTHLY: {
        label =
          selectedIncomeGroupIndex != -1
            ? this.translocoService.translate(
                'pages.main.labels.absolute-income-change-monthly',
                {},
                this.lang,
              )
            : '';
        data = parties
          .map((party) =>
            selectedIncomeGroupIndex != -1
              ? party.changesAbsoluteAnnually[selectedIncomeGroupIndex]
              : 0,
          )
          .map((value) => Math.floor(value / 12));
        break;
      }
      case TimeFormat.ANNUALLY: {
        label =
          selectedIncomeGroupIndex != -1
            ? this.translocoService.translate(
                'pages.main.labels.absolute-income-change-annually',
                {},
                this.lang,
              )
            : '';
        data = parties.map((party) =>
          selectedIncomeGroupIndex != -1
            ? party.changesAbsoluteAnnually[selectedIncomeGroupIndex]
            : 0,
        );
        break;
      }
    }

    dataContext = parties.map((party) =>
      selectedIncomeGroupIndex != -1
        ? party.changesRelative[selectedIncomeGroupIndex]
        : 0,
    );

    this.incomeGroupDatasets = [
      {
        axis: 'y',
        label: label,
        data: data,
        dataContext: dataContext,
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
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        [this.QUERY_PARAM_THEME]: this.themeService.themeSubject.value,
        [this.QUERY_PARAM_INCOME_GROUP]:
          this.selectionService.incomeGroupIndexSubject.value,
        [this.QUERY_PARAM_TIME_FORMAT]:
          this.selectionService.timeFormatSubject.value,
      },
    });
  }
}
