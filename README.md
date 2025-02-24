# Screenman
"Aye Screenman" - A Realtime Transcriber and Web Researcher for Podcasters and other Live Audio Hosts to have relevant information at a glance.

## Inspiration

Inspired by The Joe Budden podcast's production approach, where a behind-the-scenes team member researches topics in real-time to enrich discussions. As a podcast host myself, I recognized how valuable this role is for maintaining engaging, fact-based conversations. ScreenMan automates this support function, allowing hosts to focus on the conversation while maintaining accuracy and flow.

This could further be applied to live streamers and live audio hosts on sports and radio shows.

## What it does

ScreenMan is a web application that serves as an AI-powered research assistant for live conversations. Its key features include:

- Real-time speech transcription and context analysis
- Jeopardy-style display board showing relevant facts and media
- Topic transition suggestions

## How we built it

Built on a modern tech stack combining real-time audio processing with AI services:

- Python server for audio buffering and OpenAI Whisper integration
- NextJS full-stack application managing the frontend and backend pipelines
- Multi-stage AI pipeline for:
    - Speech transcription
    - Claim detection and search query optimization
    - Web research and fact verification
    - Context-aware content staging
- ElevenLabs text-to-speech for prompting narration
- PostHog for analytics and LLM generation tracking

## How to Launch the Backend Whisper Server

1. **Dependencies**:

- Install required dependences :

    ```bash
    python3 -m venv venv && source venv/bin/activate
    <!-- pip install -r requirements.txt -->

    # Whisper streaming required dependencies
    pip install librosa soundfile

    # Whisper streaming web required dependencies
    pip install fastapi ffmpeg-python openai 
    ```
- Install at least one whisper backend among:

    ```
   whisper
   whisper-timestamped
   faster-whisper (faster backend on NVIDIA GPU)
   mlx-whisper (faster backend on Apple Silicon)
   ```
- Optionnal dependencies

    ```
    # If you want to use VAC (Voice Activity Controller). Useful for preventing hallucinations
    torch
   
    # If you choose sentences as buffer trimming strategy
    mosestokenizer
    wtpsplit
    tokenize_uk # If you work with Ukrainian text

    # If you want to run the server using uvicorn (recommended)
    uvicorn

    # If you want to use diarization
    diart
    ```


3. **Run the FastAPI Server**:

    ```bash
     source venv/bin/activate &&  python whisper_fastapi_online_server.py --host 0.0.0.0 --port 8000
    ```

    - `--host` and `--port` let you specify the server’s IP/port. 
    - `-min-chunk-size` sets the minimum chunk size for audio processing. Make sure this value aligns with the chunk size selected in the frontend. If not aligned, the system will work but may unnecessarily over-process audio data.
    - For a full list of configurable options, run `python whisper_fastapi_online_server.py -h`
    - `--transcription`, default to True. Change to False if you want to run only diarization
    - `--diarization`, default to False, let you choose whether or not you want to run diarization in parallel
    - For other parameters, look at [whisper streaming](https://github.com/ufal/whisper_streaming) readme.

4. **Open the Provided HTML**:

    - By default, the server root endpoint `/` serves a simple `live_transcription.html` page.  
    - Open your browser at `http://localhost:8000` (or replace `localhost` and `8000` with whatever you specified).  
    - The page uses vanilla JavaScript and the WebSocket API to capture your microphone and stream audio to the server in real time.


## Future Plans

- Speaker diarization for multi-person conversations
- Fine-tuned models to replace prompt engineering
- Local speech-to-text processing for improved latency and cost efficiency
- Production-ready online deployment for web app and servers

## Acknowledgments

The backend of this project is supported by the foundational work of the Whisper Streaming project and the Whisper Online server backed. We extend our gratitude to the original authors for their contributions.
