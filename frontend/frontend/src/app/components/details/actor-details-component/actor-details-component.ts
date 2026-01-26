import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Actor, ActorFull } from '../../../model/actor';
import { ActorService } from '../../../services/actor/actor-service';
import { Router, RouterModule } from '@angular/router';
import { Movie } from '../../../model/movie';

@Component({
  selector: 'app-actor-details-component',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './actor-details-component.html',
  styleUrls: ['./actor-details-component.css'],
})
export class ActorDetailsComponent {
  @Input()
  actor!: ActorFull;

  @Output()
  clickEvent = new EventEmitter<Actor>();

  @Output()
  movieClickEvent = new EventEmitter<Movie>();

  constructor(private service: ActorService, private router: Router) { }

  onClick(e: Actor) {
    this.clickEvent.emit(e);
  }

  onMovieClick(e : Movie){
    this.movieClickEvent.emit(e);
  }
}
