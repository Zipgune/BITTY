import { Type, Image, Square, Undo2, Redo2, Download, Save, Share2, Trash2 } from 'lucide-react';

interface ToolbarProps {
  onAddText: () => void;
  onAddImage: () => void;
  onAddShape: (type: 'rectangle' | 'circle' | 'line') => void;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onExport: () => void;
  onShare: () => void;
  onDelete: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
}

export default function Toolbar({
  onAddText,
  onAddImage,
  onAddShape,
  onUndo,
  onRedo,
  onSave,
  onExport,
  onShare,
  onDelete,
  canUndo,
  canRedo,
  hasSelection,
}: ToolbarProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
      <div className="flex items-center space-x-2">
        <button
          onClick={onAddText}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          title="Add Text"
        >
          <Type className="w-4 h-4" />
          <span>Text</span>
        </button>

        <button
          onClick={onAddImage}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          title="Add Image"
        >
          <Image className="w-4 h-4" />
          <span>Image</span>
        </button>

        <div className="relative group">
          <button
            className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition font-medium"
            title="Add Shape"
          >
            <Square className="w-4 h-4" />
            <span>Shape</span>
          </button>
          <div className="hidden group-hover:block absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 min-w-[150px]">
            <button
              onClick={() => onAddShape('rectangle')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Rectangle
            </button>
            <button
              onClick={() => onAddShape('circle')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Circle
            </button>
            <button
              onClick={() => onAddShape('line')}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
            >
              Line
            </button>
          </div>
        </div>

        <div className="h-6 w-px bg-gray-300 mx-2" />

        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Undo"
        >
          <Undo2 className="w-5 h-5" />
        </button>

        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition"
          title="Redo"
        >
          <Redo2 className="w-5 h-5" />
        </button>

        {hasSelection && (
          <>
            <div className="h-6 w-px bg-gray-300 mx-2" />
            <button
              onClick={onDelete}
              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
              title="Delete Selected"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={onSave}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
          title="Save Meme"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>

        <button
          onClick={onExport}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          title="Export Meme"
        >
          <Download className="w-4 h-4" />
          <span>Export</span>
        </button>

        <button
          onClick={onShare}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          title="Share Meme"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
