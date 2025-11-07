import { useState } from 'react';
import { X, Download } from 'lucide-react';
import { CanvasState } from '../../types/canvas';

interface ExportModalProps {
  canvasState: CanvasState;
  onClose: () => void;
}

export default function ExportModal({ canvasState, onClose }: ExportModalProps) {
  const [format, setFormat] = useState<'png' | 'jpg'>('png');
  const [quality, setQuality] = useState<'low' | 'medium' | 'high'>('high');
  const [transparent, setTransparent] = useState(false);
  const [exporting, setExporting] = useState(false);

  const getQualityScale = () => {
    switch (quality) {
      case 'low': return 1;
      case 'medium': return 2;
      case 'high': return 3;
      default: return 2;
    }
  };

  const handleExport = async () => {
    setExporting(true);

    try {
      const canvas = document.createElement('canvas');
      const scale = getQualityScale();
      canvas.width = canvasState.width * scale;
      canvas.height = canvasState.height * scale;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.scale(scale, scale);

      if (!transparent || format === 'jpg') {
        ctx.fillStyle = canvasState.backgroundColor;
        ctx.fillRect(0, 0, canvasState.width, canvasState.height);
      }

      for (const element of canvasState.elements.sort((a, b) => a.zIndex - b.zIndex)) {
        ctx.save();
        ctx.translate(element.x + element.width / 2, element.y + element.height / 2);
        ctx.rotate((element.rotation * Math.PI) / 180);

        if (element.type === 'text') {
          const textEl = element as any;
          ctx.font = `${textEl.bold ? 'bold ' : ''}${textEl.italic ? 'italic ' : ''}${textEl.fontSize}px ${textEl.fontFamily}`;
          ctx.fillStyle = textEl.color;
          ctx.textAlign = textEl.align;
          ctx.textBaseline = 'middle';

          const lines = textEl.content.split('\n');
          const lineHeight = textEl.fontSize * 1.2;
          const startY = -(lines.length - 1) * lineHeight / 2;

          lines.forEach((line: string, i: number) => {
            const x = textEl.align === 'center' ? 0 : textEl.align === 'right' ? element.width / 2 : -element.width / 2;
            ctx.fillText(line, x, startY + i * lineHeight);
          });
        } else if (element.type === 'image') {
          const imgEl = element as any;
          const img = new Image();
          img.src = imgEl.src;
          await new Promise(resolve => {
            img.onload = resolve;
            if (img.complete) resolve(null);
          });

          ctx.globalAlpha = imgEl.opacity;
          if (imgEl.filter !== 'none') {
            ctx.filter = imgEl.filter;
          }
          ctx.drawImage(img, -element.width / 2, -element.height / 2, element.width, element.height);
          ctx.globalAlpha = 1;
          ctx.filter = 'none';
        } else if (element.type === 'shape') {
          const shapeEl = element as any;
          ctx.fillStyle = shapeEl.fill;
          ctx.strokeStyle = shapeEl.stroke;
          ctx.lineWidth = shapeEl.strokeWidth;

          if (shapeEl.shapeType === 'rectangle') {
            ctx.fillRect(-element.width / 2, -element.height / 2, element.width, element.height);
            if (shapeEl.strokeWidth > 0) {
              ctx.strokeRect(-element.width / 2, -element.height / 2, element.width, element.height);
            }
          } else if (shapeEl.shapeType === 'circle') {
            ctx.beginPath();
            ctx.ellipse(0, 0, element.width / 2, element.height / 2, 0, 0, 2 * Math.PI);
            ctx.fill();
            if (shapeEl.strokeWidth > 0) {
              ctx.stroke();
            }
          } else if (shapeEl.shapeType === 'line') {
            ctx.beginPath();
            ctx.moveTo(-element.width / 2, 0);
            ctx.lineTo(element.width / 2, 0);
            ctx.lineWidth = shapeEl.strokeWidth;
            ctx.strokeStyle = shapeEl.stroke;
            ctx.stroke();
          }
        }

        ctx.restore();
      }

      const dataUrl = canvas.toDataURL(`image/${format}`, format === 'jpg' ? 0.95 : 1);
      const link = document.createElement('a');
      link.download = `meme-${Date.now()}.${format}`;
      link.href = dataUrl;
      link.click();

      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900">Export Meme</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="png"
                  checked={format === 'png'}
                  onChange={(e) => setFormat(e.target.value as 'png')}
                  className="mr-2"
                />
                PNG
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="jpg"
                  checked={format === 'jpg'}
                  onChange={(e) => setFormat(e.target.value as 'jpg')}
                  className="mr-2"
                />
                JPG
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="low">Low (1x)</option>
              <option value="medium">Medium (2x)</option>
              <option value="high">High (3x)</option>
            </select>
          </div>

          {format === 'png' && (
            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={transparent}
                  onChange={(e) => setTransparent(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Transparent Background</span>
              </label>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
          >
            <Download className="w-4 h-4" />
            <span>{exporting ? 'Exporting...' : 'Download'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
