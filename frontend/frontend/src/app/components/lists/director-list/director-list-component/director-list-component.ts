import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { DirectorFull } from '../../../../model/director';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SearchComponent } from '../../../search/search-component';

@Component({
  selector: 'app-director-list',
  standalone : true,
  imports: [CommonModule, SearchComponent],
  templateUrl: './director-list-component.html',
  styleUrls: ['./director-list-component.css'],
})
export class DirectorListComponent {
  @Input() directors: DirectorFull[] = [];
  @Output() viewEvent = new EventEmitter<DirectorFull>();
  @Output() updateEvent = new EventEmitter<DirectorFull>();
  @Output() deleteEvent = new EventEmitter<DirectorFull>();
  @Output() searchEvent = new EventEmitter<string>();

  constructor(private router: Router, private cdr: ChangeDetectorRef) { }

  trackById(index: number, director: DirectorFull) {
    return director?.director?._id ?? index;
  }

  onView(m: DirectorFull) {
    this.viewEvent.emit(m);
  }

  onUpdate(m: DirectorFull) {
    this.updateEvent.emit(m);
  }

  onDelete(m: DirectorFull) {
    this.deleteEvent.emit(m);
  }

  onSearch(term: string) {
    this.searchEvent.emit(term);
  }
}
