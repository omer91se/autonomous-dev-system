'use client';

import { motion } from 'framer-motion';
import { AgentActivity } from '@/types';
import { differenceInSeconds, format, parseISO } from 'date-fns';
import { Bot, Clock } from 'lucide-react';

interface AgentTimelineProps {
  agents: AgentActivity[];
}

export default function AgentTimeline({ agents }: AgentTimelineProps) {
  if (agents.length === 0) {
    return (
      <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/50 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Agent Timeline</h3>
        </div>
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No agent activity yet</p>
        </div>
      </div>
    );
  }

  // Calculate timeline bounds
  const allTimes = agents.map(a => parseISO(a.startedAt).getTime());
  const completedTimes = agents
    .filter(a => a.completedAt)
    .map(a => parseISO(a.completedAt!).getTime());

  const startTime = Math.min(...allTimes);
  const endTime = completedTimes.length > 0
    ? Math.max(...completedTimes)
    : Date.now();
  const totalDuration = endTime - startTime;

  const getPositionPercent = (timestamp: string) => {
    const time = parseISO(timestamp).getTime();
    return ((time - startTime) / totalDuration) * 100;
  };

  const getDurationPercent = (agent: AgentActivity) => {
    const start = parseISO(agent.startedAt).getTime();
    const end = agent.completedAt ? parseISO(agent.completedAt).getTime() : Date.now();
    return ((end - start) / totalDuration) * 100;
  };

  const getStatusColor = (status: AgentActivity['status']) => {
    switch (status) {
      case 'running': return 'blue';
      case 'completed': return 'green';
      case 'error': return 'red';
      default: return 'gray';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/50 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">Agent Timeline</h3>
        </div>
        <div className="text-sm text-gray-400">
          Total Duration: {Math.floor(totalDuration / 1000)}s
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {agents.map((agent, index) => {
          const color = getStatusColor(agent.status);
          const startPos = getPositionPercent(agent.startedAt);
          const duration = getDurationPercent(agent);
          const startSeconds = differenceInSeconds(parseISO(agent.startedAt), new Date(startTime));

          return (
            <div key={agent.id} className="relative">
              <div className="flex items-center gap-3 mb-2">
                <Bot className={`w-4 h-4 text-${color}-400`} />
                <span className="text-sm font-medium text-white">{agent.name}</span>
                <span className="text-xs text-gray-500">
                  +{startSeconds}s
                </span>
              </div>

              {/* Timeline bar background */}
              <div className="relative h-8 bg-gray-700/30 rounded-lg overflow-hidden">
                {/* Agent activity bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${duration}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`
                    absolute top-0 h-full rounded-lg
                    bg-gradient-to-r from-${color}-500/80 to-${color}-600/80
                    border border-${color}-400/30
                  `}
                  style={{ left: `${startPos}%` }}
                >
                  {/* Progress indicator for running agents */}
                  {agent.status === 'running' && (
                    <motion.div
                      initial={{ left: 0 }}
                      animate={{ left: `${agent.progress}%` }}
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg shadow-white/50"
                    />
                  )}

                  {/* Shimmer effect */}
                  <motion.div
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  />
                </motion.div>

                {/* Time markers */}
                <div className="absolute inset-0 flex items-center px-3 text-xs font-medium text-white/90 z-10 pointer-events-none">
                  <span>
                    {format(parseISO(agent.startedAt), 'HH:mm:ss')}
                  </span>
                  {agent.completedAt && (
                    <span className="ml-auto">
                      {format(parseISO(agent.completedAt), 'HH:mm:ss')}
                    </span>
                  )}
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center justify-between mt-1">
                <span className={`text-xs px-2 py-0.5 rounded-full bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`}>
                  {agent.status}
                </span>
                {agent.status === 'running' && (
                  <span className="text-xs text-gray-400">{agent.progress}% complete</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time axis */}
      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex justify-between text-xs text-gray-400">
          <span>{format(new Date(startTime), 'HH:mm:ss')}</span>
          <span>Now</span>
        </div>
      </div>
    </div>
  );
}
