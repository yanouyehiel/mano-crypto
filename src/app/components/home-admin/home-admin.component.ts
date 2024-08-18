import { Component, OnInit } from '@angular/core';
import * as chartData from '../../shared/data/chartData'
import { UserService } from 'src/app/services/user.service';
import { AdminService } from 'src/app/services/admin.service';
import { ResponseParent } from 'src/app/models/Transaction';
import Swal from 'sweetalert2';
import { catchError, of, timeout } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home-admin',
  templateUrl: './home-admin.component.html',
  styleUrls: ['./home-admin.component.scss']
})
export class HomeAdminComponent implements OnInit {
  public growthChart = chartData.growthChart;
  private users: any
  private solde: any
  public datas?:any
  public configs:any[]
  private transaction: any
  public barChart = chartData.barChart
  private userSaved = localStorage.getItem('user-mansexch')
  public loader: boolean = true;
  public loaderConfig: boolean = true;

  constructor(
    private adminService:AdminService,
    private router: Router
  ) {
    if (this.userSaved == undefined) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
    this.fetchStatistics('all');
    this.fetchConfigs();
  }

  getConfigKey(key:string):string{
    return key=='SALT_ROUNDS'?"Chaine de hashage":key=='CRYPTO_BUY_SERVICE_FEES_PERCENTAGE'?"Taxe sur les transactions (%)":key=='MIN_XAF_AMOUNT'?"Montant minimal de transaction (XAF)":key=='CRYPTO_WITHDRAW_FEES_PERCENTAGE'?'Frais de retrait crypto (x100 (%))':key=='CRYPTO_WITHDRAW_MIN_AMOUNT'?'Montant minimal de retrait crypto':key=='MIN_CRYPTO_WITHDRAW_VERIFY_AMOUNT'?'Montant minimal de retrait crypto à vérifier':key
  }
  getConfigIcon(key:string):string{
    return key=='SALT_ROUNDS'?"key":key=='CRYPTO_BUY_SERVICE_FEES_PERCENTAGE'?"percent":key=='MIN_XAF_AMOUNT'?'money':key=='CRYPTO_WITHDRAW_FEES_PERCENTAGE'?'ticket':key=='CRYPTO_WITHDRAW_MIN_AMOUNT'?'link':key=='MIN_CRYPTO_WITHDRAW_VERIFY_AMOUNT'?'check':"question"
  }
  fetchStatistics(data:string){
    let country: string =  "all"
    if (data !== country) {
      country = data.toLowerCase()
    }
    this.adminService.getUsersStatistics(country).subscribe((res: any) => {
      console.log(res.data)
      this.datas = res.data
      this.users = res.data.users
      this.growthChart.series = [this.users.total_users, this.users.connected_users, this.users.unconnected_users]
      this.solde = res.data.wallets
      this.transaction = res.data.transactions
      this.barChart.series[0].data = [
        this.solde.XAF_balance,
        this.solde.BTC_balance,
        this.solde.ETH_balance,
        this.transaction.deposit_transactions_amount,
        this.transaction.withdraw_transactions_amount,
        this.transaction.crypto_recharge_transactions_amount,
        this.transaction.crypto_withdraw_transactions_amount
      ]
      this.loader = false;
    })
  }
  fetchConfigs(){
    this.adminService.getConfigs().subscribe((response:ResponseParent)=>{
      if(response.statusCode===1000){
        this.configs = response.data;
        this.loaderConfig = false;
      }
    })
  }

  async updateConfigs(element: any) {
    Swal.fire({
      titleText:`Modification du ${this.getConfigKey(element.key)}`,
      html: `Quelle est la nouvelle valeur ?`,
      input: 'text',
      inputAutoFocus:true,
      inputPlaceholder: element.value,
      showCancelButton: true,
      confirmButtonText: 'Modifier',
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
      preConfirm:async (value)=>this.askConfirmTransaction({...element, value:value})
    });
  }

  askConfirmTransaction(element: any) {
    Swal.fire({
      titleText:`Modification du ${this.getConfigKey(element.key)}`,
      html: `Voulez vous vraiment effectuer cette opération ?`,
      showDenyButton: true,
      confirmButtonText: 'Oui',
      denyButtonText: `Non`,
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        try {
          const response = await this.adminService
      .setConfigs(element).pipe(
        timeout(10000), // Définir le délai d'attente en millisecondes (ici, 5 secondes)
         
        catchError((error)=>{
          if (
            error.status === 0 ||
            error.statusText === 'Unknown Error'|| error.name === 'TimeoutError'
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
          Swal.fire('Opération annulée', result.value.message, 'error');
        }else{
          Swal.fire('Success',`Opération effectué avec success`,  'success');
          let index = this.configs.indexOf(this.configs.find((el)=>el.key===element.key))
          this.configs[index]=element;
        }

      } else if (result.isDenied) {
        Swal.fire('Opération annulée', '', 'error');
      }
    });
  }
}

