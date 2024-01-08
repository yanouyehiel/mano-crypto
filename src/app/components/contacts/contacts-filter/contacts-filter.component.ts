import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-contacts-filter',
  templateUrl: './contacts-filter.component.html',
  styleUrls: ['./contacts-filter.component.scss']
})
export class ContactsFilterComponent implements OnInit {
  public type: any;
  public open: boolean = false;
  public countries:any[]
  
  public filters = [
    {
      name: 'Comptes',
      criteria: {}
    },
    {
      name: 'Administrateurs',
      criteria: {role:'admin'},
      isSubItem:true
    },
    {
      name: 'Validateurs',
      criteria: {role:'validator'},
      isSubItem:true
    },
    {
      name: 'Comptes validés',
      criteria: {kyc_status:'approved'}
    }, {
      name: 'Comptes à valider',
      criteria: {kyc_status:'submitted'}
    },
    
    {
      name: 'Comptes bannis',
      criteria: {account_status:'banned'}
    },
    {
      name: 'Comptes suspendus',
      criteria: {account_status:'suspended'},
    },
  ]
  @Output() emitFilterName = new EventEmitter()
  @Output() applyFilter = new EventEmitter()

  constructor(private adminService: AdminService) { }

  ngOnInit(): void {
    this.emitFilterName.emit(this.filters[0].name)
    this.fetchCountries()
  }



  openMenu() {
    this.open = !this.open
  }

  fetchCountries(){
    this.adminService.getCountries().subscribe((response)=>{
      this.countries = response.data.countries
    })
  }

  selectFilter(event: any, filter: any) {
    const filterElements = Array.from(document.querySelectorAll('.main-menu li a'))
    filterElements.forEach((element) => {
      element.classList.remove('bg-primary-subtle')
    }
    )

    event.target.parentElement.classList.add('bg-primary-subtle')
    this.applyFilter.emit(filter.criteria)
    this.emitFilterName.emit(filter.name)
  }
}

