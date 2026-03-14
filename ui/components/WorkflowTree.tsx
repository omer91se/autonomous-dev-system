'use client';

import { motion } from 'framer-motion';
import {
  Bot, CheckCircle2, Clock, Loader2, FileText, Database,
  Palette, Code, TestTube, Rocket, TrendingUp, X, AlertCircle, ArrowDown
} from 'lucide-react';
import { AgentActivity } from '@/types';
import { useEffect, useState } from 'react';

interface WorkflowTreeProps {
  agents: AgentActivity[];
  workflow?: 'build' | 'improve' | 'market';
}

interface TreeNode {
  id: string;
  name: string;
  type: string;
  inputs: string[];
  outputs: string[];
  children: string[];
}

const WORKFLOWS = {
  build: [
    { id: 'ceo', name: 'CEO', type: 'ceo', inputs: ['User Idea'], outputs: ['business-plan.json'], children: ['pm'] },
    { id: 'pm', name: 'PM', type: 'pm', inputs: ['business-plan.json'], outputs: ['product-spec.json'], children: ['designer', 'architect'] },
    { id: 'designer', name: 'Designer', type: 'designer', inputs: ['product-spec.json'], outputs: ['design-system.json'], children: ['frontend'] },
    { id: 'architect', name: 'Architect', type: 'architect', inputs: ['product-spec.json'], outputs: ['architecture.json'], children: ['backend', 'frontend'] },
    { id: 'backend', name: 'Backend', type: 'backend', inputs: ['architecture.json'], outputs: ['Backend Code'], children: ['qa'] },
    { id: 'frontend', name: 'Frontend', type: 'frontend', inputs: ['design-system.json'], outputs: ['Frontend Code'], children: ['qa'] },
    { id: 'qa', name: 'QA', type: 'qa', inputs: ['Complete App'], outputs: ['Tests'], children: [] },
  ],
  improve: [
    { id: 'analysis', name: 'Analysis', type: 'analysis', inputs: ['Codebase'], outputs: ['analysis.json'], children: ['pm'] },
    { id: 'pm', name: 'PM', type: 'pm', inputs: ['analysis.json'], outputs: ['improvements.json'], children: ['designer', 'architect'] },
    { id: 'designer', name: 'Designer', type: 'designer', inputs: ['improvements.json'], outputs: ['design.json'], children: ['frontend'] },
    { id: 'architect', name: 'Architect', type: 'architect', inputs: ['improvements.json'], outputs: ['architecture.json'], children: ['backend'] },
    { id: 'backend', name: 'Backend', type: 'backend', inputs: ['architecture.json'], outputs: ['Updated Backend'], children: [] },
    { id: 'frontend', name: 'Frontend', type: 'frontend', inputs: ['design.json'], outputs: ['Updated Frontend'], children: [] },
  ],
  market: [
    { id: 'marketing-strategist', name: 'Strategist', type: 'marketing-strategist', inputs: ['Business Plan'], outputs: ['strategy.json'], children: ['content', 'seo', 'social', 'email'] },
    { id: 'content', name: 'Content', type: 'content', inputs: ['strategy.json'], outputs: ['content/'], children: [] },
    { id: 'seo', name: 'SEO', type: 'seo', inputs: ['strategy.json'], outputs: ['seo.json'], children: [] },
    { id: 'social', name: 'Social', type: 'social', inputs: ['strategy.json'], outputs: ['social.json'], children: [] },
    { id: 'email', name: 'Email', type: 'email', inputs: ['strategy.json'], outputs: ['emails/'], children: [] },
  ],
};

const getAgentIcon = (type: string) => {
  const icons: Record<string, any> = {
    ceo: TrendingUp, pm: FileText, designer: Palette, architect: Database,
    backend: Code, frontend: Code, qa: TestTube, analysis: AlertCircle,
    'marketing-strategist': Rocket, content: FileText, seo: TrendingUp,
    social: Rocket, email: Rocket
  };
  return icons[type] || Bot;
};

const getStatus = (node: TreeNode, agents: AgentActivity[]) => {
  const agent = agents.find(a => a.type === node.type || a.name.toLowerCase().includes(node.name.toLowerCase()));
  return agent?.status || 'pending';
};

const getAgent = (node: TreeNode, agents: AgentActivity[]) => {
  return agents.find(a => a.type === node.type || a.name.toLowerCase().includes(node.name.toLowerCase()));
};

