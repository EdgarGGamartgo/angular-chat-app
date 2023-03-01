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

  constructor(
    private apollo: Apollo,
    private toastr: ToastrService
  ) { }

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
          const { fetchMoreMessages, errors } = data as { fetchMoreMessages: ChatMessage[]; errors: { extensions: { code: number; } }[] } || {};

          if (fetchMoreMessages?.length) {
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
          } else if (errors?.[0]?.extensions?.code) {
            this.toastr.error("Couldn't load message, please retry.");
          }
        },
        error: () => {
          this.toastr.error("Couldn't load message, please retry.");
        },
        complete: () => {} 
      })
  }

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
          const { fetchLatestMessages, errors } = data as { fetchLatestMessages: ChatMessage[]; errors: { extensions: { code: number; } }[] } || {};

          if (fetchLatestMessages?.length) {
            this.messages.next([
              ...this.messages.getValue(),
              ...fetchLatestMessages
            ])
          } else if (errors?.[0]?.extensions?.code) {
            this.toastr.error("Couldn't load message, please retry.");
          }
        },
        error: () => {
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

        if (postMessage?.userId) this.messages.next([ ...this.messages.getValue(), postMessage ])
        else if (errors?.[0]?.extensions?.code) {
          this.messages.next([ ...this.messages.getValue(), {
            text,
            userId,
            datetime: new Date().toISOString()
          }])
        }
      },
      error: () => {
        this.messages.next([ ...this.messages.getValue(), {
          text,
          userId,
          datetime: new Date().toISOString()
        }])
      },
      complete: () => {} 
    })
  }
}
