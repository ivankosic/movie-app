import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MovieListComponent } from '../../../lists/movie-list/movie-list-component/movie-list-component';
import { MovieFull, MovieRecommendation, SearchParams } from '../../../../model/movie';
import { MovieService } from '../../../../services/movie/movie-service';
import { Router } from '@angular/router';
import { Navbar } from '../../../navbar/navbar/navbar';
import { NavbarItem } from '../../../../model/navbar';
import { catchError, of, tap } from 'rxjs';
import { MatPaginatorModule } from '@angular/material/paginator';

@Component({
  selector: 'app-movie-list-view-component',
  imports: [MovieListComponent, Navbar, MatPaginatorModule],
  templateUrl: './movie-list-view-component.html',
  styleUrl: './movie-list-view-component.css',
})
export class MovieListViewComponent implements OnInit, OnChanges {
  movies: MovieFull[] = [];
  clickedMovie: MovieFull | null = null;
  recommendations: MovieRecommendation[] = [];
  loading = false;

  totalResults = 0;
  pageSize = 10;
  pageIndex = 0;

  navLinks: NavbarItem[] = [
    { label: 'Actors', route: '/actors' },
    { label: 'Directors', route: '/directors' }
  ];

  constructor(private service: MovieService, private router: Router, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.getAllActive();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['movies']) {
      console.log('Movies updated in parent:', this.movies);
    }
  }


  getAllActive(after?: string) {
    this.loadPage(0, this.pageSize);
  }

  view(m: MovieFull) {
    if (!m.movie?._id) {
      console.warn('Movie ID is missing, cannot navigate.');
      return;
    }
    console.log('Clicked movie:', m);
    this.router.navigate(['/movies/movie', m.movie._id]);
  }

  viewSimilar(m: MovieFull) {
    if (!m.movie?._id) return;
    this.router.navigate(['/movies/movie', m.movie._id, 'recommendations']);
  }

  update(m: MovieFull) {
    if (!m.movie._id) return;
    this.service.update(m.movie, m.movie._id).subscribe(() => this.getAllActive());
  }

  softDelete(m: MovieFull) {
    if (!m.movie._id) return;
    this.service.softDelete(m.movie._id).subscribe(() => this.getAllActive());
  }

  search(params: SearchParams) {
    // If all fields are empty, show all active movies
    const isEmptySearch = !params.searchText &&
      !params.actorName &&
      !params.directorName &&
      !params.genreName &&
      !params.releaseDateStart &&
      !params.releaseDateEnd &&
      !params.runningTimeMin &&
      !params.runningTimeMax;

    if (isEmptySearch) {
      this.getAllActive();
      return;
    }

    this.loading = true;
    this.service.search(params)
      .pipe(
        tap(movies => console.log('[ADVANCED SEARCH] Fetched movies:', movies)),
        catchError(err => {
          console.error('[ADVANCED SEARCH] Error:', err);
          this.loading = false;
          return of([] as MovieFull[]);
        })
      )
      .subscribe(movies => {
        this.movies = movies;
        this.loading = false;
        console.log('[ADVANCED SEARCH] Results:', this.movies.length);
        this.cdr.detectChanges();
      });
  }

  redirect(path: string) {
    this.router.navigate([path]);
  }

  loadPage(pageIndex: number, pageSize: number) {
    this.loading = true;

    this.service.getAllActive(pageIndex, pageSize).subscribe(res => {
      this.movies = res.data;
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
