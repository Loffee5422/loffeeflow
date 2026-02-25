
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Task, SubTask, TaskStatus } from '../types';
import { ZoomIn, ZoomOut, Move, LocateFixed, List, Calendar as CalendarIcon, Timer, X, GripHorizontal, EyeOff } from 'lucide-react';
import { toggleSubtaskInTree } from '../utils/taskUtils';
import { Dashboard } from './Dashboard';
import { TimelineWheel } from './TimelineWheel';
import { FocusTimer } from './FocusTimer';
import { CalendarView } from './CalendarView';
import { isBefore, isToday, format, addDays, isSameDay } from 'date-fns';

const startOfDay = (date: Date | number): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const parseISO = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

interface Node {
  id: string;
  title: string;
  status: 'TODO' | 'COMPLETED';
  starLevel: number;
  x: number;
  y: number;
  children: Node[];
  isRoot?: boolean;
  rawTask: Task; 
}

interface ColumnZone {
    key: string;
    label: string;
    x: number;
    width: number;
    isToday: boolean;
    tasks: Node[];
}

const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 80;
const VERTICAL_GAP = 20;
const COLUMN_GAP = 150;
const TAB_WIDTH = 220;
const TAB_HEIGHT = 40;

type PanelType = 'LIST' | 'TIMELINE' | 'FOCUS';

const DEFAULT_PANEL_DIMS: Record<PanelType, { w: number, h: number }> = {
    LIST: { w: 400, h: 600 },
    TIMELINE: { w: 350, h: 500 },
    FOCUS: { w: 320, h: 400 },
};

interface PanelState {
    id: PanelType;
    x: number;
    y: number;
    w: number;
    h: number;
    z: number;
    isOpen: boolean;
    isMinimized: boolean;
}

interface SnapPreview {
    x: number;
    y: number;
    w: number;
    h: number;
    visible: boolean;
    isMinimized?: boolean;
}

const getRank = (t: Task) => {
    if (t.order !== undefined) return t.order;
    const base = t.starLevel > 0 ? -20000000000000 : -10000000000000;
    return base - t.createdAt;
};

