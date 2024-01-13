import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as data from '../contact'
import { UserService } from 'src/app/services/user.service';
import { AdminService } from 'src/app/services/admin.service';
import { catchError, of } from 'rxjs';
const Swal = require('sweetalert2')
// import Swal from 'sweetalert2';

@Component({
  selector: 'app-personal',
  templateUrl: './personal.component.html',
  styleUrls: ['./personal.component.scss']
})
export class PersonalComponent implements OnInit {
  public history: boolean = false;
  public editContact: boolean = false;
  public currentPage: number = 1;
  public currentHistoryPage: number = 1;
  public historyLength: number;
  public isApproved: boolean = false;
  public contacts = data.contactData.contact
  public open: boolean = false
  public term: string = ''
  public currentUser:any;
  maxHistoryElements:number = 9
  @Input() users: any[];
  @Input() usersLength: number;
  @Input() filterName: string
  @Output() applyFilterWithTerm = new EventEmitter()
  @Output() applyPageChange = new EventEmitter()
  user: any
  public transactions?: any[]
  public alertMsg = "Pas d'historique disponible."

  constructor(private modalService: NgbModal, private userService: UserService, private adminServise: AdminService) { }

  ngOnInit(): void {
    
    this.currentUser = JSON.parse(localStorage.getItem('user-mansexch')!).user
    this.setUserDisplay(this.users[0])
    this.pageHistoryChange(1)
    this.setPaginationOnBottom()

  }
  

  emitFilterWithTerm() {
    this.applyFilterWithTerm.emit({ name: this.term })
    this.filterName = `Recherche '${this.term}'`
  }

  setUserDisplay(user: any) {
    this.user = user
    this.fetchHistory(1, this.user._id)
    this.isApproved = this.isKycApprouved()
  }
  fetchHistory(page: number, userId: string) {
    
    this.maxHistoryElements = parseInt((document.querySelector('#right-history')?.clientHeight! / document.querySelector('.elementHistory')?.clientHeight!).toString())-1
    this.adminServise.getUsersTransactions(page, userId, this.maxHistoryElements).pipe(catchError((error) => {
      this.alertMsg = "Une erreur s'est produite, veuillez reessayer !"
      return of(error.error)
    })).subscribe((res: any) => {
      if (res.statusCode !== 1000) {
        this.alertMsg = "Une erreur s'est produite, veuillez reessayer !"
      } else {
        this.currentHistoryPage = parseInt(res.data.currentPage)
        this.historyLength = res.data.total_transactions
        this.transactions = res.data.transactions;
      }
    })
  }

  pageChange(page: number) {
    this.currentPage = page;
    this.applyPageChange.emit(page)
  }

  manageUserRole(role: "validator" | "customer" | "admin") {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })
    swalWithBootstrapButtons.fire({
      title: `Changer les droits de ce compte`,
      text: `Voulez vous ${role == 'validator' ? 'donner le role de validateur à ' : role == 'admin' ? 'donner le role d\'administrateur à' : 'Reinitialiser les roles de'} ce compte de ${this.user.name} ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result: any) => {
      if (result.value) {
        this.adminServise.roleOfUser(this.user._id, role).subscribe((result) => {
          if (result.statusCode === 1000) {
            this.user.role = role
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
        // swalWithBootstrapButtons.fire(
        //   'Fermé',
        //   'Tout reste en place :)',
        //   'error'
        // )
      }
    })
  }

  manageUserStatus(action: "active" | "banned" | "suspended") {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })
    swalWithBootstrapButtons.fire({
      title: `${action == 'active' ? 'Activer' : action == 'banned' ? 'Bannir' : 'Suspendre'} le compte`,
      text: `Voulez vous ${action == 'active' ? 'Activer' : action == 'banned' ? 'Bannir' : 'Suspendre'} le compte de ${this.user.name} ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result: any) => {
      if (result.value) {
        this.adminServise.banAnUser(this.user._id, action).subscribe((result) => {
          if (result.statusCode === 1000) {
            this.user.account_status = action
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
        // swalWithBootstrapButtons.fire(
        //   'Fermé',
        //   'Tout reste en place :)',
        //   'error'
        // )
      }
    })
  }

  manageKYCStatus(action: "approved" | "rejected", docType: string) {
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
        title: `Approuver le document`,
        text: `Voulez vous approuver le document ${docType} de ${this.user.name} ?`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancel',
        reverseButtons: true
      } : {
        title: `Rejeter le document`,
        text: `Voulez vous rejeter le document ${docType} de ${this.user.name} ?`,
        type: 'warning',
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
          this.adminServise.kyc(this.user._id, action, docType, action == 'approved' ? undefined : result.value).subscribe((result) => {
            if (result.statusCode === 1000) {
              let id = (this.user.kyc as any[]).indexOf((this.user.kyc as any[]).find((doc) => doc.document_type == docType))
              this.user.kyc[id].status = action
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

  isKycApprouved(): boolean {
    return (this.user.kyc as any[]).length === (this.user.kyc as any[]).filter((e) => e.status == 'approved').length
  }


  openHistory() {
    this.open = !this.open
    if(this.open){
      this.pageHistoryChange(1)
    }
  }
  pageHistoryChange(page: number) {
    this.fetchHistory(page, this.user._id)
  }

  setPaginationOnBottom() {
    let windowsHeight = window.innerHeight
    let historyComponent = document.getElementById('right-history')
    historyComponent!.style.height = `${windowsHeight - 50}px`;
  }

  getTextHistory(transaction:any):string{
    switch (transaction.type) {
      case 'DEPOSIT':
        return `Recharge de manen mobile de ${transaction.amount} FCFA`;
      case 'WITHDRAW':
        return `Retrait de manen mobile de ${transaction.amount} FCFA`;
      case 'RECHARGE_CRYPTO':
        return `Recharge de ${transaction.final_amount} ${transaction.final_currency}`;
      case 'WITHDRAW_CRYPTO':
        return `Retrait de ${transaction.final_amount} ${transaction.final_currency}`;
      case 'BUY_CRYPTO':
        return `Achat de ${transaction.final_amount} ${transaction.final_currency}`;
      case 'SELL_CRYPTO':
        return `Vante de ${transaction.final_amount} ${transaction.final_currency}`;
      default:
        return transaction.type;

    }
  }

  getHistory(transaction:any){
    return {
      status:transaction.status,
      description:transaction.type
    }
  }

  getTextUsingStatus(recent: any) {return recent.status == 'PENDING' ? 'EN ATTENTE' : recent.status == 'SUCCESS' ? 'effectué' : recent.status == 'CREATED' ? 'initié' : recent.status == 'REJECTED' ? 'rejeté ('+recent.reject_reason+')' : recent.status == 'FAILED' ? 'echoué' : recent.status}
  getClassUsingStatus = (recent: any) => recent.status=='PENDING'?' bg-secondary':recent.status=='SUCCESS'?' bg-success': recent.status == 'CREATED' ? 'bg-primary' : 'bg-danger'


}
