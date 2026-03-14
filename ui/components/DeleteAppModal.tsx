'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, Check, XCircle } from 'lucide-react';
import { App } from '@/types';

interface DeleteAppModalProps {
  app: App;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteAppModal({
  app,
  isOpen,
  onClose,
  onConfirm
}: DeleteAppModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-gray-900 border-2 border-gray-700 rounded-2xl max-w-lg w-full shadow-2xl"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-b border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Move to Deleted Apps</h2>
                  <p className="text-sm text-gray-400">{app.displayName}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-300 mb-6">
              This will move the app to the "Deleted Apps" tab. You can restore it later or permanently delete it.
            </p>

            <div className="bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Hide from active apps</div>
                  <div className="text-sm text-gray-400">App will be moved to Deleted tab</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Database will be kept</div>
                  <div className="text-sm text-gray-400">PostgreSQL database: {app.database}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium">Files will be kept</div>
                  <div className="text-sm text-gray-400">Project files remain at: {app.path}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-blue-400 mt-0.5" />
                <div>
                  <div className="text-white font-medium">S3 bucket will be kept</div>
                  <div className="text-sm text-gray-400">Bucket: {app.s3Bucket}</div>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <p className="text-sm text-blue-300">
                💡 <strong>Tip:</strong> To free up resources, permanently delete the app from the Deleted Apps tab.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-700 bg-gray-900/50 px-6 py-4 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors font-medium"
            >
              Move to Deleted Apps
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
