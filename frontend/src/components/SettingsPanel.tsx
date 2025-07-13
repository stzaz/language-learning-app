// frontend/src/components/SettingsPanel.tsx
'use client';

import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface SettingsPanelProps {
    fontSize: string;
    lineHeight: string;
    onFontSizeChange: (newSize: string) => void;
    onLineHeightChange: (newHeight: string) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
    fontSize,
    lineHeight,
    onFontSizeChange,
    onLineHeightChange,
}) => {
    const fontSizes = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl'];
    const lineHeights = ['leading-relaxed', 'leading-loose', 'leading-extra-loose']; // custom class

    const cycleSetting = (currentValue: string, options: string[], direction: 'up' | 'down') => {
        const currentIndex = options.indexOf(currentValue);
        if (direction === 'up') {
            return options[Math.min(currentIndex + 1, options.length - 1)];
        } else {
            return options[Math.max(currentIndex - 1, 0)];
        }
    };

    return (
        <div className="absolute top-12 right-0 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 p-4 z-10">
            <p className="text-sm font-semibold mb-2 text-left text-slate-800 dark:text-slate-200">Reading Settings</p>
            {/* Font Size Control */}
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600 dark:text-slate-300">Font Size</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => onFontSizeChange(cycleSetting(fontSize, fontSizes, 'down'))} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><Minus size={16} /></button>
                    <span className="text-lg font-sans text-slate-800 dark:text-slate-200">A</span>
                    <button onClick={() => onFontSizeChange(cycleSetting(fontSize, fontSizes, 'up'))} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><Plus size={16} /></button>
                </div>
            </div>
            {/* Line Height Control */}
            <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-300">Line Height</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => onLineHeightChange(cycleSetting(lineHeight, lineHeights, 'down'))} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><Minus size={16} /></button>
                    <span className="text-lg font-sans text-slate-800 dark:text-slate-200">¶</span>
                    <button onClick={() => onLineHeightChange(cycleSetting(lineHeight, lineHeights, 'up'))} className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"><Plus size={16} /></button>
                </div>
            </div>
        </div>
    );
};

export default SettingsPanel;
