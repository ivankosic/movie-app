import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Movie } from '../../../../model/movie';

@Component({
  selector: 'app-movie-list-component',
  imports: [],
  templateUrl: './movie-list-component.html',
  styleUrl: './movie-list-component.css',
})
export class MovieListComponent {
  
  @Input()
  data : Movie[] = [];

  @Output()
  updateEvent = new EventEmitter<Movie>();

  @Output()
  deleteEvent = new EventEmitter<Movie>();

  @Output()
  softDeleteEvent = new EventEmitter<Movie>();

  onUpdate(e : Movie){
    this.updateEvent.emit(e);
  }

  onDelete(e : Movie){
    this.deleteEvent.emit(e);
  }

  onSoftDelete(e : Movie){
    this.softDeleteEvent.emit(e);
  }
}
