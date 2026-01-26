import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DirectorFull } from '../../../model/director';
import { Router } from '@angular/router';
import { NavbarItem } from '../../../model/navbar';
import { Navbar } from '../../navbar/navbar/navbar';
import { DirectorListComponent } from '../../lists/director-list/director-list-component/director-list-component';
import { DirectorService } from '../../../services/director/director-service';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-director-list-view',
  imports: [Navbar, DirectorListComponent, MatPaginatorModule],
  templateUrl: './director-list-view.html',
  styleUrl: './director-list-view.css',
})
export class DirectorListView implements OnInit, OnChanges {
  directors: DirectorFull[] = [];
  clickedDirector: DirectorFull | null = null;

  searchTerm: string = '';
  loading = false;

  totalResults = 0;
  pageSize = 10;
  pageIndex = 0;

  navLinks: NavbarItem[] = [
    { label: 'Movies', route: '/' },
    { label: 'Actors', route: '/actors' }
  ];


  constructor(private service: DirectorService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getAllActive();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['directors']) {
      console.log('Actors updated in parent:', this.directors);
    }
  }

  getAllActive() {
    this.loadPage(0, this.pageSize);
  }

  view(a: DirectorFull) {
    if (!a.director?._id) {
      console.warn('Actor ID is missing, cannot navigate.');
      return;
    }
    console.log('Clicked actor:', a);
    this.router.navigate(['/director', a.director._id]);
  }

  update(a: DirectorFull) {
    if (!a.director._id) return;
    this.service.update(a.director, a.director._id).subscribe(() => this.getAllActive());
  }

  softDelete(a: DirectorFull) {
    if (!a.director._id) return;
    this.service.softDelete(a.director._id).subscribe(() => this.getAllActive());
  }

  search(term: string) {
    this.searchTerm = term;

    if (!term) {
      this.getAllActive();
      return;
    }

    this.service.search(term).subscribe({
      next: (result) => {
        console.log('Search results:', result); // check the data
        this.directors = result;                  // replace the array
        this.cdr.detectChanges();
      },
      error: (err) => console.error(err)
    });
  }

  redirect(path: string) {
    this.router.navigate([path]);
  }

  loadPage(pageIndex: number, pageSize: number) {
    this.loading = true;

    this.service.getAllActive(pageIndex, pageSize).subscribe(res => {
      this.directors = res.data;
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
