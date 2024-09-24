import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
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
import { ResponseParent } from 'src/app/models/Transaction';
import { CryptoTransactionService } from 'src/app/services/crypto-transaction.service';
import { LayoutService } from 'src/app/services/layout.service';
import { NavService } from 'src/app/services/nav.service';
import { UserService } from 'src/app/services/user.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vente-crypto',
  templateUrl: './vente-crypto.component.html',
  styleUrls: ['./vente-crypto.component.scss']
})
export class VenteCryptoComponent implements OnInit {
  public cryptos = []
  public wallet: any;
  public typeCrypto: string;
  public recentOrders: any[] = [];
  public loader: boolean = true;
  public responseFee: ResponseParent;
  cryptoAmount: number;
  xafAmount: number;
  reloadHistory = false;
  swalInputValue = new Subject<string>();
  liveResponse$: Observable<any>;
  liveSpinner: HTMLElement | null;
  liveContent: HTMLElement | null;
  setReload() {
    this.reloadHistory = !this.reloadHistory
  }
  private userSaved: any

  constructor(
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
    this.getWalletDetails()
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
            
            type: "SELL_CRYPTO"
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
        liveValue6.innerText = `${parseFloat(response.data.xaf_total).toLocaleString('fr-FR')+' XAF'}`;
      }
     
    })
  }

  getWalletDetails() {

    this.cryptoService.getWalletDetails().subscribe((value) => {

      if (value && value.statusCode == 1000) {
        this.wallet = value.data.details.filter((e: any) => e.image_url != null);
      }else if (value.statusCode == 1001) {
        this.router.navigate(['/auth/login'])
      } 
    });
  }


  async initSellingProcess(crypto: string) {
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
    
    await Swal.fire({
      titleText: `Vente de ${crypto}`,
      html: `Combien de ${crypto} voulez vous vendre?
      <p><i class="fa fa-spin fa-spinner" style="display:none;" id="live-spinner"></i></p>
      <ul id="live-content" style="display:none;">
        <li><b id="live-value1"></b> exactement</li>
        <li><b id="live-value2"></b> de frais de transaction</li>
        <li><b id="live-value3"></b> de frais reseau</li>
        
        <li><b id="live-value4"></b> de frais manen crypto</li>
        <li><b id="live-value5"></b> de frais réseau crypto</li>
        <li><b id="live-value6"></b> à recevoir au total</li>
      </ul>`,
      input: 'text',
      inputAutoFocus: true,
      inputPlaceholder: `Ex: 0.02`,
      showCancelButton: true,
      confirmButtonText: 'Vendre',
      cancelButtonText: 'Fermer',
      inputValidator: (value) => {
        // Ajoutez une validation personnalisée ici si nécessaire
        if (isNaN(parseFloat(value))) {
          return 'Veuillez entrer un nombre valide.';
        }
        else if (parseFloat(value) > (this.wallet as any[]).find((e) => e.details.type == crypto).wallet.solde) {
          return "Vous n'en possedez pas autant"
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
            .sellCrypto({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            }).pipe(
              catchError((error) => {
                this.liveSpinner!.style.display = 'none';
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
          this.liveSpinner!.style.display = 'none';
          Swal.showValidationMessage(
            `Impossible de traiter votre requete, Veuillez reessayer plus tard`
          );
          return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    }).then((result: any) => {
      if (result.isConfirmed) {
        if (result.value.statusCode == 1000) {
          Swal.fire('Success', `Vente effectué avec success`, 'success');
          this.setReload()
        } else if (result.value.statusCode == 1001) {
          this.router.navigate(['/auth/login'])
        } else {
          Swal.fire('Vente annulée', result.value.message, 'error');

        }

      } else if (result.isDenied) {
        Swal.fire('Vente annulée', '', 'error');
      }
    });
  }

}
