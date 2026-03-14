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
    <div className="max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 badge-nature mb-8"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span className="text-sm">Powered by Claude Code Agents</span>
        </motion.div>
        <h1 className="text-7xl font-bold mb-6 bg-gradient-to-r from-green-600 via-emerald-500 to-green-600 text-transparent bg-clip-text gradient-animate">
          Grow Your Dream App
        </h1>
        <p className="text-xl text-amber-800 max-w-2xl mx-auto leading-relaxed font-medium">
          Plant an idea and watch AI agents cultivate it into a thriving application
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="wood-card p-10 mb-12"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <label htmlFor="idea" className="block text-base font-bold text-amber-900 mb-3">
            🌾 What would you like to grow?
          </label>
          <div className="flex gap-4">
            <input
              id="idea"
              type="text"
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="A real-time chat app with video calls and file sharing..."
              className="flex-1 bg-white/80 border-2 border-amber-200 rounded-xl px-6 py-4 text-amber-900 placeholder-amber-400 focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-100 transition-all text-lg font-medium shadow-inner"
            />
            <button
              type="submit"
              disabled={!idea.trim()}
              className="nature-button flex items-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <span>Start Growing</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </form>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-16"
      >
        <h3 className="text-sm font-bold text-amber-700 mb-5 uppercase tracking-wide">✨ Popular Seeds to Plant</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examples.map((example, index) => (
            <motion.button
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIdea(example)}
              className="text-left wood-card-hover p-5 group"
            >
              <p className="text-base text-amber-900 group-hover:text-green-800 transition-colors font-medium">
                🌿 {example}
              </p>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {[
          { title: 'Planning', desc: 'AI analyzes and generates detailed specs', icon: '📋', color: 'blue' },
          { title: 'Development', desc: 'Autonomous agents write production code', icon: '⚡', color: 'green' },
          { title: 'Harvest', desc: 'Production-ready app in minutes', icon: '🌻', color: 'purple' },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + index * 0.1 }}
            whileHover={{ scale: 1.05, y: -4 }}
            className={`status-card-${feature.color} p-8 text-center cursor-default`}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity, delay: index * 0.3 }}
            >
              {feature.icon}
            </motion.div>
            <h4 className="font-bold text-amber-900 mb-3 text-lg">{feature.title}</h4>
            <p className="text-sm text-amber-700 leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
