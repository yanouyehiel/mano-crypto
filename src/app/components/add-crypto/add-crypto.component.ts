import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  forkJoin,
  map,
  of,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { PricingItem } from 'src/app/models/pricings-elements';
import { ResponseParent } from 'src/app/models/Transaction';
import { BuyPricingService } from 'src/app/services/buyService';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { LayoutService } from 'src/app/services/layout.service';
import { NavService } from 'src/app/services/nav.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-add-crypto',
  templateUrl: './add-crypto.component.html',
  styleUrls: ['./add-crypto.component.scss'],
})
export class AddCryptoComponent implements OnInit, OnDestroy {

  public items$: Observable<PricingItem[]>;
  public loading$: Observable<boolean>;
  public error$: Observable<string | null>;

  private destroy$ = new Subject<void>();
  public typeCrypto: string;
  public recentOrders: any[] = [];
  public loader: boolean = true;
  reloadHistory = false;
  cryptoAmount: number;
  xafAmount: number;
  private userSaved: any
  swalInputValue = new Subject<string>();
  liveResponse$: Observable<any>;
  liveSpinner: HTMLElement | null;
  liveContent: HTMLElement | null;
  loading = false;
  pricingItems: PricingItem[] = [];
  constructor(
    private modalService: NgbModal,
    public navService: NavService,
    public layoutService: LayoutService,
    private cryptoService: CryptoTransactionService,
    private router: Router,
    private userService: UserService,
    private buyPricingService: BuyPricingService,
    private configurationService: ConfigurationService
  ) {

  }
  setReload() {
    this.reloadHistory = !this.reloadHistory
  }
  getProfileUser(): void {
    this.userService.getProfile().subscribe((response: any) => {
      this.userSaved = response.data.user
    }, (err) => {
      this.router.navigate(['/auth/login'])
    })
  }


  onRefresh(): void {
    // this.buyPricingService.refreshPricing();
  }


