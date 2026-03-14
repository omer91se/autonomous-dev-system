'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AgentActivity, LogEntry } from '@/types';
import { MessageSquare, ArrowRight, Bot, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface AgentCommunicationProps {
  agents: AgentActivity[];
  logs: LogEntry[];
}

interface CommunicationMessage {
  id: string;
  from: string;
  to?: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'communication';
}

export default function AgentCommunication({ agents, logs }: AgentCommunicationProps) {
  // Extract communication messages from logs
  const communications: CommunicationMessage[] = logs.map((log, index) => ({
    id: `${log.timestamp}-${index}`,
    from: log.agent || 'Orchestrator',
    message: log.message,
    timestamp: log.timestamp,
    type: log.level,
  }));

  // Group by agent transitions
  const agentTransitions = agents.reduce((acc, agent, index) => {
    if (index > 0) {
      const prevAgent = agents[index - 1];
      if (prevAgent.status === 'completed' && agent.status === 'running') {
        acc.push({
          id: `transition-${index}`,
          from: prevAgent.name,
          to: agent.name,
          message: `Handoff: ${prevAgent.name} completed, ${agent.name} starting`,
          timestamp: agent.startedAt,
          type: 'communication' as const,
        });
      }
    }
    return acc;
  }, [] as CommunicationMessage[]);

  // Merge and sort all messages
  const allMessages = [...communications, ...agentTransitions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'error': return 'red';
      case 'warning': return 'yellow';
      case 'success': return 'green';
      case 'communication': return 'purple';
      default: return 'blue';
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/50 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold text-white">Agent Communication</h3>
        </div>
        <span className="text-sm text-gray-400">{allMessages.length} message{allMessages.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Communication stream */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2">
        <AnimatePresence>
          {allMessages.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm">No messages yet</p>
              <p className="text-xs text-gray-600 mt-1">Agent communication will appear here</p>
            </div>
          ) : (
            allMessages.map((msg, index) => {
              const color = getMessageColor(msg.type);
              const isHandoff = msg.type === 'communication';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className={`
                    relative
                    ${isHandoff ? 'my-4' : ''}
                  `}
                >
                  {isHandoff ? (
                    // Agent handoff message
                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <div className="flex items-center justify-center gap-3 mb-2">
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/50 rounded-lg">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">{msg.from}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-purple-400" />
                        <div className="flex items-center gap-2 px-3 py-1 bg-gray-900/50 rounded-lg">
                          <Bot className="w-4 h-4 text-purple-400" />
                          <span className="text-sm font-medium text-white">{msg.to}</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <Zap className="w-4 h-4 text-purple-400 inline-block mr-2" />
                        <span className="text-sm text-purple-300">Agent Transition</span>
                      </div>
                      <div className="text-xs text-gray-500 text-center mt-2">
                        {format(new Date(msg.timestamp), 'HH:mm:ss')}
                      </div>
                    </div>
                  ) : (
                    // Regular message
                    <div className={`
                      flex gap-3 p-3 rounded-lg border
                      bg-${color}-500/5 border-${color}-500/20
                    `}>
                      {/* Timestamp */}
                      <div className="flex-shrink-0 text-xs text-gray-500 font-mono w-16 pt-0.5">
                        {format(new Date(msg.timestamp), 'HH:mm:ss')}
                      </div>

                      {/* Agent indicator */}
                      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-${color}-500`} />

                      {/* Message content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium text-${color}-400`}>
                            {msg.from}
                          </span>
                          {msg.to && (
                            <>
                              <ArrowRight className="w-3 h-3 text-gray-500" />
                              <span className="text-xs text-gray-400">{msg.to}</span>
                            </>
                          )}
                        </div>
                        <p className={`text-sm text-${color === 'blue' ? 'gray-300' : color + '-200'} break-words`}>
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Active indicator */}
      {allMessages.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700/50 flex items-center justify-center gap-2 text-xs text-gray-500">
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-2 h-2 rounded-full bg-green-500"
          />
          <span>Live communication stream</span>
        </div>
      )}
    </div>
  );
}
