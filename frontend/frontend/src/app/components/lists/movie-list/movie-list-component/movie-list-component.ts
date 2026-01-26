import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { MovieFull, SearchParams } from '../../../../model/movie';
import { SearchComponent } from '../../../search/search-component';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './movie-list-component.html',
  styleUrls: ['./movie-list-component.css'],
})
export class MovieListComponent {
  @Input() movies: MovieFull[] = [];
  @Input() loading = false;

  @Output() viewEvent = new EventEmitter<MovieFull>();
  @Output() viewSimilarEvent = new EventEmitter<MovieFull>();
  @Output() updateEvent = new EventEmitter<MovieFull>();
  @Output() deleteEvent = new EventEmitter<MovieFull>();
  @Output() searchEvent = new EventEmitter<SearchParams>();

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  trackById(index: number, movie: MovieFull) {
    return movie?.movie?._id ?? index;
  }

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

  onSearch(term: SearchParams) {
    this.searchEvent.emit(term);
  }
}