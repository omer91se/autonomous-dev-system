'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  ArrowRight,
  CheckCircle2,
  Clock,
  Loader2,
  FileText,
  Database,
  Palette,
  Code,
  TestTube,
  Rocket,
  TrendingUp,
  X
} from 'lucide-react';
import { AgentActivity } from '@/types';

interface WorkflowNode {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  inputs?: string[];
  outputs?: string[];
  dependencies?: string[];
}

interface WorkflowVisualizationProps {
  agents: AgentActivity[];
  workflow?: 'build' | 'improve' | 'market';
}

const WORKFLOWS = {
  build: [
    {
      id: 'ceo',
      name: 'CEO Agent',
      type: 'ceo',
      inputs: ['User Idea'],
      outputs: ['business-plan.json'],
      dependencies: []
    },
    {
      id: 'pm',
      name: 'PM Agent',
      type: 'pm',
      inputs: ['business-plan.json'],
      outputs: ['product-spec.json'],
      dependencies: ['ceo']
    },
    {
      id: 'designer',
      name: 'Designer',
      type: 'designer',
      inputs: ['product-spec.json'],
      outputs: ['design-system.json', 'mockups/'],
      dependencies: ['pm']
    },
    {
      id: 'architect',
      name: 'Architect',
      type: 'architect',
      inputs: ['product-spec.json'],
      outputs: ['architecture.json', 'api-contracts.yaml'],
      dependencies: ['pm']
    },
    {
      id: 'backend',
      name: 'Backend Dev',
      type: 'backend',
      inputs: ['architecture.json', 'api-contracts.yaml'],
      outputs: ['Backend Code'],
      dependencies: ['architect']
    },
    {
      id: 'frontend',
      name: 'Frontend Dev',
      type: 'frontend',
      inputs: ['design-system.json', 'mockups/', 'api-contracts.yaml'],
      outputs: ['Frontend Code'],
      dependencies: ['designer', 'architect']
    },
    {
      id: 'qa',
      name: 'QA Agent',
      type: 'qa',
      inputs: ['Complete Application'],
      outputs: ['test-results.json', 'qa-report.md'],
      dependencies: ['backend', 'frontend']
    },
  ],
  improve: [
    {
      id: 'analysis',
      name: 'Analysis Agent',
      type: 'analysis',
      inputs: ['Existing Codebase'],
      outputs: ['analysis-report.json'],
      dependencies: []
    },
    {
      id: 'pm',
      name: 'PM Agent',
      type: 'pm',
      inputs: ['analysis-report.json'],
      outputs: ['improvement-spec.json'],
      dependencies: ['analysis']
    },
    {
      id: 'designer',
      name: 'Designer',
      type: 'designer',
      inputs: ['improvement-spec.json'],
      outputs: ['design-improvements.json'],
      dependencies: ['pm']
    },
    {
      id: 'architect',
      name: 'Architect',
      type: 'architect',
      inputs: ['improvement-spec.json'],
      outputs: ['architecture-improvements.json'],
      dependencies: ['pm']
    },
    {
      id: 'backend',
      name: 'Backend Dev',
      type: 'backend',
      inputs: ['architecture-improvements.json'],
      outputs: ['Updated Backend'],
      dependencies: ['architect']
    },
    {
      id: 'frontend',
      name: 'Frontend Dev',
      type: 'frontend',
      inputs: ['design-improvements.json'],
      outputs: ['Updated Frontend'],
      dependencies: ['designer']
    },
  ],
  market: [
    {
      id: 'marketing-strategist',
      name: 'Marketing Strategist',
      type: 'marketing-strategist',
      inputs: ['business-plan.json', 'product-spec.json'],
      outputs: ['marketing-strategy.json'],
      dependencies: []
    },
    {
      id: 'content',
      name: 'Content Creator',
      type: 'content',
      inputs: ['marketing-strategy.json'],
      outputs: ['marketing-content/'],
      dependencies: ['marketing-strategist']
    },
    {
      id: 'seo',
      name: 'SEO Specialist',
      type: 'seo',
      inputs: ['marketing-strategy.json'],
      outputs: ['seo-strategy.json'],
      dependencies: ['marketing-strategist']
    },
    {
      id: 'social',
      name: 'Social Media',
      type: 'social',
      inputs: ['marketing-strategy.json'],
      outputs: ['social-media-plan.json'],
      dependencies: ['marketing-strategist']
    },
    {
      id: 'email',
      name: 'Email Marketing',
      type: 'email',
      inputs: ['marketing-strategy.json'],
      outputs: ['email-campaigns/'],
      dependencies: ['marketing-strategist']
    },
  ],
};

const getAgentIcon = (type: string) => {
  switch (type) {
    case 'ceo': return TrendingUp;
    case 'pm': return FileText;
    case 'designer': return Palette;
    case 'architect': return Database;
    case 'backend': case 'frontend': return Code;
    case 'qa': return TestTube;
    case 'marketing-strategist': case 'content': case 'seo': case 'social': case 'email': return Rocket;
    default: return Bot;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'running': return 'blue';
    case 'completed': return 'green';
    case 'error': return 'red';
    default: return 'gray';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'running': return Loader2;
    case 'completed': return CheckCircle2;
    case 'error': return X;
    default: return Clock;
  }
};

