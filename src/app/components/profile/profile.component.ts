import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProfileUser, ResponseProfile } from 'src/app/models/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
  public user!: any;
  public kycIsUploaded: boolean = false;
  public textKYC: string = ""

  constructor(private router: Router, private userService: UserService) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user-mansexch')!).user

    if (this.user.kyc[0].document_url === "") {
      this.textKYC = "Veuillez insérer votre CNI"
      this.kycIsUploaded = false
    } else if (this.user.kyc[1].document_url === "") {
      this.textKYC = "Veuillez insérer une photo de vous avec votre CNI"
      this.kycIsUploaded = false
    } else {
      this.textKYC = "Vous documents ont déjà été soumis"
      this.kycIsUploaded = true
    }
  }

  openProfileEdit(): any {
    this.router.navigate(['/client/profile-edit'])
  }

}

