import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LoadDeviceResolver } from '@shared/resolvers/load-device.resolver';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    resolve: { deviceLoaded: LoadDeviceResolver },
    data: {
      isHomePage: true,
      title: 'ONDER Dashboard',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
