import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { LayoutService } from 'src/app/services/layout.service';
import { NavService } from 'src/app/services/nav.service';
import * as feather from 'feather-icons';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss']
})
export class ClientComponent {

  constructor(
    public navService: NavService,
    public layoutService: LayoutService,
    public route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe((params) => {
      this.layoutService.config.settings.layout = params['layout']
        ? params['layout']
        : this.layoutService.config.settings.layout;
    });
  }

  ngAfterViewInit() {
    feather.replace();
  }

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
