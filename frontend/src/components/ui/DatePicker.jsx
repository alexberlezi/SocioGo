import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';

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

const DatePicker = ({ value, onChange, placeholder = "Selecione uma data" }) => {
    const [isOpen, setIsOpen] = useState(false);

    const parseLocalDate = (dateStr) => {
        if (!dateStr) return new Date();
        const [year, month, day] = dateStr.split('-').map(Number);
        return new Date(year, month - 1, day); // month is 0-indexed
    };

    const [viewDate, setViewDate] = useState(value ? parseLocalDate(value) : new Date());
    const containerRef = useRef(null);
    useClickOutside(containerRef, () => setIsOpen(false));

    // Update viewDate if value changes externally (and is valid)
    useEffect(() => {
        if (value) {
            setViewDate(parseLocalDate(value));
        }
    }, [value]);

    const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const months = [
        "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
        "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    const weekDays = ["D", "S", "T", "Q", "Q", "S", "S"];

    const handlePrevMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    };

    const handleNextMonth = (e) => {
        e.stopPropagation();
        setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        const y = newDate.getFullYear();
        const m = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');
        onChange(`${y}-${m}-${d}`);
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    const isSelected = (day) => {
        if (!value) return false;
        const d = parseLocalDate(value);
        return d.getDate() === day &&
            d.getMonth() === viewDate.getMonth() &&
            d.getFullYear() === viewDate.getFullYear();
    };

    const isToday = (day) => {
        const today = new Date();
        return today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear();
    };

    const formatDateDisplay = (dateStr) => {
        if (!dateStr) return "";
        const [year, month, day] = dateStr.split('-');
        return `${day}/${month}/${year}`;
    };

    const days = [];
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());

    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);

    return (
        <div className="relative w-full" ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-4 flex items-center justify-between bg-gray-50 dark:bg-slate-900/90 border transition-all rounded-xl text-sm font-medium outline-none ${isOpen
                        ? 'border-blue-500 ring-2 ring-blue-500/20'
                        : 'border-gray-200 dark:border-blue-500/30 hover:border-blue-400 dark:hover:border-blue-500/50'
                    } text-gray-800 dark:text-slate-200`}
            >
                <div className="flex items-center gap-3">
                    <Calendar className={`w-4 h-4 ${isOpen || value ? 'text-blue-500' : 'text-gray-400 dark:text-slate-500'}`} />
                    <span className={value ? 'text-gray-800 dark:text-slate-200 font-semibold' : 'text-gray-400 dark:text-slate-500'}>
                        {formatDateDisplay(value) || placeholder}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    {value && (
                        <div
                            onClick={handleClear}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-slate-800 rounded-full transition-colors group"
                        >
                            <X className="w-3.5 h-3.5 text-gray-400 dark:text-slate-500 group-hover:text-red-400" />
                        </div>
                    )}
                    <ChevronDown className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 w-72 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-100">
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                            {months[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {weekDays.map((day, i) => (
                            <div key={i} className="h-8 flex items-center justify-center text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {days.map((day, idx) => (
                            <div key={idx} className="h-8 flex items-center justify-center">
                                {day && (
                                    <button
                                        type="button"
                                        onClick={() => handleDateSelect(day)}
                                        className={`w-7 h-7 rounded-lg text-xs font-bold transition-all flex items-center justify-center
                                            ${isSelected(day)
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : isToday(day)
                                                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10'
                                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white'
                                            }`}
                                    >
                                        {day}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
