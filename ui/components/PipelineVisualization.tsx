'use client';

import { motion } from 'framer-motion';
import { FileText, Palette, Code, TestTube, Rocket, Check, Clock, Zap } from 'lucide-react';
import { Phase, Checkpoint } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface PipelineVisualizationProps {
  currentPhase: Phase;
  checkpoints: Checkpoint[];
}

const phases = [
  {
    id: 'requirements',
    label: 'Requirements',
    icon: FileText,
    color: 'blue',
    description: 'Analyzing requirements and generating specifications'
  },
  {
    id: 'design',
    label: 'Design',
    icon: Palette,
    color: 'purple',
    description: 'Creating architecture and database schema'
  },
  {
    id: 'development',
    label: 'Development',
    icon: Code,
    color: 'green',
    description: 'Generating full-stack application code'
  },
  {
    id: 'testing',
    label: 'Testing',
    icon: TestTube,
    color: 'orange',
    description: 'Running tests and quality checks'
  },
  {
    id: 'deployment',
    label: 'Deployment',
    icon: Rocket,
    color: 'red',
    description: 'Deploying to production environment'
  },
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
  const currentPhaseData = phases[currentIndex];
  const completedPhases = currentIndex;
  const totalPhases = phases.length;
  const overallProgress = Math.round((completedPhases / totalPhases) * 100);

  return (
    <div className="bg-gradient-to-br from-gray-800/80 via-gray-800/50 to-gray-900/80 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 shadow-2xl">
      {/* Header with Stats */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white mb-1">Build Pipeline</h2>
          <p className="text-sm text-gray-400">{currentPhaseData.description}</p>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-3xl font-bold text-white">{overallProgress}%</div>
            <div className="text-xs text-gray-400">Overall Progress</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-400">{completedPhases}/{totalPhases}</div>
            <div className="text-xs text-gray-400">Phases Complete</div>
          </div>
        </div>
      </div>

      {/* Overall Progress Bar */}
      <div className="mb-8">
        <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 relative"
          >
            <motion.div
              animate={{ x: ['-100%', '100%'] }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />
          </motion.div>
        </div>
      </div>

      {/* Phase Timeline */}
      <div className="relative">
        {/* Connection Line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(currentIndex / (phases.length - 1)) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="absolute top-8 left-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"
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
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.15, type: "spring" }}
                className="flex flex-col items-center relative"
                style={{ flex: 1 }}
              >
                {/* Node Circle */}
                <motion.div
                  animate={isCurrent ? {
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 0 0 rgba(59, 130, 246, 0.7)',
                      '0 0 0 10px rgba(59, 130, 246, 0)',
                      '0 0 0 0 rgba(59, 130, 246, 0)'
                    ]
                  } : {}}
                  transition={isCurrent ? { repeat: Infinity, duration: 2 } : {}}
                  className={`
                    w-16 h-16 rounded-full border-4 flex items-center justify-center mb-3 transition-all relative z-10
                    ${isComplete ? 'bg-gradient-to-br from-green-500 to-green-600 border-green-400 shadow-lg shadow-green-500/50' : ''}
                    ${isCurrent ? `bg-gradient-to-br from-${phase.color}-500 to-${phase.color}-600 border-${phase.color}-400 shadow-xl shadow-${phase.color}-500/50` : ''}
                    ${isPending ? 'bg-gray-800 border-gray-600' : ''}
                  `}
                >
                  {isComplete ? (
                    <Check className="w-8 h-8 text-white drop-shadow-lg" strokeWidth={3} />
                  ) : isCurrent ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Icon className="w-8 h-8 text-white drop-shadow-lg" />
                    </motion.div>
                  ) : (
                    <Icon className="w-8 h-8 text-gray-400" />
                  )}
                </motion.div>

                {/* Phase Label */}
                <span
                  className={`text-sm font-semibold mb-1 ${
                    isCurrent ? 'text-white' : isPending ? 'text-gray-500' : 'text-gray-300'
                  }`}
                >
                  {phase.label}
                </span>

                {/* Status Indicator */}
                {isCurrent && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-500/20 border border-blue-400/30 rounded-full"
                  >
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span className="text-xs font-medium text-blue-400">Active</span>
                  </motion.div>
                )}

                {isComplete && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-1 text-xs text-green-400"
                  >
                    <Check className="w-3 h-3" />
                    <span>Done</span>
                  </motion.div>
                )}

                {isPending && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Pending</span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Checkpoints Section */}
      {checkpoints.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 pt-6 border-t border-gray-700/50"
        >
          <h3 className="text-sm font-semibold text-gray-400 mb-3">Review Checkpoints</h3>
          <div className="space-y-2">
            {checkpoints.map((checkpoint, index) => (
              <motion.div
                key={checkpoint.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className={`
                  flex items-center justify-between px-4 py-2 rounded-lg border
                  ${checkpoint.status === 'approved' ? 'bg-green-500/10 border-green-500/30' : ''}
                  ${checkpoint.status === 'rejected' ? 'bg-red-500/10 border-red-500/30' : ''}
                  ${checkpoint.status === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30 animate-pulse' : ''}
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`
                    w-2 h-2 rounded-full
                    ${checkpoint.status === 'approved' ? 'bg-green-500' : ''}
                    ${checkpoint.status === 'rejected' ? 'bg-red-500' : ''}
                    ${checkpoint.status === 'pending' ? 'bg-yellow-500' : ''}
                  `} />
                  <span className="text-sm text-white">{checkpoint.type}</span>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(checkpoint.timestamp), { addSuffix: true })}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
