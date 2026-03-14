'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileCode, FolderTree, Eye } from 'lucide-react';
import { ProjectState } from '@/types';
import FileTreeViewer from './FileTreeViewer';
import CodeViewer from './CodeViewer';

interface OutputPreviewProps {
  projectState: ProjectState;
}

type Tab = 'files' | 'requirements' | 'code';

export default function OutputPreview({ projectState }: OutputPreviewProps) {
  const [activeTab, setActiveTab] = useState<Tab>('files');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const tabs = [
    { id: 'files' as Tab, label: 'File Tree', icon: FolderTree },
    { id: 'requirements' as Tab, label: 'Requirements', icon: FileCode },
    { id: 'code' as Tab, label: 'Code Preview', icon: Eye },
  ];

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden">
      {/* Tabs */}
      <div className="border-b border-gray-700 bg-gray-900/50">
        <div className="flex gap-1 p-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${activeTab === tab.id
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 h-[600px] overflow-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <FileTreeViewer
                projectId={projectState.projectId}
                onFileSelect={setSelectedFile}
              />
            </motion.div>
          )}

          {activeTab === 'requirements' && (
            <motion.div
              key="requirements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {projectState.requirementsPath ? (
                <CodeViewer filePath={projectState.requirementsPath} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Requirements not yet generated
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'code' && (
            <motion.div
              key="code"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              {selectedFile ? (
                <CodeViewer filePath={selectedFile} />
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a file from the tree to preview
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
