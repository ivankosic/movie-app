import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { ActorFull } from '../../../../model/actor';
import { Router } from '@angular/router';
import { SearchComponent } from '../../../search/search-component';

@Component({
  selector: 'app-actor-list',
  standalone: true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './actor-list-component.html',
  styleUrls: ['./actor-list-component.css'],
})
export class ActorListComponent {
  @Input() actors: ActorFull[] = [];
  @Output() viewEvent = new EventEmitter<ActorFull>();
  @Output() updateEvent = new EventEmitter<ActorFull>();
  @Output() deleteEvent = new EventEmitter<ActorFull>();
  @Output() searchEvent = new EventEmitter<string>();

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  // Track by _id if available, otherwise fallback to index
  trackById(index: number, actorFull: ActorFull) {
    return actorFull.actor?._id ?? index;
  }

  onView(actorFull: ActorFull) {
    if (!actorFull.actor?._id) return;
    this.viewEvent.emit(actorFull);
  }

  onUpdate(actorFull: ActorFull) {
    if (!actorFull.actor?._id) return;
    this.updateEvent.emit(actorFull);
  }

  onDelete(actorFull: ActorFull) {
    if (!actorFull.actor?._id) return;
    this.deleteEvent.emit(actorFull);
  }

  onSearch(term: string) {
    this.searchEvent.emit(term);
  }
}
