'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronDown, File, Folder, Sparkles } from 'lucide-react';
import { FileNode } from '@/types';

interface FileTreeViewerProps {
  projectId: string;
  onFileSelect: (filePath: string) => void;
}

export default function FileTreeViewer({ projectId, onFileSelect }: FileTreeViewerProps) {
  const [fileTree, setFileTree] = useState<FileNode[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Fetch file tree from API
    fetchFileTree();
  }, [projectId]);

  const fetchFileTree = async () => {
    try {
      const response = await fetch(`/api/files/${projectId}`);
      const data = await response.json();
      setFileTree(data.files || []);
    } catch (error) {
      console.error('Failed to fetch file tree:', error);
    }
  };

  const toggleDirectory = (path: string) => {
    setExpandedDirs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const getStatusIcon = (status?: FileNode['status']) => {
    if (status === 'creating') {
      return <Sparkles className="w-3 h-3 text-yellow-400 animate-pulse" />;
    }
    if (status === 'created') {
      return <Sparkles className="w-3 h-3 text-green-400" />;
    }
    return null;
  };

  const renderNode = (node: FileNode, depth: number = 0) => {
    const isExpanded = expandedDirs.has(node.path);
    const isDirectory = node.type === 'directory';

    return (
      <div key={node.path}>
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className={`
            flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer hover:bg-gray-700/50 transition-colors
            ${depth > 0 ? 'ml-' + (depth * 4) : ''}
          `}
          onClick={() => {
            if (isDirectory) {
              toggleDirectory(node.path);
            } else {
              onFileSelect(node.path);
            }
          }}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          {isDirectory && (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
              <Folder className="w-4 h-4 text-blue-400" />
            </>
          )}
          {!isDirectory && <File className="w-4 h-4 text-gray-400 ml-5" />}

          <span className="text-sm text-gray-300 flex-1">{node.name}</span>

          {getStatusIcon(node.status)}
        </motion.div>

        <AnimatePresence>
          {isDirectory && isExpanded && node.children && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              {node.children.map(child => renderNode(child, depth + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-1">
      {fileTree.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No files generated yet
        </div>
      ) : (
        fileTree.map(node => renderNode(node))
      )}
    </div>
  );
}
