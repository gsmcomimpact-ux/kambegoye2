
import React, { useEffect, useState, useRef } from 'react';
import { Trash2, Download, FileText, Image as ImageIcon, Upload, Plus } from 'lucide-react';
import { db } from '../../services/db';
import { MediaItem } from '../../types';

const MediaLibrary = () => {
  const [medias, setMedias] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const data = await db.getMedia();
    setMedias(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Voulez-vous supprimer ce fichier ?')) {
      await db.deleteMedia(id);
      loadData();
    }
  };

  const handleDownload = (media: MediaItem) => {
    const link = document.createElement("a");
    link.href = media.data;
    link.download = media.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          if (file.size > 2 * 1024 * 1024) {
              alert("Fichier trop volumineux (Max 2MB)");
              return;
          }

          try {
              const dataUrl = await db.fileToDataURL(file);
              const type = file.type.startsWith('image/') ? 'image' : 'document';
              await db.saveMedia({
                  id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(),
                  type: type,
                  name: file.name,
                  data: dataUrl,
                  date: new Date().toISOString()
              });
              loadData();
          } catch (err) {
              alert("Erreur lors de l'upload");
          }
      }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Médiathèque (Documents & Images)</h2>
        <div>
            <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                onChange={handleFileUpload} 
                accept="image/*,application/pdf"
            />
            <button 
                onClick={() => fileInputRef.current?.click()}
                className="bg-brand-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-brand-700 shadow-sm"
            >
                <Plus className="w-4 h-4 mr-2" /> Ajouter un média
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm mb-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">
              Cet espace regroupe les documents téléversés (ex: Cartes d'identité des ouvriers). 
              Dans cette version démo, les fichiers sont stockés localement dans le navigateur (Max 5MB total).
          </p>
      </div>

      {loading ? (
        <p className="text-center">Chargement...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {medias.map((media) => (
            <div key={media.id} className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden group">
              <div className="h-40 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                {media.type === 'image' || media.data.startsWith('data:image') ? (
                    <img src={media.data} alt={media.name} className="w-full h-full object-cover" />
                ) : (
                    <FileText className="w-16 h-16 text-gray-400" />
                )}
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 gap-2">
                    <button onClick={() => handleDownload(media)} className="p-2 bg-white rounded-full text-brand-600 hover:bg-gray-100" title="Télécharger">
                        <Download className="w-5 h-5" />
                    </button>
                    <button onClick={() => handleDelete(media.id)} className="p-2 bg-white rounded-full text-red-600 hover:bg-gray-100" title="Supprimer">
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
              </div>
              <div className="p-3">
                <p className="font-semibold text-gray-800 dark:text-white truncate" title={media.name}>{media.name}</p>
                <p className="text-xs text-gray-500 mt-1">{new Date(media.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
          
          {medias.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                  <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>Aucun document dans la médiathèque.</p>
              </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MediaLibrary;