export const TaskMap: React.FC = () => {
  const { tasks, updateTask, addTask } = useTasks();
  const { snapEnabled, autoHideControls, autoHideDuration, t, language } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 100, y: 100 });
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragNodeOffset, setDragNodeOffset] = useState({ x: 0, y: 0 }); 
  const [dragNodePos, setDragNodePos] = useState({ x: 0, y: 0 }); 
  
  const nodeDragInteractionRef = useRef(false);
  const dragStartScreenPos = useRef({ x: 0, y: 0 });
  const dragDirectionRef = useRef<'left' | 'right' | null>(null);
  const lastDragMouseX = useRef(0);
  const [snapPreview, setSnapPreview] = useState<SnapPreview>({ x: 0, y: 0, w: 0, h: 0, visible: false });
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsVisibleRef = useRef(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreRevealRef = useRef(false);

  useEffect(() => { controlsVisibleRef.current = controlsVisible; }, [controlsVisible]);

  const [panels, setPanels] = useState<Record<PanelType, PanelState>>({
      LIST: { id: 'LIST', x: 40, y: 40, ...DEFAULT_PANEL_DIMS.LIST, z: 10, isOpen: false, isMinimized: false },
      TIMELINE: { id: 'TIMELINE', x: 460, y: 40, ...DEFAULT_PANEL_DIMS.TIMELINE, z: 11, isOpen: false, isMinimized: false },
      FOCUS: { id: 'FOCUS', x: 830, y: 40, ...DEFAULT_PANEL_DIMS.FOCUS, z: 12, isOpen: false, isMinimized: false },
  });
  
  const [maxZ, setMaxZ] = useState(20);
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);

  useEffect(() => {
      if (!autoHideControls) {
          setControlsVisible(true);
          if (hideTimeout.current) clearTimeout(hideTimeout.current);
          return;
      }
      const handleMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          const inZone = clientY > innerHeight - 150 || (clientX > innerWidth - 120 && clientY < 400);
          if (inZone) {
              if (ignoreRevealRef.current) return;
              setControlsVisible(true);
              if (hideTimeout.current) { clearTimeout(hideTimeout.current); hideTimeout.current = null; }
          } else {
              ignoreRevealRef.current = false;
              if (controlsVisibleRef.current && !hideTimeout.current) {
                  hideTimeout.current = setTimeout(() => { setControlsVisible(false); hideTimeout.current = null; }, autoHideDuration);
              }
          }
      };
      window.addEventListener('mousemove', handleMouseMove);
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          if (hideTimeout.current) clearTimeout(hideTimeout.current);
      };
  }, [autoHideControls, autoHideDuration]);

  const getTreeDimensions = (subtasks: SubTask[] | undefined): { width: number, height: number } => {
      if (!subtasks || subtasks.length === 0) return { width: NODE_WIDTH, height: NODE_HEIGHT };
      let totalHeight = 0, maxWidth = 0;
      subtasks.forEach(sub => {
          const dims = getTreeDimensions(sub.subtasks);
          totalHeight += dims.height + VERTICAL_GAP;
          maxWidth = Math.max(maxWidth, dims.width);
      });
      return { width: NODE_WIDTH + HORIZONTAL_GAP + maxWidth, height: Math.max(NODE_HEIGHT, totalHeight - VERTICAL_GAP) };
  };

  const layoutTree = (task: Task, subtasks: SubTask[] | undefined, x: number, y: number, nodes: Node[], links: any[]): number => {
      const node: Node = { 
          id: task.id, title: task.title, 
          status: task.status === TaskStatus.COMPLETED ? 'COMPLETED' : 'TODO', 
          starLevel: task.starLevel, x, y, children: [], rawTask: task 
      };
      nodes.push(node);
      if (!subtasks || subtasks.length === 0) return NODE_HEIGHT;
      let currentChildY = y;
      subtasks.forEach(sub => {
          const mockTask: any = { id: sub.id, title: sub.title, status: sub.completed ? TaskStatus.COMPLETED : TaskStatus.TODO, starLevel: 0 };
          const childHeightUsed = layoutTree(mockTask, sub.subtasks, x + NODE_WIDTH + HORIZONTAL_GAP, currentChildY, nodes, links);
          links.push({ x1: x + NODE_WIDTH, y1: y + (NODE_HEIGHT / 2), x2: x + NODE_WIDTH + HORIZONTAL_GAP, y2: currentChildY + (NODE_HEIGHT / 2) });
          node.children.push(nodes[nodes.length - 1]);
          currentChildY += Math.max(childHeightUsed, getTreeDimensions(sub.subtasks).height) + VERTICAL_GAP;
      });
      return currentChildY - y - VERTICAL_GAP;
  };

  const calculateTimelineLayout = () => {
    const nodes: Node[] = [], links: any[] = [], zones: ColumnZone[] = [];
    const buckets: Record<string, Task[]> = { 'nodate': [], 'overdue': [], 'today': [] };
    const futureDatesSet = new Set<string>();
    const todayDate = startOfDay(new Date());
    const tomorrowStr = format(addDays(todayDate, 1), 'yyyy-MM-dd');
    buckets[tomorrowStr] = []; futureDatesSet.add(tomorrowStr);
    tasks.forEach(task => {
        if (!task.dueDate) { buckets['nodate'].push(task); return; }
        const taskStart = startOfDay(parseISO(task.dueDate));
        if (isBefore(taskStart, todayDate)) buckets['overdue'].push(task);
        else if (isSameDay(taskStart, todayDate)) buckets['today'].push(task);
        else { if (!buckets[task.dueDate]) { buckets[task.dueDate] = []; futureDatesSet.add(task.dueDate); } buckets[task.dueDate].push(task); }
    });
    const columns = [
        { key: 'nodate', label: 'No Date' }, { key: 'overdue', label: 'Overdue' }, { key: 'today', label: t('common.today') },
        ...Array.from(futureDatesSet).sort().map(date => ({ key: date, label: date === tomorrowStr ? t('common.tomorrow') : format(parseISO(date), 'MMM d') }))
    ];
    let currentX = 0;
    columns.forEach(col => {
        const columnTasks = buckets[col.key] || [];
        if (columnTasks.length === 0 && col.key === 'overdue') return;
        columnTasks.sort((a, b) => a.status === b.status ? getRank(a) - getRank(b) : (a.status === TaskStatus.COMPLETED ? 1 : -1));
        let currentY = 100, maxColumnWidth = NODE_WIDTH;
        const zoneNodes: Node[] = [];
        columnTasks.forEach(task => {
            const heightUsed = layoutTree(task, task.subtasks, currentX, currentY, nodes, links);
            const realRoot = nodes[nodes.length - 1 - (nodes.findLastIndex(n => n.id === task.id) || 0)];
            if(nodes.find(n => n.id === task.id)) {
                const actualRoot = nodes.find(n => n.id === task.id)!;
                actualRoot.isRoot = true; zoneNodes.push(actualRoot);
            }
            maxColumnWidth = Math.max(maxColumnWidth, getTreeDimensions(task.subtasks).width);
            currentY += Math.max(heightUsed, NODE_HEIGHT) + VERTICAL_GAP;
        });
        zones.push({ key: col.key, label: col.label, x: currentX, width: maxColumnWidth, isToday: col.key === 'today', tasks: zoneNodes });
        currentX += maxColumnWidth + COLUMN_GAP;
    });
    return { nodes, links, zones };
  };

  const { nodes, links, zones } = useMemo(calculateTimelineLayout, [tasks, language]);

  const handleNodeMouseDown = (e: React.MouseEvent, node: Node) => {
      e.stopPropagation(); e.preventDefault(); 
      const worldPos = { x: (e.clientX - offset.x) / scale, y: (e.clientY - offset.y) / scale };
      setDragNodeId(node.id); setDragNodeOffset({ x: worldPos.x - node.x, y: worldPos.y - node.y }); setDragNodePos({ x: node.x, y: node.y });
      dragStartScreenPos.current = { x: e.clientX, y: e.clientY }; lastDragMouseX.current = e.clientX;
      dragDirectionRef.current = null; nodeDragInteractionRef.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (dragNodeId) {
          if (!nodeDragInteractionRef.current && Math.hypot(e.clientX - dragStartScreenPos.current.x, e.clientY - dragStartScreenPos.current.y) > 5) nodeDragInteractionRef.current = true;
          dragDirectionRef.current = e.clientX > lastDragMouseX.current ? 'right' : 'left'; lastDragMouseX.current = e.clientX;
          const worldPos = { x: (e.clientX - offset.x) / scale, y: (e.clientY - offset.y) / scale };
          setDragNodePos({ x: worldPos.x - dragNodeOffset.x, y: worldPos.y - dragNodeOffset.y });
      } else if (isDraggingCanvas) {
          setOffset(p => ({ x: p.x + e.clientX - lastPos.x, y: p.y + e.clientY - lastPos.y })); setLastPos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseUp = () => {
      if (dragNodeId) {
          const detX = dragDirectionRef.current === 'right' ? dragNodePos.x + NODE_WIDTH : dragNodePos.x;
          const mouseY = dragNodePos.y + (NODE_HEIGHT / 2);
          const dropZone = zones.find(z => detX >= z.x - (COLUMN_GAP / 2) && detX <= z.x + z.width + (COLUMN_GAP / 2));
          if (dropZone) {
             const task = tasks.find(t => t.id === dragNodeId);
             if (task) {
                 let newDueDate = dropZone.key === 'nodate' ? undefined : (dropZone.key === 'today' ? format(new Date(), 'yyyy-MM-dd') : dropZone.key);
                 updateTask(task.id, { dueDate: newDueDate });
             }
          }
          setDragNodeId(null);
      }
      setIsDraggingCanvas(false);
  };

  const updatePanelState = (id: PanelType, newState: Partial<PanelState>) => setPanels(prev => ({ ...prev, [id]: { ...prev[id], ...newState } }));
  const bringToFront = (id: PanelType) => { if (panels[id].z !== maxZ) { setPanels(prev => ({ ...prev, [id]: { ...prev[id], z: maxZ + 1 } })); setMaxZ(z => z + 1); } };

  const ControlButton = ({ onClick, icon: Icon, label }: { onClick: any, icon: any, label?: string }) => (
      <button onClick={onClick} className="w-10 h-10 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95" title={label}>
          <Icon size={20} />
      </button>
  );

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col">
        <div ref={containerRef} className={`absolute inset-0 z-0 ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`} onMouseDown={(e) => { if(!(e.target as Element).closest('.floating-panel')) { setIsDraggingCanvas(true); setLastPos({ x: e.clientX, y: e.clientY }); } }} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp} onWheel={(e) => { if(!(e.target as Element).closest('.floating-panel')) setOffset(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY })); }}>
            <div className="absolute origin-top-left transition-transform duration-75" style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, width: '100%', height: '100%' }}>
                {zones.map((zone, i) => (
                    <div key={i} className={`absolute top-0 bottom-0 rounded-3xl transition-all duration-300 ${zone.isToday ? 'bg-brand-50/50 dark:bg-brand-900/10 border-2 border-dashed border-brand-200 dark:border-brand-800' : ''}`} style={{ left: zone.x - 20, width: zone.width + 40, minHeight: '3000px' }}>
                        <div className="absolute -top-12 left-0 w-full text-center">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${zone.isToday ? 'bg-brand-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}`}>{zone.label}</span>
                        </div>
                    </div>
                ))}
                <svg className="absolute inset-0 pointer-events-none">
                    {links.map((link, i) => <path key={i} d={`M ${link.x1} ${link.y1} C ${link.x1 + 40} ${link.y1}, ${link.x2 - 40} ${link.y2}, ${link.x2} ${link.y2}`} fill="none" stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeWidth="2" />)}
                </svg>
                {nodes.map(node => (
                    <div key={node.id} className={`absolute ${node.id === dragNodeId ? 'z-50' : 'z-10'}`} style={{ left: node.id === dragNodeId ? dragNodePos.x : node.x, top: node.id === dragNodeId ? dragNodePos.y : node.y, width: NODE_WIDTH, height: NODE_HEIGHT }} onMouseDown={(e) => node.isRoot && handleNodeMouseDown(e, node)}>
                        <div onClick={(e) => { e.stopPropagation(); updateTask(node.id, { status: node.status === 'COMPLETED' ? TaskStatus.TODO : TaskStatus.COMPLETED }); }} className={`absolute inset-0 flex flex-col justify-center p-4 rounded-xl shadow-sm border-2 bg-white dark:bg-slate-900 ${node.status === 'COMPLETED' ? 'opacity-60' : node.starLevel > 0 ? 'border-l-yellow-500' : 'border-l-indigo-500'}`}>
                            <h4 className={`font-semibold text-sm line-clamp-2 ${node.status === 'COMPLETED' ? 'line-through text-slate-400' : ''}`}>{node.title}</h4>
                            {node.isRoot && <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 border rounded-full flex items-center justify-center shadow-sm"><Move size={12} className="text-slate-400" /></div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {(Object.values(panels) as PanelState[]).map((panel) => panel.isOpen && (
            <FloatingPanel key={panel.id} config={panel} containerRef={containerRef} onUpdate={(u) => updatePanelState(panel.id, u)} onClose={() => updatePanelState(panel.id, { isOpen: false })} onFocus={() => bringToFront(panel.id)} onToggleMinimize={() => updatePanelState(panel.id, { isMinimized: !panel.isMinimized })} setSnapPreview={setSnapPreview} snapEnabled={snapEnabled} defaultW={DEFAULT_PANEL_DIMS[panel.id].w} defaultH={DEFAULT_PANEL_DIMS[panel.id].h}>
                {panel.id === 'LIST' && <div className="h-full overflow-y-auto"><Dashboard /></div>}
                {panel.id === 'TIMELINE' && <TimelineWheel onExpand={() => setIsFullCalendarOpen(true)} />}
                {panel.id === 'FOCUS' && <FocusTimer />}
            </FloatingPanel>
        ))}

        <div className={`absolute top-6 right-6 z-[100] transition-all duration-500 ${controlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-xl border border-slate-200/60 dark:border-slate-800/60 flex flex-col gap-1">
                <ControlButton onClick={() => setScale(s => Math.min(s + 0.2, 3))} icon={ZoomIn} label={t('map.zoom_in')} />
                <ControlButton onClick={() => setScale(s => Math.max(s - 0.2, 0.1))} icon={ZoomOut} label={t('map.zoom_out')} />
                <ControlButton onClick={() => { setScale(1); setOffset({ x: 100, y: 100 }); }} icon={LocateFixed} label={t('map.reset')} />
            </div>
        </div>
        {isFullCalendarOpen && <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 flex flex-col"><div className="p-4 flex justify-end"><button onClick={() => setIsFullCalendarOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button></div><div className="flex-1 overflow-hidden"><CalendarView /></div></div>}
    </div>
  );
};

const FloatingPanel: React.FC<any> = ({ config, containerRef, onUpdate, onClose, onFocus, onToggleMinimize, children, defaultW, defaultH }) => {
    const [isDragging, setIsDragging] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const startDims = useRef({ w: 0, h: 0, x: 0, y: 0 });

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!isDragging) return;
            const dx = e.clientX - startPos.current.x, dy = e.clientY - startPos.current.y;
            onUpdate({ x: startDims.current.x + dx, y: startDims.current.y + dy });
        };
        const handleUp = () => setIsDragging(false);
        if (isDragging) { window.addEventListener('mousemove', handleMove); window.addEventListener('mouseup', handleUp); }
        return () => { window.removeEventListener('mousemove', handleMove); window.removeEventListener('mouseup', handleUp); };
    }, [isDragging]);

    return (
        <div className="absolute bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden floating-panel" style={{ left: config.x, top: config.y, width: config.isMinimized ? TAB_WIDTH : config.w, height: config.isMinimized ? TAB_HEIGHT : config.h, zIndex: config.z }} onMouseDownCapture={onFocus}>
            <div className="w-full h-8 flex items-center justify-between px-3 shrink-0 bg-slate-50/50 dark:bg-slate-800/30 cursor-grab active:cursor-grabbing select-none" onMouseDown={(e) => { setIsDragging(true); startPos.current = { x: e.clientX, y: e.clientY }; startDims.current = { x: config.x, y: config.y, w: config.w, h: config.h }; }}>
                 <div className="flex items-center gap-2 overflow-hidden"><GripHorizontal size={14} className="text-slate-300" />{config.isMinimized && <span className="text-xs font-bold text-slate-500">{config.id}</span>}</div>
                 <button onClick={onClose} className="p-1 text-slate-400 hover:text-rose-500 rounded-full transition-colors"><X size={16} /></button>
            </div>
            <div className={`flex-1 overflow-hidden ${config.isMinimized ? 'hidden' : 'block'}`}>{children}</div>
        </div>
    );
};
