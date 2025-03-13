import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, TextField, Checkbox, FormControlLabel,Button,Table,TableBody,TableCell,TableContainer,TableHead,TableRow,Paper,Box,Typography,Tab,Tabs } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';


// Define types for better TypeScript support
interface MonthlyBreakdown {
  month: string;
  gross: number;
  retirement: number;
  disability: number;
  sickness: number;
  health: number;
  taxBase: number;
  tax: number;
  ppk?: number;
  net: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface CalculationResults {
  monthlyGross: number;
  netSalary: number;
  totalEmployerCost: number;
  retirementContribution: number;
  disabilityContribution: number;
  sicknessContribution: number;
  healthContribution: number;
  taxAdvance: number;
  ppkContribution?: number;
  monthlyBreakdown: MonthlyBreakdown[];
  pieChartData: PieChartData[];
}

const SalaryCalculator = () => {
  const [grossOrNet, setGrossOrNet] = useState<string>("brutto");
  const [salaryAmount, setSalaryAmount] = useState<number>(5000);
  const [taxYear, setTaxYear] = useState<number>(2025);
  const [workFromHome, _setWorkFromHome] = useState<boolean>(true);
  const [fgspContribution, setFgspContribution] = useState<boolean>(true);
  const [stableSalary, _setStableSalary] = useState<boolean>(true);
  const [ppkParticipation, setPpkParticipation] = useState<boolean>(false);
  const [over26, setOver26] = useState<boolean>(true);
  const [accidentInsuranceRate, setAccidentInsuranceRate] = useState<number>(1.67);
  const [numberOfTaxReductions, _setNumberOfTaxReductions] = useState<number>(1);
  const [showEmployerCalculation, setShowEmployerCalculation] = useState<boolean>(false);
  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null);
  const [showMonthlyBreakdown, setShowMonthlyBreakdown] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<number>(0);

  // Colors for the pie chart
  const COLORS = ['#4CAF50', '#FF6B6B', '#4A4E69', '#FFD166', '#06D6A0', '#118AB2', '#F79824'];

  //const handleSalaryTypeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    //setGrossOrNet(event.target.value as string);
  //};

