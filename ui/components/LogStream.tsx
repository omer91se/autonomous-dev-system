'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Info, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { LogEntry } from '@/types';
import { format } from 'date-fns';

interface LogStreamProps {
  logs: LogEntry[];
}

export default function LogStream({ logs }: LogStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Info;
    }
  };

  const getLogColor = (level: LogEntry['level']) => {
    switch (level) {
      case 'success': return 'text-green-400';
      case 'warning': return 'text-yellow-400';
      case 'error': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-5 h-5 text-green-400" />
        <h2 className="text-lg font-semibold text-white">Activity Log</h2>
      </div>

      <div
        ref={containerRef}
        className="bg-gray-950 rounded-lg p-4 h-64 overflow-y-auto font-mono text-xs space-y-1"
      >
        <AnimatePresence initial={false}>
          {logs.length === 0 ? (
            <p className="text-gray-600 text-center py-8 font-sans">Waiting for activity...</p>
          ) : (
            logs.map((log, index) => {
              const Icon = getLogIcon(log.level);
              const color = getLogColor(log.level);

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-start gap-2 text-gray-300"
                >
                  <span className="text-gray-600 shrink-0">
                    [{format(new Date(log.timestamp), 'HH:mm:ss')}]
                  </span>
                  <Icon className={`w-3 h-3 mt-0.5 shrink-0 ${color}`} />
                  {log.agent && (
                    <span className="text-purple-400 shrink-0">[{log.agent}]</span>
                  )}
                  <span className="break-all">{log.message}</span>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
