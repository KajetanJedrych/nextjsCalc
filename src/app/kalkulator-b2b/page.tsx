"use client";
import React, { useState, useEffect } from 'react';
import { Slider, FormControlLabel, Radio, RadioGroup, Select, MenuItem, FormControl, SelectChangeEvent } from '@mui/material';

// Define types for the component state
type ZusType = 'duzy' | 'maly' | 'zdrowie';
type IncomeFrequency = 'monthly' | 'daily' | 'hourly';
type Results = {
  general: number;
  linear: number;
  flatRate: number;
};

const B2BSalaryCalculator: React.FC = () => {
  const [income, setIncome] = useState<number>(11000);
  const [incomeFrequency, setIncomeFrequency] = useState<IncomeFrequency>('monthly');
  const [monthlyCosts, setMonthlyCosts] = useState<number>(1000);
  const [taxRate, setTaxRate] = useState<number>(12);
  const [zusType, setZusType] = useState<ZusType>('maly');
  const [voluntaryHealthInsurance, setVoluntaryHealthInsurance] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);
  
  // Results state
  const [results, setResults] = useState<Results>({
    general: 0,
    linear: 0,
    flatRate: 0
  });

  // Calculate monthly income based on frequency
  const calculateMonthlyIncome = (): number => {
    switch(incomeFrequency) {
      case 'daily':
        return income * 22; // Assuming 22 working days per month
      case 'hourly':
        return income * 8 * 22; // Assuming 8 hours per day, 22 days per month
      default:
        return income;
    }
  };
  const [taxationType, setTaxationType] = useState<string>('scale'); 

  // Calculate results
  useEffect(() => {
    const monthlyIncome = calculateMonthlyIncome();
    const costs = Number(monthlyCosts);
    const profit = monthlyIncome - costs;
    
    // Simplified tax calculations based on the provided information
    const generalTax = calculateGeneralTax(profit, monthlyIncome, zusType, taxationType);
    const linearTax = calculateLinearTax(profit, monthlyIncome, zusType, taxationType);
    const flatRateTax = calculateFlatRateTax(monthlyIncome, taxRate, zusType, taxationType);
    
    setResults({
      general: Math.round(profit - generalTax),
      linear: Math.round(profit - linearTax),
      flatRate: Math.round(monthlyIncome - flatRateTax)
    });
  }, [income, incomeFrequency, monthlyCosts, taxRate, zusType, voluntaryHealthInsurance]);

  // Calculate ZUS based on type and voluntary insurance
  const calculateZUS = (income: number, zusType: ZusType, taxationType: string): number => {
    let zus = 0;
    let healthInsurance = 0;
  
    if (zusType === 'duzy') {
      // Duży ZUS: składki na ubezpieczenia społeczne (bez zdrowotnej)
      zus = 1418.48; // Suma składek emerytalnej, rentowej, chorobowej, wypadkowej, FP i FS
    } else if (zusType === 'maly') {
      // Mały ZUS: preferencyjne składki społeczne
      zus = 331.26;
    }
  
    // Składka zdrowotna dla przedsiębiorców na skali podatkowej: min. 381.78 PLN (9% od minimalnego wynagrodzenia)
    if (taxationType === 'scale') {
      healthInsurance = Math.max(income * 0.09, 381.78);
    } else if (taxationType === 'flat') {
      // Składka zdrowotna na podatku liniowym: 4.9% dochodu, min. 381.78 PLN
      healthInsurance = Math.max(income * 0.049, 381.78);
    } else if (taxationType === 'lumpSum') {
      // Składka zdrowotna dla ryczałtowców zależy od przychodów (progi)
      if (income <= 60_000) {
        healthInsurance = 381.78;
      } else if (income <= 300_000) {
        healthInsurance = 636.51;
      } else {
        healthInsurance = 1145.67;
      }
    } else {
      // Domyślna składka zdrowotna
      healthInsurance = 381.78;
    }
  
    return zus + healthInsurance;
  };

  // Simplified tax calculation functions
  const calculateGeneralTax = (profit: number, income: number, zusType: ZusType, taxationType: string): number => {
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
    const zus = calculateZUS(income, zusType, taxationType);
    
    return (tax / 12) + zus;
  };

  const calculateLinearTax = (profit: number, income: number, zusType: ZusType, taxationType: string): number => {
    // 19% flat tax
    const tax = profit * 0.19;
    
    // ZUS contribution based on selection
    const zus = calculateZUS(income, zusType, taxationType);
    
    return tax + zus;
  };

  const calculateFlatRateTax = (income: number, rate: number, zusType: ZusType, taxationType: string): number => {
    // Flat rate tax without costs deduction
    const tax = income * (rate / 100);
    
    // ZUS contribution based on selection
    const zus = calculateZUS(income, zusType, taxationType);
    
    return tax + zus;
  };

  // Handle input changes
  const handleIncomeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncome(Number(event.target.value));
  };

  const handleIncomeFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncomeFrequency(event.target.value as IncomeFrequency);
  };

  const handleCostsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMonthlyCosts(Number(event.target.value));
  };

  const handleCostsSliderChange = (_event: Event, newValue: number | number[]) => {
    setMonthlyCosts(newValue as number);
  };

  const handleTaxRateChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setTaxRate(parseFloat(event.target.value) || 0);
  };

  const handleTaxRateSliderChange = (_event: Event, newValue: number | number[]) => {
    setTaxRate(newValue as number);
  };

  const handleZusTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZusType(event.target.value as ZusType);
  };

  const handleVoluntaryHealthInsuranceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoluntaryHealthInsurance(event.target.value === "tak");
  };

  // Tax rate marks with equal spacing
  const taxRateMarks = [
    { value: 2, label: '2%' },
    { value: 3, label: '3%' },
    { value: 5.5, label: '5.5%' },
    { value: 8.5, label: '8.5%' },
    { value: 12, label: '12%' },
    { value: 12.5, label: '12.5%' },
    { value: 14, label: '14%' },
    { value: 15, label: '15%' },
    { value: 17, label: '17%' }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
      <div className="p-4 bg-white rounded-lg shadow-sm mb-6">
        <h2 className="text-lg text-gray-500 mb-2">KALKULATOR DZIAŁALNOŚCI GOSPODARCZEJ</h2>
        <h1 className="text-3xl font-bold mb-8">Najkorzystniejsza forma opodatkowania</h1>
        
        {/* Income with frequency selection */}
        <div className="mb-8">
          <label className="block text-gray-600 mb-2">Twój przychód netto</label>
          <div className="flex items-center">
            <input
              type="number"
              value={income}
              onChange={handleIncomeChange}
              className="w-32 p-3 border border-gray-300 rounded-md mr-3"
            />
            <span className="mr-4">zł</span>
            
            <RadioGroup 
              row 
              value={incomeFrequency} 
              onChange={handleIncomeFrequencyChange}
            >
              <FormControlLabel value="monthly" control={<Radio color="primary" />} label="Miesięcznie" />
              <FormControlLabel value="daily" control={<Radio color="primary" />} label="Dziennie" />
              <FormControlLabel value="hourly" control={<Radio color="primary" />} label="Godzinowo" />
            </RadioGroup>
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

            <select
              value={taxRate}
              onChange={handleTaxRateChange}
              className="p-3 border border-gray-300 rounded-md bg-white text-gray-700"
            >
              {[2, 3, 5.5, 8.5, 10, 12, 12.5, 14, 15, 17].map((rate) => (
                <option key={rate} value={rate}>
                  {rate}%
                </option>
              ))}
            </select>
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
        
        {/* Voluntary Health Insurance */}
        <div className="mb-8">
          <label className="block text-gray-600 mb-2">Dobrowolne ubezpieczenie chorobowe (2,45% podstawy wymiaru składki zdrowotnej)</label>
          <RadioGroup 
            row 
            value={voluntaryHealthInsurance ? "tak" : "nie"} 
            onChange={handleVoluntaryHealthInsuranceChange}
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