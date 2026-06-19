import React, { useState, useEffect, useRef } from 'react';

function TimeSelect({ value, onChange, options, freeInput = false, min = 0, max = 59 }) {
    const [open, setOpen] = useState(false);
    const [inputVal, setInputVal] = useState(value);
    const ref = useRef(null);
    const listRef = useRef(null);

    useEffect(() => { setInputVal(value); }, [value]);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
                setInputVal(value);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [value]);

    useEffect(() => {
        if (open && listRef.current) {
            const active = listRef.current.querySelector('[data-active="true"]');
            if (active) active.scrollIntoView({ block: 'center' });
        }
    }, [open]);

    const handleInput = (e) => {
        const raw = e.target.value.replace(/\D/g, '').slice(0, 2);
        setInputVal(raw);
        if (!freeInput) setOpen(true);
    };

    const handleBlur = () => {
        if (freeInput) {
            // Acepta cualquier número en el rango, sin snap a opciones
            const num = parseInt(inputVal, 10);
            if (!isNaN(num)) {
                const clamped = Math.min(Math.max(num, min), max);
                const padded = clamped.toString().padStart(2, '0');
                onChange(padded);
                setInputVal(padded);
            } else {
                setInputVal(value);
            }
        } else {
            // Snap a la opción más cercana
            const padded = inputVal.padStart(2, '0');
            const match = options.find(o => o === padded)
                || options.reduce((prev, curr) =>
                    Math.abs(parseInt(curr) - parseInt(padded)) < Math.abs(parseInt(prev) - parseInt(padded))
                        ? curr : prev
                );
            onChange(match);
            setInputVal(match);
        }
        setOpen(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleBlur();
        if (e.key === 'Escape') { setOpen(false); setInputVal(value); }
        if (!freeInput) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const idx = options.indexOf(value);
                if (idx < options.length - 1) onChange(options[idx + 1]);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const idx = options.indexOf(value);
                if (idx > 0) onChange(options[idx - 1]);
            }
        } else {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const num = Math.min(parseInt(value, 10) + 1, max);
                const padded = num.toString().padStart(2, '0');
                onChange(padded); setInputVal(padded);
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const num = Math.max(parseInt(value, 10) - 1, min);
                const padded = num.toString().padStart(2, '0');
                onChange(padded); setInputVal(padded);
            }
        }
    };

    return (
        <div className="relative" ref={ref}>
            <input
                type="text"
                value={inputVal}
                onChange={handleInput}
                onFocus={() => { if (!freeInput) setOpen(true); }}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                className=" py-1.5 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 w-14 text-center focus:outline-none focus:border-indigo-300 focus:ring-1 focus:ring-indigo-100"
            />
            {open && !freeInput && (
                <div
                    ref={listRef}
                    className="absolute bottom-full mb-1 left-0 w-14 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                    style={{
                        maxHeight: '160px',
                        overflowY: 'scroll',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                >
                    <style>{`.time-list::-webkit-scrollbar { display: none; }`}</style>
                    <div className="time-list">
                        {options.map(opt => (
                            <button
                                key={opt}
                                type="button"
                                data-active={opt === value}
                                onClick={() => { onChange(opt); setInputVal(opt); setOpen(false); }}
                                className={`w-full py-1.5 text-sm text-center transition
                                    ${opt === value
                                        ? 'bg-indigo-50 text-indigo-600 font-semibold'
                                        : 'text-gray-700 hover:bg-gray-50 hover:text-indigo-500'
                                    }`}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default TimeSelect;