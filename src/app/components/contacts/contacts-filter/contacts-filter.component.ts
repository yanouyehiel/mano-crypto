import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-contacts-filter',
  templateUrl: './contacts-filter.component.html',
  styleUrls: ['./contacts-filter.component.scss']
})
export class ContactsFilterComponent implements OnInit {
  public type : any;
  public open : boolean = false;

  constructor(private modalService: NgbModal) { }

  ngOnInit(): void {
  }

  openMenu(){
    this.open = !this.open
  }

selectFilter(event:any){
const filterElements = Array.from(document.querySelectorAll('.main-menu li a'))
filterElements.forEach((element)=>{
  element.classList.remove('bg-primary-subtle')
})

  event.target.parentElement.classList.add('bg-primary-subtle')
}
}

