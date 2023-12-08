import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class FileManagerComponent implements OnInit {
  @Input() datas: any = {};
  @Output() filterEvent = new EventEmitter()
  
  public countries = ["all","Cameroun", "Benin", "Gabon"]
  public selectedCountry:string;
  constructor() {}

  ngOnInit(): void {
    this.selectedCountry = "all"
  }

  applyFilter(country:string){
    this.selectedCountry = country
    this.filterEvent.emit(country)
  }

}
