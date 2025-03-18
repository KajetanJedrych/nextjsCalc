import React, { useState } from "react";
import { Button, TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, Divider, Paper, SelectChangeEvent } from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface InvestmentParams {
  initialAmount: string;
  additionalContribution: string;
  contributionFrequency: string;
  annualReturnRate: string;
  compoundingFrequency: string;
  investmentDuration: string;
}

interface InvestmentResult {
  finalAmount: number;
  totalContributions: number;
  totalInterest: number;
  yearlyData: {
    year: number;
    principal: number;
    interest: number;
    balance: number;
  }[];
}

const InvestmentCalculator: React.FC = () => {
  const [params, setParams] = useState<InvestmentParams>({
    initialAmount: "",
    additionalContribution: "",
    contributionFrequency: "monthly",
    annualReturnRate: "",
    compoundingFrequency: "annually",
    investmentDuration: ""
  });

  const [result, setResult] = useState<InvestmentResult | null>(null);
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);

  const handleInputChange = (field: keyof InvestmentParams, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectChange = (field: keyof InvestmentParams) => (event: SelectChangeEvent<string>) => {
    setParams(prev => ({ ...prev, [field]: event.target.value }));
  };

  const handleDecimalChange = (event: SelectChangeEvent<number>) => {
    setDecimalPlaces(Number(event.target.value));
  };

  const calculateInvestment = () => {
    const initialAmount = parseFloat(params.initialAmount) || 0;
    const additionalContribution = parseFloat(params.additionalContribution) || 0;
    const annualReturnRate = parseFloat(params.annualReturnRate) / 100;
    const years = parseFloat(params.investmentDuration) || 0;

    if (initialAmount < 0 || annualReturnRate < 0 || years <= 0) {
      return;
    }

    // Calculate compound frequency multiplier
    let compoundFrequencyMultiplier = 1;
    switch (params.compoundingFrequency) {
      case "annually": compoundFrequencyMultiplier = 1; break;
      case "semiannually": compoundFrequencyMultiplier = 2; break;
      case "quarterly": compoundFrequencyMultiplier = 4; break;
      case "monthly": compoundFrequencyMultiplier = 12; break;
      case "daily": compoundFrequencyMultiplier = 365; break;
    }

    // Calculate contribution frequency multiplier
    let contributionFrequencyMultiplier = 0;
    switch (params.contributionFrequency) {
      case "monthly": contributionFrequencyMultiplier = 12; break;
      case "quarterly": contributionFrequencyMultiplier = 4; break;
      case "semiannually": contributionFrequencyMultiplier = 2; break;
      case "annually": contributionFrequencyMultiplier = 1; break;
    }

    const yearlyData = [];
    let totalContributions = initialAmount;
    let currentBalance = initialAmount;
    const contributionPerPeriod = additionalContribution;

    // Calculate year by year
    for (let year = 1; year <= years; year++) {
      let yearlyContributions = contributionPerPeriod * contributionFrequencyMultiplier;
      //let startOfYearBalance = currentBalance;
      
      // Apply compounding
      for (let period = 0; period < compoundFrequencyMultiplier; period++) {
        // Add contributions for this period
        const periodContributions = yearlyContributions / compoundFrequencyMultiplier;
        currentBalance += periodContributions;
        
        // Apply interest
        const periodRate = annualReturnRate / compoundFrequencyMultiplier;
        currentBalance *= (1 + periodRate);
      }
      
      totalContributions += yearlyContributions;
      
      yearlyData.push({
        year,
        principal: totalContributions,
        interest: currentBalance - totalContributions,
        balance: currentBalance
      });
    }

    const finalResult: InvestmentResult = {
      finalAmount: currentBalance,
      totalContributions,
      totalInterest: currentBalance - totalContributions,
      yearlyData
    };

    setResult(finalResult);
  };

  const formatCurrency = (value: number): string => {
    return value.toFixed(decimalPlaces);
  };

  return (
    <Box sx={{ textAlign: "center", p: 2, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
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
          Kalkulator procentu składanego
        </Typography>
      </Paper>
      
      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ maxWidth: 1200, width: "100%", p: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="decimal-places-label">Miejsca po przecinku</InputLabel>
              <Select
                labelId="decimal-places-label"
                value={decimalPlaces}
                onChange={handleDecimalChange}
                label="Miejsca po przecinku"
              >
                {[0, 1, 2, 3, 4].map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          <Paper elevation={2} sx={{ p: 3, my: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
              Parametry Inwestycji
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Kwota początkowa (zł)"
                  variant="outlined"
                  value={params.initialAmount}
                  onChange={(e) => handleInputChange("initialAmount", e.target.value)}
                  type="number"
                  InputProps={{ sx: { bgcolor: "#fff" } }}
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Dodatkowe wpłaty (zł)"
                  variant="outlined"
                  value={params.additionalContribution}
                  onChange={(e) => handleInputChange("additionalContribution", e.target.value)}
                  type="number"
                  InputProps={{ sx: { bgcolor: "#fff" } }}
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Częstotliwość wpłat</InputLabel>
                  <Select
                    value={params.contributionFrequency}
                    onChange={handleSelectChange("contributionFrequency")}
                    label="Częstotliwość wpłat"
                  >
                    <MenuItem value="monthly">Miesięcznie</MenuItem>
                    <MenuItem value="quarterly">Kwartalnie</MenuItem>
                    <MenuItem value="semiannually">Półrocznie</MenuItem>
                    <MenuItem value="annually">Rocznie</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Stopa zwrotu (%)"
                  variant="outlined"
                  value={params.annualReturnRate}
                  onChange={(e) => handleInputChange("annualReturnRate", e.target.value)}
                  type="number"
                  InputProps={{ sx: { bgcolor: "#fff" } }}
                />
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <FormControl fullWidth variant="outlined">
                  <InputLabel>Kapitalizacja</InputLabel>
                  <Select
                    value={params.compoundingFrequency}
                    onChange={handleSelectChange("compoundingFrequency")}
                    label="Kapitalizacja"
                  >
                    <MenuItem value="annually">Roczna</MenuItem>
                    <MenuItem value="semiannually">Półroczna</MenuItem>
                    <MenuItem value="quarterly">Kwartalna</MenuItem>
                    <MenuItem value="monthly">Miesięczna</MenuItem>
                    <MenuItem value="daily">Dzienna</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ flex: 1, minWidth: 250 }}>
                <TextField
                  fullWidth
                  label="Czas inwestycji (lata)"
                  variant="outlined"
                  value={params.investmentDuration}
                  onChange={(e: { target: { value: string; }; }) => handleInputChange("investmentDuration", e.target.value)}
                  type="number"
                  InputProps={{ sx: { bgcolor: "#fff" } }}
                />
              </Box>
            </Box>
            
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={calculateInvestment}
                sx={{ px: 4, py: 1, fontSize: "1.1rem", boxShadow: 3 }}
              >
                Oblicz Zysk
              </Button>
            </Box>
          </Paper>
          
          {result && (
            <Paper elevation={2} sx={{ p: 3, my: 3, borderRadius: 2 }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>
                Wyniki
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4, mb: 4, justifyContent: "center" }}>
                <Box sx={{ textAlign: "center", minWidth: 200 }}>
                  <Typography variant="subtitle1" color="textSecondary">Wartość końcowa</Typography>
                  <Typography variant="h5" color="primary" sx={{ fontWeight: "bold" }}>
                    {formatCurrency(result.finalAmount)} zł
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: "center", minWidth: 200 }}>
                  <Typography variant="subtitle1" color="textSecondary">Wpłacony kapitał</Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#2e7d32" }}>
                    {formatCurrency(result.totalContributions)} zł
                  </Typography>
                </Box>
                
                <Box sx={{ textAlign: "center", minWidth: 200 }}>
                  <Typography variant="subtitle1" color="textSecondary">Zyskane odsetki</Typography>
                  <Typography variant="h5" sx={{ fontWeight: "bold", color: "#d32f2f" }}>
                    {formatCurrency(result.totalInterest)} zł
                  </Typography>
                </Box>
              </Box>
              
              <Typography variant="h6" sx={{ mb: 2, mt: 3 }}>Struktura kapitału</Typography>
              <Box sx={{ height: 400, width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={result.yearlyData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <XAxis dataKey="year" label={{ value: 'Rok', position: 'insideBottomRight', offset: -5 }} />
                    <YAxis label={{ value: 'Wartość (zł)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => formatCurrency(Number(value)) + " zł"} />
                    <Legend />
                    <Bar dataKey="principal" name="Wpłacony kapitał" stackId="a" fill="#2e7d32" />
                    <Bar dataKey="interest" name="Zysk z odsetek" stackId="a" fill="#d32f2f" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default InvestmentCalculator;