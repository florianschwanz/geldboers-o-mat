import Chart, { ChartData, ChartOptions } from 'chart.js/auto';
import {
  Component,
  input,
  OnChanges,
  OnInit,
  SimpleChanges,
} from '@angular/core';
import { Theme } from '../../core/ui/services/theme.service';

/** Represents a dataset */
export interface Dataset {
  axis: string;
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

/**
 * Displays bar chart
 */
@Component({
  selector: 'app-bar-chart',
  imports: [],
  templateUrl: './bar-chart.component.html',
  standalone: true,
  styleUrl: './bar-chart.component.scss',
})
export class BarChartComponent implements OnInit, OnChanges {
  //
  // Signals
  //

  /** Theme */
  theme = input<Theme>(Theme.LIGHT);
  /** Labels */
  labels = input<string[]>([]);
  /** Datasets */
  datasets = input<Dataset[]>([]);

  /** Whether to display the bar chart vertically */
  vertical = input<boolean>(true);

  /** Unit of x-axis */
  xUnit = input<string>('');
  /** Suggested x-axis min value */
  xSuggestedMin = input<number>(0);
  /** Suggested x-axis max value */
  xSuggestedMax = input<number>(1);

  //
  // Chart
  //

  /** Chart data */
  chartData: ChartData | undefined;
  /** Chart options */
  chartOptions: ChartOptions | undefined;

  //
  // Lifecycle hooks
  //

  /**
   * Handles on-init phase
   */
  ngOnInit() {
    this.initializeChart(this.theme(), this.labels(), this.datasets());
  }

  /**
   * Handles on-changes phase
   */
  ngOnChanges(_: SimpleChanges): void {
    this.initializeChart(this.theme(), this.labels(), this.datasets());
  }

  //
  // Initialization
  //

  /**
   * Initializes chart
   * @param theme theme
   * @param labels labels
   * @param datasets datasets
   */
  private initializeChart(theme: Theme, labels: any[], datasets: any[]) {
    let chartId = 'bar-chart';
    let chart = Chart.getChart(chartId);

    // Initialize chart
    if (!chart) {
      chart = new Chart(chartId, {
        type: 'bar',
        data: {
          labels: [],
          datasets: [],
        },
        options: {},
      });
    }

    this.chartData = {
      labels: labels,
      datasets: datasets,
    };

    this.chartOptions = {
      animation: {
        duration: 500,
      },
      indexAxis: this.vertical() ? 'x' : 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: {
          onClick: (_) => {},
          labels: {
            color: theme == Theme.DARK ? '#fefefe' : '#000000',
            sort: (a, b) => {
              // @ts-ignore
              return a.index > b.index ? 1 : -1;
            },
          },
        },
      },
      scales: {
        x: {
          display: true,
          ticks: {
            color: theme == Theme.DARK ? '#fefefe' : '#000000',
            callback: (value, index, values) => {
              return value + this.xUnit();
            },
          },
          suggestedMin: this.xSuggestedMin(),
          suggestedMax: this.xSuggestedMax(),
        },
        y: {
          display: true,
          ticks: {
            color: theme == Theme.DARK ? '#fefefe' : '#000000',
          },
        },
      },
      onClick: (_, elements, chart) => {
        if (elements[0]) {
          const index = elements[0].index;
          // @ts-ignore
          this.onElementClicked(chart.data.labels[index].toString());
        }
      },
    };

    // Update chart data and options
    chart.data = this.chartData;
    chart.options = this.chartOptions;

    try {
      chart.update();
    } catch (_) {}
  }

  //
  // Actions
  //

  onElementClicked(label: string) {
    console.log(label);
  }
}
