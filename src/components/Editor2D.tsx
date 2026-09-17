import { useRef, useEffect, useCallback, useState } from 'react';
import { useAppState, pointInPolygon, getObjectCenter } from '../store';
import { EquipmentObject, OBJECT_TYPE_ICONS } from '../types';

export default function Editor2D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { state, dispatch } = useAppState();
  const { currentPlan, selectedObjectId, selectedZoneId, zoom, panOffset } = state;
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  const scale = zoom; // pixels per meter

  const toScreen = useCallback((x: number, y: number) => ({
    x: x * scale + panOffset.x + 40,
    y: y * scale + panOffset.y + 40,
  }), [scale, panOffset]);

  const toWorld = useCallback((sx: number, sy: number) => ({
    x: (sx - panOffset.x - 40) / scale,
    y: (sy - panOffset.y - 40) / scale,
  }), [scale, panOffset]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvasSize.width;
    canvas.height = canvasSize.height;

    // Clear
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 0.5;
    const gridSize = scale; // 1 meter grid
    const startX = panOffset.x + 40;
    const startY = panOffset.y + 40;
    for (let x = startX; x < canvas.width; x += gridSize) {
      if (x >= 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    }
    for (let y = startY; y < canvas.height; y += gridSize) {
      if (y >= 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw room
    const room = currentPlan.room;
    const tl = toScreen(0, 0);
    const br = toScreen(room.width, room.height);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);
    ctx.strokeStyle = '#1E293B';
    ctx.lineWidth = 3;
    ctx.strokeRect(tl.x, tl.y, br.x - tl.x, br.y - tl.y);

    // Draw zones
    currentPlan.zones.forEach((zone) => {
      ctx.beginPath();
      zone.points.forEach((p, i) => {
        const sp = toScreen(p.x, p.y);
        if (i === 0) ctx.moveTo(sp.x, sp.y);
        else ctx.lineTo(sp.x, sp.y);
      });
      ctx.closePath();
      ctx.fillStyle = zone.color + '20';
      ctx.fill();
      ctx.strokeStyle = zone.id === selectedZoneId ? '#000000' : zone.color;
      ctx.lineWidth = zone.id === selectedZoneId ? 2.5 : 1.5;
      ctx.setLineDash(zone.id === selectedZoneId ? [] : [5, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Zone label
      const centerX = zone.points.reduce((s, p) => s + p.x, 0) / zone.points.length;
      const centerY = zone.points.reduce((s, p) => s + p.y, 0) / zone.points.length;
      const labelPos = toScreen(centerX, centerY);
      ctx.fillStyle = zone.color;
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(zone.name, labelPos.x, labelPos.y);
    });

    // Draw objects
    currentPlan.objects.forEach((obj) => {
      const pos = toScreen(obj.x, obj.y);
      const w = obj.width * scale;
      const h = obj.height * scale;
      const isSelected = obj.id === selectedObjectId;

      ctx.save();
      const cx = pos.x + w / 2;
      const cy = pos.y + h / 2;
      ctx.translate(cx, cy);
      ctx.rotate((obj.rotation * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);

      // Object body
      ctx.fillStyle = obj.color + (isSelected ? 'DD' : '99');
      ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = isSelected ? '#000000' : obj.color;
      ctx.lineWidth = isSelected ? 2.5 : 1.5;
      ctx.strokeRect(0, 0, w, h);

      // Icon
      const icon = OBJECT_TYPE_ICONS[obj.type];
      ctx.font = `${Math.min(w, h) * 0.5}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(icon, w / 2, h / 2);

      ctx.restore();

      // Object label
      if (isSelected || scale > 35) {
        ctx.fillStyle = '#1E293B';
        ctx.font = '9px Inter, sans-serif';
        ctx.textAlign = 'center';
        const labelY = pos.y + h + 12;
        ctx.fillText(obj.name.substring(0, 20), pos.x + w / 2, labelY);
      }
    });

    // Dimension labels
    ctx.fillStyle = '#64748B';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${room.width} м`, (tl.x + br.x) / 2, br.y + 20);
    ctx.save();
    ctx.translate(tl.x - 15, (tl.y + br.y) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${room.height} м`, 0, 0);
    ctx.restore();

    // Scale indicator
    ctx.fillStyle = '#94A3B8';
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'left';
    const scaleBarX = canvas.width - 120;
    const scaleBarY = canvas.height - 20;
    ctx.fillText(`Масштаб: 1м = ${scale}px`, scaleBarX, scaleBarY);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(scaleBarX, scaleBarY + 5);
    ctx.lineTo(scaleBarX + scale, scaleBarY + 5);
    ctx.stroke();

  }, [currentPlan, selectedObjectId, selectedZoneId, zoom, panOffset, canvasSize, scale, toScreen]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const world = toWorld(mx, my);

    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true);
      setPanStart({ x: mx - panOffset.x, y: my - panOffset.y });
      return;
    }

    // Check if clicking on an object
    const clickedObj = findObjectAt(world.x, world.y);
    if (clickedObj) {
      dispatch({ type: 'SELECT_OBJECT', payload: clickedObj.id });
      setIsDragging(true);
      setDragStart({ x: world.x - clickedObj.x, y: world.y - clickedObj.y });
      return;
    }

    // Check if clicking on a zone
    const clickedZone = findZoneAt(world.x, world.y);
    if (clickedZone) {
      dispatch({ type: 'SELECT_ZONE', payload: clickedZone.id });
      return;
    }

    dispatch({ type: 'SELECT_OBJECT', payload: null });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;

    if (isPanning) {
      dispatch({ type: 'SET_PAN', payload: { x: mx - panStart.x, y: my - panStart.y } });
      return;
    }

    if (isDragging && state.selectedObjectId) {
      const world = toWorld(mx, my);
      const obj = currentPlan.objects.find((o) => o.id === state.selectedObjectId);
      if (obj) {
        const newX = world.x - dragStart.x;
        const newY = world.y - dragStart.y;
        dispatch({
          type: 'UPDATE_OBJECT',
          payload: { ...obj, x: Math.round(newX * 10) / 10, y: Math.round(newY * 10) / 10 },
        });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    const newZoom = Math.max(20, Math.min(100, zoom + delta));
    dispatch({ type: 'SET_ZOOM', payload: newZoom });
  };

  function findObjectAt(wx: number, wy: number): EquipmentObject | null {
    for (let i = currentPlan.objects.length - 1; i >= 0; i--) {
      const obj = currentPlan.objects[i];
      if (wx >= obj.x && wx <= obj.x + obj.width && wy >= obj.y && wy <= obj.y + obj.height) {
        return obj;
      }
    }
    return null;
  }

  function findZoneAt(wx: number, wy: number) {
    for (let i = currentPlan.zones.length - 1; i >= 0; i--) {
      const zone = currentPlan.zones[i];
      if (pointInPolygon({ x: wx, y: wy }, zone.points)) {
        return zone;
      }
    }
    return null;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-slate-50 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur rounded-lg px-3 py-1.5 text-xs text-slate-600 shadow-sm border border-slate-200">
        🖱️ Перетаскивание — перемещение объекта | Alt+ЛКМ — панорама | Колесо — масштаб
      </div>
    </div>
  );
}
