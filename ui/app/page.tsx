'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Activity } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Dashboard from '@/components/Dashboard';
import PipelineVisualization from '@/components/PipelineVisualization';
import AgentActivityPanel from '@/components/AgentActivityPanel';
import OutputPreview from '@/components/OutputPreview';
import LogStream from '@/components/LogStream';
import CheckpointModal from '@/components/CheckpointModal';
import BuildTracking from '@/components/BuildTracking';
import BuildSelector from '@/components/BuildSelector';
import WorkflowTree from '@/components/WorkflowTree';
import { ProjectState, AgentActivity, LogEntry, Checkpoint } from '@/types';

type TabType = 'overview' | 'tracking';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [projectState, setProjectState] = useState<ProjectState | null>(null);
  const [agents, setAgents] = useState<AgentActivity[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeCheckpoint, setActiveCheckpoint] = useState<Checkpoint | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedBuildId, setSelectedBuildId] = useState<string | null>(null);
  const [workflowType, setWorkflowType] = useState<'build' | 'improve' | 'market'>('build');

  // Detect workflow type based on agents
  useEffect(() => {
    if (agents.length === 0) return;

    const agentTypes = agents.map(a => a.type);

    if (agentTypes.includes('marketing-strategist') || agentTypes.includes('content') || agentTypes.includes('seo')) {
      setWorkflowType('market');
    } else if (agentTypes.includes('analysis')) {
      setWorkflowType('improve');
    } else {
      setWorkflowType('build');
    }
  }, [agents]);

  useEffect(() => {
    // Connect to WebSocket server
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
    const ws = new WebSocket(wsUrl);

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

  // Auto-switch to tracking tab when agents are active
  useEffect(() => {
    if (agents.length > 0 && agents.some(a => a.status === 'running')) {
      setActiveTab('tracking');
    }
  }, [agents]);

  // Load historical build when selected
  useEffect(() => {
    if (selectedBuildId) {
      loadHistoricalBuild(selectedBuildId);
    }
  }, [selectedBuildId]);

  const loadHistoricalBuild = async (buildId: string) => {
    try {
      const response = await fetch(`/api/builds/${buildId}`);
      const build = await response.json();

      setAgents(build.agents || []);
      setLogs(build.logs || []);

      // Switch to tracking tab to show the data
      setActiveTab('tracking');
    } catch (error) {
      console.error('Failed to load historical build:', error);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar isConnected={isConnected} />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Tabs and Build Selector */}
          <div className="flex items-center justify-between gap-4 border-b-2 border-amber-200/60 pb-0">
            <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('overview')}
              className={`
                flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all relative rounded-t-xl
                ${activeTab === 'overview'
                  ? 'text-green-900 bg-gradient-to-b from-emerald-100 to-green-100 border-2 border-b-0 border-green-300 shadow-md'
                  : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                }
              `}
            >
              <LayoutDashboard className="w-4 h-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`
                flex items-center gap-2 px-6 py-3 font-bold text-sm transition-all relative rounded-t-xl
                ${activeTab === 'tracking'
                  ? 'text-green-900 bg-gradient-to-b from-emerald-100 to-green-100 border-2 border-b-0 border-green-300 shadow-md'
                  : 'text-amber-700 hover:text-amber-900 hover:bg-amber-100/50'
                }
              `}
            >
              <Activity className="w-4 h-4" />
              Build Tracking
              {agents.filter(a => a.status === 'running').length > 0 && (
                <span className="ml-2 badge-glow-green">
                  {agents.filter(a => a.status === 'running').length}
                </span>
              )}
            </button>
            </div>

            {/* Build Selector */}
            <BuildSelector
              selectedBuildId={selectedBuildId}
              onSelectBuild={setSelectedBuildId}
            />
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' ? (
            !projectState ? (
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
            )
          ) : (
            <div className="space-y-6">
              {/* Workflow Tree */}
              <WorkflowTree agents={agents} workflow={workflowType} />

              {/* Build Tracking */}
              <BuildTracking agents={agents} logs={logs} />
            </div>
          )}
        </div>
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
