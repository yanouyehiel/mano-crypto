import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {

  public footerFix = false;
  public footerLight = false;
  public footerDark = false

  constructor() {}

  ngDoCheck(){
    if(window.location.pathname == '/page-layout/footer-dark'){
      this.footerDark = true;
      this.footerLight = false;
      this.footerFix = false;
    }else if(window.location.pathname == '/page-layout/footer-light'){
      this.footerLight = true;
      this.footerDark = false;
      this.footerFix = false;
    }else if(window.location.pathname == '/page-layout/footer-fixed'){
      this.footerFix = true;
      this.footerLight = false;
      this.footerDark = false;
    }
  }

  ngOnInit() {}
}
