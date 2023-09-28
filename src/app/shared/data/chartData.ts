import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexFill, ApexLegend, ApexPlotOptions, ApexStroke, ApexTooltip, ApexXAxis, ApexYAxis, ApexResponsive, ApexNonAxisChartSeries, ApexTitleSubtitle, ApexTheme, ApexMarkers, ApexAnnotations, ApexGrid, ApexForecastDataPoints, ApexNoData, ApexStates } from "ng-apexcharts";
import { DataCryptoService } from "src/app/services/data-crypto.service";

let primary_color = '#0F74F6';
let secondary_color = '#43DF97';
let tertiary_color = '#cccccc';

export type ChartOptions = {
    series?: ApexAxisChartSeries;
    chart?: ApexChart;
    xaxis?: ApexXAxis;
    stroke?: ApexStroke;
    tooltip?: any;
    dataLabels?: ApexDataLabels;
    yaxis?: ApexYAxis;
    legend?: ApexLegend;
    labels?: string[];
    plotOptions?: ApexPlotOptions;
    fill?: ApexFill;
    responsive?: ApexResponsive[];
    pieseries?: ApexNonAxisChartSeries;
    title?: ApexTitleSubtitle;
    theme?: ApexTheme;
    colors?: string[];
    markers?: ApexMarkers;
    annotations?: ApexAnnotations;
    grid?: ApexGrid;
};

export let areaSpalineChart : ChartOptions | any = {
    chart: {
        height: 350,
        type: 'area',
        toolbar: {
            show: false
        }
    },
    dataLabels: {
        enabled: false
    },
    stroke: {
        curve: 'smooth'
    },
    series: [
        {
            name: 'BTC',
            data: [31, 40, 28, 51, 42, 109, 100]
        }, 
        {
            name: 'USD',
            data: [11, 32, 45, 32, 34, 52, 41]
        },
        {
            name: 'ETH',
            data: [50, 8, 32, 21, 17, 65, 97]
        }
    ],
 
    xaxis: {
        type: 'datetime',
        categories: [
            "2023-09-21T10:45:00", 
            "2023-09-21T11:00:00", 
            "2023-09-21T11:15:00", 
            "2023-09-21T11:30:00", 
            "2023-09-21T11:45:00", 
            "2023-09-21T12:00:00", 
            "2023-09-21T12:15:00"
        ],
    },
    tooltip: {
        x: {
            format: 'dd/MM/yy HH:mm'
        },
    },
    colors:[ primary_color, secondary_color, tertiary_color ]
 }
 