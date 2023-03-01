import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { pairwise, startWith } from 'rxjs';
import { ChatService } from './_services/chat.service';
import { formatTime } from './_utils';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  userId: FormControl = new FormControl('')
  users: string[] = ['Sam', 'Russell', 'Joyse']
  channels: { label: string; id: string; }[] = [
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
  ]
  channelId: FormControl = new FormControl('')
  channelLabel: string = ''
  formatMsgTime = formatTime
  text: FormControl = new FormControl('')
  activeUsers: string[] = []

  constructor(
    public chatService: ChatService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  // Messages will only be displayable once a user selects a channel or clicks on the "Read more" buttons and therefore real-time message updates are
  // not supported. The user would need to refresh the page and reselect or simply change channels and come back to see if there are any new messages.
  // Ideally we can solve this if the back end supports graphql subscriptions or with websockets otherwise with the back end as is now the only solution
  // would be to constantly poll with periodical query requests to the server to check if there are new messages. This project uses polling every 0.5secs.
  ngOnInit(): void {
    this.chatService.loading.subscribe(loading => {
      if (loading) {
        this.spinner.show()
      } else {
        this.spinner.hide()
      }
    })

    this.channelId.valueChanges.subscribe((channelId) => {
      if (channelId && this.userId.getRawValue()) {
        this.chatService.loading.next(true)
        this.chatService.fetchLatestMessages(channelId)
      }
    })

    // Persist the user text editor string
    this.text.valueChanges.subscribe((text) => {
      let sessions = JSON.parse((localStorage.getItem('sessions') || '{}') as string) || {}
      if (sessions?.[this.userId.getRawValue()]) {
        sessions[this.userId.getRawValue()].text = text
      } else {
        sessions = {
          ...sessions,
          [this.userId.getRawValue()]: {
            text
          }
        }
      }
      localStorage.setItem('sessions', JSON.stringify(sessions))
    })

    // When users reopen the page, the text editor will keep their previous text BUT in order to identify
    // which text belongs to who, a user from the user select box must be selected as well.
    // Also add an active session key to allow only one userId at a time.
    this.userId.valueChanges.pipe(startWith(null), pairwise()).subscribe(([prevUserId, userId]: [string, string]) => {
      let sessions = JSON.parse((localStorage.getItem('sessions') || '{}') as string) || {}

      if (sessions?.[userId]?.isActive && prevUserId !== userId) {
        this.toastr.warning('This user is already active, please try a diffrent user.')
        this.activeUsers = Object.entries(sessions).filter(([key, value]) => {
          if ((value as { isActive: boolean })?.isActive) {
            return true
          }
          return false
        }).map(([key, value]) => key)
        this.userId.setValue(prevUserId)
      } else {
        if (sessions?.[prevUserId]) {
          sessions[prevUserId] = {
            ...sessions[prevUserId],
            isActive: false
          }
        } else if (prevUserId) {
          sessions[prevUserId] = {
            isActive: false
          }
        }
  
        if (sessions?.[userId]) {
          sessions[userId] = {
            ...sessions[userId],
            isActive: true
          }
        } else {
          sessions[userId] = {
            isActive: true
          }
        }
  
        localStorage.setItem('sessions', JSON.stringify(sessions))
  
        if (userId && sessions?.[userId]?.text) {
          this.text.setValue(sessions?.[userId].text)
        } else {
          this.text.setValue('')
        }
      }
    })
  }

  @HostListener('window:unload', ['$event'])
  unloadHandler() {
    let sessions = JSON.parse((localStorage.getItem('sessions') || '{}') as string) || {}
    sessions[this.userId.getRawValue()].isActive = false
    localStorage.setItem('sessions', JSON.stringify(sessions))
  }

  selectChannel(channel: { label: string; id: string; }): void {
    if (this.userId.getRawValue() && channel?.id) {
      this.channelId.setValue(channel.id)
      this.channelLabel = channel.label
    }
  }

  fetchMoreMessages(old: boolean = false): void {
    this.chatService.loading.next(true)
    if (old) {
      // Find first sent msg from available messages in ascening order (oldest datetime comes first, index 0)
      const { messageId } = this.chatService.messages.getValue().find(msg => msg?.messageId) || {}
      messageId && this.chatService.fetchMoreMessages(this.channelId.getRawValue(), messageId, old)
    } else {
      // Find first sent msg from available messages in descening order (most recent datetime comes first, index 0)
      const { messageId } = this.chatService.messages
        .getValue()
        .slice()
        .sort((a, b) => b.datetime.localeCompare(a.datetime))
        .find(msg => msg?.messageId) || {}
      messageId && this.chatService.fetchMoreMessages(this.channelId.getRawValue(), messageId, old)
    }
  }

  shouldDisableOption(userId: string): boolean {
    let sessions = JSON.parse((localStorage.getItem('sessions') || '{}') as string) || {}
    return sessions?.[userId]?.isActive || this.activeUsers.includes(userId)
  }

  postMessage(): void {
    this.chatService.loading.next(true)
    this.chatService.postMessage(
      this.channelId.getRawValue(),
      this.text.getRawValue().trim(),
      this.userId.getRawValue()
    )
    this.text.setValue('')
  }
}
