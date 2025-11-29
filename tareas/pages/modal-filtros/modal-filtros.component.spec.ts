import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ModalFiltrosComponent } from './modal-filtros.component';

describe('ModalFiltrosComponent', () => {
  let component: ModalFiltrosComponent;
  let fixture: ComponentFixture<ModalFiltrosComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ModalFiltrosComponent ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalFiltrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
