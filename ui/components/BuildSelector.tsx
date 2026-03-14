'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, ChevronDown, CheckCircle, XCircle, Clock, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface Build {
  buildId: string;
  projectName: string;
  status: string;
  phase: string;
  startedAt: string;
  completedAt?: string;
  agentCount: number;
  logCount: number;
}

interface BuildSelectorProps {
  onSelectBuild: (buildId: string | null) => void;
  selectedBuildId: string | null;
}

export default function BuildSelector({ onSelectBuild, selectedBuildId }: BuildSelectorProps) {
  const [builds, setBuilds] = useState<Build[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBuilds();
    // Refresh every 10 seconds
    const interval = setInterval(loadBuilds, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadBuilds = async () => {
    try {
      const response = await fetch('/api/builds');
      const data = await response.json();
      setBuilds(data.builds || []);
    } catch (error) {
      console.error('Failed to load builds:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteBuild = async (buildId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this build history?')) return;

    try {
      await fetch(`/api/builds/${buildId}`, { method: 'DELETE' });
      setBuilds(builds.filter(b => b.buildId !== buildId));
      if (selectedBuildId === buildId) {
        onSelectBuild(null);
      }
    } catch (error) {
      console.error('Failed to delete build:', error);
    }
  };

  const selectedBuild = builds.find(b => b.buildId === selectedBuildId);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'running': return Clock;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'green';
      case 'failed': return 'red';
      case 'running': return 'blue';
      default: return 'gray';
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nature-button-secondary flex items-center gap-3"
      >
        <History className="w-4 h-4" />
        <div className="text-left">
          {selectedBuild ? (
            <>
              <div className="text-sm font-bold">{selectedBuild.projectName}</div>
              <div className="text-xs text-amber-700">
                {format(new Date(selectedBuild.startedAt), 'MMM d, HH:mm')}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold">Live Build</div>
              <div className="text-xs text-amber-700">Real-time updates</div>
            </>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full mt-3 right-0 w-96 wood-card shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            <div className="p-4">
              {/* Live Build Option */}
              <button
                onClick={() => {
                  onSelectBuild(null);
                  setIsOpen(false);
                }}
                className={`
                  w-full text-left p-4 rounded-xl transition-all
                  ${!selectedBuildId
                    ? 'status-card-green shadow-lg'
                    : 'bg-white/60 border-2 border-amber-200 hover:bg-white/80 hover:shadow-md'}
                `}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Clock className={`w-5 h-5 ${!selectedBuildId ? 'text-green-700 pulse-glow' : 'text-amber-700'}`} />
                  <span className="font-bold text-amber-900">Live Build</span>
                </div>
                <p className="text-xs text-amber-700 font-medium">Real-time updates from current build</p>
              </button>

              {/* Divider */}
              {builds.length > 0 && (
                <div className="my-4 border-t-2 border-amber-200/60" />
              )}

              {/* Build History */}
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-amber-300 border-t-green-500 mx-auto" />
                </div>
              ) : builds.length === 0 ? (
                <div className="text-center py-8 bg-white/60 rounded-xl border-2 border-amber-200">
                  <p className="text-sm font-bold text-amber-700">No build history yet</p>
                </div>
              ) : (
                builds.map((build) => {
                  const StatusIcon = getStatusIcon(build.status);
                  const color = getStatusColor(build.status);
                  const isSelected = selectedBuildId === build.buildId;

                  return (
                    <button
                      key={build.buildId}
                      onClick={() => {
                        onSelectBuild(build.buildId);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full text-left p-4 rounded-xl transition-all group relative mb-3
                        ${isSelected
                          ? `status-card-${color} shadow-lg`
                          : 'bg-white/60 border-2 border-amber-200 hover:bg-white/80 hover:shadow-md'}
                      `}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <StatusIcon className={`w-4 h-4 text-${color === 'green' ? 'green' : color === 'red' ? 'red' : 'blue'}-700`} />
                            <span className="font-bold text-amber-900 text-sm truncate">{build.projectName}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-amber-700 font-semibold">
                            <span>{format(new Date(build.startedAt), 'MMM d, HH:mm')}</span>
                            <span>• {build.agentCount} agents</span>
                            <span>• {build.logCount} logs</span>
                          </div>
                        </div>
                        <button
                          onClick={(e) => deleteBuild(build.buildId, e)}
                          className="opacity-0 group-hover:opacity-100 p-2 status-card-red hover:shadow-md rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4 text-red-700" />
                        </button>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
