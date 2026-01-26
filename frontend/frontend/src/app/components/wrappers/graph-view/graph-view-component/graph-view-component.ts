import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit
} from '@angular/core';

import { GraphComponent } from '../../../graph/graph-component/graph-component';
import { MovieFull, MovieRecommendation } from '../../../../model/movie';
import { MovieService } from '../../../../services/movie/movie-service';
import { ActivatedRoute, Router } from '@angular/router';

import { MovieListViewComponent } from
  '../../movie-list-view/movie-list-view-component/movie-list-view-component';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-graph-view-component',
  standalone: true,
  imports: [GraphComponent, CommonModule],
  templateUrl: './graph-view-component.html',
  styleUrl: './graph-view-component.css',
})
export class GraphViewComponent implements OnInit {
  movie: MovieFull | null = null;
  recommendations: MovieRecommendation[] = [];

  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private service: MovieService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    // Fetch movie and recommendations in parallel
    forkJoin({
      movie: this.service.getById(id),
      recommendations: this.service.recommend(id)
    }).subscribe({
      next: ({ movie, recommendations }) => {
        this.movie = movie;
        this.recommendations = recommendations;
        console.log('[Clicked movie]', movie);
        console.log('[Recommendations received]', recommendations);
        this.loading = false;
        this.cdr.markForCheck(); // update the template
      },
      error: (err) => {
        console.error('Failed to load movie or recommendations:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }
}
