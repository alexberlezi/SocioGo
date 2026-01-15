import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

const Card = ({ children, className }) => {
    return (
        <div className={cn(
            "bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border border-white/50 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-blue-900/10",
            className
        )}>
            {children}
        </div>
    );
};

export default Card;
