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
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vente-crypto',
  templateUrl: './vente-crypto.component.html',
  styleUrls: ['./vente-crypto.component.scss']
})
export class VenteCryptoComponent  implements OnInit{
  public cryptos = []
  public wallet:any;
  public typeCrypto: string;
  public recentOrders: any[] = [];
  public loader: boolean = true;
  public responseFee: ResponseParent;
  cryptoAmount: number;
  xafAmount:number;
  reloadHistory = false;
  swalInputValue = new Subject<string>();
  liveResponse$: Observable<any>;
   liveSpinner : HTMLElement | null;
   liveContent : HTMLElement | null;
  setReload(){
    this.reloadHistory = !this.reloadHistory
  }
  private userSaved = localStorage.getItem('user-mansexch')

  constructor(
    public navService: NavService,
    public layoutService: LayoutService,
    private cryptoService: CryptoTransactionService,
    private router: Router
  ) {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

ngOnInit(): void {
  this.getWalletDetails()
  
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
        this.cryptoAmount = parseFloat(term);
        
        // Utiliser forkJoin pour exécuter les requêtes en parallèle
        return forkJoin({
          conversion: this.cryptoService.convertToFiat({
            crypto_currency: this.typeCrypto,
            amount: term,
          }),
          fees: this.cryptoService.getCryptoFees({
            crypto_currency: this.typeCrypto,
            amount: term,
          })
          
        }).pipe(
          // Combiner les résultats en un seul objet
          map(({ conversion, fees }) => ({
            conversion,
            fees
          }))
        );

      } else {
        return of(null);
      }
    })
  );

  this.liveResponse$.subscribe((response) => {
    console.log('--------');
    console.log(response);
    this.liveSpinner!.style.display = 'none';
    if (this.liveContent) {
      this.liveContent.style.display = 'block';
    }
    const liveValue1 = document.getElementById('live-value1');
    if (liveValue1) {
      liveValue1.innerText = `${response.conversion.data.xaf_amount && parseInt(response.conversion.data.xaf_amount).toLocaleString('fr-FR') + ' XAF'}`;
    }
    const liveValue2 = document.getElementById('live-value2');
    if (liveValue2) {
      liveValue2.innerText = `${response.fees.data.withdrawFees.fee && response.fees.data.withdrawFees.fee + ' ' + response.fees.data.withdrawFees.currency}`;
    }
    const liveValue3 = document.getElementById('live-value3');
    if (liveValue3) {
      let total1 = parseFloat(response.conversion.data.crypto_amount) - parseFloat(response.fees.data.withdrawFees.fee)

      let total2 = parseFloat(response.conversion.data.xaf_amount) / parseFloat(response.conversion.data.crypto_amount)
      liveValue3.innerText = `${(response.conversion.data.crypto_amount && response.fees.data.withdrawFees.fee && response.conversion.data.xaf_amount) ? parseInt((total1 * total2).toString()).toLocaleString('fr-FR') + ' XAF' : ''}`;
    }

  })
}

getWalletDetails() {
  
  this.cryptoService.getWalletDetails().subscribe((value) => {
    
    if(value && value.statusCode==1000){
      this.wallet = value.data.details.filter((e:any)=>e.image_url!=null);
    }
  });
}


  async initSellingProcess(crypto: string) {
   await Swal.fire({
      titleText:`Vente de ${crypto}`,
      html: `Combien de ${crypto} voulez vous vendre?
      <p><i class="fa fa-spin fa-spinner" style="display:none;" id="live-spinner"></i></p>
      <ul id="live-content" style="display:none;">
        <li>Valeur en XAF : <span style="color:green;" id="live-value1"></span></li>
        <li>Frais Manen : <span style="color:green;" id="live-value2"></span></li>
        <li>Net à recevoir : <span style="color:green;" id="live-value3"></span></li>
      </ul>`,
      input: 'text',
      inputAutoFocus:true,
      inputPlaceholder: `Ex: 0.02`,
      showCancelButton: true,
      confirmButtonText: 'Vendre',
      cancelButtonText: 'Fermer',
      inputValidator: (value) => {
        // Ajoutez une validation personnalisée ici si nécessaire
        if (isNaN(parseFloat(value))) {
          return 'Veuillez entrer un nombre valide.';
        }
      else if( parseFloat(value)>(this.wallet as any[]).find((e)=>e.details.type==crypto).wallet.solde){
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
              catchError((error)=>{
                this.liveSpinner!.style.display = 'none';
                if (error.status === 0 || error.statusText === 'Unknown Error') {
                  Swal.showValidationMessage(
                    `Erreur de connexion Internet. Veuillez vérifier votre connexion.`
                  );
                }

                return of(error.error)})
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
        if(result.value.statusCode!=1000){
          Swal.fire('Vente annulée', result.value.message, 'error');
        }else{
          Swal.fire('Success',`Vente effectué avec success`,  'success');
          this.setReload()
        }

      } else if (result.isDenied) {
        Swal.fire('Vente annulée', '', 'error');
      }
    });
  }

}
