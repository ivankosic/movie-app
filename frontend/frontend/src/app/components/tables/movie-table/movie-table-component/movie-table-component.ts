import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { MovieFull } from '../../../../model/movie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-table-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './movie-table-component.html',
  styleUrls: ['./movie-table-component.css'],
})
export class MovieTableComponent {
  @Input() clickedMovie: MovieFull | null = null;
  @Input() movies: MovieFull[] = [];
  @Output() viewEvent = new EventEmitter<MovieFull>();
  @Output() viewSimilarEvent = new EventEmitter<MovieFull>();
  @Output() updateEvent = new EventEmitter<MovieFull>();
  @Output() deleteEvent = new EventEmitter<MovieFull>();

  onView(m: MovieFull) {
    this.viewEvent.emit(m);
  }

  onViewSimilar(m: MovieFull) {
    this.viewSimilarEvent.emit(m);
  }

  onUpdate(m: MovieFull) {
    this.updateEvent.emit(m);
  }

  onDelete(m: MovieFull) {
    this.deleteEvent.emit(m);
  }

  trackByKey(_: number, m: MovieFull) {
    return m.movie._key;
  }
}