export default function WorkflowVisualization({ agents, workflow = 'build' }: WorkflowVisualizationProps) {
  const workflowNodes = WORKFLOWS[workflow] || WORKFLOWS.build;

  // Map agent activities to workflow nodes
  const nodesWithStatus = workflowNodes.map(node => {
    const agent = agents.find(a =>
      a.type === node.type ||
      a.name.toLowerCase().includes(node.name.toLowerCase())
    );

    return {
      ...node,
      status: agent?.status || 'pending',
      agent,
    };
  });

  // Calculate layout - group by dependencies
  const layers: typeof nodesWithStatus[][] = [];
  const processed = new Set<string>();

  const addToLayer = (nodeId: string, layerIndex: number) => {
    if (processed.has(nodeId)) return;

    const node = nodesWithStatus.find(n => n.id === nodeId);
    if (!node) return;

    // Ensure layer exists
    while (layers.length <= layerIndex) {
      layers.push([]);
    }

    layers[layerIndex].push(node);
    processed.add(nodeId);
  };

  // First pass: nodes with no dependencies
  nodesWithStatus.forEach(node => {
    if (!node.dependencies || node.dependencies.length === 0) {
      addToLayer(node.id, 0);
    }
  });

  // Second pass: nodes with dependencies
  let currentLayer = 1;
  while (processed.size < nodesWithStatus.length && currentLayer < 10) {
    nodesWithStatus.forEach(node => {
      if (processed.has(node.id)) return;

      const allDepsProcessed = node.dependencies?.every(dep => processed.has(dep));
      if (allDepsProcessed) {
        addToLayer(node.id, currentLayer);
      }
    });
    currentLayer++;
  }

  return (
    <div className="wood-card p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 status-card-purple rounded-xl">
            <Rocket className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-amber-900">Workflow Pipeline</h2>
            <p className="text-xs text-amber-700 font-semibold capitalize">{workflow} Workflow</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-gray-500" />
            <span className="text-gray-700 font-semibold">Pending</span>
          </div>
          <div className="flex items-center gap-1">
            <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />
            <span className="text-blue-700 font-semibold">Running</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-green-500" />
            <span className="text-green-700 font-semibold">Done</span>
          </div>
        </div>
      </div>

      {/* Workflow Visualization */}
      <div className="relative overflow-x-auto">
        <div className="flex flex-col gap-8 min-w-max p-4">
          <AnimatePresence mode="popLayout">
            {layers.map((layer, layerIndex) => (
              <div key={layerIndex} className="flex items-start gap-4">
                {/* Layer indicator */}
                <div className="flex flex-col items-center justify-center w-12 flex-shrink-0">
                  <div className="badge-nature text-xs">
                    {layerIndex === 0 ? 'Start' : `Stage ${layerIndex}`}
                  </div>
                </div>

                {/* Nodes in this layer */}
                <div className="flex flex-wrap gap-4 flex-1">
                  {layer.map((node, nodeIndex) => {
                    const StatusIcon = getStatusIcon(node.status);
                    const AgentIcon = getAgentIcon(node.type);
                    const color = getStatusColor(node.status);

                    return (
                      <motion.div
                        key={node.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: layerIndex * 0.1 + nodeIndex * 0.05 }}
                        className="relative"
                      >
                        {/* Connection arrows to dependencies */}
                        {node.dependencies && node.dependencies.length > 0 && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                            <ArrowRight className="w-4 h-4 text-amber-400 rotate-90" />
                          </div>
                        )}

                        {/* Node card */}
                        <div className={`status-card-${color} p-4 rounded-xl w-64 relative`}>
                          {/* Status badge */}
                          <div className="absolute -top-2 -right-2">
                            <div className={`p-1.5 rounded-full ${
                              color === 'blue' ? 'bg-blue-100 border-2 border-blue-400' :
                              color === 'green' ? 'bg-green-100 border-2 border-green-400' :
                              color === 'red' ? 'bg-red-100 border-2 border-red-400' :
                              'bg-gray-100 border-2 border-gray-400'
                            }`}>
                              <StatusIcon className={`w-3 h-3 ${
                                color === 'blue' ? 'text-blue-700 animate-spin' :
                                color === 'green' ? 'text-green-700' :
                                color === 'red' ? 'text-red-700' :
                                'text-gray-700'
                              }`} />
                            </div>
                          </div>

                          {/* Agent info */}
                          <div className="flex items-start gap-3">
                            <motion.div
                              animate={node.status === 'running' ? {
                                rotate: 360,
                              } : {}}
                              transition={{
                                duration: 2,
                                repeat: node.status === 'running' ? Infinity : 0,
                                ease: "linear"
                              }}
                              className="p-2 bg-white/60 rounded-xl"
                            >
                              <AgentIcon className={`w-5 h-5 ${
                                color === 'blue' ? 'text-blue-700' :
                                color === 'green' ? 'text-green-700' :
                                color === 'red' ? 'text-red-700' :
                                'text-gray-700'
                              }`} />
                            </motion.div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-sm text-amber-900 mb-1">
                                {node.name}
                              </h3>

                              {/* Inputs */}
                              {node.inputs && node.inputs.length > 0 && (
                                <div className="mb-2">
                                  <p className="text-xs text-amber-700 font-bold mb-1">Inputs:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {node.inputs.map((input, i) => (
                                      <span key={i} className="text-xs bg-white/60 px-2 py-0.5 rounded text-amber-800">
                                        {input}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Outputs */}
                              {node.outputs && node.outputs.length > 0 && (
                                <div>
                                  <p className="text-xs text-green-700 font-bold mb-1">Outputs:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {node.outputs.map((output, i) => (
                                      <span key={i} className="text-xs bg-green-100/80 px-2 py-0.5 rounded text-green-800 font-semibold">
                                        {output}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress bar for running agents */}
                          {node.status === 'running' && node.agent && (
                            <div className="mt-3 pt-3 border-t-2 border-white/40">
                              <div className="flex justify-between items-center text-xs mb-1">
                                <span className="text-amber-700 font-bold">Progress</span>
                                <span className="font-bold text-blue-700">{node.agent.progress}%</span>
                              </div>
                              <div className="nature-progress-bar h-2">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${node.agent.progress}%` }}
                                  className="nature-progress-fill"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
