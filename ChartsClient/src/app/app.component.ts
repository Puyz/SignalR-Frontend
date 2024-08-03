import { Component } from '@angular/core';
import * as Highcharts from 'highcharts';
import * as signalR from '@microsoft/signalr';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  connection: signalR.HubConnection;
  constructor() {
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7047/saleshub")
      .withAutomaticReconnect()
      .build();
    this.connection.start();

    this.connection.on("receiveMessage", data=> {
      this.chartOptions.series = data;
      console.log(data);
    });


  }
  

  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {
    title: { text: 'Başlık' },
    subtitle: { text: 'Alt Başlık' },
    xAxis: { title: { text: 'X Ekseni' }, accessibility: { rangeDescription: "2019 - 2020" } },
    yAxis: { title: { text: 'Y Ekseni' } },
    legend: {
      layout: "vertical",
      align: "right",
      verticalAlign: "middle"
    },
    plotOptions: {
      series: {
        label: {
          connectorAllowed: true
        },
        pointStart: 100
      }
    },
    series: []
  };

}
