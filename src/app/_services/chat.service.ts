import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public messages: BehaviorSubject<ChatMessage[]> = new BehaviorSubject([] as ChatMessage[]);
  public loading: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService,
  ) { }

  // Should be called only when clicking on "Read More" buttons
  fetchMoreMessages(channelId: string, messageId: string, old: boolean) {
    this.apollo
      .watchQuery({
        query: gql`
          query FetchMoreMessages($channelId: String!, $messageId: String!, $old: Boolean!) {
            fetchMoreMessages(channelId: $channelId, messageId: $messageId, old: $old) {
              messageId
              text
              datetime
              userId
            }
          }
        `,
        variables: {
          channelId,
          messageId,
          old
        }
      })
      .valueChanges.subscribe({
        next: ({ data, loading, error }) => {
          let { fetchMoreMessages, errors } = data as { fetchMoreMessages: ChatMessage[]; errors: { extensions: { code: number; } }[] } || {};

          if (fetchMoreMessages?.length) {
            // List msgs in ascening order (oldest datetime comes first, index 0). Backend is desc by default so this would be beter in the backend.
            fetchMoreMessages.slice().sort((a, b) => a.datetime.localeCompare(b.datetime))

            // Current msgs are already asc sorted so depeding on the action (fetching older or newer msgs), the fetched msgs should be merged at the end
            // or the begining of the current msgs lists to stay congruent with datetimes.
            if (old) {
              this.messages.next([
                ...fetchMoreMessages,
                ...this.messages.getValue(),
              ])
            } else {
              this.messages.next([
                ...this.messages.getValue(),
                ...fetchMoreMessages
              ])
            }
            this.loading.next(false)
          } else if (errors?.[0]?.extensions?.code) {
            this.loading.next(false)
            this.toastr.error("Couldn't load message, please retry.");
          } else {
            this.loading.next(false)
          }
        },
        error: () => {
          this.loading.next(false)
          this.toastr.error("Couldn't load message, please retry.");
        },
        complete: () => {} 
      })
  }

  // This should be called each time a user changes channel
  fetchLatestMessages(channelId: string) {
    this.apollo
      .watchQuery({
        query: gql`
          query FetchLatestMessages($channelId: String!) {
            fetchLatestMessages(channelId: $channelId) {
              messageId
              text
              datetime
              userId
            }
          }
        `,
        variables: {
          channelId
        }
      })
      .valueChanges.subscribe({
        next: ({ data, loading, error }) => {
          let { fetchLatestMessages, errors } = data as { fetchLatestMessages: ChatMessage[]; errors: { extensions: { code: number; } }[] } || {};

          if (fetchLatestMessages?.length) {
            // List msgs in ascening order (oldest datetime comes first, index 0). Backend is desc by default so this would be beter in the backend.
            fetchLatestMessages.slice().sort((a, b) => a.datetime.localeCompare(b.datetime))
            this.messages.next(fetchLatestMessages)
            this.loading.next(false)
          } else if (!fetchLatestMessages?.length && !errors?.[0]?.extensions?.code) {
            // Reset the msgs UI panel each time the length is 0.
            this.messages.next([])
            this.loading.next(false)
          } else if (errors?.[0]?.extensions?.code) {
            // Reset the msgs UI panel each time tan error occurs.
            this.messages.next([])
            this.loading.next(false)
            this.toastr.error("Couldn't load message, please retry.");
          } else {
            this.loading.next(false)
          }
        },
        error: () => {
          // Reset the msgs UI panel each time tan error occurs.
          this.loading.next(false)
          this.messages.next([])
          this.toastr.error("Couldn't load message, please retry.");
        },
        complete: () => {} 
      })
  }

  postMessage(channelId: string, text: string, userId: string) {
    this.apollo.mutate({
      mutation: gql`
        mutation PostMessage($channelId: String!, $text: String!, $userId: String!) {
          postMessage(channelId: $channelId, text: $text, userId: $userId) {
            messageId
            text
            datetime
            userId
          }
        }
      `,
      variables: {
        channelId,
        text,
        userId
      },
    }).subscribe({
      next: ({ data }) => {
        const { postMessage, errors } = data as { postMessage: ChatMessage; errors: { extensions: { code: number; } }[] } || {};

        if (postMessage?.userId) {
          this.messages.next([ ...this.messages.getValue(), postMessage ])
          this.loading.next(false)
        } else if (errors?.[0]?.extensions?.code) {
          // Unsent messages are not stored by the backend and therefore ignored by the fetching queries therefore only temporary unsent messages
          // are including in the current user session UI and will be deleted on a page reload. Persisting these unsent messages in the backend 
          // would be a better approach than trying to persist messages in the browser through localStorage for example.
          this.messages.next([ ...this.messages.getValue(), {
            text,
            userId,
            datetime: new Date().toISOString()
          }])
          this.loading.next(false)
        } else {
          this.loading.next(false)
        }
      },
      error: () => {
        this.messages.next([ ...this.messages.getValue(), {
          text,
          userId,
          datetime: new Date().toISOString()
        }])
        this.loading.next(false)
      },
      complete: () => {} 
    })
  }
}
