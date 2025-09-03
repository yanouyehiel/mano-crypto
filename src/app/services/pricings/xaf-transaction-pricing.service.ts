import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, interval, switchMap, startWith, map, catchError, of } from 'rxjs';
import { ConfigurationService } from '../configuration.service';
import { Currency } from 'src/app/models/pricings-elements';

export interface XafTransactionPricingItem {
    type: 'deposit' | 'withdraw';
    name: string;
    currency: string;
    feePercentage: string;
    minAmount: string;
}

@Injectable({
    providedIn: 'root'
})
export class XafTransactionPricingService {
    private xafPricingItemsSubject = new BehaviorSubject<XafTransactionPricingItem[]>([]);
    private loadingSubject = new BehaviorSubject<boolean>(false);
    private errorSubject = new BehaviorSubject<string | null>(null);

    public xafPricingItems$ = this.xafPricingItemsSubject.asObservable();
    public loading$ = this.loadingSubject.asObservable();
    public error$ = this.errorSubject.asObservable();

    private readonly REFRESH_INTERVAL = 30000; // 30 seconds
    private readonly TIMEOUT_DURATION = 10000; // 10 seconds
    private readonly supportedCurrencies: Currency[] = [
        {
            symbol: 'XAF',
            name: 'XAF',
            icon: '' // No specific icon for XAF
        }
    ];

    constructor(
        private configurationService: ConfigurationService
    ) {
        this.initializeAutoRefresh();
    }

    public refreshPricing(): void {
        this.loadingSubject.next(true);
        this.updateXafPricingData().subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private initializeAutoRefresh(): void {
        this.configurationService.updateConfigurations();
        interval(this.REFRESH_INTERVAL).pipe(
            startWith(0),
            switchMap(() => {
                this.loadingSubject.next(true);
                return this.updateXafPricingData();
            })
        ).subscribe({
            next: () => this.handleUpdateSuccess(),
            error: (error) => this.handleUpdateError(error)
        });
    }

    private updateXafPricingData(): Observable<void> {
        return this.configurationService.configuration$.pipe(
            switchMap(() => {
                this.initializeItemsIfEmpty();
                return this.processXafItems();
            }),
            catchError(error => {
                this.handleError(error);
                return of(void 0);
            })
        );
    }

    private initializeItemsIfEmpty(): void {
        const currentItems = this.xafPricingItemsSubject.getValue();
        if (currentItems.length === 0) {
            this.xafPricingItemsSubject.next(this.getDefaultXafPricingItems());
        }
    }

    private getDefaultXafPricingItems(): XafTransactionPricingItem[] {
        return [
            {
                type: 'deposit',
                name: 'XAF Deposit',
                currency: 'XAF',
                feePercentage: 'Loading...',
                minAmount: 'Loading...'
            },
            {
                type: 'withdraw',
                name: 'XAF Withdrawal',
                currency: 'XAF',
                feePercentage: 'Loading...',
                minAmount: 'Loading...'
            }
        ];
    }

    private processXafItems(): Observable<void> {
        let completedCount = 0;
        const totalItems = 2; // Deposit and Withdraw

        return new Observable<void>(observer => {
            // Process Deposit
            this.buildXafPricingItem('deposit').subscribe({
                next: (pricingItem) => {
                    this.replaceXafPricingItem(pricingItem);
                    this.checkCompletion(++completedCount, totalItems, observer);
                },
                error: () => {
                    this.ensureDefaultItem('deposit');
                    this.checkCompletion(++completedCount, totalItems, observer);
                }
            });

            // Process Withdraw
            this.buildXafPricingItem('withdraw').subscribe({
                next: (pricingItem) => {
                    this.replaceXafPricingItem(pricingItem);
                    this.checkCompletion(++completedCount, totalItems, observer);
                },
                error: () => {
                    this.ensureDefaultItem('withdraw');
                    this.checkCompletion(++completedCount, totalItems, observer);
                }
            });

            this.setTimeoutSafety(completedCount, totalItems, observer);
        });
    }

    private buildXafPricingItem(type: 'deposit' | 'withdraw'): Observable<XafTransactionPricingItem> {
        const minXafAmount = this.configurationService.getConfigByKey('MIN_XAF_AMOUNT');
        let feePercentage = 0;

        if (type === 'deposit') {
            feePercentage = this.configurationService.getConfigByKey('XAF_DEPOSITS_FEES_PERCENTAGE');
        } else {
            feePercentage = this.configurationService.getConfigByKey('XAF_WITHDRAW_FEES_PERCENTAGE');
        }

        return of({
            type,
            name: type === 'deposit' ? 'XAF Deposit' : 'XAF Withdrawal',
            currency: 'XAF',
            feePercentage: `${feePercentage}%`,
            minAmount: this.formatCurrency(minXafAmount, 'XAF')
        });
    }

    private replaceXafPricingItem(newItem: XafTransactionPricingItem): void {
        const currentItems = [...this.xafPricingItemsSubject.getValue()];
        const index = currentItems.findIndex(item => item.type === newItem.type);

        if (index !== -1) {
            currentItems[index] = newItem;
        } else {
            currentItems.push(newItem);
        }

        this.xafPricingItemsSubject.next(currentItems);
    }

    private ensureDefaultItem(type: 'deposit' | 'withdraw'): void {
        const currentItems = this.xafPricingItemsSubject.getValue();
        const existingItem = currentItems.find(item => item.type === type);

        if (!existingItem) {
            const defaultItem = {
                type,
                name: type === 'deposit' ? 'XAF Deposit' : 'XAF Withdrawal',
                currency: 'XAF',
                feePercentage: 'Loading...',
                minAmount: 'Loading...'
            };
            this.replaceXafPricingItem(defaultItem);
        }
    }

    private checkCompletion(completed: number, total: number, observer: any): void {
        if (completed === total) {
            observer.next();
            observer.complete();
        }
    }

    private setTimeoutSafety(completedCount: number, total: number, observer: any): void {
        setTimeout(() => {
            if (completedCount < total) {
                observer.next();
                observer.complete();
            }
        }, this.TIMEOUT_DURATION);
    }

    private handleUpdateSuccess(): void {
        this.loadingSubject.next(false);
        this.errorSubject.next(null);
    }

    private handleUpdateError(error: any): void {
        this.loadingSubject.next(false);
        this.handleError(error);
    }

    private handleError(error: any): void {
        const errorMessage = error.error?.message || error.message || 'Une erreur est survenue lors du chargement des données de transaction XAF';
        this.errorSubject.next(errorMessage);
    }

    private formatCurrency(amount: number, currency: 'USD' | 'XAF'): string {
        const symbol = currency === 'USD' ? '$' : '';
        const suffix = currency === 'XAF' ? ' XAF' : '';

        if (amount < 1 && currency === 'USD') {
            return `${symbol}${amount.toFixed(4)}${suffix}`;
        }

        return `${symbol}${amount.toLocaleString('fr-FR', {
            minimumFractionDigits: currency === 'XAF' ? 0 : 2,
            maximumFractionDigits: currency === 'XAF' ? 0 : 2
        })}${suffix}`;
    }
}
