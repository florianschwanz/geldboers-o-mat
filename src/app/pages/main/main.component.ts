import { Component, inject, OnInit } from '@angular/core';
import { Theme, ThemeService } from '../../core/ui/services/theme.service';
import { ActivatedRoute, RouterLink, RouterModule } from '@angular/router';
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
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelDescription,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import { AsyncPipe } from '@angular/common';

/**
 * Represents a time format
 */
export enum TimeFormat {
  MONTHLY,
  ANNUALLY,
}

/**
 * Represents an income group
 */
export type IncomeGroup = {
  /** Index */
  index: number;
  /** Texts for annual income  */
  annually: { selectText: string; buttonToggleText: string };
  /** Texts for monthly income  */
  monthly: { selectText: string; buttonToggleText: string };
};

/**
 * Bullet point
 */
export type BulletPoint = {
  /** Text */
  text: string;
  /** Sub-texts */
  subTexts?: BulletPoint[];
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
  changesRelative: number[];
  /** Absolute changes in income based on income groups */
  changesAbsoluteAnnually: number[];
  /** Reform proposals */
  reformProposals: BulletPoint[];
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
      annually: { selectText: '1 - 10.000', buttonToggleText: '10T' },
      monthly: { selectText: '1 - 833', buttonToggleText: '833' },
    },
    {
      index: 1,
      annually: { selectText: '10.001 - 20.000', buttonToggleText: '20T' },
      monthly: { selectText: '834 - 1.666', buttonToggleText: '1.666' },
    },
    {
      index: 2,
      annually: { selectText: '20.001 - 30.000', buttonToggleText: '30T' },
      monthly: { selectText: '1.667 - 2.500', buttonToggleText: '2.500' },
    },
    {
      index: 3,
      annually: { selectText: '30.001 - 40.000', buttonToggleText: '40T' },
      monthly: { selectText: '2.500 - 3.333', buttonToggleText: '3.333' },
    },
    {
      index: 4,
      annually: { selectText: '40.001 - 55.000', buttonToggleText: '55T' },
      monthly: { selectText: '3.334 - 4.583', buttonToggleText: '4.583' },
    },
    {
      index: 5,
      annually: { selectText: '55.001 - 80.000', buttonToggleText: '80T' },
      monthly: { selectText: '4.584 - 6.666', buttonToggleText: '6.666' },
    },
    {
      index: 6,
      annually: { selectText: '80.001 - 100.000', buttonToggleText: '100T' },
      monthly: { selectText: '6.667 - 8.333', buttonToggleText: '8.333' },
    },
    {
      index: 7,
      annually: { selectText: '100.001 - 150.000', buttonToggleText: '150T' },
      monthly: { selectText: '8.334 - 12.500', buttonToggleText: '12.5T' },
    },
    {
      index: 8,
      annually: { selectText: '150.001 - 250.000', buttonToggleText: '250T' },
      monthly: { selectText: '12.501 - 20.833', buttonToggleText: '20.8T' },
    },
    {
      index: 9,
      annually: { selectText: '250.001 - 2.000.000', buttonToggleText: '2Mio' },
      monthly: { selectText: '20.834 - 166.666', buttonToggleText: '166.6T' },
    },
  ];

  /** Data of parties */
  parties: Party[] = [
    {
      name: 'CDU',
      image: 'assets/images/party-cdu.png',
      color: 'rgb(0, 0, 0)',
      changesRelative: [0.1, 0.1, 0.3, 0.6, 1.1, 1.8, 2.4, 3.2, 4.4, 5.1],
      changesAbsoluteAnnually: [
        11, 13, 63, 176, 414, 907, 1528, 2587, 5203, 13248,
      ],
      reformProposals: [
        {
          text: '"Einkommen entlasten. Dazu flachen wir den Einkommensteuertarif schrittweise spürbar ab und erhöhen den Grundfreibetrag. Die Einkommensgrenze für den Spitzensteuersatz erhöhen wir deutlich" (Wahlprogramm, S. 12), umgesetzt als',
          subTexts: [
            { text: 'Anstieg Grundfreibetrag um 100 Euro,' },
            {
              text: 'Einstiegssteuersatz in der 2. Progressionszone 21 % statt 23,97%,',
            },
            {
              text: 'Beginn Spitzensteuersatz bei 80.000 Euro zu versteuerndem Einkommen.',
            },
            {
              text: 'Entlastungsbetrag für Alleinerziehende steigt auf 4.500 Euro.',
            },
          ],
        },
        {
          text: '"Steigende Preise dürfen nicht zu höherer Einkommensteuerlast führen. Deshalb passen wir den Einkommensteuertarif regelmäßig an die Inflation an und gleichen so die kalte Progression aus. Dabei berücksichtigen wir auch alle inflationssensiblen Abzugsbeträge" (Wahlprogramm, S. 12), umgesetzt [...] als Erhöhung Eckwert Reichensteuer um 6,3 %',
        },
        { text: 'Abschaffung Solidaritätszuschlag' },
        {
          text: '"Familien finanziell entlasten. Unser Ziel ist, den Kinderfreibetrag in Richtung des Grundfreibetrags der Eltern zu entwickeln. Entsprechend heben wir auch das Kindergeld an, das künftig nach der Geburt automatisch ausgezahlt werden soll" (Wahlprogramm, S. 61), umgesetzt als Anstieg des Kinderfreibetrags auf 11.000 Euro.',
        },
      ],
    },
    {
      name: 'SPD',
      image: 'assets/images/party-spd.png',
      color: 'rgb(227, 0, 15)',
      changesRelative: [1.9, 2.4, 3.1, 2.8, 2.5, 2.6, 2.3, 1.7, 1.0, -3.4],
      changesAbsoluteAnnually: [
        268, 373, 682, 795, 926, 1281, 1438, 1360, 1179, -8892,
      ],
      reformProposals: [
        {
          text: '"Wir wollen die große Mehrheit der Einkommensteuerpflichtigen entlasten (etwa 95 Prozent) und dafür unter anderem Spitzeneinkommen und -vermögen stärker an der Finanzierung des Gemeinwohls und der Modernisierung unseres Landes beteiligen" (Wahlprogramm, S. 20), umgesetzt als}',
          subTexts: [
            {
              text: 'Anstieg des Grundfreibetrags und des Eckwerts der zweiten Progressionszone um je 1.446 Euro (auf 13.230 Euro bzw. 18.451 Euro zu versteuerndes Einkommen),',
            },
            {
              text: 'Spitzensteuersatz von 45 % ab 77.021 Euro zu versteuerndem Einkommen (statt 42 % ab 66.760 Euro) und',
            },
            {
              text: 'Reichensteuersatz von 47 % ab 210.000 Euro zu versteuerndem Einkommen (statt 45 % ab 277.825 Euro).',
            },
          ],
        },
        {
          text: 'Erhöhung des Freibetrags beim Solidaritätszuschlag von 18.130 Euro auf 21.189 Euro.',
        },
        { text: 'Abschaffung der Abgeltungsteuer' },
        {
          text: '"Die ausgesetzte Vermögensteuer wollen wir für sehr hohe Vermögen revitalisieren" (Parteiprogramm, S. 16), umgesetzt als 2% Vermögensteuer auf Vermögen über 100 Mio. Euro.',
        },
        { text: 'Anhebung des Mindestlohns auf 15 Euro in 2026.' },
        {
          text: 'Klimageld. Es gibt in der SPD Überlegungen für eine soziale gestaffelte Auszahlung, z. B. nach Einkommen. Zur Ausgestaltung der sozialen Staffelung liegen uns aber keine Informationen vor. Wir simulieren daher ein pauschales Klimageld von 136 Euro pro Person.',
        },
      ],
    },
    {
      name: 'Die Grünen',
      image: 'assets/images/party-gruene.png',
      color: 'rgb(0, 152, 68)',
      changesRelative: [0.9, 2.8, 3.9, 3.6, 3.1, 2.1, 1.4, 0.7, -0.1, -3.8],
      changesAbsoluteAnnually: [
        119, 437, 846, 1033, 1140, 1055, 867, 585, -122, -9833,
      ],
      reformProposals: [
        {
          text: '"Den Grundfreibetrag erhöhen wir. Den Solidaritätszuschlag werden wir in den Einkommensteuertarif integrieren" (Wahlprogramm, S. 32).',
          subTexts: [
            { text: 'Abschaffung des Solidaritätszuschlags, im Gegenzug' },
            {
              text: 'Anhebung der Spitzensteuersatzes auf 46,5 % (ab 73.500 Euro)',
            },
            { text: 'und des Reichensteuersatzes auf 50 % (ab 250.000 Euro).' },
            {
              text: 'Zwischen Spitzensteuer und Reichensteuer gilt ab 100.000 Euro ein Steuersatz von 48 %.',
            },
            { text: 'Der Grundfreibetrag steigt auf 12.500 Euro.' },
          ],
        },
        { text: 'Werbungskostenpauschale steigt auf 1.500 Euro.' },
        { text: 'Abschaffung der Abgeltungsteuer' },
        {
          text: '"Um insbesondere niedrige Einkommen zielgenau und unbürokratisch zu entlasten, führen wir Steuergutschriften ein. Das ist ein Baustein, um die Arbeitsanreize im Bürgergeldsystem zu erhöhen" (Wahlprogramm, S. 34), umgesetzt als Steuergutschrift, sobald das zu versteuernde Einkommen den Grundfreibetrag übersteigt. Die maximale Steuergutschrift entspricht dem sächlichen Existenzminimum. Sie wird mit einer Rate von 65 % des zu versteuernden Einkommens abgeschmolzen. Die Einkommensteuer wird vom bei der Steuergutschrift anzurechnenden Einkommen abgezogen. Beim Hinzuverdienst im Bürgergeld nehmen wir an, dass die Freibetragsrate von 30 % bis 2.000 Euro ausgedehnt wird und darüber hinaus eine Rate von 35 % gilt.a',
        },
        {
          text: '"Aktiver Einsatz für die Einführung der globalen Milliardärssteuer" (Wahlprogramm, S. 34), Aufkommensschätzung von 6 Mrd. Euro pro Jahr (Bild am Sonntag, 15.12.24).',
        },
        { text: 'Anhebung des Mindestlohns auf 15 Euro in 2026.' },
        {
          text: '"Klimageld. Alle Menschen mit niedrigen und mittleren Einkommen bekommen zum Ausgleich einen Großteil der Einnahmen der CO2-Bepreisung von Gebäudewärme und Transport als Klimageld zurück" (Wahlprogramm, S. 21). Genaue Ausgestaltung unbekannt, deswegen pauschales Klimageld von 136 Euro pro Person.',
        },
      ],
    },
    {
      name: 'FDP',
      image: 'assets/images/party-fdp.png',
      color: 'rgb(255, 204, 0)',
      changesRelative: [-2.1, -0.2, 1.4, 2.3, 3.7, 5.5, 6.8, 8.2, 9.8, 8.1],
      changesAbsoluteAnnually: [
        -289, -36, 292, 663, 1379, 2758, 4378, 6734, 11543, 21083,
      ],
      reformProposals: [
        {
          text: 'Grundfreibetrag bei der Einkommensteuer steigt um 1.000 Euro',
        },
        {
          text: 'Spitzensteuersatz greift erst ab 96.600 Euro zu versteuerndem Einkommen',
        },
        {
          text: '"Freibeträge und Eckwerte der Einkommensteuer automatisch an die allgemeine Preisentwicklung anpassen (Tarif auf Rädern)" (Wahlprogramm, S. 13), umgesetzt [...] als Erhöhung Eckwert Reichensteuer um 6,3 %. Daneben Anstieg Grundfreibetrag und Eckwert Spitzensteuersatz',
        },
        {
          text: '"Abschaffung Mittelstandsbauch": nur noch eine Progressionszone',
        },
        { text: 'Abschaffung Solidaritätszuschlag' },
        {
          text: '"Sparer-Freibetrag für Kapitaleinkünfte deutlich erhöhen" (Wahlprogramm, S. 15), umgesetzt als Verdopplung auf 2.000 Euro.',
        },
        {
          text: '"Steuerfinanzierte Sozialleistungen wie das Bürgergeld und das Wohngeld in einer Leistung und an einer staatlichen Stelle zusammenfassen" (Wahlprogramm, S. 19), umgesetzt als Abschaffung des Wohngelds und als Freibetragsrate von 25% ab dem ersten Euro im Bürgergeld',
        },
        {
          text: '"Der Regelsatz liegt im Jahr 2025 weiter über dem Bedarf. Deshalb wollen wir mit der Abschaffung der sogenannten Besitzstandsregelung die Voraussetzung dafür schaffen, den Regelsatz abzusenken" (Wahlprogramm, S. 19), in der Simulation den Regelsatz im Jahr 2024 auf das im 14. Existenzminimum ausgewiesene Bedarfsniveau gesenkt.',
        },
        {
          text: '"Klimadividende einführen, um Einnahmen aus dem Emissionshandel direkt und pauschal pro Kopf an die Bürgerinnen und Bürger zurückzuzahlen" (Wahlprogramm, S.39), umgesetzt als jährliche Zahlung von 136 Euro pro Person.',
        },
      ],
    },
    {
      name: 'Die Linke',
      image: 'assets/images/party-linke.png',
      color: 'rgb(197, 30, 58)',
      changesRelative: [29.7, 12.4, 8.5, 6.4, 6.4, 6.7, 5.5, 2.7, -3.0, -27.0],
      changesAbsoluteAnnually: [
        4125, 1936, 1846, 1840, 2378, 3316, 3500, 2189, -3547, -70679,
      ],
      reformProposals: [
        {
          text: '"Alle zu versteuernden Einkommen unter 16.800 Euro im Jahr bleiben steuerfrei - das entspricht der Höhe unseres Modells des Existenzminimums. Hohe Einkommen wollen wir stärker besteuern.',
        },
        {
          text: 'Ab 70.000 Euro zu versteuerndem Einkommen im Jahr beträgt der Steuersatz 53 Prozent [. . . ]',
        },
        {
          text: 'Für die Reichensteuer fordern wir zwei Stufen:',
          subTexts: [
            { text: '60 Prozent für Einkommen oberhalb von 260.533 Euro und' },
            {
              text: '75 Prozent für Einkommen oberhalb von 1 Million Euro zu versteuerndem Einkommen" (Antrag Wahlprogramm, S. 8).',
            },
          ],
        },
        { text: 'Abschaffung Abgeltungsteuer' },
        {
          text: 'Die Linke fordert die Wiedereinführung der Vermögensteuer. Damit wir nur die Reichsten 2,5 Prozent unserer Gesellschaft belasten, fordern wir',
          subTexts: [
            {
              text: 'einen Freibetrag für Privatvermögen von 1 Million Euro pro Person (abzüglich aller Schulden, wie zum Beispiel Hypotheken auf ein Eigenheim).',
            },
            {
              text: 'Der Freibetrag für Betriebsvermögen liegt bei 5 Millionen Euro.',
            },
            {
              text: 'Unser Steuersatz ist progressiv, steigt also mit höheren Vermögen:',
              subTexts: [
                { text: 'ab 1 Million 1 Prozent,' },
                { text: 'ab 50 Millionen 5 Prozent.' },
                {
                  text: 'Für Vermögen oberhalb der Grenze von 1 Milliarde Euro legen wir einen Sondersteuersatz von 12 Prozent fest - die Milliardärsteuer" (Antrag Wahlprogramm, S. 7).',
                },
              ],
            },
          ],
        },
        {
          text: '"Der Regelsatz im Bürgergeld ist kleingerechnet: Der Paritätische Wohlfahrtsverband zeigt, dass der Regelsatz bei mindestens 813 Euro liegen müsste" (Antrag Wahlprogramm, S. 13).',
        },
        {
          text: '"Wir wollen das Bürgergeld zu einer sanktionsfreien Mindestsicherung umbauen. [. . . ] Eine alleinlebende Person würde demnach gegenwärtig rund 1.400 Euro monatlich bekommen (inkl. Miete und sonstige Wohnkosten; in Regionen mit hohen Mieten entsprechend mehr)" (Antrag Wahlprogramm, S. 13).',
        },
        {
          text: 'Kindergeld für alle Kinder (379 Euro monatlich; entspricht der maximalen monatlichen Entlastungswirkung des Steuerfreibetrags für Kinder und Jugendliche im Jahr 2024)" (Antrag Wahlprogramm, S. 14).',
        },
        {
          text: 'Soziales Klimageld von aktuell 320 Euro jährlich pro Person als Direktzahlung einführen, von dem Haushalte mit kleinem und mittleren Einkommen besonders profitieren" (Antrag Wahlprogramm, S. 4).',
        },
      ],
    },
    {
      name: 'BSW',
      image: 'assets/images/party-bsw.png',
      color: 'rgb(255, 165, 0)',
      changesRelative: [0.5, 1.4, 3.0, 2.8, 2.9, 3.0, 2.3, 1.3, 0.1, -2.2],
      changesAbsoluteAnnually: [
        75, 224, 654, 820, 1083, 1474, 1482, 1033, 107, -5767,
      ],
      reformProposals: [
        {
          text: '"Wir fordern eine deutliche Erhöhung des steuerlichen Grundfreibetrages, der sich an der Armutsgefährdungsschwelle orientieren sollte" (Wahlprogramm, S. 17), liegt bei 16.600€',
        },
        {
          text: '"Wir wollen Einkommen bis zu 7.500 Euro brutto steuerlich entlasten" (Wahlprogramm, S. 16).',
          subTexts: [
            {
              text: 'Der Schwellenwert für die Spitzensteuer liegt in unserem Tarif bei einem zu versteuernden Einkommen von 56.630 Euro.',
            },
            {
              text: 'Der Spitzen- und Reichensteuersatz bleiben, ebenso wie die Eingangssteuersätze in den beiden Progressionszonen, unverändert.',
            },
          ],
        },
        { text: 'Abschaffung Abgeltungsteuer' },
        { text: 'Anhebung des Mindestlohns auf 15 Euro.' },
        {
          text: '"Die Vermögenssteuer wollen wir für Vermögen ab 25 Millionen Euro mit einem Steuersatz von 1 Prozent reaktivieren, der ab 100 Millionen Euro Vermögen auf 2 Prozent und ab 1 Mrd. Euro auf 3 Prozent steigt" (Wahlprogramm, S. 17).',
        },
      ],
    },
  ];

  //
  // Selections
  //

  /** Subject providing the selected time format */
  selectedTimeFormatSubject = new BehaviorSubject<TimeFormat>(
    TimeFormat.ANNUALLY,
  );
  /** Subject providing the selected income group index */
  selectedIncomeGroupIndexSubject = new BehaviorSubject<number>(-1);
  /** Subject providing the selected parties */
  selectedPartiesSubject = new BehaviorSubject<Map<string, boolean>>(
    new Map<string, boolean>(),
  );

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

    this.initializeTitle(this.selectedTimeFormatSubject.value);
    this.initializeIncomeGroupLabels(this.parties);
    this.initializeIncomeGroupDatasets(
      this.parties,
      -1,
      this.selectedTimeFormatSubject.value,
    );
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
      .pipe(
        combineLatestWith(
          this.selectedPartiesSubject,
          this.selectedTimeFormatSubject,
        ),
      )
      .subscribe(([incomeGroupIndex, parties, timeFormat]) => {
        let dataSorted = this.parties
          .slice()
          .filter((party: Party) => this.isPartySelected(parties, party));

        dataSorted = dataSorted.sort(
          (a: Party, b: Party) =>
            b.changesAbsoluteAnnually[incomeGroupIndex] -
            a.changesAbsoluteAnnually[incomeGroupIndex],
        );

        this.initializeTitle(timeFormat);
        this.initializeIncomeGroupLabels(dataSorted);
        this.initializeIncomeGroupDatasets(
          dataSorted,
          incomeGroupIndex,
          timeFormat,
        );
        this.initializeIncomeGroupSuggestedMinMax(
          dataSorted,
          incomeGroupIndex,
          timeFormat,
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
   * Handles time format change
   * @param event event
   */
  onTimeFormatChanged(event: MatSelectChange | MatButtonToggleChange) {
    this.selectedTimeFormatSubject.next(event.value);
  }

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
