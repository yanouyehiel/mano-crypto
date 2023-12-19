import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as data from '../contact'
import { Observable, catchError } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
import { AdminService } from 'src/app/services/admin.service';
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
  public contacts = data.contactData.contact
  public open: boolean = false
  public term:string=''
  @Output() applyFilterWithTerm = new EventEmitter()
  @Input() users:any[];
  @Input() filterName:string
  user:any
  public transactions:any[]
  public alertMsg = "Pas d'historique disponible."

  //  $users :Observable<any[]> = new Observable()
  

  public days = ["01", "02", "03","04"]
  public months = ["January", "February", "March","April", "May", "June", "July", "August", "September","October", "November", "December"]

  constructor(private modalService: NgbModal, private userService:UserService, private adminServise:AdminService) { }

  showHistory() {
    this.history = !this.history;
  }
  ngOnInit(): void {
    console.log(this.users)
      this.user = this.users[0]
      this.fetchHistory(this.user._id)
  }

  emitFilterWithTerm(){
    this.applyFilterWithTerm.emit({name:this.term})
    this.filterName = `Recherche '${this.term}'`
  }

  setUserDisplay(user:any){
    this.user = user
    this.fetchHistory(this.user._id)
  }
  fetchHistory(userId:string){
    this.userService.getUsersTransactions(userId).subscribe((res: any) => {
      
      this.transactions = res.data.reverse();
    })
  }
  
  manageUserStatus(action: "active" | "banned" | "suspended"){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })
    swalWithBootstrapButtons.fire({
      title: `${action=='active'?'Activer':action=='banned'?'Bannir':'Suspendre'} le compte`,
      text: `Voulez vous ${action=='active'?'Activer':action=='banned'?'Bannir':'Suspendre'} le compte de ${this.user.name} ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result:any) => {
      if (result.value) {
        this.adminServise.banAnUser(this.user._id, action).subscribe((result)=>{
         if( result.statusCode===1000){
          this.user.account_status=action
          swalWithBootstrapButtons.fire(
            'Success!',
            'Opération terminé avec success.',
            'success'
          )
         }else{
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

  manageKYCStatus(action: "approved" | "rejected", docType:string){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })
    swalWithBootstrapButtons.fire({
      title: `${action=='approved'?'Approuver':'Rejeter'} le document`,
      text: `Voulez vous ${action=='approved'?'Approuver':'Rejeter'} le document ${docType} de ${this.user.name} ?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result:any) => {
      if (result.value) {
        this.adminServise.kyc(this.user._id, action, docType).subscribe((result)=>{
         if( result.statusCode===1000){
          let id = (this.user.kyc as any[]).indexOf((this.user.kyc as any[]).find((doc)=>doc.document_type==docType))
          this.user.kyc[id].status = action
          swalWithBootstrapButtons.fire(
            'Success!',
            'Opération terminé avec success.',
            'success'
          )
         }else{
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

  isKycApprouved():boolean{
   return (this.user.kyc as any[])===(this.user.kyc as any[]).filter((e)=>e.status=='approved')
  }


  openHistory(){
    this.open = !this.open
  }


}
