import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DirectorListView } from './director-list-view';

describe('DirectorListView', () => {
  let component: DirectorListView;
  let fixture: ComponentFixture<DirectorListView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DirectorListView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DirectorListView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
