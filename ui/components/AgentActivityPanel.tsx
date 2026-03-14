'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Activity, Check, X, Loader2, ChevronDown, ChevronUp, Clock, Cpu } from 'lucide-react';
import { AgentActivity } from '@/types';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { useState } from 'react';

interface AgentActivityPanelProps {
  agents: AgentActivity[];
}

export default function AgentActivityPanel({ agents }: AgentActivityPanelProps) {
  const [expandedAgents, setExpandedAgents] = useState<Set<string>>(new Set());

  const toggleExpand = (agentId: string) => {
    setExpandedAgents(prev => {
      const next = new Set(prev);
      if (next.has(agentId)) {
        next.delete(agentId);
      } else {
        next.add(agentId);
      }
      return next;
    });
  };

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
      default: return Bot;
    }
  };

  const getStatusText = (status: AgentActivity['status']) => {
    switch (status) {
      case 'running': return 'Running';
      case 'completed': return 'Completed';
      case 'error': return 'Error';
      default: return 'Idle';
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
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <div className="wood-card p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 status-card-green rounded-xl">
            <Activity className="w-5 h-5 text-green-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-900">Agent Activity</h2>
            <p className="text-xs text-amber-700 font-semibold">{agents.length} agent{agents.length !== 1 ? 's' : ''} {agents.filter(a => a.status === 'running').length > 0 ? 'active' : 'total'}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="badge-glow-green">
            {agents.filter(a => a.status === 'running').length} Active
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {agents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 wood-card"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Bot className="w-20 h-20 text-amber-400 mx-auto mb-4" />
              </motion.div>
              <p className="text-lg font-bold text-amber-900 mb-2">No active agents</p>
              <p className="text-sm text-amber-700">Agents will appear when a build starts</p>
            </motion.div>
          ) : (
            agents.map((agent, index) => {
              const StatusIcon = getStatusIcon(agent.status);
              const color = getStatusColor(agent.status);
              const isExpanded = expandedAgents.has(agent.id);
              const uptime = calculateUptime(agent.startedAt, agent.completedAt);

              return (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`status-card-${color} rounded-xl overflow-hidden`}
                >
                  {/* Agent Header */}
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <motion.div
                          animate={agent.status === 'running' ? {
                            rotate: 360,
                          } : {}}
                          transition={{
                            duration: 2,
                            repeat: agent.status === 'running' ? Infinity : 0,
                            ease: "linear"
                          }}
                          className={`p-2 rounded-xl bg-white/60`}
                        >
                          <Bot className={`w-5 h-5 text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : color === 'red' ? 'red' : 'gray'}-700`} />
                        </motion.div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-amber-900 truncate text-sm">{agent.name}</h3>
                            <span className="badge-nature text-xs">
                              {agent.type}
                            </span>
                          </div>
                          <p className="text-xs text-amber-700 truncate">{agent.currentTask}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`flex items-center gap-1.5 badge-nature`}>
                          <StatusIcon className={`w-3.5 h-3.5 text-${color === 'blue' ? 'blue' : color === 'green' ? 'green' : color === 'red' ? 'red' : 'gray'}-700 ${agent.status === 'running' ? 'animate-spin' : ''}`} />
                          <span className="text-xs">{getStatusText(agent.status)}</span>
                        </div>
                        <button
                          onClick={() => toggleExpand(agent.id)}
                          className="p-1.5 hover:bg-white/60 rounded-lg transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-amber-700" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-amber-700" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar for Running Agents */}
                    {agent.status === 'running' && (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-amber-700 font-bold uppercase tracking-wide">Progress</span>
                          <span className="font-bold text-green-700 text-lg">{agent.progress}%</span>
                        </div>
                        <div className="nature-progress-bar">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${agent.progress}%` }}
                            transition={{ duration: 0.5 }}
                            className="nature-progress-fill"
                            style={{ width: `${agent.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {agent.error && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 p-4 status-card-red"
                      >
                        <div className="flex items-start gap-2">
                          <X className="w-4 h-4 text-red-700 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700 flex-1">{agent.error}</p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Expanded Details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t-2 border-white/40"
                      >
                        <div className="p-5 space-y-3 bg-white/40">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="wood-card p-3">
                              <div className="flex items-center gap-2 text-amber-700 mb-2">
                                <Clock className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-wide">Started</span>
                              </div>
                              <p className="text-sm text-amber-900 font-semibold">
                                {formatDistanceToNow(new Date(agent.startedAt), { addSuffix: true })}
                              </p>
                            </div>
                            <div className="wood-card p-3">
                              <div className="flex items-center gap-2 text-amber-700 mb-2">
                                <Cpu className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-wide">Duration</span>
                              </div>
                              <p className="text-sm text-amber-900 font-semibold">
                                {formatDuration(uptime)}
                              </p>
                            </div>
                          </div>

                          {agent.completedAt && (
                            <div className="wood-card p-3">
                              <div className="flex items-center gap-2 text-green-700 mb-2">
                                <Check className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold uppercase tracking-wide">Completed</span>
                              </div>
                              <p className="text-sm text-green-900 font-semibold">
                                {formatDistanceToNow(new Date(agent.completedAt), { addSuffix: true })}
                              </p>
                            </div>
                          )}

                          {agent.status === 'running' && (
                            <div className="wood-card p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs text-amber-700 font-bold uppercase tracking-wide">Est. Completion</span>
                                <span className="text-sm font-bold text-green-700">
                                  {agent.progress < 100 && agent.progress > 0
                                    ? `~${Math.round(((100 - agent.progress) / agent.progress) * uptime)}s`
                                    : 'Calculating...'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
