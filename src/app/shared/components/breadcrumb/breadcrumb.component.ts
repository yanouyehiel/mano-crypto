import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent implements OnInit {
  public breadcrumbs: any;
  public title : string = ''

  constructor(private router: Router) {}

  ngOnInit() {
    let url = this.router.url;
    url = url.replace('/', '')
    url = url.replace('/', ' ')
    const word = url.split(' ')
    let parentWord = word[0]
    let childWord = word[1]

    if (parentWord.includes('-')) {
      parentWord = parentWord.replace('-', ' ')
    }
    if (childWord.includes('-')) {
      childWord = childWord.replace('-', ' ')
    }

    this.title = childWord
    this.breadcrumbs = {
      "parentBreadcrumb": parentWord,
      "childBreadcrumb": childWord
    }
    
  }

  ngOnDestroy() {  }
}
