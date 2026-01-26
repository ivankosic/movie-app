import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorDetailsComponent } from './director-details-component';

describe('DirectorDetailsComponent', () => {
  let component: DirectorDetailsComponent;
  let fixture: ComponentFixture<DirectorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectorDetailsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
