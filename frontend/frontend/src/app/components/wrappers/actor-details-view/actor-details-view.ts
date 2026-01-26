import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActorDetailsComponent } from '../../details/actor-details-component/actor-details-component';
import { Movie } from '../../../model/movie';
import { Actor, ActorFull } from '../../../model/actor';
import { ActorService } from '../../../services/actor/actor-service';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-actor-details-view',
  standalone: true,
  imports: [ActorDetailsComponent, CommonModule],
  templateUrl: './actor-details-view.html',
  styleUrls: ['./actor-details-view.css'],
})
export class ActorDetailsView implements OnInit {
  actor!: ActorFull;
  movies: Movie[] = [];
  loading = true;
  error?: string;

  constructor(
    private actorService: ActorService,
    private route: ActivatedRoute,
    private router : Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Actor ID missing';
      this.loading = false;
      return;
    }

    this.actorService.getById(id).subscribe({
      next: (response: ActorFull) => {
        console.log('Loaded actor:', response);
        this.actor = response;
        this.movies = response.movies;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load actor:', err);
        this.error = 'Failed to load actor details';
        this.loading = false;
      },
    });
  }

  redirectToMovie(m: Movie) {
    console.log('Redirecting to movie:', m);
    this.router.navigate(['/movies/movie', m._key]);
  }
}