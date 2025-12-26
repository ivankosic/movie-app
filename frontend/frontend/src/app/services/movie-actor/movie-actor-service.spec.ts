import { TestBed } from '@angular/core/testing';

import { MovieActorService } from './movie-actor-service';

describe('MovieActorService', () => {
  let service: MovieActorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MovieActorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
