import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Eye } from 'lucide-react';

interface Meme {
  id: string;
  title: string;
  description: string;
  canvas_data: any;
  created_at: string;
  is_public: boolean;
  creator_id: string;
}

export default function MemeLibrary() {
  const { user } = useAuth();
  const [memes, setMemes] = useState<Meme[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMemes();
  }, []);

  const loadMemes = async () => {
    try {
      const allMemes = JSON.parse(localStorage.getItem('memes') || '[]');
      const userMemes = allMemes.filter((m: Meme) => m.creator_id === user?.id);
      setMemes(userMemes);
    } catch (error) {
      console.error('Failed to load memes:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteMeme = async (id: string) => {
    if (!confirm('Are you sure you want to delete this meme?')) return;

    try {
      const allMemes = JSON.parse(localStorage.getItem('memes') || '[]');
      const updatedMemes = allMemes.filter((m: Meme) => m.id !== id);
      localStorage.setItem('memes', JSON.stringify(updatedMemes));
      setMemes(memes.filter(m => m.id !== id));
    } catch (error) {
      console.error('Failed to delete meme:', error);
    }
  };

  const generateThumbnail = (canvasData: any) => {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    ctx.fillStyle = canvasData.backgroundColor || '#ffffff';
    ctx.fillRect(0, 0, 200, 200);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#666';
    ctx.textAlign = 'center';
    ctx.fillText('Meme Preview', 100, 100);

    return canvas.toDataURL();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500">Loading your memes...</div>
      </div>
    );
  }

  if (memes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <div className="text-gray-400 mb-4">
          <Eye className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">No memes yet</h3>
        <p className="text-gray-600 mb-6">Start creating your first meme</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">My Memes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {memes.map(meme => (
          <div key={meme.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <img
                src={generateThumbnail(meme.canvas_data)}
                alt={meme.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1 truncate">{meme.title}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{meme.description || 'No description'}</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-1 rounded ${meme.is_public ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                  {meme.is_public ? 'Public' : 'Private'}
                </span>
                <button
                  onClick={() => deleteMeme(meme.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded transition"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
