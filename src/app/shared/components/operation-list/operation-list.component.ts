import { Component } from '@angular/core';
import { ResponseParent } from 'src/app/models/Transaction';
import { AdminService } from 'src/app/services/admin.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-operation-list',
  templateUrl: './operation-list.component.html',
  styleUrls: ['./operation-list.component.scss']
})
export class OperationListComponent {
  public widgetsProductData = [];
  public operations :any[] = []
  public messageToDisplay? :any
  currentPage: number = 1;
  totalLenght: number;
  loader:boolean = true;

  constructor(private adminService:AdminService) { }

  ngOnInit(): void {
    this.fetchAwaitingWithdraws(this.currentPage)
  }

  fetchAwaitingWithdraws(pageNumber:number){
    this.loader = true
    this.adminService.getAllUsersTransactions(pageNumber).subscribe((response:ResponseParent)=>{
      if(response.statusCode===1000){
        this.operations = response.data.transactions
        this.currentPage = parseInt(response.data.currentPage)
        this.totalLenght = response.data.total_transactions
        if(this.operations.length===0){
          this.messageToDisplay='Aucune operation trouvée'
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
          this.adminService.verifyCryptoWithdraw(operation.merchantReference).subscribe((result: any) => {
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