  const handleSalaryAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryAmount(parseFloat(event.target.value) || 0);
  };


  const calculateNetFromGross = (gross: number): number => {
    // Social security contributions rates (employee part)
    const retirementRate = 0.0976;
    const disabilityRate = 0.015;
    const sicknessRate = 0.0245;
    const healthRate =  0.09;

    // Calculate social security contributions
    const retirementContribution = gross * retirementRate;
    const disabilityContribution = gross * disabilityRate;
    const sicknessContribution = gross * sicknessRate;
    
    // Total social security contributions
    const totalSocialContributions = retirementContribution + disabilityContribution + sicknessContribution;
    
    // Tax base
    const taxBase = Math.round((gross - totalSocialContributions) * 100) / 100;
    
    // Health contribution - calculated from tax base
    const healthContribution = taxBase * healthRate;
    
    // Tax calculation
    let taxAdvance = 0;
    if (over26) {
      // Cost of income for local workers: 250 PLN per month
      const costsOfIncome = workFromHome ? 250 : 300;
      
      // Tax base after costs
      const taxBaseAfterCosts = Math.max(0, taxBase - costsOfIncome);
      
      // Annual income estimation for tax threshold calculation
      const annualIncome = taxBaseAfterCosts * 12;
      
      // Apply progressive tax rates
      // First threshold: 12% up to 120,000 PLN annually
      // Second threshold: 32% for income above 120,000 PLN annually
      let taxAmount = 0;
      if (annualIncome <= 120000) {
        // Only 12% tax rate applies
        taxAmount = taxBaseAfterCosts * 0.12;
      } else {
        // Monthly income that exceeds the threshold
        const monthlyThreshold = 120000 / 12;
        // Part taxed at 12%
        const lowerPartTax = monthlyThreshold * 0.12;
        // Part taxed at 32%
        const higherPartTax = (taxBaseAfterCosts - monthlyThreshold) * 0.32;
        taxAmount = lowerPartTax + higherPartTax;
      }
      
      // Apply tax reduction
      const taxReduction = (numberOfTaxReductions * 300);
      taxAdvance = Math.max(0, taxAmount - taxReduction);
    }
    
    // PPK contribution (if participating)
    const ppkContribution = ppkParticipation ? gross * 0.02 : 0;
    
    // Net salary calculation
    return gross - totalSocialContributions - healthContribution - taxAdvance - ppkContribution;
  };

  const calculateGrossFromNet = (net: number): number => {
    // This is an approximation method since the exact calculation requires solving an equation
    let approxGross = net * 1.4; // Start with a reasonable approximation
    const tolerance = 0.01;
    let calculatedNet = calculateNetFromGross(approxGross);
    let iterations = 0;
    const maxIterations = 100;
    
    // Iteratively adjust gross until the calculated net is close enough to the target
    while (Math.abs(calculatedNet - net) > tolerance && iterations < maxIterations) {
      approxGross = approxGross * (net / calculatedNet);
      calculatedNet = calculateNetFromGross(approxGross);
      iterations++;
    }
    
    return Math.round(approxGross * 100) / 100;
  };

  const handleCalculate = () => {
    // Calculate based on whether input is gross or net
    const monthlyGross = grossOrNet === "brutto" ? salaryAmount : calculateGrossFromNet(salaryAmount);
    
    // Social security contributions (ZUS) - employee part
    const retirementContribution = monthlyGross * 0.0976;
    const disabilityContribution = monthlyGross * 0.015;
    const sicknessContribution = monthlyGross * 0.0245;
    
    // Total social security contributions
    const totalSocialContributions = retirementContribution + disabilityContribution + sicknessContribution;
    
    // Tax base
    const taxBase = Math.round((monthlyGross - totalSocialContributions) * 100) / 100;
    
    // Health contribution - calculated from tax base
    const healthContribution = taxBase * 0.09;
    
    // Tax calculation
    let taxAdvance = 0;
    if (over26) {
      // Cost of income for local workers: 250 PLN per month
      const costsOfIncome = workFromHome ? 250 : 300;
      
      // Tax base after costs
      const taxBaseAfterCosts = Math.max(0, taxBase - costsOfIncome);
      
      // Annual income estimation for tax threshold calculation
      const annualIncome = taxBaseAfterCosts * 12;
      
      // Apply progressive tax rates
      // First threshold: 12% up to 120,000 PLN annually
      // Second threshold: 32% for income above 120,000 PLN annually
      let taxAmount = 0;
      if (annualIncome <= 120000) {
        // Only 12% tax rate applies
        taxAmount = taxBaseAfterCosts * 0.12;
      } else {
        // Monthly income that exceeds the threshold
        const monthlyThreshold = 120000 / 12;
        // Part taxed at 12%
        const lowerPartTax = monthlyThreshold * 0.12;
        // Part taxed at 32%
        const higherPartTax = (taxBaseAfterCosts - monthlyThreshold) * 0.32;
        taxAmount = lowerPartTax + higherPartTax;
      }
      
      // Apply tax reduction
      const taxReduction = (numberOfTaxReductions * 300);
      taxAdvance = Math.max(0, taxAmount - taxReduction);
    }
    
    // PPK contribution (if participating)
    const ppkContribution = ppkParticipation ? monthlyGross * 0.02 : 0;
    
    // Net salary calculation
    const netSalary = monthlyGross - totalSocialContributions - healthContribution - taxAdvance - ppkContribution;
    
    // Employer costs
    const employerRetirementContribution = monthlyGross * 0.0976;
    const employerDisabilityContribution = monthlyGross * 0.065;
    const employerAccidentContribution = monthlyGross * (accidentInsuranceRate / 100);
    const employerLaborFundContribution = monthlyGross * 0.0245;
    const employerFGSPContribution = fgspContribution ? monthlyGross * 0.001 : 0;
    const employerPPKContribution = ppkParticipation ? monthlyGross * 0.015 : 0;
    
    // Total employer cost
    const totalEmployerCost = monthlyGross + employerRetirementContribution + 
                             employerDisabilityContribution + employerAccidentContribution + 
                             employerLaborFundContribution + employerFGSPContribution +
                             employerPPKContribution;
    
    // Generate monthly breakdown
    const months = ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec', 
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'];

    // Track cumulative tax base for progressive tax calculation
    let cumulativeTaxBase = 0;
    const annualThreshold = 120000;
    

    const monthlyBreakdown: MonthlyBreakdown[] = months.map((month, index) => {
    // In reality, tax calculations can vary by month due to tax thresholds
    // Apply variation only if stableSalary is false
    const variationFactor = stableSalary ? 1 : 1 - (index * 0.005); 

    const monthlyGrossVar = monthlyGross * variationFactor;
    const retirementVar = monthlyGrossVar * 0.0976;
    const disabilityVar = monthlyGrossVar * 0.015;
    const sicknessVar = monthlyGrossVar * 0.0245;
    const socialContributionsVar = retirementVar + disabilityVar + sicknessVar;
    const taxBaseVar = Math.round((monthlyGrossVar - socialContributionsVar) * 100) / 100;
    const healthVar = taxBaseVar * 0.09;

    // Tax calculation
    let taxVar = 0;
    if (over26) {
    const costsOfIncome = workFromHome ? 250 : 300;
    const taxBaseAfterCostsVar = Math.max(0, taxBaseVar - costsOfIncome);

    // Add this month's tax base to the cumulative total
    cumulativeTaxBase += taxBaseAfterCostsVar;

    // Apply progressive tax rates based on cumulative income
    let taxAmountVar = 0;

    if (cumulativeTaxBase <= annualThreshold) {
    // Only 12% tax rate applies
    taxAmountVar = taxBaseAfterCostsVar * 0.12;
    } else {
    // We need to handle the case where we cross the threshold this month
    if (cumulativeTaxBase - taxBaseAfterCostsVar < annualThreshold) {
    // Part of this month is below threshold, part is above
    const amountBelowThreshold = annualThreshold - (cumulativeTaxBase - taxBaseAfterCostsVar);
    const amountAboveThreshold = taxBaseAfterCostsVar - amountBelowThreshold;

    // Apply appropriate tax rates to each portion
    taxAmountVar = (amountBelowThreshold * 0.12) + (amountAboveThreshold * 0.32);
    } else {
    // Entirely above threshold - apply 32% to the whole amount
    taxAmountVar = taxBaseAfterCostsVar * 0.32;
    }
    }

    // Apply tax reduction
    const taxReduction = (numberOfTaxReductions * 300);
    taxVar = Math.max(0, taxAmountVar - taxReduction);
    }

    // PPK contribution
    const ppkVar = ppkParticipation ? monthlyGrossVar * 0.02 : 0;

    // Net salary for this month
    const netVar = monthlyGrossVar - socialContributionsVar - healthVar - taxVar - ppkVar;

    return {
    month: month,
    gross: Math.round(monthlyGrossVar * 100) / 100,
    retirement: Math.round(retirementVar * 100) / 100,
    disability: Math.round(disabilityVar * 100) / 100,
    sickness: Math.round(sicknessVar * 100) / 100,
    health: Math.round(healthVar * 100) / 100,
    taxBase: Math.round(taxBaseVar * 100) / 100,
    tax: Math.round(taxVar * 100) / 100,
    ppk: ppkParticipation ? Math.round(ppkVar * 100) / 100 : 0,
    net: Math.round(netVar * 100) / 100
    };
    });
    
    // Create pie chart data
    const pieChartData: PieChartData[] = [
      { name: 'Kwota netto', value: Math.round(netSalary * 100) / 100 },
      { name: 'Ubezpieczenie emerytalne', value: Math.round(retirementContribution * 100) / 100 },
      { name: 'Ubezpieczenie rentowe', value: Math.round(disabilityContribution * 100) / 100 },
      { name: 'Ubezpieczenie chorobowe', value: Math.round(sicknessContribution * 100) / 100 },
      { name: 'Ubezpieczenie zdrowotne', value: Math.round(healthContribution * 100) / 100 },
      { name: 'Zaliczka na PIT', value: Math.round(taxAdvance * 100) / 100 }
    ];
    
    // Add PPK to pie chart if participating
    if (ppkParticipation) {
      pieChartData.push({ 
        name: 'Składka PPK', 
        value: Math.round(ppkContribution * 100) / 100 
      });
    }
    
    // Set calculation results
    setCalculationResults({
      monthlyGross: Math.round(monthlyGross * 100) / 100,
      netSalary: Math.round(netSalary * 100) / 100,
      totalEmployerCost: Math.round(totalEmployerCost * 100) / 100,
      retirementContribution: Math.round(retirementContribution * 100) / 100,
      disabilityContribution: Math.round(disabilityContribution * 100) / 100,
      sicknessContribution: Math.round(sicknessContribution * 100) / 100,
      healthContribution: Math.round(healthContribution * 100) / 100,
      taxAdvance: Math.round(taxAdvance * 100) / 100,
      ppkContribution: ppkParticipation ? Math.round(ppkContribution * 100) / 100 : 0,
      monthlyBreakdown: monthlyBreakdown,
      pieChartData: pieChartData
    });
  };

  useEffect(() => {
    // Calculate on initial load
    handleCalculate();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <div className="max-w-6xl mx-auto p-4 bg-gray-50 pt-5">
      {/* Banner */}
      <Paper elevation={3} sx={{ 
        width: "80%", 
        height: "150px", 
        p: 2, 
        mb: 3, 
        mt: 3, 
        mx: "auto",
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center",
        backgroundImage: "linear-gradient(to right, #1976d2, #64b5f6)",
        color: "white",
        borderRadius: 2
      }}>
        <Typography variant="h3" component="div" sx={{ fontWeight: "bold" }}>
          Kalkulator UoP
        </Typography>
      </Paper>
      <Box className="mb-8">
        <Typography variant="h4" className="text-gray-800 font-bold mb-2">
          Kalkulator wynagrodzeń {taxYear}
        </Typography>
        <Typography variant="subtitle1" className="text-gray-600">
          Przelicz zarobki brutto/netto, oblicz składki i koszty pracodawcy
        </Typography>
      </Box>

      {/* Main form */}
      <Box className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <FormControl fullWidth variant="outlined">
          <InputLabel>Typ wynagrodzenia</InputLabel>
          <Select
            value={grossOrNet}
            onChange={(e) => setGrossOrNet(e.target.value as string)}
            label="Typ wynagrodzenia"
          >
            <MenuItem value="brutto">brutto</MenuItem>
            <MenuItem value="netto">netto</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Twoje wynagrodzenie"
          variant="outlined"
          type="number"
          value={salaryAmount}
          onChange={handleSalaryAmountChange}
          InputProps={{
            endAdornment: <span className="text-gray-500">PLN</span>
          }}
        />

        <FormControl fullWidth variant="outlined">
          <InputLabel>rok podatkowy</InputLabel>
          <Select
            value={taxYear}
            onChange={(e) => setTaxYear(e.target.value as number)}
            label="rok podatkowy"
          >
            <MenuItem value={2025}>2025</MenuItem>
            <MenuItem value={2024}>2024</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Options checkboxes */}
      <Box className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/*
        <div>
          <FormControlLabel
            control={
              <Checkbox 
                checked={workFromHome}
                onChange={(e) => setWorkFromHome(e.target.checked)}
                color="primary"
              />
            }
            label="praca w miejscu zamieszkania"
          />
        </div>
        */ }
        <div>
          <FormControlLabel
            control={
              <Checkbox 
                checked={fgspContribution}
                onChange={(e) => setFgspContribution(e.target.checked)}
                color="primary"
              />
            }
            label="składka na FGŚP"
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox 
                checked={ppkParticipation}
                onChange={(e) => setPpkParticipation(e.target.checked)}
                color="primary"
              />
            }
            label="uczestnictwo w PPK"
          />
        </div>
        <div>
          <FormControlLabel
            control={
              <Checkbox 
                checked={over26}
                onChange={(e) => setOver26(e.target.checked)}
                color="primary"
              />
            }
            label="ukończony 26 rok życia"
          />
        </div>
      </Box>

      {/* Accident insurance rate */}
      <Box className="flex gap-2 items-center mb-6">
        <Typography variant="body1">
          stopa procentowa składki na ubezpieczenie wypadkowe
        </Typography>
        <TextField 
          value={accidentInsuranceRate}
          onChange={(e) => setAccidentInsuranceRate(parseFloat(e.target.value) || 0)}
          variant="outlined"
          size="small"
          style={{ width: '80px' }}
          type="number"
          inputProps={{ step: 0.01 }}
        />
        <Typography variant="body1">%</Typography>
      </Box>

      {/* Employer calculation checkbox */}
      <Box className="mb-6">
        <FormControlLabel
          control={
            <Checkbox 
              checked={showEmployerCalculation}
              onChange={(e) => setShowEmployerCalculation(e.target.checked)}
              color="primary"
            />
          }
          label="pokaż wyliczenie dla pracodawcy/HR"
        />
      </Box>

      {/* Calculate button */}
      <Box className="flex justify-center mb-8">
        <Button 
          variant="contained" 
          onClick={handleCalculate}
          className="bg-orange-500 hover:bg-orange-600 text-white py-3 px-16"
        >
          Oblicz
        </Button>
      </Box>

      {/* Results section */}
      {calculationResults && (
        <Box className="border-t border-gray-200 pt-6">
          {/* Summary */}
          <Box className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Box className="flex flex-col">
              <Typography variant="h6" className="text-2xl text-green-700 font-medium">
                {calculationResults.netSalary.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
              </Typography>
              <Typography variant="body2" className="text-gray-600">kwota netto</Typography>
            </Box>
            <Box className="flex flex-col">
              <Typography variant="h6" className="text-2xl text-amber-700 font-medium">
                {calculationResults.monthlyGross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
              </Typography>
              <Typography variant="body2" className="text-gray-600">kwota brutto</Typography>
            </Box>
            <Box className="flex flex-col">
              <Typography variant="h6" className="text-2xl text-gray-700 font-medium">
                {calculationResults.totalEmployerCost.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
              </Typography>
              <Typography variant="body2" className="text-gray-600">łączny koszt pracodawcy</Typography>
            </Box>
          </Box>

          {!stableSalary && (
            <Box className="text-sm text-gray-600 mb-8">
              <p>Uwaga: kwoty netto różnią się dla poszczególnych miesięcy <Button 
                onClick={() => setShowMonthlyBreakdown(true)} 
                className="text-orange-500 underline"
              >
                zobacz więcej
              </Button></p>
            </Box>
          )}

          {/* Tabs for Employee and Employer costs */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange} aria-label="calculation tabs">
              <Tab label="Koszty pracownika" />
              {showEmployerCalculation && <Tab label="Koszty pracodawcy" />}
            </Tabs>
          </Box>

          {/* Employee costs tab */}
          {activeTab === 0 && (
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <Box>
                <Typography variant="h6" className="mb-4">
                  Koszty pracownika dla miesięcznego wynagrodzenia {calculationResults.monthlyGross.toLocaleString('pl-PL')} PLN brutto
                </Typography>
                <TableContainer component={Paper} className="mb-4">
                  <Table>
                    <TableBody>
                      <TableRow className="bg-green-50">
                        <TableCell>kwota netto</TableCell>
                        <TableCell align="right" className="font-medium">
                          {calculationResults.netSalary.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ubezpieczenie emerytalne (9,76%)</TableCell>
                        <TableCell align="right">
                          {calculationResults.retirementContribution.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ubezpieczenie rentowe (1,5%)</TableCell>
                        <TableCell align="right">
                          {calculationResults.disabilityContribution.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ubezpieczenie chorobowe (2,45%)</TableCell>
                        <TableCell align="right">
                          {calculationResults.sicknessContribution.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>ubezpieczenie zdrowotne (9%)</TableCell>
                        <TableCell align="right">
                          {calculationResults.healthContribution.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>zaliczka na PIT</TableCell>
                        <TableCell align="right">
                          {calculationResults.taxAdvance.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                      {ppkParticipation && (
                        <TableRow>
                          <TableCell>składka PPK (2%)</TableCell>
                          <TableCell align="right">
                            {(calculationResults.ppkContribution || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                          </TableCell>
                        </TableRow>
                      )}
                      <TableRow className="bg-amber-50">
                        <TableCell>kwota brutto</TableCell>
                        <TableCell align="right" className="font-medium">
                          {calculationResults.monthlyGross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
                
                <Button
                  onClick={() => setShowMonthlyBreakdown(!showMonthlyBreakdown)}
                  className="text-orange-500"
                >
                  {showMonthlyBreakdown ? 'ukryj rozliczenie roczne' : 'pokaż rozliczenie roczne'}
                </Button>
              </Box>
              
              <Box>
                <Typography variant="h6" className="mb-4">
                  Wykres rozkładu kosztów pracownika
                </Typography>
                <Box className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={calculationResults.pieChartData}
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {calculationResults.pieChartData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => value.toLocaleString('pl-PL', { minimumFractionDigits: 2 }) + ' PLN'} />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </Box>
          )}

          {/* Employer costs tab */}
          {activeTab === 1 && showEmployerCalculation && (
            <Box className="mb-8">
              <Typography variant="h6" className="mb-4">
                Koszty pracodawcy dla miesięcznego wynagrodzenia {calculationResults.monthlyGross.toLocaleString('pl-PL')} PLN brutto
              </Typography>
              <TableContainer component={Paper} className="mb-4">
                <Table>
                  <TableBody>
                    <TableRow className="bg-amber-50">
                      <TableCell>wynagrodzenie brutto</TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyGross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>składka emerytalna (9,76%)</TableCell>
                      <TableCell align="right">
                        {(calculationResults.monthlyGross * 0.0976).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>składka rentowa (6,5%)</TableCell>
                      <TableCell align="right">
                        {(calculationResults.monthlyGross * 0.065).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>składka wypadkowa ({accidentInsuranceRate}%)</TableCell>
                      <TableCell align="right">
                        {(calculationResults.monthlyGross * accidentInsuranceRate / 100).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Fundusz Pracy (2,45%)</TableCell>
                      <TableCell align="right">
                        {(calculationResults.monthlyGross * 0.0245).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                      </TableCell>
                    </TableRow>
                    {fgspContribution && (
                      <TableRow>
                        <TableCell>FGŚP (0,1%)</TableCell>
                        <TableCell align="right">
                          {(calculationResults.monthlyGross * 0.001).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                    )}
                    {ppkParticipation && (
                      <TableRow>
                        <TableCell>składka PPK pracodawcy (1,5%)</TableCell>
                        <TableCell align="right">
                        {(calculationResults.monthlyGross * 0.015).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow className="bg-gray-100">
                      <TableCell>łączny koszt pracodawcy</TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.totalEmployerCost.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} PLN
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Monthly breakdown dialog */}
          {showMonthlyBreakdown && (
            <Box className="mb-8">
              <Typography variant="h6" className="mb-4">
                Rozliczenie roczne {taxYear}
              </Typography>
              <TableContainer component={Paper} className="mb-4">
                <Table size="small">
                  <TableHead>
                    <TableRow className="bg-gray-100">
                      <TableCell>Miesiąc</TableCell>
                      <TableCell align="right">Brutto</TableCell>
                      <TableCell align="right">Emerytalne</TableCell>
                      <TableCell align="right">Rentowe</TableCell>
                      <TableCell align="right">Chorobowe</TableCell>
                      <TableCell align="right">Zdrowotne</TableCell>
                      <TableCell align="right">Zaliczka PIT</TableCell>
                      {ppkParticipation && (
                        <TableCell align="right">PPK</TableCell>
                      )}
                      <TableCell align="right">Netto</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {calculationResults.monthlyBreakdown.map((month) => (
                      <TableRow key={month.month}>
                        <TableCell>{month.month}</TableCell>
                        <TableCell align="right">{month.gross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{month.retirement.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{month.disability.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{month.sickness.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{month.health.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                        <TableCell align="right">{month.tax.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                        {ppkParticipation && (
                          <TableCell align="right">{(month.ppk || 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                        )}
                        <TableCell align="right" className="font-medium">{month.net.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}</TableCell>
                      </TableRow>
                    ))}
                    {/* Totals row */}
                    <TableRow className="bg-gray-100">
                      <TableCell className="font-medium">Razem</TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + m.gross, 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + m.retirement, 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + m.disability, 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + m.sickness, 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + m.health, 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + m.tax, 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </TableCell>
                      {ppkParticipation && (
                        <TableCell align="right" className="font-medium">
                          {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + (m.ppk || 0), 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                        </TableCell>
                      )}
                      <TableCell align="right" className="font-medium">
                        {calculationResults.monthlyBreakdown.reduce((sum, m) => sum + m.net, 0).toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}

      {/* Footer */}
      <Box className="mt-12 pt-4 border-t border-gray-200 text-sm text-gray-500">
        <Typography variant="body2">
          © {new Date().getFullYear()} Kalkulator wynagrodzeń. Kalkulacje mają charakter orientacyjny.
        </Typography>
        <Typography variant="body2" className="mt-1">
          Wszystkie dane są obliczane zgodnie z polskim prawem podatkowym na rok {taxYear}.
        </Typography>
      </Box>
    </div>
  );
};

export default SalaryCalculator;