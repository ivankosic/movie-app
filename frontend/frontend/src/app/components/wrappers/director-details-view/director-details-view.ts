import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Director, DirectorFull } from '../../../model/director';
import { Movie } from '../../../model/movie';
import { DirectorService } from '../../../services/director/director-service';
import { ActivatedRoute, Router } from '@angular/router';
import { DirectorDetailsComponent } from '../../details/director-details-component/director-details-component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-director-details-view',
  standalone: true,
  imports: [DirectorDetailsComponent, CommonModule],
  templateUrl: './director-details-view.html',
  styleUrls: ['./director-details-view.css'],
})
export class DirectorDetailsView implements OnInit {
  director!: DirectorFull;
  movies: Movie[] = [];
  loading = true;
  error?: string;

  constructor(
    private service: DirectorService,
    private route: ActivatedRoute,
    private router : Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = 'Director ID missing';
      this.loading = false;
      return;
    }

    this.service.getById(id).subscribe({
      next: (response: DirectorFull) => {
        console.log('Loaded director:', response);
        this.director = response;
        this.movies = response.movies;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Failed to load director:', err);
        this.error = 'Failed to load director details';
        this.loading = false;
      },
    });
  }

   redirectToMovie(m: Movie) {
    console.log('Redirecting to movie:', m);
    this.router.navigate(['/movies/movie', m._key]);
  }
}