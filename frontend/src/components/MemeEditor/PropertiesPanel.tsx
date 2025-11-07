import { CanvasElementType, TextElement, ImageElement, ShapeElement } from '../../types/canvas';
import { AlignLeft, AlignCenter, AlignRight, Bold, Italic, Underline } from 'lucide-react';

interface PropertiesPanelProps {
  selectedElement: CanvasElementType | null;
  onUpdate: (updates: Partial<CanvasElementType>) => void;
}

const FONT_FAMILIES = [
  'Arial',
  'Times New Roman',
  'Courier New',
  'Georgia',
  'Verdana',
  'Comic Sans MS',
  'Impact',
  'Trebuchet MS',
];

export default function PropertiesPanel({ selectedElement, onUpdate }: PropertiesPanelProps) {
  if (!selectedElement) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
        <div className="text-center text-gray-500 mt-8">
          <p className="text-sm">Select an element to edit its properties</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">Properties</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">X</label>
              <input
                type="number"
                value={Math.round(selectedElement.x)}
                onChange={(e) => onUpdate({ x: Number(e.target.value) })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Y</label>
              <input
                type="number"
                value={Math.round(selectedElement.y)}
                onChange={(e) => onUpdate({ y: Number(e.target.value) })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Size</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Width</label>
              <input
                type="number"
                value={Math.round(selectedElement.width)}
                onChange={(e) => onUpdate({ width: Number(e.target.value) })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Height</label>
              <input
                type="number"
                value={Math.round(selectedElement.height)}
                onChange={(e) => onUpdate({ height: Number(e.target.value) })}
                className="w-full px-3 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rotation</label>
          <input
            type="range"
            min="0"
            max="360"
            value={selectedElement.rotation}
            onChange={(e) => onUpdate({ rotation: Number(e.target.value) })}
            className="w-full"
          />
          <div className="text-xs text-gray-500 text-center">{selectedElement.rotation}°</div>
        </div>

        {selectedElement.type === 'text' && (
          <TextProperties element={selectedElement as TextElement} onUpdate={onUpdate} />
        )}

        {selectedElement.type === 'image' && (
          <ImageProperties element={selectedElement as ImageElement} onUpdate={onUpdate} />
        )}

        {selectedElement.type === 'shape' && (
          <ShapeProperties element={selectedElement as ShapeElement} onUpdate={onUpdate} />
        )}
      </div>
    </div>
  );
}

function TextProperties({ element, onUpdate }: { element: TextElement; onUpdate: (updates: Partial<CanvasElementType>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Text Content</label>
        <textarea
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm resize-none"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
        <select
          value={element.fontFamily}
          onChange={(e) => onUpdate({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          {FONT_FAMILIES.map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
        <input
          type="range"
          min="12"
          max="120"
          value={element.fontSize}
          onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">{element.fontSize}px</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
        <input
          type="color"
          value={element.color}
          onChange={(e) => onUpdate({ color: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Style</label>
        <div className="flex space-x-2">
          <button
            onClick={() => onUpdate({ bold: !element.bold })}
            className={`p-2 rounded border ${element.bold ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdate({ italic: !element.italic })}
            className={`p-2 rounded border ${element.italic ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdate({ underline: !element.underline })}
            className={`p-2 rounded border ${element.underline ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
          >
            <Underline className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Text Align</label>
        <div className="flex space-x-2">
          <button
            onClick={() => onUpdate({ align: 'left' })}
            className={`p-2 rounded border ${element.align === 'left' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdate({ align: 'center' })}
            className={`p-2 rounded border ${element.align === 'center' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => onUpdate({ align: 'right' })}
            className={`p-2 rounded border ${element.align === 'right' ? 'bg-blue-100 border-blue-500' : 'border-gray-300'}`}
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </>
  );
}

function ImageProperties({ element, onUpdate }: { element: ImageElement; onUpdate: (updates: Partial<CanvasElementType>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Opacity</label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={element.opacity}
          onChange={(e) => onUpdate({ opacity: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">{Math.round(element.opacity * 100)}%</div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Filter</label>
        <select
          value={element.filter}
          onChange={(e) => onUpdate({ filter: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
        >
          <option value="none">None</option>
          <option value="grayscale(100%)">Grayscale</option>
          <option value="sepia(100%)">Sepia</option>
          <option value="blur(5px)">Blur</option>
          <option value="brightness(150%)">Bright</option>
          <option value="contrast(150%)">Contrast</option>
        </select>
      </div>
    </>
  );
}

function ShapeProperties({ element, onUpdate }: { element: ShapeElement; onUpdate: (updates: Partial<CanvasElementType>) => void }) {
  return (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Fill Color</label>
        <input
          type="color"
          value={element.fill}
          onChange={(e) => onUpdate({ fill: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Color</label>
        <input
          type="color"
          value={element.stroke}
          onChange={(e) => onUpdate({ stroke: e.target.value })}
          className="w-full h-10 border border-gray-300 rounded cursor-pointer"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stroke Width</label>
        <input
          type="range"
          min="0"
          max="20"
          value={element.strokeWidth}
          onChange={(e) => onUpdate({ strokeWidth: Number(e.target.value) })}
          className="w-full"
        />
        <div className="text-xs text-gray-500 text-center">{element.strokeWidth}px</div>
      </div>
    </>
  );
}
