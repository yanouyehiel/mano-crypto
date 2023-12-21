import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.scss']
})
export class NotificationComponent implements OnInit{
  public user:any
  public notifications:any[] = []

  constructor() {}
  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user
    this.buildNotifis()
  }

  buildNotifis(){
    (this.user.kyc as any[]).forEach((item)=>{
      if(item.document_type=='cni'){
        this.notifications.push({
          status:item.status,
          title:(item.status=='rejected')?'Rejeté':(item.status=='approved')?'Validé':(item.status=='submitted')?'En attente':'Requis',
          text:(item.status=='rejected')?'Votre piece d\'identité a été rejeté, Veuillez la ressoumettre !':(item.status=='approved')?'Votre piece d\'identité a été approuvé !':(item.status=='submitted')?'Votre piece d\'identité est en cours de validation !':'Veuillez soumettre votre piece d\'identité pour faire valider votre compte !',
          type:(item.status=='rejected')?'danger':(item.status=='approved')?'success':(item.status=='submitted')?'info':'warning'
        })
      }else{
        this.notifications.push({
          status:item.status,
          title:(item.status=='rejected')?'Rejeté':(item.status=='approved')?'Validé':(item.status=='submitted')?'En attente':'Requis',
          text:(item.status=='rejected')?'Votre selfie a été rejeté, Veuillez le ressoumettre !':(item.status=='approved')?'Votre selfie a été approuvé !':(item.status=='submitted')?'Votre selfie est en cours de validation !':'Veuillez soumettre votre selfie pour faire valider votre compte !',
          type:(item.status=='rejected')?'danger':(item.status=='approved')?'success':(item.status=='submitted')?'info':'warning'
        })
      }
      
    })
  }
}
