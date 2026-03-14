'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Play,
  Square,
  ExternalLink,
  Trash2,
  Database,
  Cloud,
  Globe,
  RefreshCw,
  RotateCcw
} from 'lucide-react';
import { App } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface AppCardProps {
  app: App;
  onSoftDelete: (app: App) => void;
  onHardDelete: (app: App) => void;
  onRestore: (app: App) => void;
  onRefresh: () => void;
}

export default function AppCard({
  app,
  onSoftDelete,
  onHardDelete,
  onRestore,
  onRefresh
}: AppCardProps) {
  const [isStarting, setIsStarting] = useState(false);
  const [isStopping, setIsStopping] = useState(false);

  const handleStart = async () => {
    setIsStarting(true);
    try {
      const response = await fetch(`/api/apps/${app.id}/start`, {
        method: 'POST'
      });
      const data = await response.json();

      if (data.success) {
        // Open browser after a short delay
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            window.open(data.url, '_blank');
          }
        }, 500);
      }

      onRefresh();
    } catch (error) {
      console.error('Failed to start app:', error);
    } finally {
      setIsStarting(false);
    }
  };

  const handleStop = async () => {
    setIsStopping(true);
    try {
      await fetch(`/api/apps/${app.id}/stop`, {
        method: 'POST'
      });
      onRefresh();
    } catch (error) {
      console.error('Failed to stop app:', error);
    } finally {
      setIsStopping(false);
    }
  };

  const handleOpen = () => {
    const url = `http://localhost:${app.port}`;
    window.open(url, '_blank');
  };

  const isDeleted = app.status === 'deleted';

  return (
    <div className={`
      bg-gray-800/50 backdrop-blur-sm border rounded-xl p-6 transition-all hover:border-gray-600
      ${isDeleted ? 'border-red-500/30 bg-red-500/5' : 'border-gray-700'}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">{app.displayName}</h3>
          <p className="text-xs text-gray-500">{app.name}</p>
        </div>
        {app.running && !isDeleted && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 border border-green-500/30 rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-400 font-medium">Running</span>
          </div>
        )}
        {isDeleted && (
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/20 border border-red-500/30 rounded-full">
            <Trash2 className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-400 font-medium">Deleted</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Database className="w-4 h-4" />
          <span className="font-mono text-xs">{app.database}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Cloud className="w-4 h-4" />
          <span className="font-mono text-xs">{app.s3Bucket}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Globe className="w-4 h-4" />
          <span className="font-mono text-xs">Port {app.port}</span>
        </div>
      </div>

      {/* Metadata */}
      <div className="text-xs text-gray-500 mb-4 border-t border-gray-700 pt-3">
        <div>Created {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true })}</div>
        {app.lastStartedAt && (
          <div>Last started {formatDistanceToNow(new Date(app.lastStartedAt), { addSuffix: true })}</div>
        )}
        {app.deletedAt && (
          <div className="text-red-400">
            Deleted {formatDistanceToNow(new Date(app.deletedAt), { addSuffix: true })}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        {!isDeleted ? (
          <>
            {app.running ? (
              <>
                <button
                  onClick={handleOpen}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  Open
                </button>
                <button
                  onClick={handleStop}
                  disabled={isStopping}
                  className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {isStopping ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </>
            ) : (
              <button
                onClick={handleStart}
                disabled={isStarting}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium disabled:opacity-50"
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Start
                  </>
                )}
              </button>
            )}
            <button
              onClick={() => onSoftDelete(app)}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onRestore(app)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              Restore
            </button>
            <button
              onClick={() => onHardDelete(app)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <Trash2 className="w-4 h-4" />
              Delete Forever
            </button>
          </>
        )}
      </div>
    </div>
  );
}
