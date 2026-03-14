'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AgentActivity } from '@/types';
import { FileText, Code, CheckCircle, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface AgentOutputsProps {
  agents: AgentActivity[];
}

interface AgentOutput {
  agentId: string;
  agentName: string;
  type: string;
  file?: string;
  content?: string;
  timestamp: string;
  description: string;
}

export default function AgentOutputs({ agents }: AgentOutputsProps) {
  const [selectedOutput, setSelectedOutput] = useState<AgentOutput | null>(null);

  // Extract outputs from agents
  const outputs: AgentOutput[] = agents.flatMap(agent => {
    const agentOutputs: AgentOutput[] = [];

    // Add completion output
    if (agent.status === 'completed' && agent.completedAt) {
      agentOutputs.push({
        agentId: agent.id,
        agentName: agent.name,
        type: agent.type,
        file: agent.type === 'requirements' ? 'requirements.json' :
              agent.type === 'design' ? 'design.json' :
              agent.type === 'coding' ? 'implementation.json' : undefined,
        timestamp: agent.completedAt,
        description: `Completed ${agent.type} phase`,
      });
    }

    return agentOutputs;
  });

  const getOutputIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'requirements': return FileText;
      case 'design': return Code;
      case 'coding': return Code;
      default: return FileText;
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/50 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <h3 className="text-lg font-bold text-white">Agent Outputs</h3>
        </div>
        <span className="text-sm text-gray-400">{outputs.length} output{outputs.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
        <AnimatePresence>
          {outputs.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm">No outputs yet</p>
              <p className="text-xs text-gray-600 mt-1">Completed agents will show their outputs here</p>
            </div>
          ) : (
            outputs.map((output, index) => {
              const Icon = getOutputIcon(output.type);

              return (
                <motion.div
                  key={`${output.agentId}-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-gray-600 transition-colors cursor-pointer"
                  onClick={() => setSelectedOutput(output)}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Icon className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white text-sm truncate">{output.agentName}</h4>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                          {output.type}
                        </span>
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{output.description}</p>

                      {output.file && (
                        <div className="flex items-center gap-2 text-xs">
                          <FileText className="w-3 h-3 text-blue-400" />
                          <span className="text-blue-400 font-mono">{output.file}</span>
                          <ExternalLink className="w-3 h-3 text-gray-500" />
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {format(new Date(output.timestamp), 'HH:mm:ss')}
                        </span>
                        <button className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                          <Download className="w-3 h-3" />
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
