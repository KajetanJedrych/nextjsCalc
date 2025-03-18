import React, { useState, useEffect } from 'react';
import { Slider, FormControlLabel, Radio, RadioGroup, Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material';

// Define types for the component state
type ZusType = 'duzy' | 'maly' | 'zdrowie';
type Results = {
  general: number;
  linear: number;
  flatRate: number;
};

const B2BSalaryCalculator: React.FC = () => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(11000);
  const [monthlyCosts, setMonthlyCosts] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(12);
  const [zusType, setZusType] = useState<ZusType>('maly');
  const [otherIncome, setOtherIncome] = useState<number>(0);
  const [children, setChildren] = useState<number>(0);
  const [jointFiling, setJointFiling] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);
  
  // Results state
  const [results, setResults] = useState<Results>({
    general: 0,
    linear: 0,
    flatRate: 0
  });

  // Calculate results
  useEffect(() => {
    // This is a simplified calculation for demonstration purposes
    // In a real application, you would implement the actual tax calculations
    
    const income = Number(monthlyIncome);
    const costs = Number(monthlyCosts);
    const profit = income - costs;
    
    // Simplified tax calculations based on the provided information
    const generalTax = calculateGeneralTax(profit);
    const linearTax = calculateLinearTax(profit);
    const flatRateTax = calculateFlatRateTax(income, taxRate);
    
    setResults({
      general: Math.round(profit - generalTax),
      linear: Math.round(profit - linearTax),
      flatRate: Math.round(income - flatRateTax)
    });
  }, [monthlyIncome, monthlyCosts, taxRate, zusType, otherIncome, children, jointFiling]);

  // Simplified tax calculation functions
  const calculateGeneralTax = (profit: number): number => {
    // Basic progressive tax calculation (12% up to 120k, 32% above)
    // This is highly simplified and doesn't include all deductions and specifics
    const yearlyProfit = profit * 12;
    let tax = 0;
    
    if (yearlyProfit <= 30000) {
      tax = 0;
    } else if (yearlyProfit <= 120000) {
      tax = (yearlyProfit - 30000) * 0.12;
    } else {
      tax = (120000 - 30000) * 0.12 + (yearlyProfit - 120000) * 0.32;
    }
    
    // ZUS contribution based on selection
    let zus = 0;
    if (zusType === 'duzy') {
      zus = 1600; // Approximate value
    } else if (zusType === 'maly') {
      zus = 800; // Approximate value
    } else {
      zus = 400; // Just health insurance
    }
    
    return (tax / 12) + zus;
  };

  const calculateLinearTax = (profit: number): number => {
    // 19% flat tax
    const tax = profit * 0.19;
    
    // ZUS contribution based on selection
    let zus = 0;
    if (zusType === 'duzy') {
      zus = 1600;
    } else if (zusType === 'maly') {
      zus = 800;
    } else {
      zus = 400;
    }
    
    return tax + zus;
  };

  const calculateFlatRateTax = (income: number, rate: number): number => {
    // Flat rate tax without costs deduction
    const tax = income * (rate / 100);
    
    // ZUS contribution based on selection
    let zus = 0;
    if (zusType === 'duzy') {
      zus = 1600;
    } else if (zusType === 'maly') {
      zus = 800;
    } else {
      zus = 400;
    }
    
    return tax + zus;
  };

  // Handle input changes
  const handleIncomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyIncome(Number(event.target.value));
  };

  const handleIncomeSliderChange = (_event: Event, newValue: number | number[]) => {
    setMonthlyIncome(newValue as number);
  };

  const handleCostsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyCosts(Number(event.target.value));
  };

  const handleCostsSliderChange = (_event: Event, newValue: number | number[]) => {
    setMonthlyCosts(newValue as number);
  };

  const handleTaxRateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTaxRate(Number(event.target.value));
  };

  const handleTaxRateSliderChange = (_event: Event, newValue: number | number[]) => {
    setTaxRate(newValue as number);
  };

  const handleZusTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZusType(event.target.value as ZusType);
  };

  const handleOtherIncomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setOtherIncome(Number(event.target.value));
  };

  const handleChildrenChange = (event: SelectChangeEvent<number>) => {
    setChildren(Number(event.target.value));
  };

  const handleJointFilingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setJointFiling(event.target.value === "tak");
  };

  const taxRates = [2, 3, 5.5, 8.5, 12, 12.5, 14, 15, 17];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
        <h2 className="text-lg text-gray-500 mb-2">KALKULATOR DZIAŁALNOŚCI GOSPODARCZEJ</h2>
        <h1 className="text-3xl font-bold mb-8">Najkorzystniejsza forma opodatkowania</h1>
        
        {/* Monthly Income */}
        <div className="mb-8">
          <label className="block text-gray-600 mb-2">Twój miesięczny przychód netto</label>
          <div className="flex items-center">
            <input
              type="number"
              value={monthlyIncome}
              onChange={handleIncomeChange}
              className="w-32 p-3 border border-gray-300 rounded-md mr-3"
            />
            <span className="mr-4">zł</span>
            <div className="flex-grow">
              <Slider
                value={monthlyIncome}
                onChange={handleIncomeSliderChange}
                min={100}
                max={100000}
                aria-labelledby="income-slider"
                color="primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">100 zł</span>
                <span className="text-xs text-gray-500">100 000 zł</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Monthly Costs */}
        <div className="mb-8">
          <label className="block text-gray-600 mb-2">Twoje miesięczne koszty netto</label>
          <div className="flex items-center">
            <input
              type="number"
              value={monthlyCosts}
              onChange={handleCostsChange}
              className="w-32 p-3 border border-gray-300 rounded-md mr-3"
            />
            <span className="mr-4">zł</span>
            <div className="flex-grow">
              <Slider
                value={monthlyCosts}
                onChange={handleCostsSliderChange}
                min={0}
                max={20000}
                aria-labelledby="costs-slider"
                color="primary"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-gray-500">0 zł</span>
                <span className="text-xs text-gray-500">20 000 zł</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tax Rate */}
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <label className="text-gray-600">Stawka ryczałtu</label>
            <span className="ml-2 inline-block w-5 h-5 rounded-full bg-gray-200 text-center text-gray-500 text-xs">i</span>
          </div>
          <div className="flex items-center">
            <input
              type="number"
              value={taxRate}
              onChange={handleTaxRateChange}
              className="w-32 p-3 border border-gray-300 rounded-md mr-3"
            />
            <span className="mr-4">%</span>
            <div className="flex-grow">
              <Slider
                value={taxRate}
                onChange={handleTaxRateSliderChange}
                min={2}
                max={17}
                step={null}
                marks={taxRates.map(rate => ({ value: rate, label: `${rate}%` }))}
                aria-labelledby="tax-rate-slider"
                color="primary"
              />
            </div>
          </div>
        </div>
        
        {/* ZUS Type */}
        <div className="mb-8">
          <label className="block text-gray-600 mb-2">Jaki ZUS opłacasz?</label>
          <RadioGroup 
            row 
            value={zusType} 
            onChange={handleZusTypeChange}
          >
            <FormControlLabel value="duzy" control={<Radio color="primary" />} label="Duży ZUS" />
            <FormControlLabel value="maly" control={<Radio color="primary" />} label="Mały ZUS" />
            <FormControlLabel value="zdrowie" control={<Radio color="primary" />} label="Tylko składka zdrowotna" />
          </RadioGroup>
        </div>
        
        {/* Optional Fields */}
        <div className="mb-4">
          <div className="flex items-center mb-6">
            <label className="block text-gray-600 w-40">Dochód z innych źródeł</label>
            <input
              type="number"
              value={otherIncome}
              onChange={handleOtherIncomeChange}
              className="w-40 p-3 border border-gray-300 rounded-md ml-auto"
            />
          </div>
          
          <div className="flex items-center mb-6">
            <label className="block text-gray-600 w-40">Liczba Dzieci</label>
            <FormControl className="w-40 ml-auto">
              <Select
                value={children}
                onChange={handleChildrenChange}
                className="rounded-md"
              >
                <MenuItem value={0}>0</MenuItem>
                <MenuItem value={1}>1</MenuItem>
                <MenuItem value={2}>2</MenuItem>
                <MenuItem value={3}>3</MenuItem>
                <MenuItem value={4}>4</MenuItem>
                <MenuItem value={5}>5+</MenuItem>
              </Select>
            </FormControl>
          </div>
          
          <div className="flex items-center mb-6">
            <label className="block text-gray-600">Rozliczenie z małżonkiem</label>
            <RadioGroup 
              row 
              value={jointFiling ? "tak" : "nie"} 
              onChange={handleJointFilingChange}
              className="ml-auto"
            >
              <FormControlLabel value="tak" control={<Radio color="primary" />} label="Tak" />
              <FormControlLabel value="nie" control={<Radio color="primary" />} label="Nie" />
            </RadioGroup>
          </div>
          
          <button 
            onClick={() => setShowMore(!showMore)} 
            className="text-blue-500 flex items-center justify-center w-full"
          >
            {showMore ? "Pokaż mniej opcji" : "Pokaż więcej opcji"}
            <span className={`ml-2 inline-block transform ${showMore ? 'rotate-180' : ''}`}>▲</span>
          </button>
        </div>
      </div>
      
      {/* Results Section */}
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="text-lg font-bold mb-4">Twój miesięczny dochód netto</h2>
        
        <div className="border-b border-gray-200 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span>Zasady ogólne</span>
            <span className="ml-2 inline-block w-5 h-5 rounded-full bg-gray-200 text-center text-gray-500 text-xs">i</span>
          </div>
          <span className="font-bold">{results.general.toLocaleString('pl-PL')} zł</span>
        </div>
        
        <div className="border-b border-gray-200 py-4 flex justify-between items-center">
          <span>Podatek liniowy</span>
          <span className="font-bold">{results.linear.toLocaleString('pl-PL')} zł</span>
        </div>
        
        <div className="py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span>Ryczałt</span>
            <span className="ml-2 inline-block w-5 h-5 rounded-full bg-gray-200 text-center text-gray-500 text-xs">i</span>
          </div>
          <span className="font-bold">{results.flatRate.toLocaleString('pl-PL')} zł</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500">
        <p>Kalkulator ma charakter jedynie poglądowy a dokonane wyliczenia nie mogą być traktowane jako wiążące.</p>
      </div>
    </div>
  );
};

export default B2BSalaryCalculator;