  loadBuyData(): void {
    console.log('🛒 Chargement données BUY...');
    this.loading = true;

    this.buyPricingService.getBuyPricingData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (pricingItems: PricingItem[]) => {
          console.log('✅ Données BUY reçues:', pricingItems);
          this.pricingItems = pricingItems;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Erreur chargement BUY:', error);
          this.loading = false;
          // Optionnel : afficher un toast d'erreur
        }
      });
  }

  ngOnInit(): void {
    this.loadBuyData();
    this.configurationService.updateConfigurations();

    this.getProfileUser()
    this.liveResponse$ = this.swalInputValue.pipe(
      //On va attendre un certain temps avant de lancer la requete au serveur
      debounceTime(300),
      // Éviter les requêtes qui auront le même terme de recherche
      distinctUntilChanged(),
      switchMap((term) => {
        if (parseFloat(term) > 0) {

          if (this.liveSpinner) {
            this.liveSpinner.style.display = "block";
          }

          // Utiliser forkJoin pour exécuter les requêtes en parallèle
          return this.cryptoService.transactionFees({
            amount: term,
            currency: this.typeCrypto,

            type: "BUY_CRYPTO"
          });

        } else {
          return of(null);
        }
      })
    );

    this.liveResponse$.subscribe((response) => {
      this.liveSpinner!.style.display = 'none';
      if (this.liveContent) {
        this.liveContent.style.display = 'flex';
      }
      const liveContent = document.getElementById('live-content');
      if (liveContent) {
        liveContent.style.display = 'flex';
      }


      const liveValue1 = document.getElementById('live-value1');
      if (liveValue1) {
        liveValue1.innerText = `${parseInt(response.data.xaf_total).toLocaleString('fr-FR') + ' XAF'}`;
      }
      const liveValue3 = document.getElementById('live-value3');
      if (liveValue3) {
        liveValue3.innerText = `${parseFloat(response.data.usdc_total).toFixed(2) + ' USDT'}`;
      }

      const liveValue4 = document.getElementById('live-value4');
      if (liveValue4) {
        liveValue4.innerText = `${parseFloat(response.data.usd_fees).toFixed(2) + ' USDT'}`;
      }
      const liveValue5 = document.getElementById('live-value5');
      if (liveValue5) {
        liveValue5.innerText = `${parseFloat(response.data.usd_network_fees).toFixed(2) + ' USDT'}`;
      }
      const liveValue6 = document.getElementById('live-value6');
      if (liveValue6) {
        liveValue6.innerText = `${(parseFloat(response.data.usdc_total)).toFixed(2) + ' USDT'}`;
      }

    })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // onRefresh(): void {
  //   this.buyPricingService.refreshPricing();
  // }

  get layoutClass() {
    return (
      this.layoutService.config.settings.sidebar_type +
      ' ' +
      this.layoutService.config.settings.layout.replace('layout', 'sidebar')
    );
  }


  async initBuyingProcess(crypto: string) {
    let user = JSON.parse(localStorage.getItem('user-mansexch')!).user;
    if ((this.userSaved.kyc as any[]).filter((e) => e.status != 'approved').length > 0) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false,
      });

      swalWithBootstrapButtons.fire({
        title: `Erreur`,
        text: `Vous devez faire valider votre compte avant d'effectuer cette operation !`,
        // type: 'warning',
        confirmButtonText: 'Valider mon compte',
        reverseButtons: true
      }).then(() => {
        this.router.navigate(['/client/profile-edit'])
      })
      return
    }
    await Swal.fire({
      titleText: `Achat de ${crypto}`,
      html: `Combien de ${crypto} voulez vous acheter?
      <p><i class="fa fa-spin fa-spinner" style="display:none;" id="live-spinner"></i></p>
      <ul id="live-content" style="display:none;">
      <li><b id="live-value6"  class="text-success h5 "></b> de cout au total</li>
        <li><b id="live-value1"></b> </li>
        
        <li><b id="live-value4"></b> de frais manen crypto</li>
        <li><b id="live-value5"></b> de frais réseau crypto</li>
        
      </ul>`,
      input: 'text',
      inputAutoFocus: true,
      inputPlaceholder: `Ex: 0.02`,
      showCancelButton: true,
      confirmButtonText: 'Acheter',
      cancelButtonText: 'Fermer',
      inputValidator: (value) => {
        // Ajoutez une validation personnalisée ici si nécessaire
        if (isNaN(parseFloat(value))) {
          return 'Veuillez entrer un nombre valide.';
        }
        return null
      },
      inputAttributes: {
        autocapitalize: 'off'
      },
      showLoaderOnConfirm: true,
      didOpen: async (popup) => {
        this.liveSpinner = document.getElementById('live-spinner')
        this.liveContent = document.getElementById('live-content');
        this.typeCrypto = crypto;
        const inputElement = Swal.getInput()
        if (inputElement) {
          inputElement.addEventListener('keyup', (event) => {
            let inputValue = (event.target as HTMLInputElement).value
            this.swalInputValue.next(inputValue)
          });
        }

      },
      preConfirm: async (value) => {
        try {
          const response = await this.cryptoService
            .buyCrypto({
              crypto_currency: this.typeCrypto,
              amount: parseFloat(value),
            }).pipe(
              catchError((error) => {
                if (error.status === 0 || error.statusText === 'Unknown Error') {
                  Swal.showValidationMessage(
                    `Erreur de connexion Internet. Veuillez vérifier votre connexion.`
                  );
                }

                return of(error.error)
              })
            )
            .toPromise();
          if (response) {
            return response;
          } else {
            throw new Error("Can't buy");
          }
        } catch (error: any) {

          Swal.showValidationMessage(
            `Impossible de traiter votre requete, Veuillez reessayer plus tard`
          );
          return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result: any) => {

      if (result.isConfirmed) {
        console.log(result)
        if (result.value.statusCode === 1000) {
          Swal.fire('Success', `Achat effectué avec success`, 'success');
          this.setReload()
        } else if (result.value.statusCode == 1001) {
          this.router.navigate(['/auth/login'])
        } else {
          Swal.fire('Achat annulée', result.value.message, 'error');
        }

      } else if (result.isDenied) {
        Swal.fire('Achat annulée', '', 'error');
      }
    });
  }


}
