import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-recharge-compte',
  templateUrl: './recharge-compte.component.html',
  styleUrls: ['./recharge-compte.component.scss']
})
export class RechargeCompteComponent implements OnInit {
  public current: string = 'current'

  constructor() {}

  ngOnInit(): void {
    
  }
}
