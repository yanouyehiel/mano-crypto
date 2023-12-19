import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-contacts-filter',
  templateUrl: './contacts-filter.component.html',
  styleUrls: ['./contacts-filter.component.scss']
})
export class ContactsFilterComponent implements OnInit {
  public type: any;
  public open: boolean = false;
  
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
      name: 'Comptes valides',
      criteria: {}
    }, {
      name: 'Comptes à valider',
      criteria: {}
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

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
    this.emitFilterName.emit(this.filters[0].name)
  }



  openMenu() {
    this.open = !this.open
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

