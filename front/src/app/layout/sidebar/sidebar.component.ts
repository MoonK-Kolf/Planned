import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

//Services
import { AuthService } from 'src/app/services/auth.service';
import { UserProfileService } from 'src/app/services/user-profile.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit, OnDestroy{
  esEmpresa: boolean = false;
  private unsubscribe$ = new Subject<void>();

  constructor(
    private authService: AuthService,
    public userProfileService: UserProfileService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userProfileService.perfil$.subscribe(perfil => {
      if (perfil) {
        this.esEmpresa = perfil.Perfil_Id === 3;
      } else {
        this.esEmpresa = false;
      }
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  logout() : void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
