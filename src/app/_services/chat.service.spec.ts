import { TestBed } from '@angular/core/testing';
import { Apollo } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { ChatService } from './chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let apollo: Apollo;
  let toastrService: ToastrService;
  let backend: ApolloTestingController;
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ApolloTestingModule],
      providers: [
        ChatService,
        { provide: ToastrService, useValue: toastrService }
      ]
    });

    toastrService = TestBed.inject(ToastrService);
    apollo = TestBed.inject(Apollo);
    backend = TestBed.inject(ApolloTestingController);
    service = TestBed.inject(ChatService);
  });

  afterEach(() => {
    backend.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
