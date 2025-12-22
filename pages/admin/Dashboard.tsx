
import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Wallet, Activity, Bell, FileText, CheckCircle, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { db } from '../../services/db';
import { Stats, Notification } from '../../types';

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const loadData = async () => {
        const [s, n] = await Promise.all([db.getStats(), db.getNotifications()]);
        setStats(s);
        setNotifications(n);
    };
    loadData();
  }, []);

  const markRead = (id: string) => {
      db.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? {...n, isRead: true} : n));
  };

  if (!stats) return <div className="p-6 text-center">Chargement...</div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Aperçu de la Plateforme</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
          <p className="text-sm text-gray-500">Total Ouvriers</p>
          <p className="text-2xl font-bold">{stats.totalWorkers}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-green-500">
          <p className="text-sm text-gray-500">Total Ventes</p>
          <p className="text-2xl font-bold">{stats.totalTransactions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-brand-500">
          <p className="text-sm text-gray-500">Revenu Global</p>
          <p className="text-2xl font-bold">{stats.totalRevenue} F</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border-l-4 border-orange-500">
          <p className="text-sm text-gray-500">Demandes Projets</p>
          <p className="text-2xl font-bold">{stats.pendingProjects || 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Centre de Notifications */}
          <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col h-[500px]">
              <div className="p-4 bg-brand-50 dark:bg-brand-900/20 border-b flex justify-between items-center">
                  <h3 className="font-bold text-gray-800 dark:text-white flex items-center">
                      <Bell className="w-5 h-5 mr-2 text-brand-600" /> Notifications
                  </h3>
                  {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {notifications.filter(n => !n.isRead).length}
                      </span>
                  )}
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-50 dark:divide-gray-700">
                  {notifications.length === 0 && <p className="p-8 text-center text-gray-400 text-sm">Aucune notification.</p>}
                  {notifications.map(notif => (
                      <div 
                        key={notif.id} 
                        onClick={() => markRead(notif.id)}
                        className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer relative ${!notif.isRead ? 'bg-blue-50/30 border-l-2 border-brand-500' : ''}`}
                      >
                          <div className="flex gap-3">
                              <div className={`mt-1 p-1.5 rounded-full ${
                                  notif.type === 'success' ? 'bg-green-100 text-green-600' : 
                                  notif.type === 'warning' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                              }`}>
                                  {notif.type === 'success' ? <CheckCircle className="w-3.5 h-3.5"/> : <Bell className="w-3.5 h-3.5"/>}
                              </div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-xs font-bold text-gray-900 dark:text-white mb-1">{notif.title}</p>
                                  <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2">{notif.message}</p>
                                  <div className="flex justify-between items-center mt-2">
                                      <span className="text-[9px] text-gray-400 flex items-center"><Clock className="w-2.5 h-2.5 mr-1" /> {new Date(notif.date).toLocaleDateString()}</span>
                                      {notif.link && <Link to={notif.link} className="text-[9px] text-brand-600 font-bold hover:underline">Voir détails</Link>}
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Graphique de Vues */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md border border-gray-100 dark:border-gray-700 h-[500px]">
            <h3 className="text-lg font-bold mb-6 flex items-center"><Activity className="w-5 h-5 mr-2 text-brand-600" /> Profils les plus consultés</h3>
            <div className="h-full pb-16">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.topWorkers} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="lastName" type="category" width={100} />
                        <Tooltip />
                        <Bar dataKey="views" fill="#16a34a" radius={[0, 4, 4, 0]} name="Vues" barSize={15} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;
