import { Component, Input, OnInit } from '@angular/core';
import { ResponseParent } from 'src/app/models/Transaction';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-withdraw-cart',
  templateUrl: './withdraw-cart.component.html',
  styleUrls: ['./withdraw-cart.component.scss']
})
export class WithdrawCartComponent implements OnInit {

  public widgetsProductData = [
];
public operations :any[] = []
public messageToDisplay? :any
currentPage: number = 1;
totalLenght: number;
loader:boolean = true;
@Input() operationType:'WITHDRAW_CRYPTO'|'WITHDRAW'


  constructor(private adminService:AdminService) { }

  ngOnInit(): void {
    this.fetchAwaitingWithdraws(this.currentPage)
  }

  fetchAwaitingWithdraws(pageNumber:number){
    this.adminService.getUsersTransactions(pageNumber,undefined,this.operationType,25,'CREATED').subscribe((response:ResponseParent)=>{
      if(response.statusCode===1000){
        console.log(response.data.transactions)
        this.operations = response.data.transactions
        this.currentPage = parseInt(response.data.currentPage)
        this.totalLenght = response.data.total_transactions
        if(this.operations.length===0){
          this.messageToDisplay='Aucune operations trouvé'
        }
      }else{
        this.messageToDisplay = response.message
      }
      this.loader = false
    })

  }

  verifyCryptoWithdraw(operation:any){
    const swalWithBootstrapButtons = Swal.mixin(

      {
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false,
      })
    swalWithBootstrapButtons.fire(
      {
        title: `Verifier le retrait`,
        html: `Voulez vous approuver le retrait de ${operation.amount} ${operation.currency} vers l'adresse : <span class='font-primary'>${operation.reference}</span> ?`,
        // type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      }).then((result: any) => {

        if (result.isConfirmed) {
          this.adminService.verifyCryptoWithdraw(operation.merchantReference).subscribe((result) => {
            if (result.statusCode === 1000) {
              let id = (this.operations as any[]).indexOf((this.operations as any[]).find((doc) => doc._id == operation._id))
              this.operations.splice(id,1)
              swalWithBootstrapButtons.fire(
                'Success!',
                'Opération terminé avec success.',
                'success'
              )
            } else {
              swalWithBootstrapButtons.fire(
                'Error',
                result.message,
                'error'
              )
            }
          })

        } else if (
          // Read more about handling dismissals
          result.dismiss === Swal.DismissReason.cancel
        ) {

        }
      })
  }

  manageWithdrawStatus(action: "approved" | "rejected", operation:any) {
    const swalWithBootstrapButtons = Swal.mixin(

      {
        customClass: {
          confirmButton: 'btn btn-success',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: false,
      })
    swalWithBootstrapButtons.fire(
      action == 'approved' ? {
        title: `Approuver le retrait`,
        text: `Voulez vous approuver le retrait de ${operation.amount} FCFA vers ${operation.receiver} ?`,
        // type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      } : {
        title: `Rejeter le document`,
        text: `Voulez vous rejeter le retrait de ${operation.amount} FCFA vers ${operation.receiver} ?`,
        // type: 'warning',
        input: 'text',
        inputAutoFocus: true,
        inputPlaceholder: `Donnez une raison au rejet`,
        inputValidator: (value:string) => {
          // Ajoutez une validation personnalisée ici si nécessaire
          if (value.length>100) {
            return 'Texte trop long !';
          }
          return null;
        },
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      }).then((result: any) => {

        if (result.isConfirmed) {
          this.adminService.manageWithdrawStatus(operation._id, action, {reject_reason:result.value}).subscribe((result) => {
            if (result.statusCode === 1000) {
              let id = (this.operations as any[]).indexOf((this.operations as any[]).find((doc) => doc._id == operation._id))
              this.operations.splice(id,1)
              swalWithBootstrapButtons.fire(
                'Success!',
                'Opération terminé avec success.',
                'success'
              )
            } else {
              swalWithBootstrapButtons.fire(
                'Error',
                result.message,
                'error'
              )
            }
          })

        } else if (
          // Read more about handling dismissals
          result.dismiss === Swal.DismissReason.cancel
        ) {

        }
      })
  }

}
