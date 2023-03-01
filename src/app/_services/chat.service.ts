import { Injectable } from '@angular/core';
import { Apollo, gql } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';
import { ChatMessage } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  public messages: BehaviorSubject<ChatMessage[]> = new BehaviorSubject([] as ChatMessage[]);

  constructor(private apollo: Apollo) { }

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
      .valueChanges.subscribe(({ data, loading, error }) => {
        const { fetchLatestMessages } = data as { fetchLatestMessages: ChatMessage[] } || {};

        if (fetchLatestMessages?.length) {
          this.messages.next(fetchLatestMessages)
        }
      });
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
        const { postMessage, errors } = data as { postMessage: ChatMessage, errors: { extensions: { code: number; } }[] } || {};

        if (postMessage?.userId) this.messages.next([ ...this.messages.getValue(), postMessage ])
        if (errors?.[0]?.extensions?.code) {
          this.messages.next([ ...this.messages.getValue(), {
            text,
            userId,
            datetime: new Date().toISOString()
          }])
        }
      },
      error: (e) => {},
      complete: () => {} 
    })
  }
}
