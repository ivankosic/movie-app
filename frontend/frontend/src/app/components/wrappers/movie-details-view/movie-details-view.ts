import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MovieFull } from '../../../model/movie';
import { ActivatedRoute, Route, Router, RouterModule } from '@angular/router';
import { MovieService } from '../../../services/movie/movie-service';
import { MovieDetailsComponent } from '../../details/movie-details-component/movie-details-component';
import { CommonModule } from '@angular/common';
import { Actor, ActorFull } from '../../../model/actor';
import { Director, DirectorFull } from '../../../model/director';

@Component({
  selector: 'app-movie-details-view',
  imports: [CommonModule, MovieDetailsComponent, RouterModule],
  templateUrl: './movie-details-view.html',
  styleUrl: './movie-details-view.css',
})
export class MovieDetailsView implements OnInit {
  movie!: MovieFull;
  actors!: Actor[];
  directors!: Director[];

  constructor(
    private route: ActivatedRoute,
    private movieService: MovieService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const movieId = this.route.snapshot.paramMap.get('id');
    if (movieId) {
      this.movieService.getById(movieId).subscribe((data) => {
        this.movie = data;
        this.cdr.detectChanges();
      });
    }
  }

  redirectToActor(a: Actor) {
    console.log('Redirecting to actor:', a);
    this.router.navigate(['/actor', a._key]);
  }

  redirectToDirector(d: Director) {
    console.log('Redirecting to director:', d);
    this.router.navigate(['/director', d._key]);
  }

}
