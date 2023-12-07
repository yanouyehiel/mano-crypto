import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stats-data',
  templateUrl: './stats-data.component.html',
  styleUrls: ['./stats-data.component.scss']
})
export class StatsDataComponent implements OnInit {

  public earningData = [
    {
        id: 1,
        classCompo: 'bg-dark',
        icon: 'users',
        title: 'Utilisateurs',
        count: 9856,
        // iconWithClass: <Database className="icon-bg" />
    },
    {
        id: 2,
        classCompo: 'bg-primary',
        icon: 'user-check',
        title: 'Utilisateurs connectees',
        count: 985,
        // iconWithClass: <ShoppingBag className="icon-bg" />
    },
    {
        id: 3,
        classCompo: 'bg-info',
        icon: 'user-x',
        title: 'Utilisateurs Non-connectees',
        count: 893,
        // iconWithClass: <MessageCircle className="icon-bg" />
    },
    {
        id: 4,
        classCompo: 'bg-secondary',
        icon: 'credit-card',
        title: 'Chiffre d\'affaires',
        count: 4531000,
        // iconWithClass: <UserPlus className="icon-bg" />
    },
];

  constructor() { }

  ngOnInit(): void {
  }

}
