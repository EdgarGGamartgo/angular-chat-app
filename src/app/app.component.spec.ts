import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ToastrModule } from 'ngx-toastr';
import { AppComponent } from './app.component';
import { GraphQLModule } from './graphql.module';
import { ChatService } from './_services/chat.service';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        NgxSpinnerModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule,
        BrowserModule,
        NgbModule,
        RouterTestingModule,
        GraphQLModule,
        HttpClientModule,
        ToastrModule.forRoot(),
      ],
      declarations: [
        AppComponent
      ],
      providers: [
        ChatService,
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have initial data`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.userId.getRawValue()).toEqual('');
    expect(app.users).toEqual(['Sam', 'Russell', 'Joyse']);
    expect(app.channels).toEqual([
      {
        label: 'General Channel',
        id: '1'
      },
      {
        label: 'Technology Channel',
        id: '2'
      },
      {
        label: 'LGTM Channel',
        id: '3'
      },
    ]);
    expect(app.channelId.getRawValue()).toEqual('');
    expect(app.text.getRawValue()).toEqual('');
    expect(app.activeUsers).toEqual([]);
    expect(app.formatMsgTime('2023-03-02T01:08:42.961283Z')).toEqual('Mar 1, 19:08');
    expect(app.chatService.messages.getValue()).toEqual([]);
    expect(app.chatService.loading.getValue()).toEqual(false);
  });

  it('should render title', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.title')?.textContent).toContain('1 day chat App');
  });

  it('should render subtitle', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#subtitle')?.textContent).toContain('All messages will be deleted at every 00:00 UTC');
  });

  it('should render choose your user', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#user-label')?.textContent).toContain('1. Choose your user');
  });

  it('should render choose your channel', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#channel-label')?.textContent).toContain('2. Choose your Channel');
  });

  it('should render channel label', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const app = fixture.componentInstance;
    expect(compiled.querySelector('#channel-header')?.textContent).toBe(app.channelLabel);
  });
});
