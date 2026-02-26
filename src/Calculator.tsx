import { useState, useCallback } from 'react';

type ButtonVariant = 'digit' | 'operator' | 'utility' | 'equals' | 'zero';

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

export default function Calculator() {
    const [expression, setExpression] = useState('');
    const [result, setResult] = useState('0');
    const [justEvaluated, setJustEvaluated] = useState(false);

    const appendDigit = useCallback((digit: string) => {
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
        setJustEvaluated(false);
        setExpression(prev => {
            const trimmed = prev.trimEnd();
            if (['+', '-', '*', '/'].includes(trimmed.slice(-1))) {
                return trimmed.slice(0, -1) + op;
            }
            return trimmed + op;
        });
        setResult('0');
    }, []);

    const appendDot = useCallback(() => {
        if (result.includes('.')) return;
        setResult(prev => prev + '.');
        setExpression(prev => prev + '.');
    }, [result]);

    const clearAll = useCallback(() => {
        setExpression('');
        setResult('0');
        setJustEvaluated(false);
    }, []);

    const toggleSign = useCallback(() => {
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
    }, []);

    const percentage = useCallback(() => {
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
    }, []);

    const calculate = useCallback(() => {
        try {
            // eslint-disable-next-line no-new-func
            const evaluated = new Function('return ' + expression)();
            const formatted = parseFloat(evaluated.toFixed(10)).toString();
            setResult(formatted);
            setExpression(expression + '=');
            setJustEvaluated(true);
        } catch {
            setResult('Error');
        }
    }, [expression]);

    /**
     * The expression row shows a shortened preview of the raw expression,
     * replacing raw operator chars with their display glyphs.
     */
    const displayExpression = expression
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/-/g, '−');

    return (
        <div className="min-h-screen bg-black flex items-end justify-center pb-0 sm:items-center sm:pb-0">
            <div className="w-full max-w-[400px] bg-black px-4 pb-6 pt-0 sm:rounded-[48px] sm:overflow-hidden sm:shadow-2xl">
                {/* Display */}
                <div className="flex flex-col items-end px-4 py-6 gap-1 min-h-[160px] justify-end">
                    <div className="text-[#999] text-[18px] font-light tracking-wide min-h-[24px] truncate w-full text-right">
                        {displayExpression}
                    </div>
                    <div className="text-white font-light tracking-tight leading-none truncate w-full text-right"
                        style={{ fontSize: result.length > 9 ? '40px' : '72px' }}>
                        {result}
                    </div>
                </div>

                {/* Keypad */}
                <div className="grid grid-cols-4 gap-3">
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
            </div>
        </div>
    );
}
