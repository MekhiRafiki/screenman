import { AgentState } from '@/components/AgentState'
import Stage from '@/components/Stage';

export default function Home() {

  return (
    <div className="flex h-screen">
      {/* Left sidebar with AgentState */}
      <div className="w-1/3 max-w-md border-r border-gray-200 p-4 bg-white overflow-y-auto">
        <AgentState />
      </div>

      {/* Main content area with Jeopardy-style display */}
      <div className="flex-1 bg-[#060CE9] flex items-center justify-center p-8">
        <div className="max-w-2xl w-full">
          <Stage />
        </div>
      </div>
    </div>
  );
}
