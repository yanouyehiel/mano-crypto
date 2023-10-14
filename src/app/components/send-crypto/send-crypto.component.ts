import { Component } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConfirmPasswordComponent } from 'src/app/shared/components/confirm-password/confirm-password.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-send-crypto',
  templateUrl: './send-crypto.component.html',
  styleUrls: ['./send-crypto.component.scss'],
})
export class SendCryptoComponent {
  constructor(private modalService: NgbModal) {}
  public recentOrders: any[] = [];
  public loader: boolean = true;

  public currentValues = [
    {
      type: 'BTC',
      value: 12.63,
      actuelValue: 39485000,
      class: 'primary',
      icon: 'bitcoin-btc-logo.svg',
    },
    {
      type: 'ETH',
      value: 4.63,
      actuelValue: 22251,
      class: 'secondary',
      icon: 'ethereum-eth-logo.svg',
    },
    {
      type: 'USD',
      value: 54.6,
      actuelValue: 39485,
      class: 'primary',
      icon: 'usd-svg.svg',
    },
  ];

  confirmIdentityModal() {
    let modalRef = this.modalService.open(ConfirmPasswordComponent);
    modalRef.closed.subscribe((res) => {
      if (res == true) {
        this.success();
      } else {
        this.phoneNotActive();
      }
    });
  }

  success(): void {
    Swal.fire('Transfert initié !');
  }
  phoneNotActive(): void {
    Swal.fire('Erreur', "Ce numero de telephone n'est pas activé?", 'error');
  }
  error(): void {
    Swal.fire('Erreur', 'Vous ne pouvez pas faire ce retrait ?', 'error');
  }
}
