import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ActorListComponent } from '../../lists/actor-list/actor-list-component/actor-list-component';
import { Navbar } from '../../navbar/navbar/navbar';
import { Actor, ActorFull } from '../../../model/actor';
import { NavbarItem } from '../../../model/navbar';
import { ActorService } from '../../../services/actor/actor-service';
import { Router } from '@angular/router';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-actor-list-view',
  imports: [ActorListComponent, Navbar, MatPaginatorModule],
  templateUrl: './actor-list-view.html',
  styleUrl: './actor-list-view.css',
})
export class ActorListView implements OnInit {
  actors: ActorFull[] = [];

  loading = false;

  totalResults = 0;
  pageSize = 10;
  pageIndex = 0;

  navLinks: NavbarItem[] = [
    { label: 'Movies', route: '/' },
    { label: 'Directors', route: '/directors' },
  ];

  constructor(
    private service: ActorService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getAllActive();
  }

  getAllActive() {
    this.loadPage(0, this.pageSize);
  }

  view(actorFull: ActorFull) {
    const actor = actorFull.actor;
    if (!actor?._id) return;
    this.router.navigate(['/actor', actor._id]);
  }

  update(actorFull: ActorFull) {
    const actor = actorFull.actor;
    if (!actor?._id) return;
    this.service.update(actor, actor._id).subscribe(() => this.getAllActive());
  }

  softDelete(actorFull: ActorFull) {
    const actor = actorFull.actor;
    if (!actor?._id) return;
    this.service.softDelete(actor._id).subscribe(() => this.getAllActive());
  }

  redirect(path: string) {
    this.router.navigate([path]);
  }

  loadPage(pageIndex: number, pageSize: number) {
    this.loading = true;
    this.service.getAllActive(pageIndex, pageSize).subscribe(res => {
      console.log('Actors fetched:', res.data); // <-- debug
      this.actors = res.data;
      this.totalResults = res.total;
      this.pageIndex = pageIndex;
      this.pageSize = pageSize;
      this.loading = false;
      this.cdr.detectChanges();
    });
  }

  onPageChange(event: any) {
    this.loadPage(event.pageIndex, event.pageSize);
  }
}
