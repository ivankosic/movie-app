import { Component, OnInit } from '@angular/core';
import { MovieTableComponent } from '../../../tables/movie-table/movie-table-component/movie-table-component';
import { Movie, MovieFull } from '../../../../model/movie';
import { MovieService } from '../../../../services/movie/movie-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-movie-table-view-component',
  imports: [MovieTableComponent],
  templateUrl: './movie-table-view-component.html',
  styleUrl: './movie-table-view-component.css',
})
export class MovieTableViewComponent implements OnInit {
  movies: MovieFull[] = [];
  clickedMovie: MovieFull | null = null;
  recommendations: MovieFull[] = [];

  constructor(private service: MovieService, private router: Router) {}

  ngOnInit(): void {
    this.loadActiveMovies();
  }

  loadActiveMovies() {
    this.service.getAllActive().subscribe(movies => {
      this.movies = movies;
      console.log('Active movies:', this.movies);
    });
  }


  view(m: MovieFull) {
    this.router.navigateByUrl(`/movies/${m.movie._id}`);
  }

  viewSimilar(m: MovieFull) {
    this.service.getById(String(m.movie._id)).subscribe(movie => {
      this.clickedMovie = movie;

      console.log('Clicked movie:', this.clickedMovie);

      this.service.recommend(String(movie.movie._id)).subscribe(recs => {
        this.recommendations = recs;
        console.log('Recommendations:', this.recommendations);
      });
    });
  }

  update(m: MovieFull) {
    if (!m.movie._id) return;
    this.service.update(m.movie, m.movie._id).subscribe(() => this.loadActiveMovies());
  }

  softDelete(m: MovieFull) {
    if (!m.movie._id) return;
    this.service.softDelete(m.movie._id).subscribe(() => this.loadActiveMovies());
  }
}
