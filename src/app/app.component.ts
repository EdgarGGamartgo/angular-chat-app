import { Component, OnInit } from '@angular/core';
import { ChatService } from './_services/chat.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  constructor(private chatService: ChatService) {
  }

  ngOnInit(): void {
    this.chatService.postMessage('2', 'Hello', 'Sam');
    this.chatService.fetchLatestMessages('2');

  }
}