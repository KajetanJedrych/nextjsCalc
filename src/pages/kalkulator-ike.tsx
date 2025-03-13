import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, Divider, Paper, Radio, RadioGroup, FormControlLabel, Slider, Tooltip, IconButton, Alert } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from "recharts";


interface IkeParams {
  age: string;
  contributionAmount: string;
  contributionFrequency: string;
  investUntilAge: string;
  annualReturnRate: number;
  payoutDuration: string;
  monthlyIncome: string;
}

interface IkeResult {
  totalSaved: number;
  taxSavings: number;
  monthlyPension: number;
  estimatedZusPension: number;
  yearlyData: {
    age: number;
    principal: number;
    interest: number;
    totalBalance: number;
  }[];
}

const IKE_LIMIT_2025 = 26019; // Annual contribution limit for 2025

const IkeCalculator: React.FC = () => {
  const [params, setParams] = useState<IkeParams>({
    age: "35",
    contributionAmount: "26019",
    contributionFrequency: "yearly",
    investUntilAge: "60",
    annualReturnRate: 6,
    payoutDuration: "10",
    monthlyIncome: "6000"
  });

  const [result, setResult] = useState<IkeResult | null>(null);
  const [isExpanded1, setIsExpanded1] = useState<boolean>(false);
  const [isExpanded2, setIsExpanded2] = useState<boolean>(false);
  const [showRetirementWarning, setShowRetirementWarning] = useState<boolean>(false);

  const handleInputChange = (field: keyof IkeParams, value: string) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const handleReturnRateChange = (_: Event, newValue: number | number[]) => {
    setParams(prev => ({ ...prev, annualReturnRate: newValue as number }));
  };

  const handleFrequencyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setParams(prev => ({ ...prev, contributionFrequency: event.target.value }));
  };

  const toggleSection1 = () => {
    setIsExpanded1(!isExpanded1);
  };

  const toggleSection2 = () => {
    setIsExpanded2(!isExpanded2);
  };

  // Calculates estimated ZUS pension based on monthly income
  const calculateEstimatedZusPension = (monthlyIncome: number): number => {
    // Simple calculation - about 30% of current income
    // This is a rough estimate for Poland's pension system
    return monthlyIncome * 0.3;
  };

  const calculateIKE = () => {
    const currentAge = parseInt(params.age) || 35;
    const retirementAge = parseInt(params.investUntilAge) || 60;
    const yearsToInvest = retirementAge - currentAge;
    const annualContribution = params.contributionFrequency === "yearly" 
      ? Math.min(parseFloat(params.contributionAmount) || 0, IKE_LIMIT_2025)
      : Math.min((parseFloat(params.contributionAmount) || 0) * 12, IKE_LIMIT_2025);
    const returnRate = params.annualReturnRate / 100;
    const payoutYears = parseInt(params.payoutDuration) || 10;
    const monthlyIncome = parseFloat(params.monthlyIncome) || 6000;
    
    if (yearsToInvest <= 0) return;

    // Check if retirement age is less than 55
    setShowRetirementWarning(retirementAge < 55);

    const yearlyData = [];
    let totalPrincipal = 0;
    let currentBalance = 0;
    
    // Calculate year by year investment growth
    for (let year = 1; year <= yearsToInvest; year++) {
      // Add annual contribution
      totalPrincipal += annualContribution;
      currentBalance += annualContribution;
      
      // Apply annual return
      const interestForYear = currentBalance * returnRate;
      currentBalance += interestForYear;
      
      yearlyData.push({
        age: currentAge + year,
        principal: totalPrincipal,
        interest: currentBalance - totalPrincipal,
        totalBalance: currentBalance
      });
    }
    
    // Calculate tax savings (19% in Poland)
    const taxRate = 0.19;
    const taxSavings = totalPrincipal * taxRate;
    
    // Calculate monthly pension
    const monthlyPension = currentBalance / (payoutYears * 12);
    
    // Calculate estimated ZUS pension
    const estimatedZusPension = calculateEstimatedZusPension(monthlyIncome);
    
    setResult({
      totalSaved: currentBalance,
      taxSavings,
      monthlyPension,
      estimatedZusPension,
      yearlyData
    });
  };

  useEffect(() => {
    calculateIKE();
  }, []);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
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
          Kalkulator IKE
        </Typography>
      </Paper>
      
      <Box sx={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 2 }}>
        <Box sx={{ width: "100%", maxWidth: 1200, p: 2 }}>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2 }}>
            {/* Left panel - Inputs */}
            <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "45%" } }}>
              <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                {/* Age input */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left" }}>
                    Podaj swój wiek
                  </Typography>
                  <TextField
                    fullWidth
                    value={params.age}
                    onChange={(e: { target: { value: string; }; }) => handleInputChange("age", e.target.value)}
                    type="number"
                    InputProps={{ 
                      sx: { bgcolor: "#fff" },
                      endAdornment: <Typography sx={{ ml: 1 }}>lat</Typography>
                    }}
                    inputProps={{ min: 18, max: 100 }}
                  />
                </Box>
                
                {/* Contribution amount */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left", display: "flex", alignItems: "center" }}>
                    Ile chcesz wpłacać na IKE?
                    <Tooltip title="Maksymalny roczny limit wpłat w 2025: 26 019 zł">
                      <IconButton size="small" sx={{ ml: 1 }}>
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <TextField
                      fullWidth
                      value={params.contributionAmount}
                      onChange={(e: { target: { value: string; }; }) => handleInputChange("contributionAmount", e.target.value)}
                      type="number"
                      InputProps={{ 
                        sx: { bgcolor: "#fff" },
                        endAdornment: <Typography sx={{ ml: 1 }}>zł</Typography>
                      }}
                    />
                    <RadioGroup 
                      row
                      name="contribution-frequency"
                      value={params.contributionFrequency}
                      onChange={handleFrequencyChange}
                    >
                      <FormControlLabel value="yearly" control={<Radio />} label="Rocznie" />
                      <FormControlLabel value="monthly" control={<Radio />} label="Miesięcznie" />
                    </RadioGroup>
                  </Box>
                  
                  <Box sx={{ mt: 2 }}>
                    <Slider
                      value={params.contributionFrequency === "yearly" 
                        ? Math.min(parseInt(params.contributionAmount) || 0, IKE_LIMIT_2025) 
                        : Math.min((parseInt(params.contributionAmount) || 0), IKE_LIMIT_2025/12)}
                      onChange={(_: any, value: { toString: () => string; }) => handleInputChange("contributionAmount", value.toString())}
                      min={50}
                      max={params.contributionFrequency === "yearly" ? IKE_LIMIT_2025 : IKE_LIMIT_2025/12}
                      step={params.contributionFrequency === "yearly" ? 100 : 10}
                      marks={[
                        { value: 50, label: "50 zł" },
                        { value: params.contributionFrequency === "yearly" ? IKE_LIMIT_2025 : IKE_LIMIT_2025/12, 
                          label: params.contributionFrequency === "yearly" ? `${IKE_LIMIT_2025} zł` : `${Math.floor(IKE_LIMIT_2025/12)} zł` }
                      ]}
                    />
                    <Typography variant="caption" sx={{ display: "block", textAlign: "right", mt: 1 }}>
                      Limit wpłat w 2025: {IKE_LIMIT_2025.toLocaleString()} zł
                    </Typography>
                  </Box>
                </Box>
                
                {/* Investment duration */}
                <Box sx={{ mb: 1 }}>
                  <Box 
                    onClick={toggleSection1}
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      cursor: "pointer",
                      borderBottom: "1px solid #e0e0e0",
                      pb: 1
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Czas inwestycji i stopa zwrotu
                    </Typography>
                    <Typography sx={{ color: "#1976d2" }}>
                      {isExpanded1 ? "Zwiń ▲" : "Rozwiń ▼"}
                    </Typography>
                  </Box>
                  
                  {isExpanded1 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left", display: "flex", alignItems: "center" }}>
                          Chcesz wpłacać do:
                          <Tooltip title="Wiek, w którym zakończysz wpłaty na IKE">
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        <TextField
                          fullWidth
                          value={params.investUntilAge}
                          onChange={(e: { target: { value: string; }; }) => handleInputChange("investUntilAge", e.target.value)}
                          type="number"
                          InputProps={{ 
                            sx: { bgcolor: "#fff" },
                            endAdornment: <Typography sx={{ ml: 1 }}>r.ż.</Typography>
                          }}
                          inputProps={{ min: parseInt(params.age) + 1, max: 100 }}
                        />
                        
                        {showRetirementWarning && (
                          <Alert severity="warning" sx={{ mt: 2 }}>
                            Aby skorzystać z ulgi podatkowej IKE, trzeba zacząć wypłacać pieniądze po nabyciu praw emerytalnych (po 55. roku życia)
                          </Alert>
                        )}
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left", display: "flex", alignItems: "center" }}>
                          Zakładana roczna stopa zwrotu (%):
                          <Tooltip title="Średnia roczna stopa zwrotu z inwestycji">
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        <Box sx={{ px: 2 }}>
                          <Slider
                            value={params.annualReturnRate}
                            onChange={handleReturnRateChange}
                            step={1}
                            marks={[
                              { value: 1, label: "1%" },
                              { value: 3, label: "3%" },
                              { value: 6, label: "6%" },
                              { value: 9, label: "9%" },
                              { value: 12, label: "12%" }
                            ]}
                            min={1}
                            max={12}
                            sx={{
                              '& .MuiSlider-mark': {
                                height: 8,
                              },
                              '& .MuiSlider-markActive': {
                                backgroundColor: 'primary.main',
                              },
                            }}
                          />
                        </Box>
                      </Box>
                    </Box>
                  )}
                </Box>
                
                {/* Payout settings */}
                <Box sx={{ mt: 3, mb: 1 }}>
                  <Box 
                    onClick={toggleSection2}
                    sx={{ 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      cursor: "pointer",
                      borderBottom: "1px solid #e0e0e0",
                      pb: 1
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Ile lat chcesz wypłacać emeryturę z IKE?
                    </Typography>
                    <Typography sx={{ color: "#1976d2" }}>
                      {isExpanded2 ? "Zwiń ▲" : "Rozwiń ▼"}
                    </Typography>
                  </Box>
                  
                  {isExpanded2 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: "#f5f5f5", borderRadius: 1 }}>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left", display: "flex", alignItems: "center" }}>
                          Chcesz wypłacać przez:
                          <Tooltip title="Przez ile lat planujesz wypłacać środki z IKE">
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        <TextField
                          fullWidth
                          value={params.payoutDuration}
                          onChange={(e: { target: { value: string; }; }) => handleInputChange("payoutDuration", e.target.value)}
                          type="number"
                          InputProps={{ 
                            sx: { bgcolor: "#fff" },
                            endAdornment: <Typography sx={{ ml: 1 }}>lat</Typography>
                          }}
                          inputProps={{ min: 1, max: 30 }}
                        />
                      </Box>
                      
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left", display: "flex", alignItems: "center" }}>
                          Twoje miesięczne zarobki brutto:
                          <Tooltip title="Potrzebne do porównania z emeryturą z ZUS">
                            <IconButton size="small" sx={{ ml: 1 }}>
                              <InfoOutlinedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Typography>
                        <TextField
                          fullWidth
                          value={params.monthlyIncome}
                          onChange={(e: { target: { value: string; }; }) => handleInputChange("monthlyIncome", e.target.value)}
                          type="number"
                          InputProps={{ 
                            sx: { bgcolor: "#fff" },
                            endAdornment: <Typography sx={{ ml: 1 }}>zł</Typography>
                          }}
                        />
                      </Box>
                    </Box>
                  )}
                </Box>
                
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={calculateIKE}
                    sx={{ px: 4, py: 1, fontSize: "1.1rem", boxShadow: 3 }}
                  >
                    Oblicz
                  </Button>
                </Box>
              </Paper>
            </Box>
            
            {/* Right panel - Results */}
            {result && (
              <Box sx={{ flex: 1, minWidth: { xs: "100%", md: "45%" } }}>
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
                    Twoja emerytura z IKE:
                  </Typography>
                  
                  <Typography variant="h3" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2", textAlign: "right" }}>
                    {formatCurrency(result.totalSaved)} zł
                  </Typography>
                
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                    <Typography variant="subtitle1">
                      Zaoszczędzony podatek:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#4caf50" }}>
                      {formatCurrency(result.taxSavings)} zł
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="subtitle1">
                        Twoja miesięczna, prywatna emerytura z IKE:
                      </Typography>
                      <Tooltip title="Kwota miesięcznej wypłaty przez zadeklarowany okres">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#1976d2" }}>
                      {formatCurrency(result.monthlyPension)} zł
                    </Typography>
                  </Box>
                  
                  {/* Comparison chart for ZUS vs IKE */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, textAlign: "left" }}>
                      Porównanie emerytury
                    </Typography>
                    
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Typography variant="body2" sx={{ minWidth: 160, textAlign: "left" }}>
                        Szacowana emerytura z ZUS:
                      </Typography>
                      <Box sx={{ flex: 1, mx: 2 }}>
                        <Box sx={{ 
                          height: 10, 
                          bgcolor: "#3f51b5", 
                          width: `${Math.min((result.estimatedZusPension / parseInt(params.monthlyIncome)) * 100, 60)}%`, 
                          borderRadius: 5 
                        }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold", minWidth: 100, textAlign: "right" }}>
                        {formatCurrency(result.estimatedZusPension)} zł
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography variant="body2" sx={{ minWidth: 160, textAlign: "left" }}>
                        Dodatkowa emerytura z IKE:
                      </Typography>
                      <Box sx={{ flex: 1, mx: 2 }}>
                        <Box sx={{ 
                          height: 10, 
                          bgcolor: "#2196f3", 
                          width: `${Math.min((result.monthlyPension / parseInt(params.monthlyIncome)) * 100, 100)}%`, 
                          borderRadius: 5 
                        }} />
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: "bold", minWidth: 100, textAlign: "right" }}>
                        {formatCurrency(result.monthlyPension)} zł
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" sx={{ textAlign: "right", mt: 1, color: "#666" }}>
                      Twoje wynagrodzenie brutto: {formatCurrency(parseInt(params.monthlyIncome) || 6000)} zł
                    </Typography>
                  </Box>
                  
                  <Box sx={{ mt: 4, mb: 2, textAlign: "left" }}>
                    <Typography variant="subtitle1" sx={{ display: "flex", alignItems: "center" }}>
                      Jak to obliczyliśmy?
                      <Tooltip title="Twoja prywatna emerytura z IKE: wysokość miesięcznej wypłaty zależy od okresu, przez który planujesz pobierać środki. W zakładce „Ile lat chcesz wypłacać emeryturę z IKE” po lewej stronie możesz dostosować ten czas.">
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Typography>
                  </Box>
                </Paper>
                
                {/* Chart showing growth over time */}
                <Paper elevation={2} sx={{ p: 3, borderRadius: 2, mt: 2 }}>
                  <Typography variant="h6" sx={{ mb: 3 }}>Wzrost wartości IKE w czasie</Typography>
                  <Box sx={{ height: 300, width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={result.yearlyData.filter((_, i) => i % Math.max(1, Math.floor(result.yearlyData.length / 10)) === 0)}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis dataKey="age" label={{ value: 'Wiek', position: 'insideBottomRight', offset: -5 }} />
                        <YAxis label={{ value: 'Wartość (zł)', angle: -90, position: 'insideLeft' }} />
                        <RechartsTooltip formatter={(value) => formatCurrency(Number(value)) + " zł"} />
                        <Legend />
                        <Bar dataKey="principal" name="Wpłacony kapitał" stackId="a" fill="#2e7d32" />
                        <Bar dataKey="interest" name="Zysk z inwestycji" stackId="a" fill="#d32f2f" />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                  
                </Paper>
              </Box>
            )}
          </Box>
        </Box>
        {/* Information about IKE */}
        <Paper elevation={3} sx={{ width: "80%", mx: "auto", mt: 4, p: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2", textAlign: "center" }}>
            Informacje o IKE
          </Typography>

          <Box sx={{ textAlign: "left" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Czym jest IKE i jakie są limity wpłat?
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Indywidualne Konto Emerytalne (IKE) to element trzeciego, dobrowolnego filaru emerytalnego. IKE umożliwia samodzielne oszczędzanie na emeryturę z korzyścią w postaci zwolnienia z podatku od zysków kapitałowych (tzw. "podatku Belki").
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Na IKE wpłacać możesz dowolne kwoty i w dowolnym czasie - pierwsza minimalna wpłata w TFI to zazwyczaj tylko 50 zł. Pamiętaj jednak, że w danym roku kalendarzowym możesz wpłacić maksymalnie 300% prognozowanego przeciętnego miesięcznego wynagrodzenia w gospodarce narodowej. W 2025 roku limit ten wynosi 26 019 zł.
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Zgromadzone środki są w pełni prywatne i podlegają dziedziczeniu. Nie są obciążone podatkiem od zysków kapitałowych ani podatkiem od spadków i darowizn.
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Jak działa kalkulator IKE?
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Nasz kalkulator IKE pomoże Ci odpowiedzieć na pytania: "ile odkładać na emeryturę, aby zapewnić sobie komfortową przyszłość?" oraz "jaką dodatkową emeryturę mogę uzyskać, inwestując regularnie określoną kwotę?".
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Aby rozpocząć obliczenia, wprowadź swój aktualny wiek oraz kwotę, którą zamierzasz wpłacać miesięcznie lub rocznie. Choć wpłaty na IKE nie muszą być regularne, systematyczne oszczędzanie buduje dobre nawyki finansowe i maksymalizuje korzyści.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Następnie określ, w jakim wieku planujesz rozpocząć wypłatę środków. Pamiętaj, że aby skorzystać z ulg podatkowych, wypłata powinna nastąpić po 60. roku życia lub po 55. roku życia, jeśli nabyłeś już uprawnienia emerytalne. Dodatkowo muszą być spełnione dwa warunki: dokonanie wpłat w co najmniej 5 różnych latach kalendarzowych oraz wpłacenie ponad połowy wartości środków co najmniej 5 lat przed złożeniem wniosku o wypłatę.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Wybierz także oczekiwaną stopę zwrotu z inwestycji. Pamiętaj, że wyższe stopy zwrotu wiążą się zwykle z większym ryzykiem inwestycyjnym - zastanów się, jaki poziom ryzyka jesteś gotów zaakceptować.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Po określeniu liczby lat, przez które chcesz otrzymywać wypłaty, kalkulator przedstawi szacowaną wartość zgromadzonego kapitału, miesięczną kwotę prywatnej emerytury oraz oszacuje oszczędności podatkowe.
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default IkeCalculator;