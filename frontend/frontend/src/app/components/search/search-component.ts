import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MovieService } from '../../services/movie/movie-service';
import { SearchParams } from '../../model/movie';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-component.html',
  styleUrls: ['./search-component.css'],
})
export class SearchComponent {
  @Output() searchEvent = new EventEmitter<SearchParams>();

  searchForm: FormGroup;
  showAdvanced = false;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      searchText: [''],
      actorName: [''],
      directorName: [''],
      genreName: [''],
      releaseDateStart: [''],
      releaseDateEnd: [''],
      runningTimeMin: [''],
      runningTimeMax: ['']
    });

    // Auto-search with debounce
    this.searchForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.emitSearch();
      });
  }

  toggleAdvanced() {
    this.showAdvanced = !this.showAdvanced;
  }

  emitSearch() {
    const formValue = this.searchForm.value;
    const params: SearchParams = {
      searchText: formValue.searchText?.trim() || '',
      actorName: formValue.actorName?.trim() || null,
      directorName: formValue.directorName?.trim() || null,
      genreName: formValue.genreName?.trim() || null,
      releaseDateStart: formValue.releaseDateStart || null,
      releaseDateEnd: formValue.releaseDateEnd || null,
      runningTimeMin: formValue.runningTimeMin ? parseInt(formValue.runningTimeMin) : null,
      runningTimeMax: formValue.runningTimeMax ? parseInt(formValue.runningTimeMax) : null,
      page: 1,
      pageSize: 20
    };

    this.searchEvent.emit(params);
  }

  resetFilters() {
    this.searchForm.reset();
  }
}