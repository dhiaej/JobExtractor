import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/auth/landing', pathMatch: 'full' },
  { 
    path: 'auth', 
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) 
  },
  { 
    path: 'admin', 
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['ADMIN'] }
  },
  { 
    path: 'poster', 
    loadChildren: () => import('./poster/poster.module').then(m => m.PosterModule),
    canActivate: [AuthGuard],
    data: { roles: ['OFFERER'] }
  },
  { 
    path: 'seeker', 
    loadChildren: () => import('./seeker/seeker.module').then(m => m.SeekerModule),
    canActivate: [AuthGuard],
    data: { roles: ['SEEKER'] }
  },
  { path: '**', redirectTo: '/auth/landing' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
