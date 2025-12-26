import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieTableViewComponent } from './movie-table-view-component';

describe('MovieTableViewComponent', () => {
  let component: MovieTableViewComponent;
  let fixture: ComponentFixture<MovieTableViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieTableViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MovieTableViewComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
