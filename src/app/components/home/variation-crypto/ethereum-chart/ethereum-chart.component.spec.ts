import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EthereumChartComponent } from './ethereum-chart.component';

describe('EthereumChartComponent', () => {
  let component: EthereumChartComponent;
  let fixture: ComponentFixture<EthereumChartComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EthereumChartComponent]
    });
    fixture = TestBed.createComponent(EthereumChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
