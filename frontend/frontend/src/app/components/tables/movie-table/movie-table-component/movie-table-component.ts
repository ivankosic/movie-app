import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie, MovieFull } from '../../../../model/movie';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-movie-table-component',
  imports: [CommonModule],
  templateUrl: './movie-table-component.html',
  styleUrl: './movie-table-component.css',
})
export class MovieTableComponent {
  @Input()
  movies : MovieFull[] = [];

  @Input()
  clickedMovie : MovieFull | null = null;

  @Output()
  viewEvent = new EventEmitter<MovieFull>();

  @Output()
  viewSimilarEvent = new EventEmitter<MovieFull>();

  @Output()
  updateEvent = new EventEmitter<MovieFull>();

  @Output()
  deleteEvent = new EventEmitter<MovieFull>();

  onView(m : MovieFull){
    this.viewEvent.emit(m);
  }

  onViewSimilar(m : MovieFull){
    this.viewSimilarEvent.emit(m);
  }

  onUpdate(m : MovieFull){
    this.updateEvent.emit(m);
  }

  onDelete(m : MovieFull){
    this.deleteEvent.emit(m);
  }
  
}
