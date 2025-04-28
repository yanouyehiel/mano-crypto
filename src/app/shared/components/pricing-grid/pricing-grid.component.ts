import { Component, Input, OnInit } from '@angular/core';
import { ResponseParent } from 'src/app/models/Transaction';
import { AdminService } from 'src/app/services/admin.service';

export interface PricingItem {
  _id: string;
  key: string;
  value: number;
  description_fr: string;
  description_en: string;
  unite: string;
}

@Component({
  selector: 'app-pricing-grid',
  templateUrl: './pricing-grid.component.html',
  styleUrls: ['./pricing-grid.component.scss']
})
export class PricingGridComponent implements OnInit {
  pricingGrid: PricingItem[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.fetchConfigs();
  }

  fetchConfigs() {
      this.adminService.getConfigs().subscribe((response: ResponseParent) => {
        if (response.statusCode === 1000) {
          this.pricingGrid = response.data
            .filter((item: any) => 
              item.key.includes('FEES_PERCENTAGE') || 
              item.key.includes('XAF')
            )
            .map((item: any) => ({
              ...item,
              unite: item.key.includes('FEES_PERCENTAGE') 
                ? '%' 
                : item.key.includes('XAF') && !item.key.includes('FEES_PERCENTAGE')
                  ? 'XAF' 
                  : item.unite
            }));
        }
      });
    }  
}
