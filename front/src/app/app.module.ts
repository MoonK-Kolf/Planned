// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Material Modules
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

// CDK Module
import { CdkTableModule } from '@angular/cdk/table';

// Components
import { AppComponent } from './app.component';
import { InstalacionesComponent } from './components/instalaciones/instalaciones.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { SidebarComponent } from './layout/sidebar/sidebar.component';
import { TabbarComponent } from './layout/tabbar/tabbar.component';
import { StartComponent } from './layout/start/start.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { InstalacionesFichaComponent } from './components/instalaciones/instalaciones-ficha/instalaciones-ficha.component';
import { ReservarComponent } from './components/reservar/reservar.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';

// Pipes
import { DiaNombrePipe } from './pipes/dia-nombre.pipe';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/reset-password/reset-password.component';

@NgModule({
  declarations: [
    AppComponent,
    InstalacionesComponent,
    LoginComponent,
    HomeComponent,
    SidebarComponent,
    TabbarComponent,
    StartComponent,
    PerfilComponent,
    ReservasComponent,
    InstalacionesFichaComponent,
    DiaNombrePipe,
    ReservarComponent,
    ForgotPasswordComponent,
    ResetPasswordComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    BrowserAnimationsModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    CdkTableModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}