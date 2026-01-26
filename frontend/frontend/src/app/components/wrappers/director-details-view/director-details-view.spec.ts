import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorDetailsView } from './director-details-view';

describe('DirectorDetailsView', () => {
  let component: DirectorDetailsView;
  let fixture: ComponentFixture<DirectorDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorDetailsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectorDetailsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
