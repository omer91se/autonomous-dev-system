'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AppWindow as AppIcon, Trash2, Plus } from 'lucide-react';
import Navbar from '@/components/Navbar';
import AppCard from '@/components/AppCard';
import DeleteAppModal from '@/components/DeleteAppModal';
import HardDeleteModal from '@/components/HardDeleteModal';
import { App } from '@/types';

type TabType = 'active' | 'deleted';

export default function AppsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [hardDeleteModalOpen, setHardDeleteModalOpen] = useState(false);

  const fetchApps = async (status: TabType = activeTab) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/apps?status=${status}`);
      const data = await response.json();
      setApps(data.apps || []);
    } catch (error) {
      console.error('Failed to fetch apps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
    // Poll for status updates every 5 seconds
    const interval = setInterval(() => fetchApps(), 5000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleSoftDelete = (app: App) => {
    setSelectedApp(app);
    setDeleteModalOpen(true);
  };

  const handleHardDelete = (app: App) => {
    setSelectedApp(app);
    setHardDeleteModalOpen(true);
  };

  const handleRestore = async (app: App) => {
    try {
      await fetch(`/api/apps/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' })
      });
      fetchApps();
    } catch (error) {
      console.error('Failed to restore app:', error);
    }
  };

  const confirmSoftDelete = async () => {
    if (!selectedApp) return;

    try {
      await fetch(`/api/apps/${selectedApp.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'soft-delete' })
      });
      setDeleteModalOpen(false);
      setSelectedApp(null);
      fetchApps();
    } catch (error) {
      console.error('Failed to soft delete app:', error);
    }
  };

  const confirmHardDelete = async () => {
    if (!selectedApp) return;

    try {
      await fetch(`/api/apps/${selectedApp.id}`, {
        method: 'DELETE'
      });
      setHardDeleteModalOpen(false);
      setSelectedApp(null);
      fetchApps();
    } catch (error) {
      console.error('Failed to hard delete app:', error);
    }
  };

  const activeApps = apps.filter(app => app.status === 'active');
  const deletedApps = apps.filter(app => app.status === 'deleted');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Navbar />

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800">
          <button
            onClick={() => setActiveTab('active')}
            className={`
              px-6 py-3 font-medium text-sm transition-all relative
              ${activeTab === 'active'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            Active Apps
            {activeApps.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full text-xs">
                {activeApps.length}
              </span>
            )}
            {activeTab === 'active' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('deleted')}
            className={`
              px-6 py-3 font-medium text-sm transition-all relative
              ${activeTab === 'deleted'
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
              }
            `}
          >
            Deleted Apps
            {deletedApps.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">
                {deletedApps.length}
              </span>
            )}
            {activeTab === 'deleted' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
              />
            )}
          </button>
        </div>

        {/* Deleted Apps Warning Banner */}
        {activeTab === 'deleted' && deletedApps.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6 flex items-start gap-3"
          >
            <Trash2 className="w-5 h-5 text-yellow-400 mt-0.5" />
            <div>
              <h3 className="font-medium text-yellow-400 mb-1">These apps are hidden but still using resources</h3>
              <p className="text-sm text-yellow-200/80">
                Files, databases, and S3 buckets are preserved. To free up resources, permanently delete these apps.
              </p>
            </div>
          </motion.div>
        )}

        {/* Apps Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
          </div>
        ) : (
          <>
            {apps.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20"
              >
                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  {activeTab === 'active' ? (
                    <AppIcon className="w-10 h-10 text-gray-600" />
                  ) : (
                    <Trash2 className="w-10 h-10 text-gray-600" />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-400 mb-2">
                  {activeTab === 'active' ? 'No apps yet' : 'No deleted apps'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {activeTab === 'active'
                    ? 'Build your first app using /build-app command'
                    : 'Deleted apps will appear here'
                  }
                </p>
                {activeTab === 'active' && (
                  <a
                    href="/"
                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Build New App
                  </a>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {apps.map((app, index) => (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AppCard
                      app={app}
                      onSoftDelete={handleSoftDelete}
                      onHardDelete={handleHardDelete}
                      onRestore={handleRestore}
                      onRefresh={fetchApps}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {selectedApp && (
        <>
          <DeleteAppModal
            app={selectedApp}
            isOpen={deleteModalOpen}
            onClose={() => {
              setDeleteModalOpen(false);
              setSelectedApp(null);
            }}
            onConfirm={confirmSoftDelete}
          />
          <HardDeleteModal
            app={selectedApp}
            isOpen={hardDeleteModalOpen}
            onClose={() => {
              setHardDeleteModalOpen(false);
              setSelectedApp(null);
            }}
            onConfirm={confirmHardDelete}
          />
        </>
      )}
    </div>
  );
}
