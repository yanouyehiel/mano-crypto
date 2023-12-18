import { Component, OnInit } from '@angular/core';
import { LayoutService } from 'src/app/services/layout.service';

@Component({
  selector: 'app-mode',
  templateUrl: './mode.component.html',
  styleUrls: ['./mode.component.scss']
})
export class ModeComponent implements OnInit{
  public dark: boolean = false;

  constructor(public layout: LayoutService) {}

  ngOnInit(): void {
   

  }
  layoutToggle() {
    this.dark = !this.dark;
    localStorage.setItem('theme-mode', this.dark ? 'dark-only' : 'light-only')
    this.dark ? document.body.classList.add('dark-only') : document.body.classList.remove('dark-only');
    this.layout.config.settings.layout_version = this.dark ? 'dark-only' : 'light-only';
  }
}
