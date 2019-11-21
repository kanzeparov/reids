import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotFoundComponent } from '@app/layout/not-found/not-found.component';
import { AccessRestrictedComponent } from '@app/layout/access-restricted/access-restricted.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full',
  },

  {
    path: 'dashboard',
    loadChildren: './features/dashboard/dashboard.module#DashboardModule',
  },

  {
    path: 'deposit',
    loadChildren: './features/transfer/deposit/deposit.module#DepositModule',
  },

  {
    path: 'withdraw',
    loadChildren: './features/transfer/withdraw/withdraw.module#WithdrawModule',
  },

  {
    path: 'access-restricted',
    component: AccessRestrictedComponent,
    data: {
      title: 'Access Restricted',
    },
  },
  {
    path: '**',
    component: NotFoundComponent,
    data: {
      title: 'Not Found',
    },
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
