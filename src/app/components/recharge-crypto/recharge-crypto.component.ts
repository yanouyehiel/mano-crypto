import { Component, OnInit } from '@angular/core';
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
} from 'rxjs';
import { ResponseCryptoFee, ResponseParent } from 'src/app/models/Transaction';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { LayoutService } from 'src/app/services/layout.service';
import { NavService } from 'src/app/services/nav.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-recharge-crypto',
  templateUrl: './recharge-crypto.component.html',
  styleUrls: ['./recharge-crypto.component.scss'],
})
export class RechargeCryptoComponent implements OnInit {

  public earningData = [
    {
      id: 1,
      classCompo: 'bg-primary',
      icon: 'database',
      title: 'Fcfa XAF',
      count: '56850',
    },
    {
      id: 2,
      classCompo: 'bg-secondary',
      icon: 'shopping-bag',
      title: 'USDT USA',
      count: '56850',
    },
  ];

  public items = [
    
    {
      name: 'Tether',
      abv: 'USDT',
      value: 1,
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/825.png',
    },{
      name: 'Bitcoin',
      abv: 'BTC',
      value: 31000,
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png',
    },
    {
      name: 'Etheurium',
      abv: 'ETH',
      value: 1900,
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png',
    },
  ];

  public currentValues = [
    {
      type: 'BTC',
      value: 12.63,
      actuelValue: 39485000,
      class: 'primary',
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1.png',
    },
    {
      type: 'ETH',
      value: 4.63,
      actuelValue: 22251,
      class: 'secondary',
      icon: 'https://raw.githubusercontent.com/coinwink/cryptocurrency-logos/master/coins/128x128/1027.png',
    },
    {
      type: 'USDT',
      value: 54.6,
      actuelValue: 39485,
      class: 'primary',
      icon: 'USDT-svg.svg',
    },
  ];

  public typeCrypto: string;
  public recentOrders: any[] = [];
  public loader: boolean = true;
  cryptoAmount: number;
  reloadHistory = false;
  swalInputValue = new Subject<string>();
  liveResponse$: Observable<any>;
  liveSpinner : HTMLElement | null;
  liveContent : HTMLElement | null;
  setReload() {
    this.reloadHistory = !this.reloadHistory
  }
  private userSaved: any

  constructor(
    private modalService: NgbModal,
    public navService: NavService,
    public layoutService: LayoutService,
    private cryptoService: CryptoTransactionService,
    private router: Router,
    private userService: UserService
  ) {}

  getProfileUser(): void {
    this.userService.getProfile().subscribe((response: any) => {
      this.userSaved = response.data.user
    }, (err) => {
      this.router.navigate(['/auth/login'])
    })
  }

  ngOnInit(): void {
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
            
            type: "RECHARGE_CRYPTO"
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
      if(liveContent){
        liveContent.style.display = 'flex';
      }
     
      const liveValue1 = document.getElementById('live-value1');
      if (liveValue1) {
        liveValue1.innerText = `${parseInt(response.data.xaf_amount).toLocaleString('fr-FR')+' XAF'}`;
      }
      const liveValue2 = document.getElementById('live-value2');
      if (liveValue2) {
        liveValue2.innerText = `${parseInt(response.data.xaf_fees).toLocaleString('fr-FR')+' XAF'}`;
      }
      const liveValue3 = document.getElementById('live-value3');
      if (liveValue3) {
        liveValue3.innerText = `${parseInt(response.data.xaf_network_fees).toLocaleString('fr-FR')+' XAF'}`;
      }
      const liveValue4 = document.getElementById('live-value4');
      if (liveValue4) {
        liveValue4.innerText = `${parseFloat(response.data.crypto_fees).toLocaleString('fr-FR')+' '+ this.typeCrypto}`;
      }
      const liveValue5 = document.getElementById('live-value5');
      if (liveValue5) {
        liveValue5.innerText = `${parseFloat(response.data.crypto_network_fees).toLocaleString('fr-FR')+' '+ this.typeCrypto}`;
      }
      const liveValue6 = document.getElementById('live-value6');
      if (liveValue6) {
        liveValue6.innerText = `${parseFloat(response.data.crypto_total).toLocaleString('fr-FR')+' '+ this.typeCrypto}`;
      }
     
    })
  }

  VerticallyCenteredModal(verticallyContent: any, item: any) {
    const modalRef = this.modalService.open(verticallyContent);
    this.typeCrypto = item;
  }

  get layoutClass() {
    return (
      this.layoutService.config.settings.sidebar_type +
      ' ' +
      this.layoutService.config.settings.layout.replace('layout', 'sidebar')
    );
  }

  async initBuyingProcess(crypto: string) {
    if((this.userSaved.kyc as any[]).filter((e)=>e.status!='approved').length>0){
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
      }).then(()=>{
        this.router.navigate(['/client/profile-edit'])
      })
      return
    }

    const { value: result } = await Swal.fire({
      titleText: `Recharge de ${crypto}`,

      input: 'text',
      inputAutoFocus: true,
      inputPlaceholder: `Ex: 0.02`,
      showCancelButton: true,
      html: `Combien de ${crypto} voulez vous recharger?
      <p><i class="fa fa-spin fa-spinner" style="display:none;" id="live-spinner"></i></p>
      <ul id="live-content">
        <li><b id="live-value1"></b> exactement</li>
        <li><b id="live-value2"></b> de frais de transaction</li>
        <li><b id="live-value3"></b> de frais reseau</li>
        
        <li><b id="live-value4"></b> de frais manen crypto</li>
        <li><b id="live-value5"></b> de frais réseau crypto</li>
        <li><b id="live-value6"></b> à dépenser au total</li>
      </ul>`,
      confirmButtonText: 'Recharger',
      cancelButtonText: 'Fermer',
      inputValidator: (value) => {
        // Ajoutez une validation personnalisée ici si nécessaire
        if (isNaN(parseFloat(value))) {
          return 'Veuillez entrer un nombre valide.';
        }
        return null;
      },
      inputAttributes: {
        autocapitalize: 'off',
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
        this.cryptoAmount = parseFloat(value);
        // this.typeCrypto = crypto;
        try {
          const response = await this.cryptoService
            .importCrypto({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            })
            .pipe(catchError((error) => {
              if (error.status === 0 || error.statusText === 'Unknown Error') {
                Swal.showValidationMessage(
                  `Erreur de connexion Internet. Veuillez vérifier votre connexion.`
                );
              }
              return of(error.error)
            }))
            .toPromise();
          if (response) {
            return response;
          } else {
            throw new Error('User not found');
          }
        } catch (error: any) {

          Swal.showValidationMessage(
            `Impossible de traiter votre requete, Veuillez reessayer plus tard`
          );

          // return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result) {

      if (result.statusCode == 1000) {
        Swal.fire(
          'Success',
          `Veuillez suivre la procedure <a href='${result.data.invoice_url}' style="color:green;" target='_blank'>en cliquant ici</a>`,
          'info'
        );
        this.setReload()
        window.open(result.data.invoice_url, '_blank');
      }else if (result.statusCode == 1001) {
        this.router.navigate(['/auth/login'])
      }  else {
        Swal.fire('Operation annulée', result.message.error, 'error');
      }
    }
  }

}


