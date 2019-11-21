import { NgModule } from '@angular/core';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NavbarComponent } from './navbar/navbar.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    NavbarComponent,
  ],
  imports: [],
  exports: [
    HeaderComponent,
    FooterComponent,
    SidebarComponent,
    NavbarComponent,
  ]
})
export class LayoutModule { }
