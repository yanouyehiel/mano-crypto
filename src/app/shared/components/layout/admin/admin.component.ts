import { Component } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';
import { RouterOutlet } from '@angular/router';
import { NavService } from 'src/app/services/nav.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent {

  constructor(
    public layoutService: LayoutService,
    public navService: NavService
  ) {}

  public getRouterOutletState(outlet: any) {
    return outlet.isActivated ? outlet.activatedRoute : '';
  }

  get layoutClass() {
    return (
      this.layoutService.config.settings.sidebar_type +
      ' ' +
      this.layoutService.config.settings.layout.replace('layout', 'sidebar')
    );
  }

  prepareRoute(outlet: RouterOutlet) {
    return (
      outlet &&
      outlet.activatedRouteData &&
      outlet.activatedRouteData['animation']
    );
  }
}
