"use client"
import { useState } from 'react';
import { useTranscription } from '@/hooks/useTranscription';
import { TranscriptionLine } from '@/types/transcription';

const CHUNK_SIZES = [
  { value: 500, label: '500 ms' },
  { value: 1000, label: '1000 ms' },
  { value: 2000, label: '2000 ms' },
  { value: 3000, label: '3000 ms' },
  { value: 4000, label: '4000 ms' },
  { value: 5000, label: '5000 ms' },
];

interface AgentStateProps {
  onTranscriptUpdate?: (text: string) => void;
}

export function AgentState({ onTranscriptUpdate }: AgentStateProps) {
  const [websocketUrl, setWebsocketUrl] = useState('ws://localhost:8000/asr');
  const [chunkDuration, setChunkDuration] = useState(1000);
  const [showAgenda, setShowAgenda] = useState(false);
  const { isRecording, status, lines, buffer, toggleRecording } = useTranscription();

  // Mock data for agenda and topics
  const mockData = {
    agenda: "Today's focus is on improving the speech recognition system and implementing new features.",
    currentTopic: "Speech Recognition Enhancement",
    relatedTopics: [
      { id: 1, title: "WebSocket Integration", description: "Real-time data streaming implementation" },
      { id: 2, title: "UI/UX Improvements", description: "Enhanced user interface design" },
      { id: 3, title: "Performance Optimization", description: "System response time improvement" },
    ]
  };

  const handleWebsocketUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value.trim();
    if (!url.startsWith('ws://') && !url.startsWith('wss://')) {
      return;
    }
    setWebsocketUrl(url);
  };

  const renderTranscriptionLine = (item: TranscriptionLine, idx: number) => {
    const timeInfo = item.beg && item.end ? ` ${item.beg} - ${item.end}` : '';
    let speakerLabel;

    switch (item.speaker) {
      case -2:
        speakerLabel = (
          <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full">
            Silence<span className="ml-2 text-gray-500">{timeInfo}</span>
          </span>
        );
        break;
      case -1:
        speakerLabel = (
          <span className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full flex items-center">
            <div className="w-2 h-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
            <span>{item.diff} second(s) of audio are undergoing diarization</span>
          </span>
        );
        break;
      case -3:
        speakerLabel = (
          <span className="px-3 py-1 text-sm text-gray-600 bg-blue-50 rounded-full">
            <span className="text-gray-500">{timeInfo}</span>
          </span>
        );
        break;
      default:
        speakerLabel = (
          <span className="px-3 py-1 text-sm text-blue-600 bg-blue-50 rounded-full">
            Speaker {item.speaker}<span className="ml-2 text-gray-500">{timeInfo}</span>
          </span>
        );
    }

    const textContent = item.text + (idx === lines.length - 1 && buffer ? 
      <span className="italic text-gray-400 ml-1">{buffer}</span> : '');

    // Update the main display text
    if (onTranscriptUpdate && item.text) {
      onTranscriptUpdate(item.text);
    }

    return (
      <div key={idx} className="mb-4">
        {speakerLabel}
        <div className="mt-2 pl-4 border-l-2 border-blue-50 text-gray-700">
          {textContent}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => toggleRecording(websocketUrl, chunkDuration)}
          className={`w-16 h-16 text-3xl rounded-full shadow-lg transition-all ${
            isRecording ? 'bg-red-500 text-white' : 'bg-white text-gray-700'
          } hover:scale-105 active:scale-95`}
        >
          🎙️
        </button>

        <div className="space-y-3">
          <div>
            <label htmlFor="chunkSelector" className="block text-sm text-gray-600 mb-1">
              Chunk size (ms):
            </label>
            <select
              id="chunkSelector"
              value={chunkDuration}
              onChange={(e) => setChunkDuration(Number(e.target.value))}
              className="px-2 py-1 border rounded-md bg-gray-50 text-gray-700 text-sm"
            >
              {CHUNK_SIZES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="websocketInput" className="block text-sm text-gray-600 mb-1">
              WebSocket URL:
            </label>
            <input
              id="websocketInput"
              type="text"
              value={websocketUrl}
              onChange={handleWebsocketUrlChange}
              className="w-48 px-2 py-1 border rounded-md bg-gray-50 text-gray-700 text-sm"
            />
          </div>
        </div>
      </div>
      <div className="my-2 flex gap-2">
        <button
          onClick={() => setShowAgenda(false)}
          className={`flex-1 py-2 rounded-md transition-colors ${
            !showAgenda 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Transcript
        </button>
        <button
          onClick={() => setShowAgenda(true)}
          className={`flex-1 py-2 rounded-md transition-colors ${
            showAgenda 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Conversation
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 relative">
        {/* Transcript View */}
        <div className={`space-y-4 ${showAgenda ? 'invisible' : 'visible'}`}>
          <p className="text-sm text-gray-600 mb-4">{status}</p>
          {lines.map((line, idx) => renderTranscriptionLine(line, idx))}
        </div>

        {/* Agenda View */}
        <div className={`space-y-4 ${showAgenda ? 'visible' : 'invisible'}`}>
          <div>
            <h3 className="font-semibold text-gray-800">Conversation Agenda</h3>
            <p className="text-sm text-gray-600">{mockData.agenda}</p>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800">Current Topic</h3>
            <p className="text-sm text-gray-600">{mockData.currentTopic}</p>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800">Related Topics</h3>
            <div className="space-y-2 mt-2">
              {mockData.relatedTopics.map(topic => (
                <div key={topic.id} className="p-2 bg-gray-50 rounded-md">
                  <h4 className="text-sm font-medium text-gray-800">{topic.title}</h4>
                  <p className="text-xs text-gray-600">{topic.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
