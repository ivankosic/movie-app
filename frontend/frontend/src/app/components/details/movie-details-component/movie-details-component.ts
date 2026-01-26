import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MovieFull } from '../../../model/movie';
import { MovieService } from '../../../services/movie/movie-service';
import { Router, RouterModule } from '@angular/router';
import { Actor, ActorFull } from '../../../model/actor';
import { Director, DirectorFull } from '../../../model/director';

@Component({
  selector: 'app-movie-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-details-component.html',
  styleUrls: ['./movie-details-component.css'],
})
export class MovieDetailsComponent {
  @Input()
  movie!: MovieFull;

  @Output()
  clickEvent = new EventEmitter<MovieFull>();

  @Output()
  actorClickEvent = new EventEmitter<Actor>();

  @Output()
  directorClickEvent = new EventEmitter<Director>();

  constructor(private service: MovieService, private router: Router) { }

  onClick(e: MovieFull) {
    this.clickEvent.emit(e);
  }

 onClickActor(a: Actor) {
    console.log('Clicked actor:', a);
    this.actorClickEvent.emit(a);
  }

  onClickDirector(d: Director) {
    console.log('Clicked director:', d);
    this.directorClickEvent.emit(d);
  }

  extractYear(releaseDate: string): string {
    return releaseDate.split('-')[0];
  }
}
