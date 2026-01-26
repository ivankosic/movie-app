import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActorListComponent } from './actor-list-component';

describe('ActorListComponent', () => {
  let component: ActorListComponent;
  let fixture: ComponentFixture<ActorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActorListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
