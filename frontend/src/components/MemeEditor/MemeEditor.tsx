import { useState, useRef, useCallback } from 'react';
import { CanvasState, CanvasElementType, TextElement, ImageElement, ShapeElement } from '../../types/canvas';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import ExportModal from './ExportModal';
import SaveModal from './SaveModal';
import { useAuth } from '../../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';

interface MemeEditorProps {
  initialTemplate?: string;
  onBack?: () => void;
}

export default function MemeEditor({ initialTemplate, onBack }: MemeEditorProps) {
  const { user } = useAuth();
  const [canvasState, setCanvasState] = useState<CanvasState>({
    elements: [],
    width: 1080,
    height: 1080,
    backgroundColor: '#ffffff',
  });
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasState[]>([canvasState]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addToHistory = useCallback((newState: CanvasState) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    setCanvasState(newState);
  }, [history, historyIndex]);

  const generateId = () => `el-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const addText = () => {
    const newElement: TextElement = {
      id: generateId(),
      type: 'text',
      x: 100,
      y: 100,
      width: 300,
      height: 100,
      rotation: 0,
      zIndex: canvasState.elements.length,
      content: 'Your Text Here',
      fontSize: 32,
      fontFamily: 'Arial',
      color: '#000000',
      bold: false,
      italic: false,
      underline: false,
      align: 'center',
    };

    addToHistory({
      ...canvasState,
      elements: [...canvasState.elements, newElement],
    });
    setSelectedElement(newElement.id);
  };

  const addImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newElement: ImageElement = {
        id: generateId(),
        type: 'image',
        x: 100,
        y: 100,
        width: 400,
        height: 400,
        rotation: 0,
        zIndex: canvasState.elements.length,
        src: event.target?.result as string,
        opacity: 1,
        filter: 'none',
      };

      addToHistory({
        ...canvasState,
        elements: [...canvasState.elements, newElement],
      });
      setSelectedElement(newElement.id);
    };
    reader.readAsDataURL(file);
  };

  const addShape = (shapeType: 'rectangle' | 'circle' | 'line') => {
    const newElement: ShapeElement = {
      id: generateId(),
      type: 'shape',
      x: 200,
      y: 200,
      width: shapeType === 'line' ? 300 : 200,
      height: shapeType === 'line' ? 20 : 200,
      rotation: 0,
      zIndex: canvasState.elements.length,
      shapeType,
      fill: '#3B82F6',
      stroke: '#1E40AF',
      strokeWidth: 2,
    };

    addToHistory({
      ...canvasState,
      elements: [...canvasState.elements, newElement],
    });
    setSelectedElement(newElement.id);
  };

  const updateElement = (id: string, updates: Partial<CanvasElementType>) => {
    const newElements = canvasState.elements.map(el =>
      el.id === id ? { ...el, ...updates } : el
    );
    addToHistory({
      ...canvasState,
      elements: newElements,
    });
  };

  const deleteSelected = () => {
    if (!selectedElement) return;

    addToHistory({
      ...canvasState,
      elements: canvasState.elements.filter(el => el.id !== selectedElement),
    });
    setSelectedElement(null);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasState(history[historyIndex - 1]);
      setSelectedElement(null);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasState(history[historyIndex + 1]);
      setSelectedElement(null);
    }
  };

  const selectedElementData = canvasState.elements.find(el => el.id === selectedElement) || null;

  return (
    <div className="flex flex-col h-screen">
      {onBack && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home</span>
          </button>
        </div>
      )}
      <Toolbar
        onAddText={addText}
        onAddImage={addImage}
        onAddShape={addShape}
        onUndo={undo}
        onRedo={redo}
        onSave={() => setShowSaveModal(true)}
        onExport={() => setShowExportModal(true)}
        onShare={() => {}}
        onDelete={deleteSelected}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        hasSelection={selectedElement !== null}
      />

      <div className="flex flex-1 overflow-hidden">
        <Canvas
          canvasState={canvasState}
          selectedElement={selectedElement}
          onElementSelect={setSelectedElement}
          onElementUpdate={updateElement}
        />
        <PropertiesPanel
          selectedElement={selectedElementData}
          onUpdate={(updates) => selectedElement && updateElement(selectedElement, updates)}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {showExportModal && (
        <ExportModal
          canvasState={canvasState}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {showSaveModal && (
        <SaveModal
          canvasState={canvasState}
          onClose={() => setShowSaveModal(false)}
        />
      )}
    </div>
  );
}
