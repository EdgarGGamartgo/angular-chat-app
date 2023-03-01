export const POST_ERROR_MESSAGE = {
    "data": {
      "postMessage": null
    },
    "errors": [
      {
        "message": "random error happened",
        "locations": [
          {
            "line": 2,
            "column": 3
          }
        ],
        "path": [
          "postMessage"
        ],
        "extensions": {
          "code": 500
        }
      }
    ]
}

export const POST_MESSAGE = {
    "data": {
      "postMessage": {
        "messageId": "1140862808331006518",
        "text": "Hola",
        "datetime": "2023-03-01T15:58:43.83848Z",
        "userId": "Sam",
        "__typename": "Message"
      }
    }
  }