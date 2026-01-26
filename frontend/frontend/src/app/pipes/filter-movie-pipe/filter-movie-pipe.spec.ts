import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FilterMoviePipe } from './filter-movie-pipe';

describe('FilterMoviePipe', () => {
  let component: FilterMoviePipe;
  let fixture: ComponentFixture<FilterMoviePipe>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilterMoviePipe]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FilterMoviePipe);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
