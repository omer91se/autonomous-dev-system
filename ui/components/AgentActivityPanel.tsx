'use client';

import { motion } from 'framer-motion';
import { Bot, Activity } from 'lucide-react';
import { AgentActivity } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface AgentActivityPanelProps {
  agents: AgentActivity[];
}

export default function AgentActivityPanel({ agents }: AgentActivityPanelProps) {
  const getStatusColor = (status: AgentActivity['status']) => {
    switch (status) {
      case 'running': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-500';
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

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-400" />
        <h2 className="text-lg font-semibold text-white">Agent Activity</h2>
      </div>

      <div className="space-y-3">
        {agents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">No active agents</p>
        ) : (
          agents.map((agent) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gray-900/50 border border-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-purple-400" />
                  <span className="font-medium text-white">{agent.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(agent.status)} ${agent.status === 'running' ? 'animate-pulse' : ''}`} />
                  <span className="text-xs text-gray-400">{getStatusText(agent.status)}</span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mb-3">{agent.currentTask}</p>

              {agent.status === 'running' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Progress</span>
                    <span>{agent.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.progress}%` }}
                      transition={{ duration: 0.5 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                    />
                  </div>
                </div>
              )}

              {agent.error && (
                <div className="mt-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded px-2 py-1">
                  {agent.error}
                </div>
              )}

              <div className="mt-2 text-xs text-gray-500">
                Started {formatDistanceToNow(new Date(agent.startedAt), { addSuffix: true })}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
