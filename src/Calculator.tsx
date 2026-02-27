import { useState, useCallback } from 'react';

type ButtonVariant = 'digit' | 'operator' | 'utility' | 'equals' | 'zero';
type AppMode = 'calculator' | 'converter';

// ─── Unit conversion config ───────────────────────────────────────────────────

type UnitCategory = 'Length' | 'Weight' | 'Temperature' | 'Speed';

interface UnitOption {
    label: string;
    toBase: (v: number) => number;   // convert unit → base unit
    fromBase: (v: number) => number; // convert base unit → unit
}

const UNIT_MAP: Record<UnitCategory, UnitOption[]> = {
    Length: [
        { label: 'Meter', toBase: v => v, fromBase: v => v },
        { label: 'Kilometer', toBase: v => v * 1000, fromBase: v => v / 1000 },
        { label: 'Centimeter', toBase: v => v / 100, fromBase: v => v * 100 },
        { label: 'Millimeter', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { label: 'Mile', toBase: v => v * 1609.34, fromBase: v => v / 1609.34 },
        { label: 'Yard', toBase: v => v * 0.9144, fromBase: v => v / 0.9144 },
        { label: 'Foot', toBase: v => v * 0.3048, fromBase: v => v / 0.3048 },
        { label: 'Inch', toBase: v => v * 0.0254, fromBase: v => v / 0.0254 },
    ],
    Weight: [
        { label: 'Kilogram', toBase: v => v, fromBase: v => v },
        { label: 'Gram', toBase: v => v / 1000, fromBase: v => v * 1000 },
        { label: 'Milligram', toBase: v => v / 1e6, fromBase: v => v * 1e6 },
        { label: 'Pound', toBase: v => v * 0.453592, fromBase: v => v / 0.453592 },
        { label: 'Ounce', toBase: v => v * 0.0283495, fromBase: v => v / 0.0283495 },
        { label: 'Ton', toBase: v => v * 1000, fromBase: v => v / 1000 },
    ],
    Temperature: [
        { label: 'Celsius', toBase: v => v, fromBase: v => v },
        { label: 'Fahrenheit', toBase: v => (v - 32) * 5 / 9, fromBase: v => v * 9 / 5 + 32 },
        { label: 'Kelvin', toBase: v => v - 273.15, fromBase: v => v + 273.15 },
    ],
    Speed: [
        { label: 'm/s', toBase: v => v, fromBase: v => v },
        { label: 'km/h', toBase: v => v / 3.6, fromBase: v => v * 3.6 },
        { label: 'mph', toBase: v => v * 0.44704, fromBase: v => v / 0.44704 },
        { label: 'knot', toBase: v => v * 0.514444, fromBase: v => v / 0.514444 },
    ],
};

const CATEGORIES = Object.keys(UNIT_MAP) as UnitCategory[];

// ─── Shared button component ──────────────────────────────────────────────────

interface CalcButtonProps {
    label: string;
    onClick: () => void;
    variant?: ButtonVariant;
}

const variantClasses: Record<ButtonVariant, string> = {
    digit: 'bg-[#333333] text-white hover:bg-[#444444] active:bg-[#555555]',
    operator: 'bg-[#F1A33C] text-white hover:bg-[#FFBE6E] active:bg-[#E59A30]',
    utility: 'bg-[#A5A5A5] text-black hover:bg-[#C7C7C7] active:bg-[#909090]',
    equals: 'bg-[#F1A33C] text-white hover:bg-[#FFBE6E] active:bg-[#E59A30]',
    zero: 'col-span-2 bg-[#333333] text-white hover:bg-[#444444] active:bg-[#555555] justify-start pl-6',
};

function CalcButton({ label, onClick, variant = 'digit' }: CalcButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`
        flex items-center justify-center
        rounded-full text-[28px] font-light
        h-[78px] w-full
        transition-all duration-100 ease-in-out
        select-none cursor-pointer
        ${variantClasses[variant]}
      `}
        >
            {label}
        </button>
    );
}

// ─── Unit Converter panel ─────────────────────────────────────────────────────

