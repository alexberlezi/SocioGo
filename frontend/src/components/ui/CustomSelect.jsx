import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Tag } from 'lucide-react';

const useClickOutside = (ref, handler) => {
    useEffect(() => {
        const listener = (event) => {
            if (!ref.current || ref.current.contains(event.target)) return;
            handler(event);
        };
        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);
        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

// Generic Option structure: { id: string|number, name: string, color?: string, icon?: Icon }
const CustomSelect = ({
    value,
    options = [],
    onChange,
    placeholder = "Selecione...",
    icon: Icon = Tag,
    renderOption = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    const selectedOption = options.find(opt => String(opt.id) === String(value));

    return (
        <div className="relative w-full group/select" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-4 flex items-center justify-between bg-slate-900/90 border transition-all rounded-xl text-sm font-medium outline-none ${isOpen
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-blue-500/30 hover:border-blue-500/50'
                    } ${selectedOption ? 'text-slate-200' : 'text-slate-500'}`}
            >
                <div className="flex items-center gap-3 truncate pr-2">
                    {selectedOption ? (
                        <>
                            {selectedOption.color && (
                                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-sm" style={{ backgroundColor: selectedOption.color }}></div>
                            )}
                            <span className="truncate">{selectedOption.name}</span>
                        </>
                    ) : (
                        <div className="flex items-center gap-3">
                            {Icon && <Icon className="w-4 h-4 text-slate-500" />}
                            <span>{placeholder}</span>
                        </div>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`absolute left-0 right-0 mt-2 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-[110] overflow-hidden origin-top transition-all duration-150 ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                <div className="p-1.5 space-y-0.5 max-h-60 overflow-y-auto custom-scrollbar">
                    {options.length > 0 ? (
                        options.map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => {
                                    onChange(option.id);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center w-full px-3 py-2.5 text-sm rounded-lg transition-all gap-3 ${String(value) === String(option.id)
                                    ? 'bg-blue-600 text-white font-medium shadow-md shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                {option.color && (
                                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: option.color }}></div>
                                )}
                                <span className="flex-1 text-left truncate">{option.name}</span>
                                {String(value) === String(option.id) && <Check className="w-4 h-4" />}
                            </button>
                        ))
                    ) : (
                        <div className="px-4 py-8 text-center text-slate-500 text-[10px] font-bold uppercase tracking-widest opacity-50">
                            Nenhuma opção
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomSelect;
