import { TestBed } from '@angular/core/testing';

import { CryptoTransactionService } from './crypto-transaction.service';

describe('CryptoTransactionService', () => {
  let service: CryptoTransactionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CryptoTransactionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
