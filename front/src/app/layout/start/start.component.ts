import { Component, OnInit, DoCheck, NgZone } from '@angular/core';
import { Router } from '@angular/router';

//Services
import { AuthService } from 'src/app/services/auth.service';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss']
})
export class StartComponent implements OnInit, DoCheck {
  isMobile: boolean = false;
  isAuthenticated: boolean = false;

  isLogueado: boolean = false;
  showHeader: boolean = true;

  constructor(
    private router: Router,
    private authService: AuthService,
    private userProfileService: UserProfileService,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    this.updateMobileView();

    const user = sessionStorage.getItem('token');
    this.isLogueado = !!user;

    if (!this.isLogueado) {
      this.router.navigate(['/login']);
    } else {
      this.userProfileService.cargarPerfil();
    }

    window.addEventListener('resize', () => {
      this.ngZone.run(() => this.updateMobileView());
    });

    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngDoCheck(): void {
    const token = sessionStorage.getItem('token');
    this.isAuthenticated = !!token;
  }

  private updateMobileView(): void {
    this.isMobile = window.innerWidth <= 768;
  }
}