function AgentCard({ node, agents, index }: { node: TreeNode; agents: AgentActivity[]; index: number }) {
  const status = getStatus(node, agents);
  const agent = getAgent(node, agents);
  const Icon = getAgentIcon(node.type);

  const colors = {
    pending: { bg: 'bg-gray-100', border: 'border-gray-400', text: 'text-gray-900', icon: 'text-gray-700' },
    running: { bg: 'bg-blue-100', border: 'border-blue-500', text: 'text-blue-900', icon: 'text-blue-700' },
    completed: { bg: 'bg-green-100', border: 'border-green-500', text: 'text-green-900', icon: 'text-green-700' },
    error: { bg: 'bg-red-100', border: 'border-red-500', text: 'text-red-900', icon: 'text-red-700' },
  };

  const color = colors[status as keyof typeof colors];
  const StatusIcon = status === 'running' ? Loader2 : status === 'completed' ? CheckCircle2 : status === 'error' ? X : Clock;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {/* Status Badge */}
      <div className="absolute -top-2 -right-2 z-10">
        <div className={`p-1.5 rounded-full ${color.bg} border-2 ${color.border} shadow-lg`}>
          <StatusIcon className={`w-3.5 h-3.5 ${color.icon} ${status === 'running' ? 'animate-spin' : ''}`} />
        </div>
      </div>

      {/* Card */}
      <div className={`${color.bg} ${color.border} border-2 rounded-xl p-3 shadow-lg w-48`}>
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={status === 'running' ? { rotate: 360 } : {}}
            transition={{ duration: 3, repeat: status === 'running' ? Infinity : 0, ease: 'linear' }}
            className={`p-1.5 rounded-lg ${color.bg} border ${color.border}`}
          >
            <Icon className={`w-4 h-4 ${color.icon}`} />
          </motion.div>
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold text-sm ${color.text} truncate`}>{node.name}</h3>
          </div>
        </div>

        {/* Inputs/Outputs */}
        <div className="space-y-1.5">
          {node.inputs[0] && (
            <div className="text-xs bg-amber-100 border border-amber-300 px-2 py-1 rounded text-amber-900 truncate">
              📥 {node.inputs[0]}
            </div>
          )}
          {node.outputs[0] && (
            <div className="text-xs bg-green-100 border border-green-300 px-2 py-1 rounded text-green-900 truncate font-semibold">
              📤 {node.outputs[0]}
            </div>
          )}
        </div>

        {/* Progress */}
        {status === 'running' && agent && (
          <div className="mt-2 pt-2 border-t border-blue-300">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-blue-900">Progress</span>
              <span className="text-xs font-bold text-blue-900">{agent.progress}%</span>
            </div>
            <div className="h-1.5 bg-blue-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${agent.progress}%` }}
                className="h-full bg-blue-600"
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default function WorkflowTree({ agents, workflow = 'build' }: WorkflowTreeProps) {
  const nodes = WORKFLOWS[workflow];
  const [positions, setPositions] = useState<Map<string, { x: number; y: number }>>(new Map());

  useEffect(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const levels: string[][] = [];
    const visited = new Set<string>();
    const queue: Array<{ id: string; level: number }> = [{ id: nodes[0].id, level: 0 }];

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);
      if (!levels[level]) levels[level] = [];
      levels[level].push(id);
      const node = nodeMap.get(id);
      node?.children.forEach(childId => {
        if (!visited.has(childId)) queue.push({ id: childId, level: level + 1 });
      });
    }

    const newPositions = new Map<string, { x: number; y: number }>();
    const cardWidth = 200;
    const levelHeight = 140;

    levels.forEach((levelNodes, level) => {
      levelNodes.forEach((nodeId, index) => {
        const x = (index - (levelNodes.length - 1) / 2) * cardWidth;
        const y = level * levelHeight;
        newPositions.set(nodeId, { x, y });
      });
    });

    setPositions(newPositions);
  }, [nodes]);

  return (
    <div className="wood-card p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl border-2 border-purple-300">
            <Rocket className="w-5 h-5 text-purple-700" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-amber-900">Workflow Pipeline</h2>
            <p className="text-xs text-amber-700 font-semibold capitalize">{workflow}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 border border-gray-300 rounded-lg">
            <Clock className="w-3 h-3 text-gray-600" />
            <span className="font-semibold text-gray-700">Pending</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-100 border border-blue-300 rounded-lg">
            <Loader2 className="w-3 h-3 text-blue-600 animate-spin" />
            <span className="font-semibold text-blue-700">Running</span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-100 border border-green-300 rounded-lg">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span className="font-semibold text-green-700">Done</span>
          </div>
        </div>
      </div>

      {/* Tree Canvas */}
      <div className="relative overflow-x-auto bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border-2 border-amber-200">
        <div className="relative mx-auto" style={{ width: '900px', minHeight: '700px' }}>
          {/* Connections */}
          <svg className="absolute inset-0 pointer-events-none" width="100%" height="100%">
            {nodes.map(node => {
              const fromPos = positions.get(node.id);
              if (!fromPos) return null;

              return node.children.map(childId => {
                const toPos = positions.get(childId);
                if (!toPos) return null;

                const childNode = nodes.find(n => n.id === childId);
                const childStatus = childNode ? getStatus(childNode, agents) : 'pending';

                const color = childStatus === 'completed' ? '#10b981' :
                             childStatus === 'running' ? '#3b82f6' : '#9ca3af';

                const x1 = fromPos.x + 450;
                const y1 = fromPos.y + 70;
                const x2 = toPos.x + 450;
                const y2 = toPos.y + 20;

                return (
                  <g key={`${node.id}-${childId}`}>
                    <motion.line
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5 }}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={color}
                      strokeWidth="3"
                      strokeDasharray={childStatus === 'running' ? '5,5' : '0'}
                    />
                    <motion.circle
                      initial={{ r: 0 }}
                      animate={{ r: 4 }}
                      transition={{ delay: 0.5 }}
                      cx={x2}
                      cy={y2}
                      r="4"
                      fill={color}
                    />
                  </g>
                );
              });
            })}
          </svg>

          {/* Agent Cards */}
          {nodes.map((node, index) => {
            const pos = positions.get(node.id);
            if (!pos) return null;

            return (
              <div
                key={node.id}
                className="absolute"
                style={{
                  left: `${pos.x + 450}px`,
                  top: `${pos.y + 50}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <AgentCard node={node} agents={agents} index={index} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
