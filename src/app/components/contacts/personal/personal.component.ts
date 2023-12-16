import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as data from '../contact'
import { Observable } from 'rxjs';
import { UserService } from 'src/app/services/user.service';
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
  @Input() users:any[];
  user:any
  public transactions:any[]
  public alertMsg = "Pas d'historique disponible."

  //  $users :Observable<any[]> = new Observable()
  

  public days = ["01", "02", "03","04"]
  public months = ["January", "February", "March","April", "May", "June", "July", "August", "September","October", "November", "December"]

  constructor(private modalService: NgbModal, private userService:UserService) { }

  showHistory() {
    this.history = !this.history;
  }
  ngOnInit(): void {
    // this.$users.
    setTimeout(()=>{
      this.user = this.users[0]
      this.fetchHistory(this.user._id)
    }, 3000)
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
  
  deleteContact(){
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false,
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "This contact will be deleted from your Personal Contacts and from the chat list too. ",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'OK',
      cancelButtonText: 'Cancel',
      reverseButtons: true
    }).then((result:any) => {
      if (result.value) {
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'Your file has been deleted.',
          'success'
        )
      } else if (
        // Read more about handling dismissals
        result.dismiss === Swal.DismissReason.cancel
      ) {
        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your imaginary file is safe :)',
          'error'
        )
      }
    })
  }


  openHistory(){
    this.open = !this.open
  }


}
