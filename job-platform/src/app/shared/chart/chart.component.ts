import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';

@Component({
  selector: 'app-chart',
  templateUrl: './chart.component.html',
  styleUrls: ['./chart.component.scss']
})
export class ChartComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() chartType: ChartType = 'bar';
  @Input() data: any[] = [];
  @Input() labels: string[] = [];
  @Input() showLegend: boolean = true;
  @Input() height: number = 300;

  chartId: string = '';
  chartData: ChartData = { datasets: [], labels: [] };
  chartOptions: ChartConfiguration['options'] = {};
  chartPlugins: any[] = [];

  ngOnInit(): void {
    this.chartId = `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.updateChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] || changes['labels']) {
      this.updateChart();
    }
  }

  private updateChart(): void {
    this.chartData = {
      labels: this.labels,
      datasets: [{
        data: this.data,
        backgroundColor: this.getBackgroundColors(),
        borderColor: this.getBorderColors(),
        borderWidth: 1
      }]
    };

    this.chartOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: this.showLegend,
          position: 'top'
        }
      },
      scales: this.getScales()
    };
  }

  private getBackgroundColors(): string[] {
    const colors = [
      'rgba(54, 162, 235, 0.6)',
      'rgba(255, 99, 132, 0.6)',
      'rgba(255, 205, 86, 0.6)',
      'rgba(75, 192, 192, 0.6)',
      'rgba(153, 102, 255, 0.6)',
      'rgba(255, 159, 64, 0.6)',
      'rgba(199, 199, 199, 0.6)',
      'rgba(83, 102, 255, 0.6)'
    ];
    return colors.slice(0, this.data.length);
  }

  private getBorderColors(): string[] {
    const colors = [
      'rgba(54, 162, 235, 1)',
      'rgba(255, 99, 132, 1)',
      'rgba(255, 205, 86, 1)',
      'rgba(75, 192, 192, 1)',
      'rgba(153, 102, 255, 1)',
      'rgba(255, 159, 64, 1)',
      'rgba(199, 199, 199, 1)',
      'rgba(83, 102, 255, 1)'
    ];
    return colors.slice(0, this.data.length);
  }

  private getScales(): any {
    if (this.chartType === 'pie' || this.chartType === 'doughnut') {
      return {};
    }

    return {
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        }
      }
    };
  }
}
