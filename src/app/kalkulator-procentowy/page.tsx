"use client";

import React, { useState } from "react";
import { Button, TextField, Typography, Box, FormControl, InputLabel, Select, MenuItem, Divider, Paper, SelectChangeEvent } from "@mui/material";
interface Calculation {
  id: string;
  title: string;
  label: string;
  middleText: string;
  isPercent: boolean;
}

interface CalculationValues {
  first: string;
  second: string;
  result: number | null;
}

const calculations: Calculation[] = [
  { id: "percentOfNumber", title: "Część z całości", label: "Oblicz ile to jest", middleText: "% z liczby", isPercent: false },
  { id: "percentageChange", title: "Zmiana procentowa", label: "O ile procent wzrosła liczba", middleText: "do", isPercent: true },
  { id: "addPercentage", title: "Dodawanie procentu", label: "Dodaj", middleText: "% do liczby", isPercent: false },
  { id: "subtractPercentage", title: "Odejmowanie procentu", label: "Odejmij", middleText: "% od liczby", isPercent: false },
  { id: "percentageOfX", title: "Proporcja procentowa", label: "Jakim procentem liczby", middleText: "jest liczba", isPercent: true },
  { id: "discountPrice", title: "Obliczanie rabatu", label: "Cena po rabacie", middleText: "% z liczby", isPercent: false }
];

const PercentageCalculator: React.FC = () => {
  const [values, setValues] = useState<Record<string, CalculationValues>>(() => {
    return calculations.reduce((acc, calc) => ({
      ...acc,
      [calc.id]: { first: "", second: "", result: null }
    }), {} as Record<string, CalculationValues>);
  });
  
  const [decimalPlaces, setDecimalPlaces] = useState<number>(2);

  const handleChange = (calcId: string, field: keyof CalculationValues, value: string) => {
    setValues(prev => ({ ...prev, [calcId]: { ...prev[calcId], [field]: value } }));
  };

  const handleDecimalChange = (event: SelectChangeEvent<number>) => {
    setDecimalPlaces(Number(event.target.value));
  };

  const calculate = (calcId: string) => {
    let result: number | null = null;
    const num1 = parseFloat(values[calcId].first);
    const num2 = parseFloat(values[calcId].second);

    if (!isNaN(num1) && !isNaN(num2)) {
      switch (calcId) {
        case "percentOfNumber":
          result = (num1 * num2) / 100;
          break;
        case "percentageChange":
          result = ((num2 - num1) / Math.abs(num1)) * 100;
          break;
        case "addPercentage":
          result = num2 + (num2 * num1) / 100;
          break;
        case "subtractPercentage":
          result = num2 - (num2 * num1) / 100;
          break;
        case "percentageOfX":
          result = (num2 / num1) * 100;
          break;
        case "discountPrice":
          result = num2 - (num2 * num1) / 100;
          break;
      }
    }
    setValues(prev => ({ ...prev, [calcId]: { ...prev[calcId], result } }));
  };

  const formatResult = (value: number | null, isPercent: boolean): string => {
    if (value === null) return '';
    return value.toFixed(decimalPlaces) + (isPercent ? '%' : '');
  };

  return (
    <Box sx={{ textAlign: "center", p: 2, bgcolor: "#f9f9f9", minHeight: "100vh" }}>
      
      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
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
          Kalkulator IKE
        </Typography>
      </Paper>

        <Box sx={{ maxWidth: 1200, width: "100%", p: 2 }}>
          <Typography variant="h4" sx={{ mb: 3 }}>Kalkulator Procentowy</Typography>
          
          <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 3 }}>
            <FormControl variant="outlined" size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="decimal-places-label">Miejsca po przecinku</InputLabel>
              <Select
                labelId="decimal-places-label"
                value={decimalPlaces}
                onChange={handleDecimalChange}
                label="Miejsca po przecinku"
              >
                {[0, 1, 2, 3, 4, 5].map((num) => (
                  <MenuItem key={num} value={num}>{num}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {calculations.map((calc) => (
            <Paper key={calc.id} elevation={2} sx={{ p: 3, my: 3, borderRadius: 2, transition: "transform 0.2s", "&:hover": { transform: "translateY(-3px)" } }}>
              <Typography variant="h6" sx={{ mb: 2, color: "#1976d2", fontWeight: "bold" }}>{calc.title}</Typography>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1 }}>
                <Typography sx={{ minWidth: "120px", textAlign: "right" }}>{calc.label}</Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  value={values[calc.id].first}
                  onChange={(e) => handleChange(calc.id, "first", e.target.value)}
                  sx={{ width: 100 }}
                  InputProps={{ sx: { bgcolor: "#fff" } }}
                />
                <Typography sx={{ mx: 1 }}>{calc.middleText}</Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  value={values[calc.id].second}
                  onChange={(e) => handleChange(calc.id, "second", e.target.value)}
                  sx={{ width: 100 }}
                  InputProps={{ sx: { bgcolor: "#fff" } }}
                />
                <Typography sx={{ mx: 1 }}>=</Typography>
                <TextField
                  variant="outlined"
                  size="small"
                  value={formatResult(values[calc.id].result, calc.isPercent)}
                  disabled
                  sx={{ 
                    width: 120, 
                    bgcolor: "#fffae5", 
                    textAlign: "center",
                  }}
                  InputProps={{
                    sx: { 
                      fontSize: "1.2rem", 
                      fontWeight: "bold", 
                      color: "#d32f2f", 
                    }
                  }}
                />
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={() => calculate(calc.id)}
                  sx={{ ml: 1, px: 3, boxShadow: 2 }}
                >
                  Oblicz
                </Button>
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default PercentageCalculator;