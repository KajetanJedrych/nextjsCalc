"use client";
import React, { useState, useEffect } from 'react';
import { Radio, RadioGroup, FormControlLabel } from '@mui/material';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

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
  const [taxationType, setTaxationType] = useState<string>('scale');
  
  // Results state
  const [results, setResults] = useState<Results>({
    general: 0,
    linear: 0,
    flatRate: 0
  });

  // Best option state
  const [bestOption, setBestOption] = useState<string>('');

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

  // Calculate results
  useEffect(() => {
    const monthlyIncome = calculateMonthlyIncome();
    const costs = Number(monthlyCosts);
    const profit = monthlyIncome - costs;
    
    // Calculate taxes for each option
    const generalTax = calculateGeneralTax(profit, monthlyIncome, zusType, 'scale');
    const linearTax = calculateLinearTax(profit, monthlyIncome, zusType, 'flat');
    const flatRateTax = calculateFlatRateTax(monthlyIncome, taxRate, zusType, 'lumpSum');
    
    const generalNet = Math.round(profit - generalTax);
    const linearNet = Math.round(profit - linearTax);
    const flatRateNet = Math.round(monthlyIncome - flatRateTax);
    
    setResults({
      general: generalNet,
      linear: linearNet,
      flatRate: flatRateNet
    });
    
    // Determine best option
    const maxNet = Math.max(generalNet, linearNet, flatRateNet);
    if (maxNet === generalNet) setBestOption('general');
    else if (maxNet === linearNet) setBestOption('linear');
    else setBestOption('flatRate');
    
  }, [income, incomeFrequency, monthlyCosts, taxRate, zusType, voluntaryHealthInsurance]);

  // Calculate ZUS based on type and voluntary insurance
  const calculateZUS = (income: number, zusType: ZusType, taxationType: string): number => {
    let zus = 0;
    let healthInsurance = 0;
    let voluntaryInsurance = 0;
  
    // Określ podstawę wymiaru składki na ubezpieczenie chorobowe
    let basis = 0;
    
    if (zusType === 'duzy') {
      // Duży ZUS: składki na ubezpieczenia społeczne (bez zdrowotnej)
      zus = 1418.48; // Suma składek emerytalnej, rentowej, wypadkowej, FP i FS
      basis = 4300; // Podstawa wymiaru dla dużego ZUS
    } else if (zusType === 'maly') {
      // Mały ZUS: preferencyjne składki społeczne
      zus = 331.26;
      basis = 1047.50; // Podstawa wymiaru dla małego ZUS
    } else if (zusType === 'zdrowie') {
      // Tylko składka zdrowotna - brak składek społecznych
      zus = 0;
      basis = 0; // Brak podstawy do dobrowolnego ubezpieczenia chorobowego
    }
    
    // Dobrowolne ubezpieczenie chorobowe (2,45% podstawy wymiaru)
    if (voluntaryHealthInsurance && basis > 0) {
      voluntaryInsurance = basis * 0.0245;
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
  
    return zus + healthInsurance + voluntaryInsurance;
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
    const zus = calculateZUS(income, zusType, 'scale');
  
    return (tax / 12) + zus;
  };

  const calculateLinearTax = (profit: number, income: number, zusType: ZusType, taxationType: string): number => {
    // 19% flat tax
    const tax = profit * 0.19;
    
    // ZUS contribution based on selection
    const zus = calculateZUS(income, zusType, 'flat');
    
    return tax + zus;
  };

  const calculateFlatRateTax = (income: number, rate: number, zusType: ZusType, taxationType: string): number => {
    // Flat rate tax without costs deduction
    const tax = income * (rate / 100);
    
    // ZUS contribution based on selection
    const zus = calculateZUS(income, zusType, 'lumpSum');
    
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

  const handleTaxRateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setTaxRate(parseFloat(event.target.value) || 0);
  };

  const handleZusTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setZusType(event.target.value as ZusType);
  };

  const handleVoluntaryHealthInsuranceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVoluntaryHealthInsurance(event.target.value === "tak");
  };

  // Prepare chart data
  const chartData = [
    { name: 'Zasady ogólne', value: results.general },
    { name: 'Podatek liniowy', value: results.linear },
    { name: 'Ryczałt', value: results.flatRate }
  ];

  // Color configuration for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];
  
  // Format currency for chart tooltip
  const formatCurrency = (value: number) => {
    return `${value.toLocaleString('pl-PL')} zł`;
  };

  // Tax breakdown data
  const monthlyIncome = calculateMonthlyIncome();
  const costs = Number(monthlyCosts);
  const profit = monthlyIncome - costs;
  
  const generalBreakdown = {
    income: monthlyIncome,
    costs: costs,
    profit: profit,
    tax: calculateGeneralTax(profit, monthlyIncome, zusType, 'scale'),
    net: results.general
  };
  
  const linearBreakdown = {
    income: monthlyIncome,
    costs: costs,
    profit: profit,
    tax: calculateLinearTax(profit, monthlyIncome, zusType, 'flat'),
    net: results.linear
  };
  
  const flatRateBreakdown = {
    income: monthlyIncome,
    costs: 0, // Ryczałt nie uwzględnia kosztów
    profit: monthlyIncome,
    tax: calculateFlatRateTax(monthlyIncome, taxRate, zusType, 'lumpSum'),
    net: results.flatRate
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md pt-20">
      <div className="bg-white rounded-xl shadow-sm mb-8 overflow-hidden">
        <div className="bg-blue-600 p-5 text-white">
          <h1 className="text-3xl font-bold">Kalkulator Działalności Gospodarczej</h1>
          <p className="text-blue-100 mt-2">Porównaj formy opodatkowania i wybierz najkorzystniejszą dla siebie</p>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Input Section */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">Dane wejściowe</h2>
            
            {/* Income with frequency selection */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Twój przychód netto</label>
              <div className="flex items-center flex-wrap gap-3">
                <div className="flex items-center">
                  <input
                    type="number"
                    value={income}
                    onChange={handleIncomeChange}
                    className="w-36 p-3 border border-gray-300 rounded-md mr-2"
                  />
                  <span className="text-gray-500">zł</span>
                </div>
                
                <RadioGroup 
                  row 
                  value={incomeFrequency} 
                  onChange={handleIncomeFrequencyChange}
                  className="ml-2"
                >
                  <FormControlLabel value="monthly" control={<Radio color="primary" />} label="Miesięcznie" />
                  <FormControlLabel value="daily" control={<Radio color="primary" />} label="Dziennie" />
                  <FormControlLabel value="hourly" control={<Radio color="primary" />} label="Godzinowo" />
                </RadioGroup>
              </div>
            </div>
            
            {/* Monthly Costs - without slider */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Twoje miesięczne koszty netto</label>
              <div className="flex items-center">
                <input
                  type="number"
                  value={monthlyCosts}
                  onChange={handleCostsChange}
                  className="w-36 p-3 border border-gray-300 rounded-md mr-2"
                />
                <span className="text-gray-500">zł</span>
              </div>
            </div>
            
            {/* Tax Rate */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Stawka ryczałtu</label>
              <div>
                <select
                  value={taxRate}
                  onChange={handleTaxRateChange}
                  className="w-36 p-3 border border-gray-300 rounded-md bg-white text-gray-700"
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
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Jaki ZUS opłacasz?</label>
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
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2">Dobrowolne ubezpieczenie chorobowe (2,45%)</label>
              <RadioGroup 
                row 
                value={voluntaryHealthInsurance ? "tak" : "nie"} 
                onChange={handleVoluntaryHealthInsuranceChange}
              >
                <FormControlLabel value="tak" control={<Radio color="primary" />} label="Tak" />
                <FormControlLabel value="nie" control={<Radio color="primary" />} label="Nie" />
              </RadioGroup>
            </div>
          </div>
          
          {/* Results & Charts Section */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">Wyniki</h2>
            
            {/* Best Option Highlight */}
            {bestOption && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded">
                <h3 className="font-bold text-green-700">Najkorzystniejsza opcja</h3>
                <p className="text-green-600">
                  {bestOption === 'general' ? 'Zasady ogólne' : 
                   bestOption === 'linear' ? 'Podatek liniowy' : 'Ryczałt'} 
                  <span className="ml-2 font-bold">
                    {bestOption === 'general' ? formatCurrency(results.general) : 
                     bestOption === 'linear' ? formatCurrency(results.linear) : formatCurrency(results.flatRate)}
                  </span>
                </p>
              </div>
            )}
            
            {/* Bar Chart */}
            <div className="mb-8 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Bar dataKey="value" name="Dochód netto">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            {/* Results Table */}
            <div className="bg-white rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-3 text-left">Forma opodatkowania</th>
                    <th className="p-3 text-right">Dochód netto</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${bestOption === 'general' ? 'bg-green-50' : ''}`}>
                    <td className="p-3">Zasady ogólne</td>
                    <td className={`p-3 text-right font-bold ${bestOption === 'general' ? 'text-green-600' : ''}`}>
                      {formatCurrency(results.general)}
                    </td>
                  </tr>
                  <tr className={`border-b ${bestOption === 'linear' ? 'bg-green-50' : ''}`}>
                    <td className="p-3">Podatek liniowy</td>
                    <td className={`p-3 text-right font-bold ${bestOption === 'linear' ? 'text-green-600' : ''}`}>
                      {formatCurrency(results.linear)}
                    </td>
                  </tr>
                  <tr className={`${bestOption === 'flatRate' ? 'bg-green-50' : ''}`}>
                    <td className="p-3">Ryczałt</td>
                    <td className={`p-3 text-right font-bold ${bestOption === 'flatRate' ? 'text-green-600' : ''}`}>
                      {formatCurrency(results.flatRate)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      {/* Tax Breakdown Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6 text-gray-700 border-b pb-2">Szczegółowe rozliczenie</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* General Tax */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-blue-600">Zasady ogólne</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Przychód:</span>
                <span className="font-medium">{formatCurrency(generalBreakdown.income)}</span>
              </div>
              <div className="flex justify-between">
                <span>Koszty:</span>
                <span className="font-medium">{formatCurrency(generalBreakdown.costs)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span>Dochód brutto:</span>
                <span className="font-medium">{formatCurrency(generalBreakdown.profit)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Podatki i składki:</span>
                <span className="font-medium">-{formatCurrency(generalBreakdown.tax)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t text-green-600 font-bold">
                <span>Dochód netto:</span>
                <span>{formatCurrency(generalBreakdown.net)}</span>
              </div>
            </div>
          </div>
          
          {/* Linear Tax */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-teal-600">Podatek liniowy</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Przychód:</span>
                <span className="font-medium">{formatCurrency(linearBreakdown.income)}</span>
              </div>
              <div className="flex justify-between">
                <span>Koszty:</span>
                <span className="font-medium">{formatCurrency(linearBreakdown.costs)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span>Dochód brutto:</span>
                <span className="font-medium">{formatCurrency(linearBreakdown.profit)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Podatki i składki:</span>
                <span className="font-medium">-{formatCurrency(linearBreakdown.tax)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t text-green-600 font-bold">
                <span>Dochód netto:</span>
                <span>{formatCurrency(linearBreakdown.net)}</span>
              </div>
            </div>
          </div>
          
          {/* Flat Rate Tax */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold text-lg mb-3 text-amber-600">Ryczałt</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Przychód:</span>
                <span className="font-medium">{formatCurrency(flatRateBreakdown.income)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Koszty (nie odliczane):</span>
                <span className="font-medium">{formatCurrency(monthlyCosts)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span>Podstawa opodatkowania:</span>
                <span className="font-medium">{formatCurrency(flatRateBreakdown.income)}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>Podatki i składki:</span>
                <span className="font-medium">-{formatCurrency(flatRateBreakdown.tax)}</span>
              </div>
              <div className="flex justify-between pt-1 border-t text-green-600 font-bold">
                <span>Dochód netto:</span>
                <span>{formatCurrency(flatRateBreakdown.net)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Kalkulator ma charakter jedynie poglądowy a dokonane wyliczenia nie mogą być traktowane jako wiążące.</p>
      </div>
    </div>
  );
};

export default B2BSalaryCalculator;