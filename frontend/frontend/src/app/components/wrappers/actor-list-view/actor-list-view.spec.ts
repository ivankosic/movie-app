import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorListView } from './actor-list-view';

describe('ActorListView', () => {
  let component: ActorListView;
  let fixture: ComponentFixture<ActorListView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorListView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorListView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