function UnitConverter() {
    const [category, setCategory] = useState<UnitCategory>('Length');
    const [fromIdx, setFromIdx] = useState(0);
    const [toIdx, setToIdx] = useState(1);
    const [inputValue, setInputValue] = useState('');

    const units = UNIT_MAP[category];

    const convert = useCallback((raw: string, fIdx: number, tIdx: number, cat: UnitCategory): string => {
        const num = parseFloat(raw);

        console.log('[UnitConverter] convert called', { raw, fromUnit: UNIT_MAP[cat][fIdx].label, toUnit: UNIT_MAP[cat][tIdx].label, category: cat });

        if (raw === '' || isNaN(num)) {
            console.log('[UnitConverter] invalid input — returning empty');
            return '';
        }

        const base = UNIT_MAP[cat][fIdx].toBase(num);
        const result = UNIT_MAP[cat][tIdx].fromBase(base);
        const formatted = parseFloat(result.toFixed(10)).toString();

        console.log('[UnitConverter] result', { base, result: formatted });
        return formatted;
    }, []);

    const handleCategoryChange = (cat: UnitCategory) => {
        console.log('[UnitConverter] category changed', { from: category, to: cat });
        setCategory(cat);
        setFromIdx(0);
        setToIdx(1);
        setInputValue('');
    };

    const handleFromUnitChange = (idx: number) => {
        console.log('[UnitConverter] fromUnit changed', { to: UNIT_MAP[category][idx].label });
        setFromIdx(idx);
    };

    const handleToUnitChange = (idx: number) => {
        console.log('[UnitConverter] toUnit changed', { to: UNIT_MAP[category][idx].label });
        setToIdx(idx);
    };

    const handleSwap = () => {
        console.log('[UnitConverter] swap units', { from: units[fromIdx].label, to: units[toIdx].label });
        setFromIdx(toIdx);
        setToIdx(fromIdx);
        setInputValue('');
    };

    const outputValue = convert(inputValue, fromIdx, toIdx, category);

    const selectClass =
        'w-full bg-[#1c1c1e] text-white rounded-2xl px-4 py-3 text-[15px] border border-[#3a3a3c] focus:outline-none focus:border-[#F1A33C] appearance-none cursor-pointer';

    return (
        <div className="flex flex-col gap-5 px-4 pb-6 pt-4">
            {/* Category tabs */}
            <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => handleCategoryChange(cat)}
                        className={`
                            rounded-full py-2 text-[13px] font-medium transition-all duration-100
                            ${category === cat
                                ? 'bg-[#F1A33C] text-white'
                                : 'bg-[#2c2c2e] text-[#aaa] hover:bg-[#3a3a3c]'}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* From */}
            <div className="flex flex-col gap-2">
                <label className="text-[#888] text-[12px] uppercase tracking-widest pl-1">From</label>
                <div className="relative">
                    <select
                        value={fromIdx}
                        onChange={e => handleFromUnitChange(Number(e.target.value))}
                        className={selectClass}
                    >
                        {units.map((u, i) => (
                            <option key={u.label} value={i}>{u.label}</option>
                        ))}
                    </select>
                </div>
                <input
                    type="number"
                    value={inputValue}
                    onChange={e => {
                        console.log('[UnitConverter] input changed', { value: e.target.value });
                        setInputValue(e.target.value);
                    }}
                    placeholder="Enter value"
                    className="w-full bg-[#1c1c1e] text-white rounded-2xl px-4 py-4 text-[28px] font-light border border-[#3a3a3c] focus:outline-none focus:border-[#F1A33C] placeholder:text-[#444]"
                />
            </div>

            {/* Swap button */}
            <div className="flex justify-center">
                <button
                    onClick={handleSwap}
                    className="bg-[#2c2c2e] hover:bg-[#3a3a3c] active:bg-[#444] text-[#F1A33C] rounded-full w-12 h-12 flex items-center justify-center text-[22px] transition-all duration-100"
                    title="Swap units"
                >
                    ⇅
                </button>
            </div>

            {/* To */}
            <div className="flex flex-col gap-2">
                <label className="text-[#888] text-[12px] uppercase tracking-widest pl-1">To</label>
                <div className="relative">
                    <select
                        value={toIdx}
                        onChange={e => handleToUnitChange(Number(e.target.value))}
                        className={selectClass}
                    >
                        {units.map((u, i) => (
                            <option key={u.label} value={i}>{u.label}</option>
                        ))}
                    </select>
                </div>
                <div className="w-full bg-[#1c1c1e] text-white rounded-2xl px-4 py-4 text-[28px] font-light border border-[#2a2a2c] min-h-[76px]">
                    {outputValue !== '' ? outputValue : <span className="text-[#444]">Result</span>}
                </div>
            </div>
        </div>
    );
}

// ─── Root component ───────────────────────────────────────────────────────────

export default function Calculator() {
    const [mode, setMode] = useState<AppMode>('calculator');

    // Calculator state
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('0');
    const [justEvaluated, setJustEvaluated] = useState(false);

    const handleModeSwitch = (next: AppMode) => {
        console.log('[Calculator] mode switch', { from: mode, to: next });
        setMode(next);
    };

    const appendDigit = useCallback((digit: string) => {
        console.log('[Calculator] appendDigit', { digit, justEvaluated });
        if (justEvaluated) {
            setExpression(digit);
            setResult(digit);
            setJustEvaluated(false);
            return;
        }
        const next = result === '0' && digit !== '.' ? digit : result + digit;
        setResult(next);
        setExpression(prev => prev + digit);
    }, [result, justEvaluated]);

    const appendOperator = useCallback((op: string) => {
        console.log('[Calculator] appendOperator', { op, expression });
        setJustEvaluated(false);
        setExpression(prev => {
            const trimmed = prev.trimEnd();
            if (['+', '-', '*', '/'].includes(trimmed.slice(-1))) {
                return trimmed.slice(0, -1) + op;
            }
            return trimmed + op;
        });
        setResult('0');
    }, [expression]);

    const appendDot = useCallback(() => {
        console.log('[Calculator] appendDot', { result });
        if (result.includes('.')) return;
        setResult(prev => prev + '.');
        setExpression(prev => prev + '.');
    }, [result]);

    const clearAll = useCallback(() => {
        console.log('[Calculator] clearAll');
        setExpression('');
        setResult('0');
        setJustEvaluated(false);
    }, []);

    const toggleSign = useCallback(() => {
        console.log('[Calculator] toggleSign', { result });
        setResult(prev => {
            const n = parseFloat(prev);
            if (isNaN(n)) return prev;
            return String(-n);
        });
        setExpression(prev => {
            const n = parseFloat(prev);
            if (!isNaN(n)) return String(-n);
            return prev;
        });
    }, [result]);

    const percentage = useCallback(() => {
        console.log('[Calculator] percentage', { result });
        setResult(prev => {
            const n = parseFloat(prev);
            if (isNaN(n)) return prev;
            return String(n / 100);
        });
        setExpression(prev => {
            try {
                return String(parseFloat(prev) / 100);
            } catch {
                return prev;
            }
        });
    }, [result]);

    const calculate = useCallback(() => {
        console.log('[Calculator] calculate', { expression });
        try {
            // eslint-disable-next-line no-new-func
            const evaluated = new Function('return ' + expression)();
            const formatted = parseFloat(evaluated.toFixed(10)).toString();
            console.log('[Calculator] result', { formatted });
            setResult(formatted);
            setExpression(expression + '=');
            setJustEvaluated(true);
        } catch (err) {
            console.error('[Calculator] evaluation error', err);
            setResult('Error');
        }
    }, [expression]);

    const displayExpression = expression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−');

    return (
        <div className="min-h-screen bg-black flex items-end justify-center pb-0 sm:items-center sm:pb-0">
            <div className="w-full max-w-[400px] bg-black px-0 pb-6 pt-0 sm:rounded-[48px] sm:overflow-hidden sm:shadow-2xl">

                {/* Mode tabs */}
                <div className="flex gap-2 mx-4 mt-4 mb-2 bg-[#1c1c1e] rounded-full p-1">
                    {(['calculator', 'converter'] as AppMode[]).map(m => (
                        <button
                            key={m}
                            onClick={() => handleModeSwitch(m)}
                            className={`
                                flex-1 rounded-full py-2 text-[14px] font-medium capitalize transition-all duration-150
                                ${mode === m
                                    ? 'bg-[#F1A33C] text-white shadow'
                                    : 'text-[#aaa] hover:text-white'}
                            `}
                        >
                            {m === 'calculator' ? 'Calculator' : 'Convert'}
                        </button>
                    ))}
                </div>

                {mode === 'calculator' ? (
                    <>
                        {/* Display */}
                        <div className="flex flex-col items-end px-4 py-6 gap-1 min-h-[160px] justify-end">
                            <div className="text-[#999] text-[18px] font-light tracking-wide min-h-[24px] truncate w-full text-right">
                                {displayExpression}
                            </div>
                            <div
                                className="text-white font-light tracking-tight leading-none truncate w-full text-right"
                                style={{ fontSize: result.length > 9 ? '40px' : '72px' }}
                            >
                                {result}
                            </div>
                        </div>

                        {/* Keypad */}
                        <div className="grid grid-cols-4 gap-3 px-4">
                            <CalcButton label="AC" onClick={clearAll} variant="utility" />
                            <CalcButton label="+/−" onClick={toggleSign} variant="utility" />
                            <CalcButton label="%" onClick={percentage} variant="utility" />
                            <CalcButton label="÷" onClick={() => appendOperator('/')} variant="operator" />

                            <CalcButton label="7" onClick={() => appendDigit('7')} />
                            <CalcButton label="8" onClick={() => appendDigit('8')} />
                            <CalcButton label="9" onClick={() => appendDigit('9')} />
                            <CalcButton label="×" onClick={() => appendOperator('*')} variant="operator" />

                            <CalcButton label="4" onClick={() => appendDigit('4')} />
                            <CalcButton label="5" onClick={() => appendDigit('5')} />
                            <CalcButton label="6" onClick={() => appendDigit('6')} />
                            <CalcButton label="−" onClick={() => appendOperator('-')} variant="operator" />

                            <CalcButton label="1" onClick={() => appendDigit('1')} />
                            <CalcButton label="2" onClick={() => appendDigit('2')} />
                            <CalcButton label="3" onClick={() => appendDigit('3')} />
                            <CalcButton label="+" onClick={() => appendOperator('+')} variant="operator" />

                            {/* Zero spans 2 columns */}
                            <button
                                onClick={() => appendDigit('0')}
                                className={`
                                    col-span-2 flex items-center justify-start pl-6
                                    rounded-full text-[28px] font-light text-white
                                    h-[78px] bg-[#333333] hover:bg-[#444444] active:bg-[#555555]
                                    transition-all duration-100 ease-in-out select-none cursor-pointer
                                `}
                            >
                                0
                            </button>
                            <CalcButton label="." onClick={appendDot} />
                            <CalcButton label="=" onClick={calculate} variant="equals" />
                        </div>
                    </>
                ) : (
                    <UnitConverter />
                )}
            </div>
        </div>
    );
}
