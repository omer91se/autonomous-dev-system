'use client';

import { motion } from 'framer-motion';
import { FileText, Palette, Code, TestTube, Rocket, Check } from 'lucide-react';
import { Phase, Checkpoint } from '@/types';

interface PipelineVisualizationProps {
  currentPhase: Phase;
  checkpoints: Checkpoint[];
}

const phases = [
  { id: 'requirements', label: 'Requirements', icon: FileText, color: 'blue' },
  { id: 'design', label: 'Design', icon: Palette, color: 'purple' },
  { id: 'development', label: 'Development', icon: Code, color: 'green' },
  { id: 'testing', label: 'Testing', icon: TestTube, color: 'orange' },
  { id: 'deployment', label: 'Deployment', icon: Rocket, color: 'red' },
] as const;

export default function PipelineVisualization({
  currentPhase,
  checkpoints,
}: PipelineVisualizationProps) {
  const getCurrentPhaseIndex = () => {
    const index = phases.findIndex(p => p.id === currentPhase);
    return index >= 0 ? index : 0;
  };

  const currentIndex = getCurrentPhaseIndex();

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
      <h2 className="text-lg font-semibold text-white mb-6">Build Pipeline</h2>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-8 left-0 right-0 h-1 bg-gray-700" />
        <div
          className="absolute top-8 left-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 transition-all duration-1000"
          style={{ width: `${(currentIndex / (phases.length - 1)) * 100}%` }}
        />

        {/* Phase Nodes */}
        <div className="relative flex justify-between">
          {phases.map((phase, index) => {
            const isComplete = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isPending = index > currentIndex;
            const Icon = phase.icon;

            return (
              <motion.div
                key={phase.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center"
              >
                <div
                  className={`
                    w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 transition-all
                    ${isComplete ? 'bg-green-500 border-green-400' : ''}
                    ${isCurrent ? `bg-${phase.color}-500 border-${phase.color}-400 animate-pulse` : ''}
                    ${isPending ? 'bg-gray-700 border-gray-600' : ''}
                  `}
                >
                  {isComplete ? (
                    <Check className="w-8 h-8 text-white" />
                  ) : (
                    <Icon className={`w-8 h-8 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                  )}
                </div>
                <span
                  className={`text-sm font-medium ${
                    isCurrent ? 'text-white' : isPending ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  {phase.label}
                </span>
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 text-xs text-blue-400"
                  >
                    In Progress...
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
