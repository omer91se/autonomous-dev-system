'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Activity, Check, X, Loader2, Clock, Cpu, FileText, Code, Settings, Zap, AlertCircle, ChevronRight, BarChart3, MessageSquare, FileOutput } from 'lucide-react';
import { AgentActivity, LogEntry } from '@/types';
import { formatDistanceToNow, differenceInSeconds, format } from 'date-fns';
import { useState } from 'react';
import AgentTimeline from './AgentTimeline';
import AgentOutputs from './AgentOutputs';
import AgentCommunication from './AgentCommunication';

interface BuildTrackingProps {
  agents: AgentActivity[];
  logs: LogEntry[];
}

type ViewMode = 'details' | 'timeline' | 'outputs' | 'communication';

export default function BuildTracking({ agents, logs }: BuildTrackingProps) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('details');

  const getStatusColor = (status: AgentActivity['status']) => {
    switch (status) {
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  const getStatusIcon = (status: AgentActivity['status']) => {
    switch (status) {
      case 'running': return Loader2;
      case 'completed': return Check;
      case 'error': return X;
      default: return Clock;
    }
  };

  const getAgentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'requirements': return FileText;
      case 'design': return Settings;
      case 'coding': return Code;
      default: return Bot;
    }
  };

  const calculateUptime = (startedAt: string, completedAt?: string) => {
    const start = new Date(startedAt);
    const end = completedAt ? new Date(completedAt) : new Date();
    return differenceInSeconds(end, start);
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes < 60) return `${minutes}m ${remainingSeconds}s`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const selectedAgentData = selectedAgent ? agents.find(a => a.id === selectedAgent) : null;
  const agentLogs = logs.filter(log => log.agent === selectedAgentData?.name);

  const activeAgents = agents.filter(a => a.status === 'running');
  const completedAgents = agents.filter(a => a.status === 'completed');
  const erroredAgents = agents.filter(a => a.status === 'error');

  return (
    <div className="space-y-6">
      {/* View Mode Tabs */}
      <div className="flex gap-2 wood-card p-3">
        <button
          onClick={() => setViewMode('details')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
            ${viewMode === 'details'
              ? 'status-card-green text-green-900 shadow-lg scale-105'
              : 'text-amber-700 hover:bg-white/60 hover:scale-105'
            }
          `}
        >
          <Activity className="w-4 h-4" />
          Agent Details
        </button>
        <button
          onClick={() => setViewMode('timeline')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
            ${viewMode === 'timeline'
              ? 'status-card-green text-green-900 shadow-lg scale-105'
              : 'text-amber-700 hover:bg-white/60 hover:scale-105'
            }
          `}
        >
          <BarChart3 className="w-4 h-4" />
          Timeline
        </button>
        <button
          onClick={() => setViewMode('outputs')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
            ${viewMode === 'outputs'
              ? 'status-card-green text-green-900 shadow-lg scale-105'
              : 'text-amber-700 hover:bg-white/60 hover:scale-105'
            }
          `}
        >
          <FileOutput className="w-4 h-4" />
          Outputs
        </button>
        <button
          onClick={() => setViewMode('communication')}
          className={`
            flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all
            ${viewMode === 'communication'
              ? 'status-card-green text-green-900 shadow-lg scale-105'
              : 'text-amber-700 hover:bg-white/60 hover:scale-105'
            }
          `}
        >
          <MessageSquare className="w-4 h-4" />
          Communication
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'timeline' ? (
        <AgentTimeline agents={agents} />
      ) : viewMode === 'outputs' ? (
        <AgentOutputs agents={agents} />
      ) : viewMode === 'communication' ? (
        <AgentCommunication agents={agents} logs={logs} />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-16rem)]">
          {/* Left Panel - Agent List */}
          <div className="lg:col-span-1 flex flex-col gap-4 overflow-hidden">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3">
              <div className="status-card-blue p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Loader2 className="w-5 h-5 text-blue-700 animate-spin" />
                  <span className="text-xs text-blue-800 font-bold uppercase tracking-wide">Active</span>
                </div>
                <div className="text-3xl font-bold text-blue-900">{activeAgents.length}</div>
              </div>
              <div className="status-card-green p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-5 h-5 text-green-700" />
                  <span className="text-xs text-green-800 font-bold uppercase tracking-wide">Done</span>
                </div>
                <div className="text-3xl font-bold text-green-900">{completedAgents.length}</div>
              </div>
              <div className="status-card-red p-4">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-700" />
                  <span className="text-xs text-red-800 font-bold uppercase tracking-wide">Errors</span>
                </div>
                <div className="text-3xl font-bold text-red-900">{erroredAgents.length}</div>
              </div>
            </div>

            {/* Agent List */}
            <div className="wood-card p-5 flex-1 overflow-y-auto">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 status-card-green rounded-xl">
                  <Activity className="w-5 h-5 text-green-700" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-amber-900">All Agents</h2>
                  <span className="text-xs text-amber-700 font-semibold">{agents.length} total</span>
                </div>
              </div>

              <div className="space-y-3">
                <AnimatePresence>
                  {agents.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center py-16 wood-card"
                    >
                      <motion.div
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      >
                        <Bot className="w-20 h-20 text-amber-400 mx-auto mb-4" />
                      </motion.div>
                      <p className="text-lg font-bold text-amber-900 mb-2">No agents yet</p>
                      <p className="text-sm text-amber-700">Start a build to see autonomous agents in action</p>
                    </motion.div>
                  ) : (
                    agents.map((agent, index) => {
                      const StatusIcon = getStatusIcon(agent.status);
                      const AgentIcon = getAgentIcon(agent.type);
                      const color = getStatusColor(agent.status);
                      const isSelected = selectedAgent === agent.id;

                      return (
                        <motion.button
                          key={agent.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => setSelectedAgent(agent.id)}
                          className={`
                            w-full text-left p-4 rounded-xl transition-all
                            ${isSelected
                              ? `status-card-${color} shadow-lg scale-105`
                              : 'wood-card-hover'
                            }
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2 ${isSelected ? `status-card-${color}` : 'bg-white/60'} rounded-lg`}>
                              <AgentIcon className={`w-4 h-4 text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : color === 'red' ? 'red' : 'gray'}-700`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-amber-900 text-sm truncate">{agent.name}</h3>
                                <StatusIcon className={`w-3.5 h-3.5 text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : color === 'red' ? 'red' : 'gray'}-700 flex-shrink-0 ${agent.status === 'running' ? 'animate-spin' : ''}`} />
                              </div>
                              <p className="text-xs text-amber-700 truncate font-medium">{agent.type}</p>
                            </div>
                            <ChevronRight className={`w-4 h-4 text-amber-700 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                          </div>

                          {agent.status === 'running' && (
                            <div className="mt-3">
                              <div className="nature-progress-bar">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${agent.progress}%` }}
                                  className="nature-progress-fill"
                                  style={{ width: `${agent.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </motion.button>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Right Panel - Agent Details */}
          <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
            {selectedAgentData ? (
              <>
                {/* Agent Header */}
                <div className="wood-card p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <motion.div
                        animate={selectedAgentData.status === 'running' ? { rotate: 360 } : {}}
                        transition={{ duration: 3, repeat: selectedAgentData.status === 'running' ? Infinity : 0, ease: "linear" }}
                        className={`p-4 rounded-2xl status-card-${getStatusColor(selectedAgentData.status)}`}
                      >
                        {(() => {
                          const Icon = getAgentIcon(selectedAgentData.type);
                          const color = getStatusColor(selectedAgentData.status);
                          return <Icon className={`w-8 h-8 text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : color === 'red' ? 'red' : 'gray'}-700`} />;
                        })()}
                      </motion.div>
                      <div>
                        <h2 className="text-2xl font-bold text-amber-900 mb-3">{selectedAgentData.name}</h2>
                        <div className="flex items-center gap-3">
                          {(() => {
                            const color = getStatusColor(selectedAgentData.status);
                            return (
                              <span className={`badge-nature text-amber-900`}>
                                {selectedAgentData.type}
                              </span>
                            );
                          })()}
                          {(() => {
                            const StatusIcon = getStatusIcon(selectedAgentData.status);
                            const color = getStatusColor(selectedAgentData.status);
                            return (
                              <div className={`flex items-center gap-2 text-sm font-bold text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : color === 'red' ? 'red' : 'gray'}-700`}>
                                <StatusIcon className={`w-4 h-4 ${selectedAgentData.status === 'running' ? 'animate-spin' : ''}`} />
                                <span className="capitalize">{selectedAgentData.status}</span>
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="text-right wood-card p-4">
                      <div className="text-xs text-amber-700 mb-1 font-bold uppercase tracking-wide">Started</div>
                      <div className="text-amber-900 font-bold text-base">
                        {format(new Date(selectedAgentData.startedAt), 'HH:mm:ss')}
                      </div>
                      <div className="text-xs text-amber-600 font-medium mt-1">
                        {formatDistanceToNow(new Date(selectedAgentData.startedAt), { addSuffix: true })}
                      </div>
                    </div>
                  </div>

                  {/* Current Task */}
                  <div className="status-card-purple p-5 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-5 h-5 text-purple-700" />
                      <span className="text-sm font-bold text-purple-800 uppercase tracking-wide">Current Task</span>
                    </div>
                    <p className="text-amber-900 font-semibold text-base leading-relaxed">{selectedAgentData.currentTask}</p>
                  </div>

                  {/* Progress */}
                  {selectedAgentData.status === 'running' && (
                    <div className="space-y-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-amber-800 font-bold uppercase tracking-wide">Progress</span>
                        <span className="text-3xl font-bold text-green-700">{selectedAgentData.progress}%</span>
                      </div>
                      <div className="nature-progress-bar">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${selectedAgentData.progress}%` }}
                          className="nature-progress-fill"
                          style={{ width: `${selectedAgentData.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="status-card-blue p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-700" />
                        <span className="text-xs text-blue-800 font-bold uppercase tracking-wide">Duration</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-900">
                        {formatDuration(calculateUptime(selectedAgentData.startedAt, selectedAgentData.completedAt))}
                      </div>
                    </div>
                    <div className="status-card-purple p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Cpu className="w-4 h-4 text-purple-700" />
                        <span className="text-xs text-purple-800 font-bold uppercase tracking-wide">Rate</span>
                      </div>
                      <div className="text-2xl font-bold text-purple-900">
                        {selectedAgentData.status === 'running' && selectedAgentData.progress > 0
                          ? `${(selectedAgentData.progress / calculateUptime(selectedAgentData.startedAt)).toFixed(1)}%/s`
                          : 'N/A'}
                      </div>
                    </div>
                    <div className="status-card-green p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-green-700" />
                        <span className="text-xs text-green-800 font-bold uppercase tracking-wide">Remaining</span>
                      </div>
                      <div className="text-2xl font-bold text-green-900">
                        {selectedAgentData.status === 'running' && selectedAgentData.progress > 0 && selectedAgentData.progress < 100
                          ? formatDuration(Math.round(((100 - selectedAgentData.progress) / selectedAgentData.progress) * calculateUptime(selectedAgentData.startedAt)))
                          : selectedAgentData.status === 'completed' ? '0s' : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Error Display */}
                  {selectedAgentData.error && (
                    <div className="mt-6 status-card-red p-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-red-700 mt-0.5" />
                        <div>
                          <h4 className="font-bold text-red-800 mb-2 text-base uppercase tracking-wide">Error Occurred</h4>
                          <p className="text-sm text-red-700 leading-relaxed">{selectedAgentData.error}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agent Logs */}
                <div className="wood-card p-6 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-2 status-card-green rounded-xl">
                      <FileText className="w-5 h-5 text-green-700" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-amber-900">Activity Log</h3>
                      <span className="text-xs text-amber-700 font-semibold">{agentLogs.length} entries</span>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    <AnimatePresence>
                      {agentLogs.length === 0 ? (
                        <div className="text-center py-12 wood-card">
                          <p className="text-sm font-bold text-amber-700">No logs yet</p>
                        </div>
                      ) : (
                        agentLogs.map((log, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.02 }}
                            className={`
                              flex gap-3 p-4 rounded-xl
                              ${log.level === 'error' ? 'status-card-red' : ''}
                              ${log.level === 'warning' ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-amber-300 rounded-xl shadow-md' : ''}
                              ${log.level === 'success' ? 'status-card-green' : ''}
                              ${log.level === 'info' ? 'status-card-blue' : ''}
                            `}
                          >
                            <div className="flex-shrink-0 text-xs text-amber-800 font-bold font-mono w-16 bg-white/60 rounded-lg px-2 py-1 border border-amber-200">
                              {format(new Date(log.timestamp), 'HH:mm:ss')}
                            </div>
                            <div className={`
                              flex-shrink-0 w-2.5 h-2.5 rounded-full mt-1.5
                              ${log.level === 'error' ? 'bg-red-600' : ''}
                              ${log.level === 'warning' ? 'bg-amber-600' : ''}
                              ${log.level === 'success' ? 'bg-green-600' : ''}
                              ${log.level === 'info' ? 'bg-blue-600' : ''}
                            `} />
                            <div className="flex-1">
                              <p className={`
                                text-sm font-medium leading-relaxed
                                ${log.level === 'error' ? 'text-red-800' : ''}
                                ${log.level === 'warning' ? 'text-amber-800' : ''}
                                ${log.level === 'success' ? 'text-green-800' : ''}
                                ${log.level === 'info' ? 'text-blue-800' : 'text-amber-900'}
                              `}>
                                {log.message}
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </>
            ) : (
              <div className="wood-card p-16 flex items-center justify-center flex-1">
                <div className="text-center">
                  <motion.div
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Bot className="w-24 h-24 text-amber-400 mx-auto mb-6" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-amber-900 mb-3">No Agent Selected</h3>
                  <p className="text-amber-700 font-medium">Select an agent from the list to view detailed information</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
