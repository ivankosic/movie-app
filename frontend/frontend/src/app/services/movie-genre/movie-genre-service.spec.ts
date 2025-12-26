import { TestBed } from '@angular/core/testing';

import { MovieGenreService } from './movie-genre-service';

describe('MovieGenreService', () => {
  let service: MovieGenreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieGenreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
