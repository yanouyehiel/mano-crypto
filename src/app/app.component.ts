import { Component, OnInit } from '@angular/core';
import { LayoutService } from './services/layout.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit{
  title = 'Mano Crypto App';
  constructor(private layout: LayoutService){}
  ngOnInit(): void {
    let themeMode = localStorage.getItem('theme-mode')
    this.layout.config.settings.layout_version = themeMode!;
    document.body.classList.add(themeMode!)
  }
}
