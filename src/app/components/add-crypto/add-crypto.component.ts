import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-add-crypto',
  templateUrl: './add-crypto.component.html',
  styleUrls: ['./add-crypto.component.scss']
})
export class AddCryptoComponent implements OnInit {

  constructor() {}

  ngOnInit(): void {
    console.log('add crypto')
  }
}
