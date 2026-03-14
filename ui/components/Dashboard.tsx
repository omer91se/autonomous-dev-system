'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';

interface DashboardProps {
  onProjectStart: (idea: string) => void;
}

export default function Dashboard({ onProjectStart }: DashboardProps) {
  const [idea, setIdea] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (idea.trim()) {
      onProjectStart(idea);
    }
  };

  const examples = [
    "A todo list app with priorities and due dates",
    "A blog platform with markdown support",
    "A chat application with real-time messaging",
    "An expense tracker with categories and charts",
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full mb-6">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">Powered by Claude Code Agents</span>
        </div>
        <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
          Build Anything, Autonomously
        </h1>
        <p className="text-xl text-gray-400">
          Describe your app idea and watch AI agents build it from scratch
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8"
      >
        <form onSubmit={handleSubmit}>
          <label htmlFor="idea" className="block text-sm font-medium text-gray-300 mb-3">
            What would you like to build?
          </label>
          <div className="flex gap-3">
            <input
              id="idea"
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="Describe your app idea..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!idea.trim()}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-gray-400 mb-3">Example Ideas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examples.map((example, index) => (
            <button
              key={index}
              onClick={() => setIdea(example)}
              className="text-left bg-gray-800/30 border border-gray-700 rounded-lg px-4 py-3 text-gray-300 hover:bg-gray-800/50 hover:border-gray-600 transition-all"
            >
              {example}
            </button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: 'Requirements', desc: 'AI analyzes and generates specs', color: 'blue' },
          { title: 'Development', desc: 'Full-stack code generation', color: 'purple' },
          { title: 'Deployment', desc: 'Production-ready in minutes', color: 'pink' },
        ].map((feature, index) => (
          <div key={index} className="text-center">
            <div className={`w-12 h-12 bg-${feature.color}-500/10 rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <div className={`w-6 h-6 bg-${feature.color}-500 rounded`} />
            </div>
            <h4 className="font-semibold text-white mb-1">{feature.title}</h4>
            <p className="text-sm text-gray-400">{feature.desc}</p>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
