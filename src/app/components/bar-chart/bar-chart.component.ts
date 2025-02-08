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
  /** Axis */
  axis: string;
  /** Label */
  label: string;
  /** Data */
  data: number[];
  /** Background color */
  backgroundColor: string[];
  /** Border color */
  borderColor: string[];
  /** Border width */
  borderWidth: number;
}

let unit = '';

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
  /** Whether to display a legend */
  displayLegend = input<boolean>(true);
  /** Whether to display tooltips */
  displayTooltip = input<boolean>(true);

  /** Title of x-axis */
  xTitle = input<string>('');
  /** Unit of x-axis */
  xUnit = input<string>('');
  /** Suggested x-axis min value */
  xSuggestedMin = input<number>(0);
  /** Suggested x-axis max value */
  xSuggestedMax = input<number>(1);
  /** Whether to display grid */
  xGrid = input<boolean>(true);
  /** Whether to display grid */
  yGrid = input<boolean>(true);

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

    unit = this.xUnit();

    Chart.register({
      id: 'barLabelPlugin',
      afterDatasetsDraw(chart, args, options) {
        const { ctx, data } = chart;

        ctx.save();
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'black';

        data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.data.forEach((bar, index) => {
            const value = dataset.data[index];
            if (value != null && value != 0) {
              const sign = +value > 0 ? '+' : '';
              const valueWithDelimiters = value
                .toString()
                .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
              const text = `${sign}${valueWithDelimiters} ${unit}`;

              const padding = 8;
              const x =
                +value > 0
                  ? bar.x + padding
                  : bar.x - padding - value.toString().length * 8;
              const y = bar.y;

              ctx.fillText(text, x, y);
            }
          });
        });

        ctx.restore();
      },
    });

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
          display: this.displayLegend(),
        },
        tooltip: {
          enabled: this.displayTooltip(),
        },
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: this.xTitle(),
            font: {
              size: 14,
            },
          },
          grid: {
            display: this.xGrid(),
          },
          ticks: {
            display: false,
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
          grid: {
            display: this.yGrid(),
          },
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

  /**
   * Handles click on an element
   * @param label label
   */
  onElementClicked(label: string) {}
}
