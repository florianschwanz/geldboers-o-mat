import Chart, { ChartData, ChartOptions } from 'chart.js/auto';
import { Component, effect, input } from '@angular/core';
import { Theme } from '../../core/ui/services/theme.service';

/** Represents a dataset */
export interface Dataset {
  /** Axis */
  axis: string;
  /** Label */
  label: string;
  /** Data */
  data: number[];
  /** Data context */
  dataContext: number[];
  /** Data title */
  dataTitle: string;
  /** Data unit */
  dataUnit: string;
  /** Background color */
  backgroundColor: string[];
  /** Border color */
  borderColor: string[];
  /** Border width */
  borderWidth: number;
}

/** Data context */
let dataContext: number[] = [];

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
export class BarChartComponent {
  //
  // Signals
  //

  /** Chart ID */
  id = input<string>(`bar-chart`);
  /** Theme */
  theme = input<Theme>(Theme.LIGHT);
  /** Labels */
  labels = input<string[]>([]);
  /** Datasets */
  datasets = input<Dataset[]>([]);

  /** Whether to display the bar chart horizontally */
  horizontal = input<boolean>(true);
  /** Whether to display a legend */
  displayLegend = input<boolean>(true);
  /** Whether to display tooltips */
  displayTooltip = input<boolean>(true);

  /** Suggested x-axis min value */
  xSuggestedMin = input<number>(0);
  /** Suggested x-axis max value */
  xSuggestedMax = input<number>(1);
  /** Whether to display grid */
  xGrid = input<boolean>(true);
  /** Whether to display ticks */
  xTicks = input<boolean>(true);

  /** Suggested x-axis min value */
  ySuggestedMin = input<number>(0);
  /** Suggested x-axis max value */
  ySuggestedMax = input<number>(1);
  /** Whether to display grid */
  yGrid = input<boolean>(true);
  /** Whether to display ticks */
  yTicks = input<boolean>(true);

  //
  // Chart
  //

  /** Chart data */
  chartData: ChartData | undefined;
  /** Chart options */
  chartOptions: ChartOptions | undefined;

  /**
   * Constructor
   */
  constructor() {
    effect(() => {
      this.initializeChart(
        this.id(),
        this.theme(),
        this.labels(),
        this.datasets(),
      );
    });
  }

  //
  // Initialization
  //

  /**
   * Initializes chart
   * @param chartId chart ID
   * @param theme theme
   * @param labels labels
   * @param datasets datasets
   */
  private initializeChart(
    chartId: string,
    theme: Theme,
    labels: any[],
    datasets: any[],
  ) {
    if (datasets.length > 0) {
      let chart = Chart.getChart(chartId);

      const horizontal = this.horizontal();
      const dataUnit = datasets[0].dataUnit;
      dataContext = datasets[0].dataContext;

      const color = theme == Theme.DARK ? '#fefefe' : '#000000';

      // Initialize chart
      if (!chart) {
        chart = new Chart(chartId, {
          type: 'bar',
          plugins: [
            {
              id: `barLabelPlugin-${chartId}`,
              afterDatasetsDraw(chart) {
                const { ctx, data } = chart;

                ctx.save();
                ctx.font = '12px Arial';
                ctx.textAlign = 'left';
                ctx.fillStyle = color;

                data.datasets.forEach((dataset, datasetIndex) => {
                  chart
                    .getDatasetMeta(datasetIndex)
                    .data.forEach((bar, index) => {
                      const value = dataset.data[index];
                      const context = dataContext[index];

                      if (value != null && value != 0) {
                        const sign = +value > 0 ? '+' : '';
                        const valueWithDelimiters = value
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                        const contextText = context != 0 ? `(${context}%)` : '';

                        if (horizontal) {
                          const text = `${sign}${valueWithDelimiters} ${dataUnit} ${contextText}`;
                          const padding = 16;
                          const x = bar.x - text.toString().length * 2.5;
                          const y =
                            +value > 0 ? bar.y - padding : bar.y + padding;

                          ctx.fillText(text, x, y);
                        } else {
                          const text = `${sign}${valueWithDelimiters} ${dataUnit} ${contextText}`;
                          const padding = 8;
                          const x =
                            +value > 0
                              ? bar.x + padding
                              : bar.x - padding - text.toString().length * 6;
                          const y = bar.y;

                          ctx.fillText(text, x, y);
                        }
                      }
                    });
                });

                ctx.restore();
              },
            },
          ],
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
        indexAxis: this.horizontal() ? 'x' : 'y',
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
            border: {
              color: color,
            },
            title: {
              display: true,
              text: datasets[0].dataTitle,
              color: color,
              font: {
                size: 14,
              },
            },
            grid: {
              display: this.xGrid(),
              color: color,
            },
            ticks: {
              display: this.xTicks(),
              color: color,
            },
            suggestedMin: this.xSuggestedMin(),
            suggestedMax: this.xSuggestedMax(),
          },
          y: {
            display: true,
            border: {
              color: color,
            },
            grid: {
              display: this.yGrid(),
              color: color,
            },
            ticks: {
              display: this.yTicks(),
              color: color,
            },
            suggestedMin: this.ySuggestedMin(),
            suggestedMax: this.ySuggestedMax(),
          },
        },
      };

      // Update chart data and options
      chart.data = this.chartData;
      chart.options = this.chartOptions;

      try {
        chart.update();
      } catch (_) {}
    }
  }
}
