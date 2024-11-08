```mermaid
graph TD
    %% App
    APP[app] --> UI[ui]
    APP[app] --> CHAT[chat]
    APP[app] --> INTERPRETER[interpreter]
    APP[app] --> AUDIO[audio]
    APP[app] --> AZURE[azure]
    APP[app] --> GEMINI[gemini]

    %% UI
    UI --> SE
    UI --> D

    %% Entry
    SE[ui.searchEntry] --> B[chat.addQuestion]
    SE --> C[interpreter.proccess]

    D[ui.micButton] --> E[audio.record]
    D --> F[audio.stopRecord]

    %% Audio
    F --> G[azure.transcribe]
    G --> B
    G --> C

    %% Interpreter
    C --> H{interpreter.isCommand?}
    H -- true --> I[interpreter.command] --> J[chat.runCommand]
    H -- false --> K{interpreter.isVoiceCommand?}

    K -- true --> L[interpreter.voiceCommand] --> M[gemini.runCommand]
    K -- false --> N[gemini.response] --> O[chat.editResponse]
```
