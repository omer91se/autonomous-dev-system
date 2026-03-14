'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, XCircle, FileText, ChevronRight } from 'lucide-react';
import { Checkpoint } from '@/types';

interface CheckpointModalProps {
  checkpoint: Checkpoint;
  onDecision: (approved: boolean, feedback?: string) => void;
}

export default function CheckpointModal({ checkpoint, onDecision }: CheckpointModalProps) {
  const [feedback, setFeedback] = useState('');
  const [showFullContent, setShowFullContent] = useState(false);
  const [content, setContent] = useState<string>('');

  const loadFullContent = async () => {
    if (checkpoint.artifactPath) {
      try {
        const response = await fetch(`/api/file-content?path=${encodeURIComponent(checkpoint.artifactPath)}`);
        const data = await response.json();
        setContent(data.content || '');
        setShowFullContent(true);
      } catch (error) {
        console.error('Failed to load content:', error);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900 border-2 border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Checkpoint Review</h2>
                  <p className="text-sm text-gray-400">{checkpoint.type}</p>
                </div>
              </div>
              <button
                onClick={() => onDecision(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-400 mb-2">Generated Artifact</h3>
              <div className="bg-gray-950 rounded-lg p-4 font-mono text-sm text-gray-300">
                {showFullContent ? (
                  <pre className="whitespace-pre-wrap">{content}</pre>
                ) : (
                  <div>
                    <p className="text-gray-500 mb-2">Preview not loaded</p>
                    <button
                      onClick={loadFullContent}
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm"
                    >
                      View Full Content
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="feedback" className="block text-sm font-medium text-gray-400 mb-2">
                Feedback (optional)
              </label>
              <textarea
                id="feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Add any feedback or requested changes..."
                rows={4}
                className="w-full bg-gray-950 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-700 bg-gray-900/50 px-6 py-4 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Review the generated artifact and approve or request changes
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => onDecision(false, feedback)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                <XCircle className="w-4 h-4" />
                Reject
              </button>
              <button
                onClick={() => onDecision(true, feedback)}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg transition-all font-medium"
              >
                <Check className="w-4 h-4" />
                Approve & Continue
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
