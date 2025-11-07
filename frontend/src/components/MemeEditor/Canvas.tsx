import { useRef, useEffect, useState } from 'react';
import { CanvasState, CanvasElementType, TextElement, ImageElement, ShapeElement } from '../../types/canvas';

interface CanvasProps {
  canvasState: CanvasState;
  selectedElement: string | null;
  onElementSelect: (id: string | null) => void;
  onElementUpdate: (id: string, updates: Partial<CanvasElementType>) => void;
}

export default function Canvas({ canvasState, selectedElement, onElementSelect, onElementUpdate }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();

    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle')) {
      setIsResizing(true);
      setResizeHandle(target.dataset.handle || null);
    } else {
      setIsDragging(true);
    }

    onElementSelect(elementId);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!selectedElement) return;

    const element = canvasState.elements.find(el => el.id === selectedElement);
    if (!element) return;

    if (isDragging) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      onElementUpdate(selectedElement, {
        x: element.x + deltaX,
        y: element.y + deltaY,
      });

      setDragStart({ x: e.clientX, y: e.clientY });
    } else if (isResizing && resizeHandle) {
      const deltaX = e.clientX - dragStart.x;
      const deltaY = e.clientY - dragStart.y;

      let updates: Partial<CanvasElementType> = {};

      if (resizeHandle.includes('e')) {
        updates.width = Math.max(20, element.width + deltaX);
      }
      if (resizeHandle.includes('s')) {
        updates.height = Math.max(20, element.height + deltaY);
      }
      if (resizeHandle.includes('w')) {
        updates.width = Math.max(20, element.width - deltaX);
        updates.x = element.x + deltaX;
      }
      if (resizeHandle.includes('n')) {
        updates.height = Math.max(20, element.height - deltaY);
        updates.y = element.y + deltaY;
      }

      onElementUpdate(selectedElement, updates);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, selectedElement, dragStart]);

  const renderElement = (element: CanvasElementType) => {
    const isSelected = element.id === selectedElement;
    const baseStyle = {
      position: 'absolute' as const,
      left: `${element.x}px`,
      top: `${element.y}px`,
      width: `${element.width}px`,
      height: `${element.height}px`,
      transform: `rotate(${element.rotation}deg)`,
      zIndex: element.zIndex,
      cursor: 'move',
      border: isSelected ? '2px solid #3B82F6' : 'none',
    };

    if (element.type === 'text') {
      const textEl = element as TextElement;
      return (
        <div
          key={element.id}
          style={{
            ...baseStyle,
            fontSize: `${textEl.fontSize}px`,
            fontFamily: textEl.fontFamily,
            color: textEl.color,
            fontWeight: textEl.bold ? 'bold' : 'normal',
            fontStyle: textEl.italic ? 'italic' : 'normal',
            textDecoration: textEl.underline ? 'underline' : 'none',
            textAlign: textEl.align,
            display: 'flex',
            alignItems: 'center',
            justifyContent: textEl.align === 'center' ? 'center' : textEl.align === 'right' ? 'flex-end' : 'flex-start',
            padding: '8px',
            wordWrap: 'break-word',
            overflow: 'hidden',
          }}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
        >
          {textEl.content}
          {isSelected && renderResizeHandles()}
        </div>
      );
    }

    if (element.type === 'image') {
      const imgEl = element as ImageElement;
      return (
        <div
          key={element.id}
          style={baseStyle}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
        >
          <img
            src={imgEl.src}
            alt=""
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
              opacity: imgEl.opacity,
              filter: imgEl.filter,
              pointerEvents: 'none',
            }}
          />
          {isSelected && renderResizeHandles()}
        </div>
      );
    }

    if (element.type === 'shape') {
      const shapeEl = element as ShapeElement;
      return (
        <div
          key={element.id}
          style={baseStyle}
          onMouseDown={(e) => handleMouseDown(e, element.id)}
        >
          {shapeEl.shapeType === 'rectangle' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: shapeEl.fill,
                border: `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}`,
                borderRadius: '4px',
              }}
            />
          )}
          {shapeEl.shapeType === 'circle' && (
            <div
              style={{
                width: '100%',
                height: '100%',
                backgroundColor: shapeEl.fill,
                border: `${shapeEl.strokeWidth}px solid ${shapeEl.stroke}`,
                borderRadius: '50%',
              }}
            />
          )}
          {shapeEl.shapeType === 'line' && (
            <div
              style={{
                width: '100%',
                height: `${shapeEl.strokeWidth}px`,
                backgroundColor: shapeEl.stroke,
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          )}
          {isSelected && renderResizeHandles()}
        </div>
      );
    }

    return null;
  };

  const renderResizeHandles = () => (
    <>
      <div className="resize-handle" data-handle="nw" style={{ position: 'absolute', top: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: '#3B82F6', cursor: 'nw-resize', borderRadius: '50%' }} />
      <div className="resize-handle" data-handle="ne" style={{ position: 'absolute', top: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#3B82F6', cursor: 'ne-resize', borderRadius: '50%' }} />
      <div className="resize-handle" data-handle="sw" style={{ position: 'absolute', bottom: '-4px', left: '-4px', width: '8px', height: '8px', backgroundColor: '#3B82F6', cursor: 'sw-resize', borderRadius: '50%' }} />
      <div className="resize-handle" data-handle="se" style={{ position: 'absolute', bottom: '-4px', right: '-4px', width: '8px', height: '8px', backgroundColor: '#3B82F6', cursor: 'se-resize', borderRadius: '50%' }} />
    </>
  );

  return (
    <div className="flex items-center justify-center p-8 bg-gray-100 flex-1 overflow-auto">
      <div
        ref={canvasRef}
        style={{
          width: `${canvasState.width}px`,
          height: `${canvasState.height}px`,
          backgroundColor: canvasState.backgroundColor,
          position: 'relative',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
        onClick={() => onElementSelect(null)}
      >
        {canvasState.elements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map(element => renderElement(element))}
      </div>
    </div>
  );
}
