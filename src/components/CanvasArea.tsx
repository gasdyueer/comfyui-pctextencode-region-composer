
import React, { useRef, useEffect, useState } from 'react';
import { Stage, Layer, Rect, Transformer, Group, Text } from 'react-konva';
import { Region, CanvasSettings } from '../types';
import Konva from 'konva';

interface CanvasAreaProps {
  canvas: CanvasSettings;
  regions: Region[];
  selectedRegionId: string | null;
  onUpdateRegion: (id: string, updates: Partial<Region>) => void;
  onSelectRegion: (id: string | null) => void;
}

const CanvasArea: React.FC<CanvasAreaProps> = ({
  canvas,
  regions,
  selectedRegionId,
  onUpdateRegion,
  onSelectRegion,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const transformerRef = useRef<Konva.Transformer>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      const padding = 64;
      const availableW = clientWidth - padding;
      const availableH = clientHeight - padding;
      
      const scaleX = availableW / canvas.width;
      const scaleY = availableH / canvas.height;
      const newScale = Math.min(scaleX, scaleY, 1);
      
      setScale(newScale);
      setOffset({
        x: (clientWidth - canvas.width * newScale) / 2,
        y: (clientHeight - canvas.height * newScale) / 2,
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvas.width, canvas.height]);

  useEffect(() => {
    if (selectedRegionId && transformerRef.current && stageRef.current) {
      const selectedNode = stageRef.current.findOne(`#${selectedRegionId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer()?.batchDraw();
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
      transformerRef.current.getLayer()?.batchDraw();
    }
  }, [selectedRegionId, regions]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>, id: string) => {
    onUpdateRegion(id, {
      x: e.target.x(),
      y: e.target.y(),
    });
  };

  const handleTransformEnd = (e: Konva.KonvaEventObject<Event>, id: string) => {
    const node = e.target;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);

    onUpdateRegion(id, {
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(5, node.height() * scaleY),
    });
  };

  return (
    <div ref={containerRef} className="flex-1 bg-slate-950 overflow-hidden relative" onClick={() => onSelectRegion(null)}>
      {/* Rulers / Dimensions overlay */}
      <div className="absolute top-4 left-4 text-xs font-mono text-slate-500 pointer-events-none">
        {canvas.width} x {canvas.height}
      </div>

      <Stage
        width={containerRef.current?.clientWidth || 0}
        height={containerRef.current?.clientHeight || 0}
        ref={stageRef}
      >
        <Layer x={offset.x} y={offset.y} scaleX={scale} scaleY={scale}>
          {/* Background Canvas area */}
          <Rect
            width={canvas.width}
            height={canvas.height}
            fill="#1e293b"
            stroke="#475569"
            strokeWidth={2 / scale}
            shadowColor="black"
            shadowBlur={20}
            shadowOpacity={0.5}
          />
          
          {/* Grid lines */}
          <Group listening={false}>
            {Array.from({ length: 11 }).map((_, i) => (
              <React.Fragment key={i}>
                <Rect
                  x={(canvas.width / 10) * i}
                  y={0}
                  width={1 / scale}
                  height={canvas.height}
                  fill="#334155"
                  opacity={i % 5 === 0 ? 0.3 : 0.1}
                />
                <Rect
                  x={0}
                  y={(canvas.height / 10) * i}
                  width={canvas.width}
                  height={1 / scale}
                  fill="#334155"
                  opacity={i % 5 === 0 ? 0.3 : 0.1}
                />
              </React.Fragment>
            ))}
          </Group>

          {/* Regions */}
          {regions.map((region, idx) => (
            <Group
              key={region.id}
              id={region.id}
              x={region.x}
              y={region.y}
              draggable
              onDragStart={() => onSelectRegion(region.id)}
              onDragEnd={(e) => handleDragEnd(e, region.id)}
              onTransformEnd={(e) => handleTransformEnd(e, region.id)}
              onClick={(e) => {
                e.cancelBubble = true;
                onSelectRegion(region.id);
              }}
              dragBoundFunc={(pos) => {
                // pos is in screen coordinates; convert to canvas coords, constrain, convert back
                const canvasX = (pos.x - offset.x) / scale;
                const canvasY = (pos.y - offset.y) / scale;
                const clampedX = Math.max(0, Math.min(canvasX, canvas.width - region.width));
                const clampedY = Math.max(0, Math.min(canvasY, canvas.height - region.height));
                return { x: clampedX * scale + offset.x, y: clampedY * scale + offset.y };
              }}
            >
              <Rect
                width={region.width}
                height={region.height}
                fill={region.color}
                opacity={0.3}
                stroke={region.color}
                strokeWidth={2 / scale}
                dash={selectedRegionId === region.id ? [] : [10, 5]}
              />
              <Text
                text={`#${idx + 1}`}
                fontSize={14 / scale}
                fill="white"
                padding={5 / scale}
                listening={false}
              />
              {region.prompt && (
                <Text
                  text={region.prompt}
                  fontSize={10 / scale}
                  fill="white"
                  y={region.height - 15 / scale}
                  padding={5 / scale}
                  width={region.width}
                  align="center"
                  wrap="none"
                  ellipsis={true}
                  listening={false}
                />
              )}
            </Group>
          ))}

          {selectedRegionId && (
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                // Minimum size
                if (newBox.width < 5 || newBox.height < 5) return oldBox;
                // Max size check could go here if needed
                return newBox;
              }}
              rotateEnabled={false}
              anchorSize={8 / scale}
              anchorCornerRadius={2}
              borderStroke="#6366f1"
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default CanvasArea;
