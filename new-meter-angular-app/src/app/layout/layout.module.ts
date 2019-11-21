import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { SharedModule } from '@shared/shared.module';

import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AccessRestrictedComponent } from './access-restricted/access-restricted.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    NavbarComponent,
    NotFoundComponent,
    AccessRestrictedComponent,
  ],
  imports: [
    CommonModule,

    SharedModule,
    RouterModule,
  ],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    NavbarComponent,
    NotFoundComponent,
    AccessRestrictedComponent,
  ]
})
export class LayoutModule { }
