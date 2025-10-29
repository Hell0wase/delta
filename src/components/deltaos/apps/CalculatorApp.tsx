import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Divide, X, Minus, Plus, Equal, Delete } from 'lucide-react';

interface CalculatorAppProps {
  themeMode: 'dark' | 'light';
}

export const CalculatorApp = ({ themeMode }: CalculatorAppProps) => {
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);

  const handleNumber = (num: string) => {
    if (display === '0') {
      setDisplay(num);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperation = (op: string) => {
    setPreviousValue(parseFloat(display));
    setOperation(op);
    setDisplay('0');
  };

  const handleEquals = () => {
    if (previousValue === null || operation === null) return;

    const current = parseFloat(display);
    let result = 0;

    switch (operation) {
      case '+':
        result = previousValue + current;
        break;
      case '-':
        result = previousValue - current;
        break;
      case '*':
        result = previousValue * current;
        break;
      case '/':
        result = previousValue / current;
        break;
    }

    setDisplay(result.toString());
    setPreviousValue(null);
    setOperation(null);
  };

  const handleClear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
  };

  const isDark = themeMode === 'dark';

  const buttons = [
    { label: '7', value: '7', type: 'number' },
    { label: '8', value: '8', type: 'number' },
    { label: '9', value: '9', type: 'number' },
    { label: <Divide className="h-5 w-5" />, value: '/', type: 'operator' },
    { label: '4', value: '4', type: 'number' },
    { label: '5', value: '5', type: 'number' },
    { label: '6', value: '6', type: 'number' },
    { label: <X className="h-5 w-5" />, value: '*', type: 'operator' },
    { label: '1', value: '1', type: 'number' },
    { label: '2', value: '2', type: 'number' },
    { label: '3', value: '3', type: 'number' },
    { label: <Minus className="h-5 w-5" />, value: '-', type: 'operator' },
    { label: '0', value: '0', type: 'number' },
    { label: '.', value: '.', type: 'number' },
    { label: <Equal className="h-5 w-5" />, value: '=', type: 'equals' },
    { label: <Plus className="h-5 w-5" />, value: '+', type: 'operator' },
  ];

  return (
    <div className="h-full flex items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="w-full max-w-sm space-y-6">
        {/* Display */}
        <div className="relative overflow-hidden rounded-3xl border backdrop-blur-3xl shadow-2xl p-6"
          style={{
            backgroundColor: isDark ? 'rgba(30, 30, 50, 0.8)' : 'rgba(255, 255, 255, 0.8)',
            borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent pointer-events-none rounded-t-3xl" />
          <div className="relative text-right">
            <div className="text-sm text-muted-foreground mb-1 min-h-[20px]">
              {previousValue !== null && operation && `${previousValue} ${operation}`}
            </div>
            <div className="text-5xl font-light tracking-tight min-h-[60px] flex items-center justify-end bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
              {display}
            </div>
          </div>
        </div>

        {/* Buttons Grid */}
        <div className="grid grid-cols-4 gap-3">
          {buttons.map((btn, index) => {
            const isOperator = btn.type === 'operator';
            const isEquals = btn.type === 'equals';
            
            return (
              <Button
                key={index}
                onClick={() => {
                  if (btn.value === '=') handleEquals();
                  else if (['/', '+', '-', '*'].includes(btn.value)) handleOperation(btn.value);
                  else handleNumber(btn.value);
                }}
                className={`h-16 rounded-2xl text-xl font-medium transition-all duration-200 hover:scale-105 active:scale-95 border backdrop-blur-xl shadow-lg hover:shadow-xl relative overflow-hidden group ${
                  isEquals ? 'bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground border-primary/50 hover:from-primary hover:via-primary/90 hover:to-primary/70' :
                  isOperator ? 'bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white border-orange-500/50 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800' :
                  ''
                }`}
                style={{
                  backgroundColor: !isOperator && !isEquals ? (isDark ? 'rgba(40, 40, 65, 0.6)' : 'rgba(255, 255, 255, 0.6)') : undefined,
                  borderColor: !isOperator && !isEquals ? (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)') : undefined,
                }}
                data-testid={`button-calc-${btn.value}`}
              >
                <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-200 rounded-2xl" />
                <span className="relative z-10">{btn.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Clear Button */}
        <Button 
          onClick={handleClear} 
          variant="destructive" 
          className="w-full h-14 text-lg rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-95 group relative overflow-hidden"
          data-testid="button-clear"
        >
          <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-all duration-200 rounded-2xl" />
          <Delete className="h-5 w-5 mr-2 relative z-10" />
          <span className="relative z-10">Clear</span>
        </Button>
      </div>
    </div>
  );
};
