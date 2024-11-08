```mermaid
graph TD
    A[ui.searchEntry] --> C[chat.addResponse]
    A --> D[interpreter.proccess]
    B[ui.micButton] --> E[audio.record]
    E --> F [audio.stopRecord]
    F --> D
```
