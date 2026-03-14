'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { App } from '@/types';

interface HardDeleteModalProps {
  app: App;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function HardDeleteModal({
  app,
  isOpen,
  onClose,
  onConfirm
}: HardDeleteModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const canDelete = confirmText === 'DELETE';

  const handleConfirm = async () => {
    if (!canDelete) return;

    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
      setConfirmText('');
    }
  };

  const handleClose = () => {
    setConfirmText('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900 border-2 border-red-500/50 rounded-2xl max-w-lg w-full shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border-b border-red-500/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Permanently Delete App</h2>
                  <p className="text-sm text-red-400">{app.displayName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Warning Banner */}
            <div className="bg-red-500/20 border-2 border-red-500/50 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-400 mt-0.5" />
                <div>
                  <h3 className="text-red-300 font-bold mb-1">⚠️  WARNING: This cannot be undone!</h3>
                  <p className="text-sm text-red-200">
                    This action is permanent and irreversible. All data will be lost forever.
                  </p>
                </div>
              </div>
            </div>

            <p className="text-gray-300 mb-4 font-medium">
              This will permanently remove:
            </p>

            <div className="space-y-3 mb-6 bg-gray-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center mt-0.5">
                  <Trash2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">All app files</div>
                  <div className="text-sm text-gray-400 font-mono">{app.path}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center mt-0.5">
                  <Trash2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">PostgreSQL database</div>
                  <div className="text-sm text-gray-400 font-mono">{app.database}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center mt-0.5">
                  <Trash2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">S3 bucket and all uploads</div>
                  <div className="text-sm text-gray-400 font-mono">{app.s3Bucket}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center mt-0.5">
                  <Trash2 className="w-3 h-3 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">Registry entry</div>
                  <div className="text-sm text-gray-400">App metadata and configuration</div>
                </div>
              </div>
            </div>

            {/* Confirmation Input */}
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-300 mb-2">
                Type <span className="font-mono font-bold text-red-400">DELETE</span> to confirm:
              </label>
              <input
                id="confirm"
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="DELETE"
                className="w-full bg-gray-950 border-2 border-gray-700 focus:border-red-500 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none font-mono"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-red-500/30 bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!canDelete || isDeleting}
              className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Permanently Delete
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
