import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivationEnd, NavigationStart, Router, RouterEvent } from '@angular/router';
import { untilDestroyed } from 'ngx-take-until-destroy';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  title = '';
  isHomePage = false;
  isRouteResolved = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events
      .pipe(untilDestroyed(this))
      .subscribe(this.setTitleFromRouteData);
  }

  ngOnDestroy() { }

  private setTitleFromRouteData = (event: RouterEvent) => {
    if (event instanceof NavigationStart) {
      this.isRouteResolved = false;
      return;
    }

    if (!(event instanceof ActivationEnd)) {
      return;
    }

    if (this.snapshotHasNoData(event)) {
      return;
    }

    this.title = event.snapshot.data.title;
    this.isHomePage = Boolean(event.snapshot.data.isHomePage);
    this.isRouteResolved = true;
  }

  private snapshotHasNoData(event: ActivationEnd) {
    return Object.keys(event.snapshot.data).length === 0;
  }

}
