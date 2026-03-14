'use client';

import { useState, useEffect } from 'react';
import Dashboard from '@/components/Dashboard';
import PipelineVisualization from '@/components/PipelineVisualization';
import AgentActivityPanel from '@/components/AgentActivityPanel';
import OutputPreview from '@/components/OutputPreview';
import LogStream from '@/components/LogStream';
import CheckpointModal from '@/components/CheckpointModal';
import { ProjectState, AgentActivity, LogEntry, Checkpoint } from '@/types';

export default function Home() {
  const [projectState, setProjectState] = useState<ProjectState | null>(null);
  const [agents, setAgents] = useState<AgentActivity[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:3001');

    ws.onopen = () => {
      console.log('Connected to orchestrator');
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case 'state_update':
          setProjectState(message.data);
          break;
        case 'agent_update':
          setAgents(prev => {
            const index = prev.findIndex(a => a.id === message.data.id);
            if (index >= 0) {
              const newAgents = [...prev];
              newAgents[index] = message.data;
              return newAgents;
            }
            return [...prev, message.data];
          });
          break;
        case 'log':
          setLogs(prev => [...prev, message.data]);
          break;
        case 'checkpoint':
          setActiveCheckpoint(message.data);
          break;
      }
    };

    ws.onclose = () => {
      console.log('Disconnected from orchestrator');
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, []);

  const handleCheckpointDecision = async (approved: boolean, feedback?: string) => {
    // Send decision to backend
    const response = await fetch('/api/checkpoint', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        checkpointId: activeCheckpoint?.id,
        approved,
        feedback
      }),
    });

    if (response.ok) {
      setActiveCheckpoint(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Autonomous Dev System</h1>
                <p className="text-xs text-gray-400">AI-Powered Application Development</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm text-gray-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {!projectState ? (
          <Dashboard onProjectStart={() => {}} />
        ) : (
          <div className="space-y-6">
            {/* Pipeline Visualization */}
            <PipelineVisualization
              currentPhase={projectState.phase}
              checkpoints={projectState.checkpoints}
            />

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Panel - Agent Activity & Logs */}
              <div className="lg:col-span-1 space-y-6">
                <AgentActivityPanel agents={agents} />
                <LogStream logs={logs} />
              </div>

              {/* Right Panel - Output Preview */}
              <div className="lg:col-span-2">
                <OutputPreview projectState={projectState} />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Checkpoint Modal */}
      {activeCheckpoint && (
        <CheckpointModal
          checkpoint={activeCheckpoint}
          onDecision={handleCheckpointDecision}
        />
      )}
    </div>
  );
}
