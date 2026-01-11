import React, { useState, useRef, useEffect } from 'react';
import { ToolLayout } from './ToolLayout';
import { Dices, Plus, X, ArrowRight, Edit2, RotateCw, Target } from 'lucide-react';

interface MiniToolsProps {
  onExit: () => void;
}

export const MiniTools: React.FC<MiniToolsProps> = ({ onExit }) => {
  const [activeTab, setActiveTab] = useState<'DICE' | 'COIN' | 'DECISION'>('DICE');

  return (
    <ToolLayout title="Mini Tools" icon={Dices} color="bg-rose-500" onExit={onExit}>
      
      <div className="flex justify-center mb-8">
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl inline-flex overflow-x-auto max-w-full">
            <button 
                onClick={() => setActiveTab('DICE')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'DICE' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
                Dice
            </button>
            <button 
                onClick={() => setActiveTab('COIN')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'COIN' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
                Coin Flip
            </button>
            <button 
                onClick={() => setActiveTab('DECISION')}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeTab === 'DECISION' ? 'bg-white dark:bg-slate-700 shadow-sm text-rose-600 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
            >
                Spin Wheel
            </button>
        </div>
      </div>

      <div className="max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 md:p-12 shadow-xl shadow-slate-200/50 dark:shadow-none min-h-[450px] flex items-center justify-center overflow-hidden relative">
        {activeTab === 'DICE' && <DiceTool />}
        {activeTab === 'COIN' && <CoinTool />}
        {activeTab === 'DECISION' && <DecisionTool />}
      </div>

      {/* Shared 3D Styles */}
      <style>{`
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .perspective-[1000px] { perspective: 1000px; }
      `}</style>
    </ToolLayout>
  );
};

const Dot = () => <div className="w-3 h-3 md:w-3.5 md:h-3.5 bg-slate-800 rounded-full shadow-inner"></div>;

const Face = ({ children, transform }: React.PropsWithChildren<{ transform: string }>) => (
    <div 
        className="absolute w-full h-full bg-white border-2 border-slate-100 rounded-xl flex p-3 justify-between backface-hidden shadow-sm"
        style={{ transform }}
    >
        {children}
    </div>
);

const DiceTool = () => {
    const [rolling, setRolling] = useState(false);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });

    const roll = () => {
        if (rolling) return;
        setRolling(true);

        const result = Math.floor(Math.random() * 6) + 1;

        // Standard Dice Configuration (Opposite sides sum to 7)
        // 1 (Front) vs 6 (Back)
        // 2 (Top) vs 5 (Bottom)
        // 3 (Right) vs 4 (Left)

        let x = 0, y = 0;
        
        switch(result) {
            case 1: x = 0; y = 0; break;
            case 6: x = 180; y = 0; break;
            case 2: x = -90; y = 0; break;
            case 5: x = 90; y = 0; break;
            case 3: x = 0; y = -90; break;
            case 4: x = 0; y = 90; break;
        }

        // Add randomization to spins
        const currentX = rotation.x;
        const currentY = rotation.y;
        
        const extraX = 1080 + (Math.floor(Math.random() * 2) * 360);
        const extraY = 1080 + (Math.floor(Math.random() * 2) * 360);

        setRotation({
            x: x + extraX + (Math.floor(currentX / 360) * 360),
            y: y + extraY + (Math.floor(currentY / 360) * 360)
        });

        setTimeout(() => setRolling(false), 2000);
    };

    return (
        <div className="flex flex-col items-center gap-12 w-full">
            <div className="h-40 w-full flex items-center justify-center perspective-[1000px]">
                <div 
                    className="relative w-28 h-28 transform-style-3d transition-transform duration-[2000ms] ease-[cubic-bezier(0.15,0.9,0.25,1)]"
                    style={{ transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)` }}
                >
                    {/* 1 */}
                    <Face transform="rotateY(0deg) translateZ(56px)">
                        <div className="w-full flex items-center justify-center"><div className="w-5 h-5 bg-rose-500 rounded-full shadow-inner"></div></div>
                    </Face>
                    {/* 6 */}
                    <Face transform="rotateY(180deg) translateZ(56px)">
                        <div className="w-full grid grid-cols-2 gap-x-6 px-1 place-items-center"><Dot /><Dot /><Dot /><Dot /><Dot /><Dot /></div>
                    </Face>
                    {/* 2 */}
                    <Face transform="rotateX(90deg) translateZ(56px)">
                        <div className="w-full flex justify-between"><div className="self-start"><Dot /></div><div className="self-end"><Dot /></div></div>
                    </Face>
                    {/* 5 */}
                    <Face transform="rotateX(-90deg) translateZ(56px)">
                        <div className="w-full flex flex-col justify-between">
                            <div className="flex justify-between"><Dot /><Dot /></div>
                            <div className="flex justify-center"><Dot /></div>
                            <div className="flex justify-between"><Dot /><Dot /></div>
                        </div>
                    </Face>
                    {/* 3 */}
                    <Face transform="rotateY(90deg) translateZ(56px)">
                        <div className="w-full flex justify-between"><div className="self-end"><Dot /></div><div className="self-center"><Dot /></div><div className="self-start"><Dot /></div></div>
                    </Face>
                    {/* 4 */}
                    <Face transform="rotateY(-90deg) translateZ(56px)">
                        <div className="w-full flex flex-col justify-between">
                            <div className="flex justify-between"><Dot /><Dot /></div>
                            <div className="flex justify-between"><Dot /><Dot /></div>
                        </div>
                    </Face>
                </div>
            </div>
            
            <button 
                onClick={roll} 
                disabled={rolling}
                className="w-full max-w-sm py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-bold text-lg shadow-xl shadow-slate-900/20 dark:shadow-none transition-all active:scale-95 disabled:opacity-50"
            >
                {rolling ? 'Rolling...' : 'Roll Dice'}
            </button>
        </div>
    );
};

const CoinTool = () => {
    const [result, setResult] = useState<'HEADS' | 'TAILS' | null>(null);
    const [flipping, setFlipping] = useState(false);

    const flip = () => {
        setFlipping(true);
        setResult(null);
        setTimeout(() => {
            setResult(Math.random() > 0.5 ? 'HEADS' : 'TAILS');
            setFlipping(false);
        }, 1000);
    };

    return (
        <div className="text-center w-full max-w-sm">
            <div className="h-48 flex items-center justify-center mb-6 perspective-[1000px]">
                <div className={`w-36 h-36 rounded-full border-4 flex items-center justify-center text-xl font-bold shadow-xl transition-all duration-1000 transform-style-3d ${flipping ? 'animate-spin-y border-slate-300' : (result === 'HEADS' ? 'bg-amber-400 border-amber-500 text-amber-900' : result === 'TAILS' ? 'bg-slate-200 border-slate-400 text-slate-700' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400')}`}>
                    <div className="backface-hidden">
                         {flipping ? '' : (result || '?')}
                    </div>
                </div>
            </div>
            <button 
                onClick={flip} 
                disabled={flipping}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-600/30 transition-all active:scale-95 disabled:opacity-50"
            >
                {flipping ? 'Flipping...' : 'Flip Coin'}
            </button>
            <style>{`
                .animate-spin-y { animation: spinY 0.5s infinite linear; }
                @keyframes spinY { from { transform: rotateY(0deg); } to { transform: rotateY(360deg); } }
            `}</style>
        </div>
    );
};

// --- SVG Wheel Implementation ---

const DecisionTool = () => {
    const [items, setItems] = useState<string[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [view, setView] = useState<'INPUT' | 'WHEEL'>('INPUT');
    const [spinning, setSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<string | null>(null);

    // Enhanced Palette
    const colors = [
        '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', 
        '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef', '#f43f5e'
    ];

    const handleAddItem = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            setItems(prev => [...prev, inputValue.trim()]);
            setInputValue("");
        }
    };

    const handleRemoveItem = (index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    };

    const spin = () => {
        if (spinning || items.length < 2) return;
        
        setSpinning(true);
        setResult(null);

        // Spin Logic
        const randomIndex = Math.floor(Math.random() * items.length);
        const sliceAngle = 360 / items.length;
        
        const sliceCenter = (randomIndex * sliceAngle) + (sliceAngle / 2);
        const jitter = (Math.random() * sliceAngle * 0.8) - (sliceAngle * 0.4); // Random spot in slice
        const targetAngleInOneRotation = (360 - sliceCenter) + jitter; 
        const spins = 5 * 360; // 5 full spins minimum
        const newRotation = rotation + spins + (targetAngleInOneRotation - (rotation % 360)) + 360; // Add 360 to ensure forward movement

        setRotation(newRotation);

        setTimeout(() => {
            setSpinning(false);
            setResult(items[randomIndex]);
        }, 4000); // 4s animation
    };

    // Helper: Convert polar coords to Cartesian for SVG path
    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent - Math.PI / 2); // -PI/2 to start at 12 o'clock
        const y = Math.sin(2 * Math.PI * percent - Math.PI / 2);
        return [x, y];
    };

    if (view === 'INPUT') {
        return (
            <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">Setup Wheel</h3>
                    <p className="text-slate-500 text-sm">Add options to spin</p>
                </div>

                <form onSubmit={handleAddItem} className="flex gap-2 mb-6">
                    <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type an option..."
                        className="flex-1 px-4 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 border-transparent focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-rose-500/50 outline-none transition-all"
                        autoFocus
                    />
                    <button 
                        type="submit"
                        disabled={!inputValue.trim()}
                        className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl disabled:opacity-50 transition-opacity"
                    >
                        <Plus size={24} />
                    </button>
                </form>

                <div className="flex flex-wrap gap-2 mb-8 min-h-[100px] content-start max-h-[200px] overflow-y-auto">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 pl-3 pr-1 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm animate-in zoom-in">
                            <span className="font-medium text-sm text-slate-700 dark:text-slate-200 max-w-[150px] truncate">{item}</span>
                            <button 
                                onClick={() => handleRemoveItem(idx)}
                                className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="w-full text-center text-slate-400 italic text-sm py-4">
                            No options added yet.
                        </div>
                    )}
                </div>

                <button
                    onClick={() => setView('WHEEL')}
                    disabled={items.length < 2}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                    Create Wheel <ArrowRight size={20} />
                </button>
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col items-center animate-in zoom-in duration-300">
             
            <div className="relative w-[85vw] h-[85vw] max-w-[320px] max-h-[320px] md:w-96 md:h-96 mb-8">
                {/* Pointer (Static at top) */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center drop-shadow-xl filter">
                    <div className="w-4 h-4 rounded-full bg-slate-800 dark:bg-white border-2 border-white dark:border-slate-800"></div>
                    <div className="w-0 h-0 border-l-[12px] border-l-transparent border-r-[12px] border-r-transparent border-t-[24px] border-t-slate-800 dark:border-t-white -mt-2"></div>
                </div>

                {/* The SVG Wheel */}
                <svg 
                    viewBox="-1 -1 2 2" 
                    className="w-full h-full rounded-full shadow-2xl border-4 border-white dark:border-slate-700 bg-white dark:bg-slate-800"
                    style={{ 
                        transform: `rotate(${rotation}deg)`, 
                        transition: spinning ? 'transform 4s cubic-bezier(0.2, 0, 0.1, 1)' : 'none'
                    }}
                >
                    {items.map((item, i) => {
                        // Geometry for slice
                        const startPercent = i / items.length;
                        const endPercent = (i + 1) / items.length;
                        const [startX, startY] = getCoordinatesForPercent(startPercent);
                        const [endX, endY] = getCoordinatesForPercent(endPercent);
                        const largeArcFlag = endPercent - startPercent > 0.5 ? 1 : 0;
                        
                        // Path definition
                        const pathData = [
                            `M 0 0`,
                            `L ${startX} ${startY}`,
                            `A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY}`,
                            `Z`
                        ].join(' ');

                        // Colors
                        const color = colors[i % colors.length];
                        
                        // Text Positioning
                        const sliceAngle = 360 / items.length;
                        const midAngle = (i * sliceAngle) + (sliceAngle / 2);
                        const textRadius = 0.85;
                        const textAngleRad = (midAngle - 90) * (Math.PI / 180);
                        const textX = textRadius * Math.cos(textAngleRad);
                        const textY = textRadius * Math.sin(textAngleRad);

                        return (
                            <g key={i}>
                                <path d={pathData} fill={color} stroke="white" strokeWidth="0.01" />
                                <text
                                    x={textX}
                                    y={textY}
                                    fill="white"
                                    fontSize="0.08"
                                    fontWeight="bold"
                                    fontFamily="sans-serif"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    transform={`rotate(${midAngle}, ${textX}, ${textY})`}
                                    style={{ pointerEvents: 'none' }}
                                >
                                    {item.length > 15 ? item.substring(0, 12) + '...' : item}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Center Cap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white dark:bg-slate-800 rounded-full shadow-lg border-2 border-slate-100 dark:border-slate-700 z-10 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                </div>
            </div>

            {result && !spinning && (
                <div className="mb-6 text-center animate-in zoom-in slide-in-from-bottom-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-xs mx-auto">
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <Target size={16} className="text-rose-500" />
                        <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Result</p>
                    </div>
                    <h3 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-indigo-500 leading-tight break-words">{result}</h3>
                </div>
            )}

            <div className="flex gap-3 w-full max-w-sm">
                <button 
                    onClick={() => { setView('INPUT'); setResult(null); }}
                    className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                    title="Edit Options"
                    disabled={spinning}
                >
                    <Edit2 size={20} />
                </button>
                <button 
                    onClick={spin} 
                    disabled={spinning}
                    className="flex-1 py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-rose-500/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
                >
                   {spinning ? <RotateCw className="animate-spin" /> : 'Spin Again'}
                </button>
            </div>
        </div>
    );
};