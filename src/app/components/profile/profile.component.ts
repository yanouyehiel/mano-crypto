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
  private userSaved = localStorage.getItem('user-mansexch')
  public loader: boolean = true;

  constructor(private router: Router, private userService: UserService) 
  {
    if (this.userSaved == null) {
      this.router.navigate(['/auth/login'])
    }
  }

  ngOnInit(): void {
    this.loader = true;
    this.getProfileUser()
    if (this.user.kyc[0].document_url === "") {
      this.textKYC = "Veuillez insérer votre CNI"
      this.kycIsUploaded = false
    } else if (this.user.kyc[1].document_url === "") {
      this.textKYC = "Veuillez insérer votre photo 4x4"
      this.kycIsUploaded = false
    } else {
      this.textKYC = "Vous documents ont déjà été soumis"
      this.kycIsUploaded = true
    }
  }

  openProfileEdit(): any {
    this.router.navigate(['/client/profile-edit'])
  }

  getProfileUser(): void {
    this.userService.getProfile().subscribe((response: any) => {
      this.user = response.data.user
    }, (err) => {
      if (err.status === 401) {
        this.router.navigate(['/auth/login'])
      }
    })
    this.loader = false;
  }

}

