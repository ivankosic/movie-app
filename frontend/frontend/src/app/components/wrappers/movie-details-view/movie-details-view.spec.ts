import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieDetailsView } from './movie-details-view';

describe('MovieDetailsView', () => {
  let component: MovieDetailsView;
  let fixture: ComponentFixture<MovieDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieDetailsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
