
import React, { useRef, useState, useMemo, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { useTheme } from '../context/ThemeContext';
import { Task, SubTask, TaskStatus } from '../types';
import { ZoomIn, ZoomOut, Move, LocateFixed, List, Calendar as CalendarIcon, Timer, Book, X, GripHorizontal, LayoutTemplate, EyeOff } from 'lucide-react';
import { toggleSubtaskInTree } from '../utils/taskUtils';
import { Dashboard } from './Dashboard';
import { TimelineWheel } from './TimelineWheel';
import { FocusTimer } from './FocusTimer';
import { Journal } from './Journal';
import { CalendarView } from './CalendarView';
import { isBefore, isToday, startOfDay, parseISO, format, addDays, isSameDay } from 'date-fns';

interface Node {
  id: string;
  title: string;
  status: 'TODO' | 'COMPLETED';
  starLevel: number;
  x: number;
  y: number;
  children: Node[];
  // Metadata for rendering headers/backgrounds
  isRoot?: boolean;
  // Raw task data for ordering
  rawTask: Task; 
}

interface ColumnZone {
    key: string;
    label: string;
    x: number;
    width: number;
    isToday: boolean;
    tasks: Node[]; // Sorted nodes in this zone
}

// Layout Constants
const NODE_WIDTH = 220;
const NODE_HEIGHT = 80;
const HORIZONTAL_GAP = 80; // Gap between parent and child
const VERTICAL_GAP = 20;   // Gap between siblings
const COLUMN_GAP = 150;    // Gap between date columns

// Tab Constants for Minimized
const TAB_WIDTH = 220;
const TAB_HEIGHT = 40;

type PanelType = 'LIST' | 'TIMELINE' | 'FOCUS' | 'JOURNAL';

const DEFAULT_PANEL_DIMS: Record<PanelType, { w: number, h: number }> = {
    LIST: { w: 400, h: 600 },
    TIMELINE: { w: 350, h: 500 },
    FOCUS: { w: 320, h: 400 },
    JOURNAL: { w: 400, h: 500 },
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

// Helper: Calculate effective rank for sorting
const getRank = (t: Task) => {
    if (t.order !== undefined) return t.order;
    const base = t.starLevel > 0 ? -20000000000000 : -10000000000000;
    return base - t.createdAt;
};

export const TaskMap: React.FC = () => {
  const { tasks, updateTask } = useTasks();
  const { snapEnabled, autoHideControls, autoHideDuration, t, language } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  
  // UI State
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 100, y: 100 });
  
  // Canvas Drag State
  const [isDraggingCanvas, setIsDraggingCanvas] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  
  // Node Drag State
  const [dragNodeId, setDragNodeId] = useState<string | null>(null);
  const [dragNodeOffset, setDragNodeOffset] = useState({ x: 0, y: 0 }); // Offset of mouse from node top-left
  const [dragNodePos, setDragNodePos] = useState({ x: 0, y: 0 }); // Current world position of dragged node
  
  // Drag Detection Refs
  const nodeDragInteractionRef = useRef(false);
  const dragStartScreenPos = useRef({ x: 0, y: 0 });
  const dragDirectionRef = useRef<'left' | 'right' | null>(null);
  const lastDragMouseX = useRef(0);

  const [snapPreview, setSnapPreview] = useState<SnapPreview>({ x: 0, y: 0, w: 0, h: 0, visible: false });
  
  // Controls Visibility State
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsVisibleRef = useRef(true);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ignoreRevealRef = useRef(false);

  // Sync ref
  useEffect(() => { controlsVisibleRef.current = controlsVisible; }, [controlsVisible]);

  // Floating Panels State
  const [panels, setPanels] = useState<Record<PanelType, PanelState>>({
      LIST: { id: 'LIST', x: 40, y: 40, ...DEFAULT_PANEL_DIMS.LIST, z: 10, isOpen: false, isMinimized: false },
      TIMELINE: { id: 'TIMELINE', x: 460, y: 40, ...DEFAULT_PANEL_DIMS.TIMELINE, z: 11, isOpen: false, isMinimized: false },
      FOCUS: { id: 'FOCUS', x: 830, y: 40, ...DEFAULT_PANEL_DIMS.FOCUS, z: 12, isOpen: false, isMinimized: false },
      JOURNAL: { id: 'JOURNAL', x: 40, y: 300, ...DEFAULT_PANEL_DIMS.JOURNAL, z: 13, isOpen: false, isMinimized: false },
  });
  
  const [maxZ, setMaxZ] = useState(20);
  const [isFullCalendarOpen, setIsFullCalendarOpen] = useState(false);

  // Auto Hide Logic
  useEffect(() => {
      if (!autoHideControls) {
          setControlsVisible(true);
          if (hideTimeout.current) clearTimeout(hideTimeout.current);
          return;
      }

      const handleMouseMove = (e: MouseEvent) => {
          const { clientX, clientY } = e;
          const { innerWidth, innerHeight } = window;
          
          const bottomThreshold = 150; 
          const topRightWidth = 120; 
          const topRightHeight = 400; 
          
          const isNearBottom = clientY > innerHeight - bottomThreshold;
          const isNearTopRight = clientX > innerWidth - topRightWidth && clientY < topRightHeight;
          const inZone = isNearBottom || isNearTopRight;

          if (inZone) {
              if (ignoreRevealRef.current) return;
              
              setControlsVisible(true);
              if (hideTimeout.current) {
                  clearTimeout(hideTimeout.current);
                  hideTimeout.current = null;
              }
          } else {
              ignoreRevealRef.current = false;
              if (controlsVisibleRef.current && !hideTimeout.current) {
                  hideTimeout.current = setTimeout(() => {
                      setControlsVisible(false);
                      hideTimeout.current = null;
                  }, autoHideDuration);
              }
          }
      };
      
      window.addEventListener('mousemove', handleMouseMove);

      if (!hideTimeout.current && controlsVisible) {
           hideTimeout.current = setTimeout(() => {
              setControlsVisible(false);
              hideTimeout.current = null;
          }, autoHideDuration);
      }

      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          if (hideTimeout.current) clearTimeout(hideTimeout.current);
      };
  }, [autoHideControls, autoHideDuration]);

  const handleManualHide = (e: React.MouseEvent) => {
      e.stopPropagation();
      setControlsVisible(false);
      ignoreRevealRef.current = true;
      if (hideTimeout.current) {
          clearTimeout(hideTimeout.current);
          hideTimeout.current = null;
      }
  };

  // --- Recursive Tree Measurement & Layout ---
  const getTreeDimensions = (subtasks: SubTask[] | undefined): { width: number, height: number } => {
      if (!subtasks || subtasks.length === 0) {
          return { width: NODE_WIDTH, height: NODE_HEIGHT };
      }

      let totalHeight = 0;
      let maxWidth = 0;

      subtasks.forEach(sub => {
          const dims = getTreeDimensions(sub.subtasks);
          totalHeight += dims.height + VERTICAL_GAP;
          maxWidth = Math.max(maxWidth, dims.width);
      });
      totalHeight -= VERTICAL_GAP;

      return { 
          width: NODE_WIDTH + HORIZONTAL_GAP + maxWidth, 
          height: Math.max(NODE_HEIGHT, totalHeight) 
      };
  };

  const layoutTree = (
      task: Task, 
      subtasks: SubTask[] | undefined, 
      x: number, 
      y: number, 
      nodes: Node[], 
      links: any[]
  ): number => {
      const node: Node = { 
          id: task.id, 
          title: task.title, 
          status: task.status === TaskStatus.COMPLETED ? 'COMPLETED' : 'TODO', 
          starLevel: task.starLevel, 
          x, 
          y, 
          children: [], 
          isRoot: false,
          rawTask: task 
      };
      nodes.push(node);

      if (!subtasks || subtasks.length === 0) {
          return NODE_HEIGHT;
      }

      let currentChildY = y;
      
      subtasks.forEach(sub => {
          const childTreeHeight = getTreeDimensions(sub.subtasks).height;
          
          const mockTask: any = { 
              id: sub.id, 
              title: sub.title, 
              status: sub.completed ? TaskStatus.COMPLETED : TaskStatus.TODO, 
              starLevel: 0 
          };

          const childHeightUsed = layoutTree(
              mockTask,
              sub.subtasks, 
              x + NODE_WIDTH + HORIZONTAL_GAP, 
              currentChildY, 
              nodes, 
              links
          );

          links.push({
              x1: x + NODE_WIDTH,
              y1: y + (NODE_HEIGHT / 2),
              x2: x + NODE_WIDTH + HORIZONTAL_GAP,
              y2: currentChildY + (NODE_HEIGHT / 2)
          });
          
          node.children.push(nodes[nodes.length - 1]);
          currentChildY += Math.max(childHeightUsed, getTreeDimensions(sub.subtasks).height) + VERTICAL_GAP;
      });

      return currentChildY - y - VERTICAL_GAP;
  };

  // --- Main Timeline Layout Algorithm ---
  const calculateTimelineLayout = () => {
    const nodes: Node[] = [];
    const links: { x1: number; y1: number; x2: number; y2: number }[] = [];
    const zones: ColumnZone[] = [];
    
    const buckets: Record<string, Task[]> = {
        'nodate': [],
        'overdue': [],
        'today': [],
    };
    const futureDatesSet = new Set<string>();

    const todayDate = startOfDay(new Date());
    const tomorrowStr = format(addDays(todayDate, 1), 'yyyy-MM-dd');

    buckets[tomorrowStr] = [];
    futureDatesSet.add(tomorrowStr);

    tasks.forEach(task => {
        if (!task.dueDate) {
            buckets['nodate'].push(task);
            return;
        }

        const taskDate = parseISO(task.dueDate);
        const taskStart = startOfDay(taskDate);

        if (isBefore(taskStart, todayDate)) {
            buckets['overdue'].push(task);
        } else if (isSameDay(taskStart, todayDate)) {
            buckets['today'].push(task);
        } else {
            const dateKey = task.dueDate;
            if (!buckets[dateKey]) {
                buckets[dateKey] = [];
                futureDatesSet.add(dateKey);
            }
            buckets[dateKey].push(task);
        }
    });

    const sortedFutureDates = Array.from(futureDatesSet).sort();

    const columns = [
        { key: 'nodate', label: 'No Date' },
        { key: 'overdue', label: 'Overdue' },
        { key: 'today', label: t('common.today') },
        ...sortedFutureDates.map(date => ({ 
            key: date, 
            label: date === tomorrowStr ? t('common.tomorrow') : format(parseISO(date), 'MMM d') 
        }))
    ];

    let currentX = 0;
    const startY = 100;

    columns.forEach(col => {
        const columnTasks = buckets[col.key] || [];
        
        if (columnTasks.length === 0 && col.key === 'overdue') return;

        columnTasks.sort((a, b) => {
             if (a.status !== b.status) return a.status === TaskStatus.COMPLETED ? 1 : -1;
             return getRank(a) - getRank(b);
        });

        let currentY = startY;
        let maxColumnWidth = NODE_WIDTH;
        const zoneNodes: Node[] = [];

        columnTasks.forEach(task => {
            const dim = getTreeDimensions(task.subtasks);
            
            const heightUsed = layoutTree(
                task,
                task.subtasks,
                currentX,
                currentY,
                nodes,
                links
            );

            const realRoot = nodes.find(n => n.id === task.id);
            if(realRoot) {
                realRoot.isRoot = true;
                zoneNodes.push(realRoot);
            }

            maxColumnWidth = Math.max(maxColumnWidth, dim.width);
            currentY += Math.max(heightUsed, NODE_HEIGHT) + VERTICAL_GAP;
        });

        zones.push({
            key: col.key,
            label: col.label,
            x: currentX,
            width: maxColumnWidth,
            isToday: col.key === 'today',
            tasks: zoneNodes
        });

        currentX += maxColumnWidth + COLUMN_GAP;
    });

    return { nodes, links, zones };
  };

  const { nodes, links, zones } = useMemo(calculateTimelineLayout, [tasks, language]);

  // --- Helpers ---
  const getDetectionX = (currentX: number) => {
      // Use edge based on direction, fallback to center
      if (dragDirectionRef.current === 'right') return currentX + NODE_WIDTH;
      if (dragDirectionRef.current === 'left') return currentX;
      return currentX + (NODE_WIDTH / 2);
  };

  // --- Canvas Handlers ---
  const handleWheel = (e: React.WheelEvent) => {
    if (e.target instanceof Element && e.target.closest('.floating-panel')) return;
    if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        setScale(s => Math.min(Math.max(0.1, s * delta), 3));
    } else {
        setOffset(p => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }));
    }
  };

  const getWorldPos = (e: MouseEvent | React.MouseEvent) => ({
      x: (e.clientX - offset.x) / scale,
      y: (e.clientY - offset.y) / scale
  });

  const handleNodeMouseDown = (e: React.MouseEvent, node: Node) => {
      e.stopPropagation();
      e.preventDefault(); 
      
      const worldPos = getWorldPos(e);
      setDragNodeId(node.id);
      setDragNodeOffset({
          x: worldPos.x - node.x,
          y: worldPos.y - node.y
      });
      setDragNodePos({ x: node.x, y: node.y });
      
      dragStartScreenPos.current = { x: e.clientX, y: e.clientY };
      lastDragMouseX.current = e.clientX;
      dragDirectionRef.current = null;
      nodeDragInteractionRef.current = false;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
      if (e.target instanceof Element && e.target.closest('.floating-panel')) return;
      if ((e.target as HTMLElement).tagName !== 'BUTTON' && (e.target as HTMLElement).tagName !== 'INPUT') {
        setIsDraggingCanvas(true);
        setLastPos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
      if (dragNodeId) {
          // Detect drag threshold
          if (!nodeDragInteractionRef.current) {
              const dist = Math.hypot(e.clientX - dragStartScreenPos.current.x, e.clientY - dragStartScreenPos.current.y);
              if (dist > 5) {
                  nodeDragInteractionRef.current = true;
              }
          }

          // Detect Direction
          const currentScreenX = e.clientX;
          if (Math.abs(currentScreenX - lastDragMouseX.current) > 0) {
              dragDirectionRef.current = currentScreenX > lastDragMouseX.current ? 'right' : 'left';
          }
          lastDragMouseX.current = currentScreenX;

          const worldPos = getWorldPos(e);
          const newDragX = worldPos.x - dragNodeOffset.x;
          const newDragY = worldPos.y - dragNodeOffset.y;

          setDragNodePos({ x: newDragX, y: newDragY });

      } else if (isDraggingCanvas) {
          const dx = e.clientX - lastPos.x;
          const dy = e.clientY - lastPos.y;
          setOffset(p => ({ x: p.x + dx, y: p.y + dy }));
          setLastPos({ x: e.clientX, y: e.clientY });
      }
  };

  const handleMouseUp = () => {
      if (dragNodeId) {
          // Drop Logic
          const detectionX = getDetectionX(dragNodePos.x);
          const mouseY = dragNodePos.y + (NODE_HEIGHT / 2);
          
          const dropZone = zones.find(z => {
              const hitStart = z.x - (COLUMN_GAP / 2);
              const hitEnd = z.x + z.width + (COLUMN_GAP / 2);
              return detectionX >= hitStart && detectionX <= hitEnd;
          });

          if (dropZone) {
             const task = tasks.find(t => t.id === dragNodeId);
             if (task) {
                 // 1. Determine New Date
                 let newDueDate: string | undefined = undefined;
                 if (dropZone.key === 'nodate') newDueDate = undefined;
                 else if (dropZone.key === 'today') newDueDate = format(new Date(), 'yyyy-MM-dd');
                 else if (dropZone.key === 'overdue') {
                     const yesterday = addDays(new Date(), -1);
                     newDueDate = format(yesterday, 'yyyy-MM-dd');
                 } else newDueDate = dropZone.key;

                 // 2. Determine New Order
                 let newOrder = getRank(task); // Default to current if not inserted specifically
                 
                 const zTasks = dropZone.tasks.filter(t => t.id !== task.id); // Exclude self
                 
                 // Find insertion point
                 if (zTasks.length === 0) {
                     // Keep relative sort? Or reset?
                 } else {
                     if (mouseY < zTasks[0].y) {
                         const topRank = getRank(zTasks[0].rawTask);
                         newOrder = topRank - 1000000;
                     } 
                     else if (mouseY > zTasks[zTasks.length - 1].y + NODE_HEIGHT) {
                         const bottomRank = getRank(zTasks[zTasks.length - 1].rawTask);
                         newOrder = bottomRank + 1000000;
                     }
                     else {
                         for (let i = 0; i < zTasks.length - 1; i++) {
                             const prev = zTasks[i];
                             const next = zTasks[i+1];
                             if (mouseY > prev.y + (NODE_HEIGHT/2) && mouseY < next.y + (NODE_HEIGHT/2)) {
                                 const pRank = getRank(prev.rawTask);
                                 const nRank = getRank(next.rawTask);
                                 newOrder = (pRank + nRank) / 2;
                                 break;
                             }
                         }
                     }
                 }

                 updateTask(task.id, { dueDate: newDueDate, order: newOrder });
             }
          }

          setDragNodeId(null);
          dragDirectionRef.current = null;
      }
      setIsDraggingCanvas(false);
  };

  // --- Node Logic ---
  const handleNodeClick = (node: Node) => {
      if (nodeDragInteractionRef.current) return;
      
      const mainTask = tasks.find(t => t.id === node.id);
      if (mainTask) {
          updateTask(mainTask.id, { status: mainTask.status === TaskStatus.COMPLETED ? TaskStatus.TODO : TaskStatus.COMPLETED });
          return;
      }
      const findParentTask = (taskList: Task[]): Task | undefined => {
          const find = (subs: SubTask[], target: string): boolean => {
             for(const s of subs) {
                 if(s.id === target) return true;
                 if(s.subtasks && find(s.subtasks, target)) return true;
             }
             return false;
          }
          return taskList.find(t => t.subtasks && find(t.subtasks, node.id));
      };
      
      const parentTask = findParentTask(tasks);
      if (parentTask && parentTask.subtasks) {
          updateTask(parentTask.id, { subtasks: toggleSubtaskInTree(parentTask.subtasks, node.id) });
      }
  };

  // --- Panel Logic ---
  const togglePanel = (id: PanelType) => {
      setPanels((prev: Record<PanelType, PanelState>) => {
          const isOpen = !prev[id].isOpen;
          const containerW = containerRef.current?.clientWidth || 1000;
          const containerH = containerRef.current?.clientHeight || 800;
          
          let newX = prev[id].x;
          let newY = prev[id].y;
          
          if (!prev[id].isOpen) {
             newX = Math.max(20, Math.min(newX, containerW - prev[id].w - 20));
             newY = Math.max(20, Math.min(newY, containerH - prev[id].h - 20));
          }

          return {
              ...prev,
              [id]: { ...prev[id], isOpen, isMinimized: false, x: newX, y: newY, z: maxZ + 1 }
          };
      });
      setMaxZ(z => z + 1);
  };

  const toggleMinimize = (id: PanelType) => {
      setPanels((prev) => ({
          ...prev,
          [id]: { ...prev[id], isMinimized: !prev[id].isMinimized }
      }));
  };

  const arrangeWindows = () => {
      const containerW = containerRef.current?.clientWidth || window.innerWidth;
      const containerH = containerRef.current?.clientHeight || window.innerHeight;
      const gap = 20;
      const dockHeight = 100;
      
      const availableH = containerH - dockHeight - gap;
      const count = Object.values(panels).filter(p => p.isOpen).length;
      
      if (count === 0) return;

      const cols = Math.ceil(Math.sqrt(count));
      const rows = Math.ceil(count / cols);
      
      const w = (containerW - (gap * (cols + 1))) / cols;
      const h = (availableH - (gap * (rows + 1))) / rows;

      let idx = 0;
      const newPanels = { ...panels };
      
      (Object.keys(newPanels) as PanelType[]).forEach(key => {
          if (newPanels[key].isOpen) {
              const row = Math.floor(idx / cols);
              const col = idx % cols;
              newPanels[key] = {
                  ...newPanels[key],
                  x: gap + (col * (w + gap)),
                  y: gap + (row * (h + gap)),
                  w: w,
                  h: h,
                  z: maxZ + idx + 1,
                  isMinimized: false // restore when organizing
              };
              idx++;
          }
      });
      
      setPanels(newPanels);
      setMaxZ(z => z + count);
      setOffset({ x: 0, y: 0 });
      setScale(1);
  };

  const bringToFront = (id: PanelType) => {
      if (panels[id].z === maxZ) return;
      setPanels(prev => ({ ...prev, [id]: { ...prev[id], z: maxZ + 1 } }));
      setMaxZ(z => z + 1);
  };

  const updatePanelState = (id: PanelType, newState: Partial<PanelState>) => {
      setPanels(prev => ({ ...prev, [id]: { ...prev[id], ...newState } }));
  };

  const getStarStyle = (level: number) => {
      if (level === 0) return 'border-white dark:border-slate-800 border-l-4 border-l-indigo-500';
      if (level === 1) return 'border-yellow-200 dark:border-yellow-900 border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/10 shadow-md scale-105 z-20';
      return '';
  };

  const DockButton = ({ id, icon: Icon, label }: { id: PanelType, icon: any, label: string }) => {
      const panel = panels[id];
      const isOpen = panel.isOpen;
      const isMinimized = panel.isMinimized;
      
      return (
        <button
            onClick={() => togglePanel(id)}
            className={`
                group relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] active:scale-95
                ${isOpen 
                    ? (isMinimized 
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700' 
                        : 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 scale-110 -translate-y-2 z-10')
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:scale-105'
                }
            `}
            title={label}
        >
            <Icon size={22} strokeWidth={isOpen && !isMinimized ? 2.5 : 2} />
            {isOpen && <span className={`absolute -bottom-2 w-1.5 h-1.5 rounded-full ${isMinimized ? 'bg-slate-400' : 'bg-brand-600 dark:bg-brand-400'}`}></span>}
        </button>
      );
  };

  const ControlButton = ({ onClick, icon: Icon, active = false, label }: { onClick: any, icon: any, active?: boolean, label?: string }) => (
      <button 
        onClick={onClick} 
        className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all active:scale-95 group relative ${active ? 'bg-slate-100 dark:bg-slate-700 text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}`}
        title={label}
      >
          <Icon size={20} strokeWidth={2} />
      </button>
  );

  return (
    <div className="h-full w-full bg-slate-50 dark:bg-slate-950 relative overflow-hidden flex flex-col">
        {/* ... Canvas Layers ... */}
        <div 
            ref={containerRef}
            className={`absolute inset-0 z-0 ${isDraggingCanvas ? 'cursor-grabbing' : 'cursor-grab'}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
        >
            <div 
                className="absolute origin-top-left transition-transform duration-75 ease-out"
                style={{ 
                    transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
                    width: '100%',
                    height: '100%'
                }}
            >
                {/* Column/Zone Backgrounds */}
                {zones.map((zone, i) => {
                    const detectionX = dragNodeId ? getDetectionX(dragNodePos.x) : 0;
                    const isHovered = dragNodeId && (
                        detectionX >= (zone.x - COLUMN_GAP / 2) && 
                        detectionX <= (zone.x + zone.width + COLUMN_GAP / 2)
                    );
                    
                    return (
                        <div 
                            key={i}
                            className={`absolute top-0 bottom-0 pointer-events-none transition-all duration-300 rounded-3xl ${
                                zone.isToday 
                                ? 'bg-brand-50/50 dark:bg-brand-900/10 border-2 border-dashed border-brand-200 dark:border-brand-800' 
                                : isHovered 
                                    ? 'bg-indigo-50/50 dark:bg-indigo-900/20 border-2 border-dashed border-indigo-200'
                                    : ''
                            }`}
                            style={{ 
                                left: zone.x - 20, 
                                width: zone.width + 40,
                                minHeight: '3000px' 
                            }}
                        >
                             {/* Column Header */}
                             <div className={`absolute -top-12 left-0 w-full text-center`}>
                                <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold shadow-sm transition-transform ${
                                    isHovered ? 'scale-110' : ''
                                } ${
                                    zone.isToday 
                                    ? 'bg-brand-600 text-white' 
                                    : isHovered 
                                        ? 'bg-indigo-500 text-white'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                }`}>
                                    {zone.label}
                                </span>
                             </div>
                        </div>
                    );
                })}

                {/* Links */}
                <svg className="absolute top-0 left-0 overflow-visible w-full h-full pointer-events-none">
                    {links.map((link, i) => (
                        <path 
                            key={i}
                            d={`M ${link.x1} ${link.y1} C ${link.x1 + 40} ${link.y1}, ${link.x2 - 40} ${link.y2}, ${link.x2} ${link.y2}`}
                            fill="none"
                            stroke="currentColor"
                            className="text-slate-300 dark:text-slate-700"
                            strokeWidth="2"
                        />
                    ))}
                </svg>

                {/* Nodes */}
                {nodes.map(node => {
                    const isDraggingThis = node.id === dragNodeId;
                    // If dragging, use dragPos, else use calculated node.x/y
                    const x = isDraggingThis ? dragNodePos.x : node.x;
                    const y = isDraggingThis ? dragNodePos.y : node.y;
                    
                    return (
                        <div
                            key={node.id}
                            className={`absolute ${isDraggingThis ? 'z-50 cursor-grabbing' : 'z-10 hover:z-20'}`}
                            style={{ 
                                left: x, 
                                top: y, 
                                width: NODE_WIDTH, 
                                height: NODE_HEIGHT,
                                transition: isDraggingThis ? 'none' : 'left 0.3s ease, top 0.3s ease'
                            }}
                            onMouseDown={(e) => node.isRoot && handleNodeMouseDown(e, node)}
                        >
                            <div
                                onClick={(e) => { 
                                    if (!isDraggingThis) {
                                        e.stopPropagation(); 
                                        handleNodeClick(node); 
                                    }
                                }}
                                title={node.title}
                                className={`absolute top-0 left-0 w-full min-h-full flex flex-col justify-center p-4 rounded-xl shadow-sm border-2 transition-all hover:scale-[1.02] ${
                                    isDraggingThis 
                                        ? 'shadow-2xl border-brand-400 scale-105 bg-white dark:bg-slate-900 rotate-1' 
                                        : node.status === 'COMPLETED' 
                                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100 cursor-pointer' 
                                            : `bg-white dark:bg-slate-900 ${getStarStyle(node.starLevel)} cursor-pointer`
                                }`}
                            >
                                <h4 className={`font-semibold text-sm break-words line-clamp-2 ${node.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'} ${node.starLevel > 0 ? 'text-base font-bold' : ''}`}>
                                    {node.title}
                                </h4>
                                <div className="flex items-center gap-2 mt-2 shrink-0">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                                        node.status === 'COMPLETED' 
                                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                    }`}>
                                        {node.status}
                                    </span>
                                    {node.starLevel > 0 && !node.status && (
                                        <span className="text-[10px] font-bold text-amber-500 flex items-center gap-1">★</span>
                                    )}
                                </div>
                                
                                {node.isRoot && (
                                    <div className={`absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full flex items-center justify-center shadow-sm transition-opacity ${isDraggingThis ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        <Move size={12} className="text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>

        {/* Snap Preview (for Windows) */}
        <div 
            className={`absolute bg-brand-500/10 dark:bg-brand-400/10 border-2 border-brand-500/50 dark:border-brand-400/50 rounded-2xl z-30 transition-all duration-200 ease-out pointer-events-none backdrop-blur-[1px] ${snapPreview.visible ? 'opacity-100' : 'opacity-0'}`}
            style={{ left: snapPreview.x, top: snapPreview.y, width: snapPreview.w, height: snapPreview.h }}
        />

        {/* Dock */}
        <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${controlsVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-20 scale-90 pointer-events-none'}`}>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 shadow-[0_12px_40px_rgba(0,0,0,0.12)] dark:shadow-black/50 rounded-full p-2 flex items-center gap-2 ring-1 ring-white/50 dark:ring-slate-800">
                <DockButton id="LIST" icon={List} label={t('nav.list')} />
                <DockButton id="TIMELINE" icon={CalendarIcon} label={t('nav.calendar')} />
                <DockButton id="FOCUS" icon={Timer} label={t('nav.focus')} />
                <DockButton id="JOURNAL" icon={Book} label={t('journal.title')} />
            </div>
        </div>

        {/* Floating Panels */}
        {(Object.values(panels) as PanelState[]).map(panel => (
            panel.isOpen && (
                <FloatingPanel 
                    key={panel.id}
                    config={panel}
                    containerRef={containerRef}
                    onUpdate={(u) => updatePanelState(panel.id, u)}
                    onClose={() => updatePanelState(panel.id, { isOpen: false })}
                    onFocus={() => bringToFront(panel.id)}
                    onToggleMinimize={() => toggleMinimize(panel.id)}
                    setSnapPreview={setSnapPreview}
                    snapEnabled={snapEnabled}
                    defaultW={DEFAULT_PANEL_DIMS[panel.id].w}
                    defaultH={DEFAULT_PANEL_DIMS[panel.id].h}
                >
                    {panel.id === 'LIST' && <div className="h-full overflow-y-auto"><Dashboard /></div>}
                    {panel.id === 'TIMELINE' && <TimelineWheel onExpand={() => setIsFullCalendarOpen(true)} />}
                    {panel.id === 'FOCUS' && <FocusTimer />}
                    {panel.id === 'JOURNAL' && <Journal variant="mini" onExpand={() => updatePanelState(panel.id, { w: 800, h: 600 })} />}
                </FloatingPanel>
            )
        ))}

        {/* Controls */}
        <div className={`absolute top-6 right-6 z-[100] flex flex-col gap-2 transition-all duration-500 ${controlsVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 pointer-events-none'}`}>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-1.5 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-800/60 ring-1 ring-white/50 dark:ring-slate-800 flex flex-col gap-1">
                <ControlButton onClick={() => setScale(s => Math.min(s + 0.2, 3))} icon={ZoomIn} label={t('map.zoom_in')} />
                <ControlButton onClick={() => setScale(s => Math.max(s - 0.2, 0.1))} icon={ZoomOut} label={t('map.zoom_out')} />
                <ControlButton onClick={() => { setScale(1); setOffset({ x: 100, y: 100 }); }} icon={LocateFixed} label={t('map.reset')} />
                <div className="h-px bg-slate-200 dark:bg-slate-700 mx-2 my-0.5"></div>
                <ControlButton onClick={arrangeWindows} icon={LayoutTemplate} label={t('map.arrange')} />
                
                {autoHideControls && (
                    <>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 mx-2 my-0.5"></div>
                        <ControlButton onClick={handleManualHide} icon={EyeOff} label={t('map.hide_controls')} />
                    </>
                )}
            </div>
        </div>

        {/* Fullscreen Calendar */}
        {isFullCalendarOpen && (
             <div className="fixed inset-0 z-[60] bg-white dark:bg-slate-900 animate-in zoom-in-95 duration-200 flex flex-col">
                 <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-end">
                     <button onClick={() => setIsFullCalendarOpen(false)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"><X /></button>
                 </div>
                 <div className="flex-1 overflow-hidden"><CalendarView /></div>
             </div>
        )}
    </div>
  );
};

// --- HELPER COMPONENT: Floating Panel ---
interface FloatingPanelProps {
    config: PanelState;
    containerRef: React.RefObject<HTMLDivElement>;
    onUpdate: (updates: Partial<PanelState>) => void;
    onClose: () => void;
    onFocus: () => void;
    onToggleMinimize: () => void;
    setSnapPreview: (preview: SnapPreview) => void;
    children: React.ReactNode;
    snapEnabled: boolean;
    defaultW: number;
    defaultH: number;
}

const FloatingPanel: React.FC<FloatingPanelProps> = ({ config, containerRef, onUpdate, onClose, onFocus, onToggleMinimize, setSnapPreview, children, snapEnabled, defaultW, defaultH }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [hasMoved, setHasMoved] = useState(false);
    const startPos = useRef({ x: 0, y: 0 });
    const startDims = useRef({ w: 0, h: 0, x: 0, y: 0 });
    const phantomRef = useRef<SnapPreview | null>(null);
    const hasDragged = useRef(false);

    // Use Refs for callbacks/config to avoid useEffect dependency churn causing lost events
    const configRef = useRef(config);
    useEffect(() => { configRef.current = config; }, [config]);
    
    const onUpdateRef = useRef(onUpdate);
    useEffect(() => { onUpdateRef.current = onUpdate; }, [onUpdate]);

    const onToggleRef = useRef(onToggleMinimize);
    useEffect(() => { onToggleRef.current = onToggleMinimize; }, [onToggleMinimize]);
    
    // Keep snapEnabled in ref to access fresh value inside event listener closure
    const snapEnabledRef = useRef(snapEnabled);
    useEffect(() => { snapEnabledRef.current = snapEnabled; }, [snapEnabled]);

    useEffect(() => {
        const handleMove = (e: MouseEvent) => {
            if (!isDragging && !isResizing) return;
            
            // Critical: Prevent text selection/native drag which kills custom drag events
            e.preventDefault(); 

            const container = containerRef.current;
            if (!container) return;
            const containerRect = container.getBoundingClientRect();
            
            if (isDragging) {
                // Determine movement start
                if (!hasMoved) {
                    const dist = Math.hypot(e.clientX - startPos.current.x, e.clientY - startPos.current.y);
                    if (dist > 5) {
                        setHasMoved(true);
                        hasDragged.current = true;
                        
                        // RESTORE LOGIC: If window is effectively maximized (near container bounds), shrink to default
                        // This allows "un-snapping" by dragging, while preserving custom sizes for smaller windows
                        const isMaximized = !configRef.current.isMinimized && 
                                          (startDims.current.w >= containerRect.width - 20 || 
                                           startDims.current.h >= containerRect.height - 20);

                        if (isMaximized) {
                            const mouseRelX = e.clientX - containerRect.left;
                            const mouseRelY = e.clientY - containerRect.top;
                            
                            // Calculate new X/Y to center window on cursor (approx)
                            const newX = mouseRelX - (defaultW / 2);
                            const newY = mouseRelY - 15; // Grip handle offset
                            
                            // Reset Drag Baseline to this new state
                            startDims.current = { x: newX, y: newY, w: defaultW, h: defaultH };
                            startPos.current = { x: e.clientX, y: e.clientY };
                            
                            // Apply the resize immediately
                            onUpdateRef.current({ x: newX, y: newY, w: defaultW, h: defaultH });
                            return; // Wait for next frame to continue standard dragging
                        }
                    } else {
                        return;
                    }
                }

                let rawX = startDims.current.x + (e.clientX - startPos.current.x);
                let rawY = startDims.current.y + (e.clientY - startPos.current.y);
                
                // BOUNDARY LOGIC
                // If minimized, use TAB dims. If not, use ACTUAL dims (so no shrink during drag)
                const isMin = configRef.current.isMinimized;
                const currentW = isMin ? TAB_WIDTH : startDims.current.w;
                const currentH = isMin ? TAB_HEIGHT : startDims.current.h;
                
                const maxX = containerRect.width - currentW;
                const maxY = containerRect.height - currentH;
                
                const newX = Math.max(0, Math.min(maxX, rawX));
                const newY = Math.max(0, Math.min(maxY, rawY));
                
                onUpdateRef.current({ x: newX, y: newY });

                // Snap Logic - Only if enabled
                if (snapEnabledRef.current) {
                    // Use Panel Edges relative to container
                    const pLeft = newX;
                    const pRight = newX + currentW;
                    const pTop = newY;
                    const pBottom = newY + currentH;
                    
                    const containerW = containerRect.width;
                    const containerH = containerRect.height;
                    
                    const cornerDist = 100; // Hit-test distance for corners (since we use edges now)
                    const edgeDist = 50;    // Hit-test distance for edges
                    
                    let preview: SnapPreview = { x: 0, y: 0, w: 0, h: 0, visible: false };
                    
                    // 1. Check Corners First (Quarter Snaps)
                    if (pTop < cornerDist && pLeft < cornerDist) {
                        // Top Left
                        preview = { x: 0, y: 0, w: containerW / 2, h: containerH / 2, visible: true };
                    } else if (pTop < cornerDist && pRight > containerW - cornerDist) {
                        // Top Right
                        preview = { x: containerW / 2, y: 0, w: containerW / 2, h: containerH / 2, visible: true };
                    } else if (pBottom > containerH - cornerDist && pLeft < cornerDist) {
                        // Bottom Left
                        preview = { x: 0, y: containerH / 2, w: containerW / 2, h: containerH / 2, visible: true };
                    } else if (pBottom > containerH - cornerDist && pRight > containerW - cornerDist) {
                        // Bottom Right
                        preview = { x: containerW / 2, y: containerH / 2, w: containerW / 2, h: containerH / 2, visible: true };
                    } 
                    // 2. Check Edges (Half/Full Snaps) - only if no corner was hit
                    else if (pTop < edgeDist) {
                        // Top (Full)
                        preview = { x: 0, y: 0, w: containerW, h: containerH, visible: true };
                    } else if (pLeft < edgeDist) {
                        // Left (Half)
                        preview = { x: 0, y: 0, w: containerW / 2, h: containerH, visible: true };
                    } else if (pRight > containerW - edgeDist) {
                        // Right (Half)
                        preview = { x: containerW / 2, y: 0, w: containerW / 2, h: containerH, visible: true };
                    }

                    phantomRef.current = preview.visible ? preview : null;
                    setSnapPreview(preview);
                } else {
                    // Ensure phantom ref is cleared if snap was just disabled or not enabled
                    if (phantomRef.current) {
                        phantomRef.current = null;
                        setSnapPreview({ x: 0, y: 0, w: 0, h: 0, visible: false });
                    }
                }
            }

            if (isResizing) {
                const newW = Math.max(300, startDims.current.w + (e.clientX - startPos.current.x));
                const newH = Math.max(300, startDims.current.h + (e.clientY - startPos.current.y));
                const boundedW = Math.min(newW, containerRect.width - configRef.current.x);
                const boundedH = Math.min(newH, containerRect.height - configRef.current.y);
                onUpdateRef.current({ w: boundedW, h: boundedH });
            }
        };

        const handleUp = (e: MouseEvent) => {
            if (isDragging) {
                if (!hasDragged.current) {
                    // Clicked without dragging -> Toggle Minimize
                    onToggleRef.current();
                } else {
                    if (phantomRef.current) {
                        // Snap: Apply dims AND force expand (remove minimize state)
                        onUpdateRef.current({ ...phantomRef.current, isMinimized: false });
                    } else {
                        // Check Bounds for EXPANDED size on Drop
                        // ONLY enforce this if NOT minimized. If minimized, we trust the drag logic (which uses TAB_WIDTH)
                        const container = containerRef.current;
                        const isMin = configRef.current.isMinimized;

                        if (container && !isMin) {
                            const rect = container.getBoundingClientRect();
                            const currentX = configRef.current.x;
                            const currentY = configRef.current.y;
                            const fullW = configRef.current.w;
                            const fullH = configRef.current.h;

                            const maxX = rect.width - fullW;
                            const maxY = rect.height - fullH;

                            // Ensure expanded window enters view if it was dragged to edge as a tab
                            const finalX = Math.max(0, Math.min(maxX, currentX));
                            const finalY = Math.max(0, Math.min(maxY, currentY));

                            if (finalX !== currentX || finalY !== currentY) {
                                onUpdateRef.current({ x: finalX, y: finalY });
                            }
                        }
                    }
                }
            }
            setIsDragging(false);
            setIsResizing(false);
            setHasMoved(false);
            setSnapPreview({ x: 0, y: 0, w: 0, h: 0, visible: false });
            phantomRef.current = null;
        };

        if (isDragging || isResizing) {
            window.addEventListener('mousemove', handleMove);
            window.addEventListener('mouseup', handleUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('mouseup', handleUp);
        };
    }, [isDragging, isResizing, containerRef, setSnapPreview, hasMoved, defaultW, defaultH]); // Added defaults to dependency array

    const startDrag = (e: React.MouseEvent) => {
        onFocus();
        const target = e.target as HTMLElement;
        if (target.closest('button')) return;

        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
        setHasMoved(false);
        hasDragged.current = false;
        startPos.current = { x: e.clientX, y: e.clientY };
        // Capture initial config to avoid stale state in rapid updates
        startDims.current = { x: config.x, y: config.y, w: config.w, h: config.h };
    };

    const startResize = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        onFocus();
        setIsResizing(true);
        startPos.current = { x: e.clientX, y: e.clientY };
        startDims.current = { x: config.x, y: config.y, w: config.w, h: config.h };
    };

    const isSmall = config.isMinimized;
    const isInteracting = isDragging || isResizing;

    return (
        <div 
            className="absolute bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden floating-panel transition-shadow"
            style={{ 
                left: config.x, 
                top: config.y, 
                width: isSmall ? TAB_WIDTH : config.w, 
                height: isSmall ? TAB_HEIGHT : config.h, 
                zIndex: config.z,
                boxShadow: isDragging ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' : undefined,
                transition: isInteracting ? 'none' : 'width 0.2s cubic-bezier(0.2, 0, 0.2, 1), height 0.2s cubic-bezier(0.2, 0, 0.2, 1), left 0.2s cubic-bezier(0.2, 0, 0.2, 1), top 0.2s cubic-bezier(0.2, 0, 0.2, 1)'
            }}
            onMouseDownCapture={onFocus}
        >
            {/* Minimal Header with Close Button and Grip */}
            <div 
                className="w-full h-8 flex items-center justify-between px-3 shrink-0 bg-slate-50/50 dark:bg-slate-800/30 cursor-grab active:cursor-grabbing select-none hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
                onMouseDown={startDrag}
            >
                 <div className="flex items-center gap-2 overflow-hidden">
                    <div className="text-slate-300 dark:text-slate-600 shrink-0">
                        <GripHorizontal size={14} />
                    </div>
                    {/* Title when dragging OR minimized */}
                    {isSmall && (
                        <span className="text-xs font-bold text-slate-500 animate-in fade-in">
                            {config.id}
                        </span>
                    )}
                 </div>
                 
                 <div className="flex items-center gap-1 shrink-0">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onClose(); }}
                        onMouseDown={(e) => e.stopPropagation()} 
                        className="p-1 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                    >
                        <X size={16} />
                    </button>
                 </div>
            </div>

            {/* Content - Hidden during drag or minimize */}
            <div className={`flex-1 overflow-hidden relative cursor-default transition-opacity duration-200 ${isSmall ? 'opacity-0 pointer-events-none' : 'opacity-100'} ${isInteracting ? 'pointer-events-none select-none' : ''}`}>
                {children}
            </div>

            {/* Resize Handle - Hidden during drag or minimize */}
            {!isSmall && (
                <div 
                    className="absolute bottom-0 right-0 w-6 h-6 cursor-se-resize flex items-end justify-end p-1 z-20 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-tl-lg"
                    onMouseDown={startResize}
                >
                    <div className="w-2 h-2 border-r-2 border-b-2 border-slate-400 dark:border-slate-500"></div>
                </div>
            )}
        </div>
    );
};
