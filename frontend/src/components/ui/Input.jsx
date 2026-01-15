import React, { forwardRef } from 'react';
import { cn } from '../../lib/utils'; // Assuming you have a utils file or will create one. For now I'll create one or implement cn here if needed.
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cnFn = (...inputs) => twMerge(clsx(inputs));

const Input = forwardRef(({ label, icon: Icon, error, className, ...props }, ref) => {
    return (
        <div className={cnFn("space-y-1 group", className)}>
            {label && <label className="block text-sm font-medium text-gray-700 ml-1 transition-colors group-focus-within:text-blue-600">{label}</label>}
            <div className="relative transition-all duration-300 transform group-focus-within:scale-[1.01]">
                {Icon && (
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Icon className={cnFn("w-5 h-5 text-gray-400 transition-colors duration-300 group-focus-within:text-blue-500", error && "text-red-400")} />
                    </div>
                )}
                <input
                    ref={ref}
                    className={cnFn(
                        "block w-full rounded-xl border-gray-200 bg-gray-50/50 text-gray-900", // Base
                        "focus:ring-2 focus:ring-blue-100 focus:border-blue-500 focus:bg-white", // Focus
                        "hover:bg-gray-50 hover:border-blue-300", // Hover
                        "transition-all duration-200 ease-out shadow-sm", // Transition
                        "p-3", // Base padding
                        Icon ? "pl-11" : "pl-4", // Left Padding (Overrides p-3 left)
                        error && "border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-red-100 placeholder:text-red-300"
                    )}
                    {...props}
                />
            </div>
            {error && (
                <span className="text-xs text-red-500 font-medium ml-1 animate-slideDown flex items-center gap-1">
                    {error.message}
                </span>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
