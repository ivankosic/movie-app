import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Director, DirectorFull } from '../../../model/director';
import { DirectorService } from '../../../services/director/director-service';
import { Router, RouterModule } from '@angular/router';
import { Movie } from '../../../model/movie';

@Component({
  selector: 'app-director-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './director-details-component.html',
  styleUrls: ['./director-details-component.css'],
})
export class DirectorDetailsComponent {
  @Input()
  director!: DirectorFull;

  @Output()
  clickEvent = new EventEmitter<Director>();

  @Output()
  movieClickEvent = new EventEmitter<Movie>();

  constructor(private service: DirectorService, private router: Router) { }

  onClick(e: Director) {
    this.clickEvent.emit(e);
  }

  onMovieClick(e: Movie) {
    this.movieClickEvent.emit(e);
  }
}
