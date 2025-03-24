import React, { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const Calculator = ({ isOpen, onClose }: Props) => {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [newNumber, setNewNumber] = useState(true);

  const handleNumber = (num: string) => {
    if (newNumber) {
      setDisplay(num);
      setNewNumber(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const handleDecimal = () => {
    if (newNumber) {
      setDisplay('0.');
      setNewNumber(false);
    } else if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  const handleOperation = (op: string) => {
    const current = parseFloat(display);
    
    if (memory === null) {
      setMemory(current);
    } else if (operation) {
      const result = calculate(memory, current, operation);
      setMemory(result);
      setDisplay(result.toString());
    }
    
    setOperation(op);
    setNewNumber(true);
  };

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleEquals = () => {
    if (memory === null || !operation) return;
    
    const current = parseFloat(display);
    const result = calculate(memory, current, operation);
    
    setDisplay(result.toString());
    setMemory(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handleClear = () => {
    setDisplay('0');
    setMemory(null);
    setOperation(null);
    setNewNumber(true);
  };

  const handlePlusMinus = () => {
    setDisplay(display.charAt(0) === '-' ? display.slice(1) : '-' + display);
  };

  const handlePercent = () => {
    const current = parseFloat(display);
    setDisplay((current / 100).toString());
  };

  if (!isOpen) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-600 dark:text-gray-300 font-medium">Calculator</span>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-900 p-3 rounded-lg mb-4">
          <div className="text-right text-2xl font-mono text-gray-800 dark:text-gray-200 h-8">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {/* Row 1 */}
          <button onClick={handleClear} className="p-3 text-red-600 dark:text-red-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">AC</button>
          <button onClick={handlePlusMinus} className="p-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">±</button>
          <button onClick={handlePercent} className="p-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">%</button>
          <button onClick={() => handleOperation('÷')} className="p-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">÷</button>

          {/* Row 2 */}
          <button onClick={() => handleNumber('7')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">7</button>
          <button onClick={() => handleNumber('8')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">8</button>
          <button onClick={() => handleNumber('9')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">9</button>
          <button onClick={() => handleOperation('×')} className="p-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">×</button>

          {/* Row 3 */}
          <button onClick={() => handleNumber('4')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">4</button>
          <button onClick={() => handleNumber('5')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">5</button>
          <button onClick={() => handleNumber('6')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">6</button>
          <button onClick={() => handleOperation('-')} className="p-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">-</button>

          {/* Row 4 */}
          <button onClick={() => handleNumber('1')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">1</button>
          <button onClick={() => handleNumber('2')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">2</button>
          <button onClick={() => handleNumber('3')} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">3</button>
          <button onClick={() => handleOperation('+')} className="p-3 text-blue-600 dark:text-blue-400 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded">+</button>

          {/* Row 5 */}
          <button onClick={() => handleNumber('0')} className="p-3 col-span-2 text-center text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">0</button>
          <button onClick={handleDecimal} className="p-3 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">.</button>
          <button onClick={handleEquals} className="p-3 bg-blue-500 text-white font-medium hover:bg-blue-600 rounded">=</button>
        </div>
      </div>
    </div>
  );
};

export default Calculator;