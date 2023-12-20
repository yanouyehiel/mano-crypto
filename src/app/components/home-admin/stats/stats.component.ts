import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-stats',
  templateUrl: './stats.component.html',
  styleUrls: ['./stats.component.scss'],
})
export class FileManagerComponent implements OnInit {
  @Input() datas: any = {};
  @Output() filterEvent = new EventEmitter()
  
  public countries : any[]
  public selectedCountry:string;
  constructor(private adminService:AdminService) {}

  ngOnInit(): void {
    this.fetchCountries()
    this.selectedCountry = "all"
  }

  applyFilter(country:string){
    this.selectedCountry = country
    this.filterEvent.emit(country)
  }
  fetchCountries(){
    this.adminService.getCountries().subscribe((response)=>{
      this.countries = [this.selectedCountry,...response.data.countries]
    })
  }

}
