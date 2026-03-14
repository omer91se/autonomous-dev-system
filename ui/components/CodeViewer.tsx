'use client';

import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

interface CodeViewerProps {
  filePath: string;
}

export default function CodeViewer({ filePath }: CodeViewerProps) {
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('typescript');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFileContent();
  }, [filePath]);

  const fetchFileContent = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/file-content?path=${encodeURIComponent(filePath)}`);
      const data = await response.json();
      setCode(data.content || '');

      // Detect language from file extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      const langMap: Record<string, string> = {
        'ts': 'typescript',
        'tsx': 'typescript',
        'js': 'javascript',
        'jsx': 'javascript',
        'json': 'json',
        'md': 'markdown',
        'css': 'css',
        'html': 'html',
        'py': 'python',
      };
      setLanguage(langMap[ext || ''] || 'plaintext');
    } catch (error) {
      console.error('Failed to fetch file content:', error);
      setCode('// Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full rounded-lg overflow-hidden border border-gray-700">
      <Editor
        height="100%"
        language={language}
        value={code}
        theme="vs-dark"
        options={{
          readOnly: true,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
