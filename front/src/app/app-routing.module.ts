import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

//Components
import { StartComponent } from './layout/start/start.component';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { InstalacionesComponent } from './components/instalaciones/instalaciones.component';
import { InstalacionesFichaComponent } from './components/instalaciones/instalaciones-ficha/instalaciones-ficha.component';
import { ReservasComponent } from './components/reservas/reservas.component';
import { PerfilComponent } from './components/perfil/perfil.component';
import { ReservarComponent } from './components/reservar/reservar.component';

//Auth
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'app',
    component: StartComponent,
    canActivate: [AuthGuard],
    runGuardsAndResolvers: 'always',
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'instalaciones', component: InstalacionesComponent },
      { path: 'instalaciones/nuevo', component: InstalacionesFichaComponent },
      { path: 'instalaciones/:id', component: InstalacionesFichaComponent },
      { path: 'reservas', component: ReservasComponent },
      { path: 'reservar/:id', component: ReservarComponent },
      { path: 'perfil', component: PerfilComponent }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}