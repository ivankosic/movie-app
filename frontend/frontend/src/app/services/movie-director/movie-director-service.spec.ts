import { TestBed } from '@angular/core/testing';

import { MovieDirectorService } from './movie-director-service';

describe('MovieDirectorService', () => {
  let service: MovieDirectorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieDirectorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
