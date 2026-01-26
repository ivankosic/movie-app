import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorDetailsView } from './actor-details-view';

describe('ActorDetailsView', () => {
  let component: ActorDetailsView;
  let fixture: ComponentFixture<ActorDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorDetailsView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorDetailsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
