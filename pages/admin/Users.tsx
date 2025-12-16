import React, { useEffect, useState } from 'react';
import { Edit, Trash2, Plus, X, Shield, ShieldAlert, Check } from 'lucide-react';
import { db, generateUUID } from '../../services/db';
import { AdminUser } from '../../types';

const Users = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<AdminUser>>({});
  const [currentUserUsername, setCurrentUserUsername] = useState<string>('');

  useEffect(() => {
    loadData();
    // Assuming simple storage of last logged user for display purposes
    // In a real app this would come from context
    const lastUser = localStorage.getItem('kambegoye_admin_last_user'); 
    if (lastUser) setCurrentUserUsername(lastUser);
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await db.getAdminUsers();
    setUsers(data);
    setLoading(false);
  };

  const handleCreate = () => {
    setEditingUser({
      id: generateUUID(),
      username: '',
      password: '',
      role: 'manager',
      name: ''
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser({
      ...user,
      password: '' // Don't show password
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
        if (window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            await db.deleteAdminUser(id);
            loadData();
        }
    } catch (e: any) {
        alert(e.message);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser.username || !editingUser.name) {
        alert("Nom et identifiant obligatoires");
        return;
    }

    // Check unique username if creating new
    if (!editingUser.id && users.some(u => u.username === editingUser.username)) {
        alert("Cet identifiant est déjà utilisé.");
        return;
    }

    await db.saveAdminUser(editingUser as AdminUser);
    setIsModalOpen(false);
    loadData();
  };

  if (loading) return <div className="p-8 text-center">Chargement...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center">
                <Shield className="w-6 h-6 mr-2 text-brand-600" />
                Utilisateurs & Rôles
            </h2>
            <p className="text-sm text-gray-500">Gérez les accès à l'administration.</p>
        </div>
        <button 
          onClick={handleCreate}
          className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Nouvel Utilisateur
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Identifiant</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rôle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Dernière Connexion</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 dark:text-white">{user.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.username}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.role === 'admin' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                          <ShieldAlert className="w-3 h-3 mr-1" /> Administrateur
                      </span>
                  ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          <Check className="w-3 h-3 mr-1" /> Manager
                      </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button onClick={() => handleEdit(user)} className="text-indigo-600 hover:text-indigo-900 mr-4 p-1 rounded hover:bg-indigo-50 dark:hover:bg-gray-700">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 dark:hover:bg-gray-700">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-900 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b pb-4 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingUser.id && users.find(u => u.id === editingUser.id) ? 'Modifier Utilisateur' : 'Nouvel Utilisateur'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom Complet</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: Jean Dupont"
                  value={editingUser.name || ''}
                  onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Identifiant (Connexion)</label>
                <input 
                  type="text" 
                  required
                  placeholder="ex: jdupont"
                  value={editingUser.username || ''}
                  onChange={e => setEditingUser({...editingUser, username: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Mot de passe {editingUser.id && users.find(u => u.id === editingUser.id) && '(Laisser vide pour ne pas changer)'}
                </label>
                <input 
                  type="text" // Using text to see password in this admin context, usually password type
                  placeholder="******"
                  value={editingUser.password || ''}
                  onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Rôle</label>
                <select 
                    value={editingUser.role || 'manager'}
                    // @ts-ignore
                    onChange={e => setEditingUser({...editingUser, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                    <option value="manager">Manager (Accès limité)</option>
                    <option value="admin">Administrateur (Accès total)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                    Les managers n'ont pas accès aux paramètres système ni à la gestion des utilisateurs.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t dark:border-gray-700">
                <button type="button" onClick={() => setIsModalOpen(false)} className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md mr-3 hover:bg-gray-300">Annuler</button>
                <button type="submit" className="bg-brand-600 text-white px-4 py-2 rounded-md hover:bg-brand-700 flex items-center">
                    <Plus className="w-4 h-4 mr-2" /> Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;