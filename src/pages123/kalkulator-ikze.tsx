import React, { useState, useEffect } from "react";
import { Button, TextField, Typography, Box, Paper, Radio, RadioGroup, FormControlLabel, Slider, Tooltip, IconButton, Card,CardContent,Grid,Accordion,AccordionSummary,AccordionDetails,InputAdornment } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
interface IkeParams {
  age: string;
  monthlySalary: string;
  contributionAmount: string;
  contributionFrequency: string;
  investUntilAge: string;
  annualReturnRate: number;
  payoutDuration: string;
}

interface IkeResult {
  yearlyTaxSavings: number;
  totalSaved: number;
  totalContributed: number;
  profit: number;
  profitPercentage: number;
  monthlyPension: number;
  estimatedZusPension: number;
}

const IkzeCalculator: React.FC = () => {
  const [params, setParams] = useState<IkeParams>({
    age: "25",
    monthlySalary: "10000",
    contributionAmount: "867.3",
    contributionFrequency: "monthly",
    investUntilAge: "65",
    annualReturnRate: 5,
    payoutDuration: "10",
  });

  const [result, setResult] = useState<IkeResult>({
    yearlyTaxSavings: 1248.91,
    totalSaved: 1329031.94,
    totalContributed: 416304.00,
    profit: 912727.94,
    profitPercentage: 219.25,
    monthlyPension: 9967.74,
    estimatedZusPension: 3000
  });

  const [expanded, setExpanded] = useState({
    investmentTime: false,
    payoutSettings: false,
    details: false
  });

  const toggleDetails = () => {
    setExpanded(prev => ({
      ...prev,
      details: !prev.details
    }));
  };

  const handleInputChange = (field: keyof IkeParams, value: string | number) => {
    setParams(prev => ({ ...prev, [field]: value }));
  };

  const calculateIKE = () => {
    // Fixed calculation to update ZUS pension based on monthly salary
    const monthlySalaryNum = parseFloat(params.monthlySalary);
    const estimatedZusRate = 0.3; // 30% of salary as an example rate
    const estimatedZusPension = monthlySalaryNum * estimatedZusRate;
    
    // Calculate total contributed based on frequency
    const years = parseInt(params.investUntilAge) - parseInt(params.age);
    let totalContributed: number;
    
    if (params.contributionFrequency === "monthly") {
      totalContributed = parseFloat(params.contributionAmount) * 12 * years;
    } else {
      totalContributed = parseFloat(params.contributionAmount) * years;
    }
    
    // Calculate total saved with compound interest
    const totalSaved = totalContributed * Math.pow(1 + params.annualReturnRate / 100, years);
    
    // Calculate profit
    const profit = totalSaved - totalContributed;
    const profitPercentage = (profit / totalContributed) * 100;
    
    // Calculate monthly pension based on payout duration
    const payoutMonths = parseInt(params.payoutDuration) * 12;
    const monthlyPension = totalSaved / payoutMonths;
    
    // Calculate tax savings (assuming 12% tax rate for simplification)
    const yearlyContribution = params.contributionFrequency === "monthly" 
        ? parseFloat(params.contributionAmount) * 12 
        : parseFloat(params.contributionAmount);
    const yearlyTaxSavings = yearlyContribution * 0.12;

    setResult({
      yearlyTaxSavings,
      totalSaved,
      totalContributed,
      profit,
      profitPercentage,
      monthlyPension,
      estimatedZusPension
    });
  };

  useEffect(() => {
    calculateIKE();
  }, [params]); // Added dependency array to recalculate when params change

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
  };

  const IKE_LIMIT_2025 = 10407.60; // Annual contribution limit for 2025 - corrected value
  const monthlyLimit = Math.floor(IKE_LIMIT_2025 / 12);

  // Get the correct max limit based on contribution frequency
  const getMaxContributionLimit = () => {
    return params.contributionFrequency === "monthly" ? monthlyLimit : IKE_LIMIT_2025;
  };

  const generateChartData = () => {
    const years = parseInt(params.investUntilAge) - parseInt(params.age);
    const intervals = [0, 10, 20, 30, 40].filter(interval => interval <= years);
    if (!intervals.includes(years)) intervals.push(years);
    
    return intervals.map(year => {
      // Simplified calculation for demonstration
      const contributedSoFar = (params.contributionFrequency === "monthly")
        ? parseFloat(params.contributionAmount) * 12 * year
        : parseFloat(params.contributionAmount) * year;
      
      const estimatedTotal = contributedSoFar * Math.pow(1 + params.annualReturnRate / 100, year);
      
      return {
        year: `${year} lat`,
        contributed: contributedSoFar,
        total: estimatedTotal
      };
    });
  };

  const handleFrequencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFrequency = e.target.value;
    let newAmount: string;
    
    // Adjust the contribution amount when switching between frequencies
    if (newFrequency === "monthly" && params.contributionFrequency === "yearly") {
      // Convert yearly to monthly
      newAmount = (parseFloat(params.contributionAmount) / 12).toFixed(2);
    } else if (newFrequency === "yearly" && params.contributionFrequency === "monthly") {
      // Convert monthly to yearly
      newAmount = (parseFloat(params.contributionAmount) * 12).toFixed(2);
    } else {
      newAmount = params.contributionAmount;
    }
    
    setParams(prev => ({ 
      ...prev, 
      contributionFrequency: newFrequency,
      contributionAmount: newAmount
    }));
  };

  const comparativeData = [
    {
      name: 'ZUS',
      value: result.estimatedZusPension,
      percentage: (result.estimatedZusPension / parseFloat(params.monthlySalary)) * 100
    },
    {
      name: 'IKZE',
      value: result.monthlyPension,
      percentage: (result.monthlyPension / parseFloat(params.monthlySalary)) * 100
    }
  ];

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3, bgcolor: "#f5f5f5" }}>
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
          Kalkulator IKZE
        </Typography>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, bgcolor: "#f0f0f0", borderRadius: 2 }}>
        <Grid container spacing={4}>
          {/* Left column - Inputs */}
          <Grid item xs={12} md={6}>
            {/* Tab navigation - Removed "Działalność gospodarcza" tab */}
            <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex' }}>
                <Button
                  sx={{
                    py: 1,
                    px: 2,
                    borderBottom: 2,
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    borderRadius: 0
                  }}
                >
                  Umowa o pracę
                </Button>
              </Box>
            </Box>

            {/* Monthly income */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  Twoje miesięczne zarobki brutto
                </Typography>
                <Tooltip title="Informacja o zarobkach brutto">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                value={params.monthlySalary}
                onChange={(e) => handleInputChange("monthlySalary", e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                }}
                size="small"
              />
            </Box>

            {/* Contribution amount */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography variant="body2" fontWeight="medium">
                  Ile chcesz wpłacać na IKZE?
                </Typography>
                <Tooltip title="Informacja o wpłatach na IKZE">
                  <IconButton size="small">
                    <InfoOutlinedIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
              </Box>
              <TextField
                fullWidth
                value={params.contributionAmount}
                onChange={(e) => handleInputChange("contributionAmount", e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">zł</InputAdornment>,
                }}
                size="small"
              />
              <RadioGroup
                row
                value={params.contributionFrequency}
                onChange={handleFrequencyChange}
                sx={{ mt: 1 }}
              >
                <FormControlLabel value="yearly" control={<Radio size="small" />} label="Rocznie" />
                <FormControlLabel value="monthly" control={<Radio size="small" />} label="Miesięcznie" />
              </RadioGroup>

              {/* Slider with dynamic max value based on contribution frequency */}
              <Box sx={{ my: 2, px: 1 }}>
                <Slider
                  value={parseFloat(params.contributionAmount)}
                  min={50}
                  max={getMaxContributionLimit()}
                  onChange={(_, value) => handleInputChange("contributionAmount", value.toString())}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value} zł`}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Typography variant="caption">50 zł</Typography>
                  <Typography variant="caption">
                    {params.contributionFrequency === "monthly" 
                      ? `Miesięczny limit wpłat w 2025: ${monthlyLimit} zł`
                      : `Roczny limit wpłat w 2025: ${IKE_LIMIT_2025} zł`}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Investment time & return rate */}
            <Accordion 
              expanded={expanded.investmentTime}
              onChange={() => setExpanded(prev => ({ ...prev, investmentTime: !prev.investmentTime }))}
              sx={{ mb: 2, bgcolor: 'background.paper' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">Czas inwestycji i stopa zwrotu</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" fontWeight="medium" gutterBottom>
                    Ile masz lat?
                  </Typography>
                  <TextField
                    fullWidth
                    value={params.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Chcesz wpłacać do:
                    </Typography>
                    <Tooltip title="Informacja o wieku końca wpłat">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    value={params.investUntilAge}
                    onChange={(e) => handleInputChange("investUntilAge", e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">r.ż.</InputAdornment>,
                    }}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Zakładana roczna stopa zwrotu (%):
                    </Typography>
                    <Tooltip title="Informacja o stopie zwrotu">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Box sx={{ px: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(value => (
                        <Button 
                          key={value}
                          sx={{
                            minWidth: 36,
                            height: 36,
                            borderRadius: '50%',
                            bgcolor: params.annualReturnRate === value ? 'primary.main' : 'grey.300',
                            color: params.annualReturnRate === value ? 'white' : 'text.primary',
                            '&:hover': {
                              bgcolor: params.annualReturnRate === value ? 'primary.dark' : 'grey.400',
                            }
                          }}
                          onClick={() => handleInputChange("annualReturnRate", value)}
                        >
                          {value}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* Payout settings */}
            <Accordion 
              expanded={expanded.payoutSettings}
              onChange={() => setExpanded(prev => ({ ...prev, payoutSettings: !prev.payoutSettings }))}
              sx={{ mb: 2, bgcolor: 'background.paper' }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography fontWeight="medium">Ile lat chcesz wypłacać emeryturę z IKZE?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Chcesz wypłacać przez:
                    </Typography>
                    <Tooltip title="Informacja o okresie wypłaty">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <TextField
                    fullWidth
                    value={params.payoutDuration}
                    onChange={(e) => handleInputChange("payoutDuration", e.target.value)}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">lat</InputAdornment>,
                    }}
                    size="small"
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          </Grid>
          
          {/* Right column - Results */}
          <Grid item xs={12} md={6}>
            <Card elevation={3} sx={{ p: 2 }}>
              <CardContent>
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight="medium">Twoja roczna ulga podatkowa IKZE:</Typography>
                    <Tooltip title="Informacja o uldze podatkowej">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography variant="h4" color="success.main" fontWeight="bold" sx={{ ml: 'auto' }}>
                    {formatCurrency(result.yearlyTaxSavings)} zł
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Po {parseInt(params.investUntilAge) - parseInt(params.age)} latach inwestycji na IKZE będziesz mieć:
                    </Typography>
                    <Button 
                      onClick={toggleDetails}
                      size="small"
                      color="primary"
                      endIcon={expanded.details ? <ExpandMoreIcon /> : <ExpandMoreIcon sx={{ transform: 'rotate(180deg)' }} />}
                    >
                      Szczegóły
                    </Button>
                  </Box>
                  <Typography variant="h5" color="primary.dark" fontWeight="bold">
                    {formatCurrency(result.totalSaved)} zł
                  </Typography>
                </Box>
                
                {expanded.details && (
                  <Box sx={{ my: 2, p: 2, bgcolor: '#f8f8f8', borderRadius: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="body2">
                        Łączna kwota wpłacona w okresie {parseInt(params.investUntilAge) - parseInt(params.age)} lat:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {formatCurrency(result.totalContributed)} zł
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2">Przewidywany zysk</Typography>
                      <Box>
                        <Typography variant="body2" color="success.main" component="span" fontWeight="medium">
                          +{result.profitPercentage.toFixed(2)}%
                        </Typography>
                        <Typography variant="body2" component="span" fontWeight="medium" sx={{ ml: 1 }}>
                          {formatCurrency(result.profit)} zł
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {/* Chart */}
                <Box sx={{ height: 300, mt: 3 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={generateChartData()}
                      margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
                    >
                      <XAxis dataKey="year" />
                      <YAxis />
                      <RechartsTooltip formatter={(value) => formatCurrency(Number(value)) + " zł"} />
                      <Legend />
                      <Line type="monotone" dataKey="contributed" stroke="#3f51b5" name="Wartość wpłat" />
                      <Line type="monotone" dataKey="total" stroke="#4caf50" name="Wynik inwestycji" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" fontWeight="medium">
                      Twoja miesięczna, prywatna emerytura z IKZE:
                    </Typography>
                    <Tooltip title="Informacja o emeryturze">
                      <IconButton size="small">
                        <InfoOutlinedIcon fontSize="small" color="primary" />
                      </IconButton>
                    </Tooltip>
                    <Typography variant="h5" color="primary.dark" fontWeight="bold" sx={{ ml: 'auto' }}>
                      {formatCurrency(result.monthlyPension)} zł
                    </Typography>
                  </Box>
                  
                  {/* Comparison bars */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="body2" gutterBottom>Porównanie emerytury:</Typography>
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart
                        data={comparativeData}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <XAxis type="number" domain={[0, 100]} hide />
                        <YAxis type="category" dataKey="name" />
                        <RechartsTooltip
                          formatter={(_value, _name, props) => [
                            `${formatCurrency(props.payload.value)} zł (${props.payload.percentage.toFixed(1)}%)`,
                            props.payload.name
                          ]}
                        />
                        <Bar dataKey="percentage" fill="#3f51b5" name="Emerytura" />
                      </BarChart>
                    </ResponsiveContainer>
                    <Typography variant="body2" align="right" color="text.secondary">
                      Wynagrodzenie brutto: {formatCurrency(parseFloat(params.monthlySalary))} zł
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>
       {/* Information about IKE */}
       <Paper elevation={3} sx={{ width: "80%", mx: "auto", mt: 4, p: 4, borderRadius: 2 }}>
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold", color: "#1976d2", textAlign: "center" }}>
            Informacje o IKE
          </Typography>

          <Box sx={{ textAlign: "left" }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Czym jest IKZE i jakie są limity wpłat?
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Indywidualne Konto Zabezpieczenia Emerytalnego (IKZE) to dobrowolna forma oszczędzania na emeryturę w ramach trzeciego filaru. IKZE oferuje korzyść podatkową w postaci odliczenia wpłat od podstawy opodatkowania oraz zwolnienia z podatku od zysków kapitałowych.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Na IKZE obowiązuje roczny limit wpłat wynoszący 1,2-krotność prognozowanego przeciętnego wynagrodzenia w gospodarce narodowej. W 2025 roku limit ten wynosi 10 408 zł dla osób fizycznych oraz 15 612 zł dla osób prowadzących działalność gospodarczą.
            </Typography>
            <Typography variant="body2" sx={{ mb: 3 }}>
              Środki zgromadzone na IKZE są prywatne i podlegają dziedziczeniu. Wypłata przed osiągnięciem 65. roku życia wiąże się z koniecznością zapłaty podatku dochodowego od całej kwoty.
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
              Jak działa kalkulator IKZE?
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Nasz kalkulator IKZE pomoże Ci oszacować przyszłe oszczędności emerytalne oraz korzyści podatkowe wynikające z regularnych wpłat na konto IKZE.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Wprowadź swój wiek oraz kwotę, którą zamierzasz wpłacać miesięcznie lub rocznie. Pamiętaj, że choć wpłaty mogą być nieregularne, systematyczność zwiększa potencjalne zyski.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Wybierz moment rozpoczęcia wypłaty środków – dla uniknięcia podatku od zysków kapitałowych i skorzystania z preferencyjnej stawki PIT (10%) należy wypłacić środki po 65. roku życia oraz dokonywać wpłat przez co najmniej 5 lat kalendarzowych.
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              Podaj oczekiwaną stopę zwrotu i liczbę lat wypłat, aby zobaczyć prognozowaną wysokość emerytury oraz oszczędności podatkowe.
            </Typography>
          </Box>
        </Paper>
    </Box>
  );
};

export default IkzeCalculator;