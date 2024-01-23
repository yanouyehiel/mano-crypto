import { Component, OnInit } from '@angular/core';
import { catchError, of } from 'rxjs';
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
  setReload(){
    this.reloadHistory = !this.reloadHistory
  }

  constructor(
    public navService: NavService,
    public layoutService: LayoutService,
    private cryptoService: CryptoTransactionService
  ) {}

ngOnInit(): void {
  this.getWalletDetails()
    
}

getWalletDetails() {
  
  this.cryptoService.getWalletDetails().subscribe((value) => {
    
    if(value && value.statusCode==1000){
      this.wallet = value.data.details.filter((e:any)=>e.image_url!=null);
    }
  });
}


  async initBuyingProcess(crypto: string) {
    const { value: result } = await Swal.fire({
      titleText:`Vente de ${crypto}`,
      html: `Combien de ${crypto} voulez vous vendre?`,
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
      preConfirm: async (value) => {
        
        this.cryptoAmount = parseFloat(value);
        this.typeCrypto = crypto;
        try {
          const responseFees:any = await this.cryptoService
            .getCryptoFees({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            }).pipe(
              catchError((error)=>{
                if (
                  error.status === 0 ||
                  error.statusText === 'Unknown Error'
                ) {
                  Swal.fire(
                    'Erreur',
                    `Erreur de connexion Internet. Veuillez vérifier votre connexion.`,
                    'error'
                  );
                }

                return of(error.error);
              })
            )
            .toPromise();
            const responseAmountToXAF = await this.cryptoService
            .convertToFiat({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            }).pipe(
              catchError((error)=>of(error.error))
            )
            .toPromise();
          if (responseFees.statusCode==1000 && responseAmountToXAF.statusCode==1000) {
            const responseFeeToXAF = await this.cryptoService
            .convertToFiat({
              crypto_currency: this.typeCrypto,
              amount:parseFloat(responseFees.data.withdrawFees.fee),
            }).pipe(
              catchError((error)=>of(error.error))
            )
            .toPromise();
            if(responseFeeToXAF.statusCode!=1000){
              throw new Error(responseFeeToXAF);
            }
            this.xafAmount = parseInt(responseAmountToXAF.data.xaf_amount) - parseInt(responseFeeToXAF.data.xaf_amount)
            return responseFeeToXAF;
          } else {
            throw new Error('User not found');
          }
        } catch (error:any) {
          if (error.error) {
            Swal.showValidationMessage(`${error.error.message}`);
          } else {
            Swal.showValidationMessage(
              `Impossible de traiter votre requete, Veuillez reessayer plus tard`
            );
          }

          return null;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });
    

    if (result.statusCode!=1000) {
      Swal.fire('Vente annulée', result.message, 'error');
    }else{
      this.askConfirmTransaction(result);
    }
  }

  askConfirmTransaction(value: any) {
    Swal.fire({
      titleText:`Vente de ${this.typeCrypto}`,
      html: `Vous recevrez au total <b class="text-success"> ${
        this.xafAmount.toLocaleString('fr-FR')} XAF</b>`,
      showDenyButton: true,
      confirmButtonText: 'Finaliser',
      denyButtonText: `Annuler`,
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        try {
          const response = await this.cryptoService
            .sellCrypto({
              crypto_currency: this.typeCrypto,
              amount: this.cryptoAmount,
            }).pipe(
              catchError((error)=>{
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
          Swal.fire('Vante annulée', result.value.message, 'error');
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
