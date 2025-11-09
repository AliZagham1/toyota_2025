"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { DollarSign, TrendingDown, Calculator, Percent } from "lucide-react"

export default function AffordabilityPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const carId = searchParams.get("carId")
  const carPrice = Number.parseFloat(searchParams.get("price") || "30000")

  const [downPayment, setDownPayment] = useState(carPrice * 0.1) // More realistic default: 10%
  const [creditScore, setCreditScore] = useState(750)
  const [loanType, setLoanType] = useState<"finance" | "lease">("finance")
  const [loanTerm, setLoanTerm] = useState(60) // Default to 60 months for finance

  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [interestRate, setInterestRate] = useState(0)
  const [residualValue, setResidualValue] = useState(0) // For lease calculations
  const [totalInterest, setTotalInterest] = useState(0) // Total interest paid

  // Update loan term when switching between finance and lease
  useEffect(() => {
    if (loanType === "lease" && loanTerm !== 36) {
      setLoanTerm(36) // Leases are typically 36 months
    } else if (loanType === "finance" && loanTerm === 36) {
      setLoanTerm(60) // Default finance to 60 months
    }
  }, [loanType])

  // Calculate affordability when inputs change
  useEffect(() => {
    calculatePayment()
  }, [downPayment, creditScore, loanType, loanTerm, carPrice])

  const getInterestRate = (score: number, term: number, isLease: boolean): number => {
    // Realistic 2024-2025 auto loan rates based on credit score and term length
    // Longer terms typically have slightly higher rates
    let baseRate = 0
    
    if (isLease) {
      // Lease money factors are typically higher (converted to APR for display)
      if (score >= 750) baseRate = 5.5
      else if (score >= 700) baseRate = 6.5
      else if (score >= 650) baseRate = 8.0
      else if (score >= 600) baseRate = 10.5
      else baseRate = 13.5
    } else {
      // Finance rates (2024-2025 market rates)
      if (score >= 750) {
        baseRate = term <= 48 ? 5.0 : term <= 60 ? 5.5 : 6.0
      } else if (score >= 700) {
        baseRate = term <= 48 ? 6.0 : term <= 60 ? 6.5 : 7.0
      } else if (score >= 650) {
        baseRate = term <= 48 ? 7.5 : term <= 60 ? 8.5 : 9.5
      } else if (score >= 600) {
        baseRate = term <= 48 ? 10.0 : term <= 60 ? 11.5 : 13.0
      } else {
        baseRate = term <= 48 ? 13.5 : term <= 60 ? 15.0 : 16.5
      }
    }
    
    return baseRate
  }

  const calculatePayment = () => {
    const principal = carPrice - downPayment
    const rate = getInterestRate(creditScore, loanTerm, loanType === "lease")
    setInterestRate(rate)

    if (loanType === "finance") {
      // Standard auto loan formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
      const monthlyRate = rate / 100 / 12
      const payment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
      
      const monthly = isFinite(payment) ? payment : 0
      const total = monthly * loanTerm + downPayment
      const interest = total - carPrice
      
      setMonthlyPayment(Math.round(monthly))
      setTotalPayment(Math.round(total))
      setTotalInterest(Math.round(interest))
      setResidualValue(0) // No residual for finance
    } else {
      // Realistic lease calculation
      // Residual value: typically 50-60% of MSRP for 36-month leases on new vehicles
      // Higher for reliable brands like Toyota (55-60%)
      const residualPercentage = 0.57 // 57% residual for Toyota (realistic for 36-month lease)
      const residual = carPrice * residualPercentage
      setResidualValue(residual)
      
      // Capitalized cost (negotiated price minus down payment)
      const capCost = carPrice - downPayment
      
      // Depreciation (amount you pay over the lease term)
      const depreciation = capCost - residual
      
      // Rent charge (interest) - calculated using money factor equivalent
      const monthlyRate = rate / 100 / 12
      const rentCharge = (capCost + residual) * monthlyRate
      
      // Monthly payment = (Depreciation + Rent Charge) / Lease Term
      const monthly = (depreciation / loanTerm) + rentCharge
      
      // Total lease cost = monthly payments + down payment + acquisition fee (typically $500-700)
      const acquisitionFee = 650 // Typical Toyota lease acquisition fee
      const total = monthly * loanTerm + downPayment + acquisitionFee
      const interest = total - (carPrice - residual) - downPayment - acquisitionFee
      
      setMonthlyPayment(Math.round(monthly))
      setTotalPayment(Math.round(total))
      setTotalInterest(Math.round(interest))
    }
  }

  const getCreditScoreCategory = (score: number) => {
    if (score >= 750) return "Excellent"
    if (score >= 700) return "Very Good"
    if (score >= 650) return "Good"
    if (score >= 600) return "Fair"
    return "Poor"
  }

  // Adjust loan term limits based on loan type
  const minTerm = loanType === "lease" ? 24 : 36
  const maxTerm = loanType === "lease" ? 48 : 84
  const termStep = loanType === "lease" ? 12 : 12

  return (
    <div>
      <Header title="Check Affordability" subtitle="Calculate your estimated monthly payment" />

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator Inputs */}
          <div className="space-y-6">
            <Card className="p-6 border border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">Vehicle Price</h2>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Total Price</p>
                <p className="text-4xl font-bold text-primary mb-4">${carPrice.toLocaleString()}</p>
              </div>
            </Card>

            <Card className="p-6 border border-border space-y-4">
              <h2 className="text-xl font-bold text-foreground mb-4">Down Payment</h2>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Amount: ${downPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </p>
                <Slider
                  value={[downPayment]}
                  onValueChange={(value) => setDownPayment(value[0])}
                  min={0}
                  max={carPrice}
                  step={500}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round((downPayment / carPrice) * 100)}% of vehicle price
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {loanType === "lease" 
                    ? "Typical lease down payment: $0-$3,000" 
                    : "Recommended: 10-20% of vehicle price"}
                </p>
              </div>
            </Card>

            <Card className="p-6 border border-border space-y-4">
              <h2 className="text-xl font-bold text-foreground mb-4">Credit Score</h2>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Score: {creditScore}</p>
                <Slider
                  value={[creditScore]}
                  onValueChange={(value) => setCreditScore(value[0])}
                  min={300}
                  max={850}
                  step={10}
                  className="w-full"
                />
                <p className="text-sm font-medium text-foreground mt-3 p-2 bg-muted rounded">
                  {getCreditScoreCategory(creditScore)}
                </p>
              </div>
            </Card>

            <Card className="p-6 border border-border space-y-4">
              <h2 className="text-xl font-bold text-foreground mb-4">Loan Type</h2>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="loanType"
                    value="finance"
                    checked={loanType === "finance"}
                    onChange={(e) => setLoanType(e.target.value as "finance" | "lease")}
                    className="w-4 h-4"
                  />
                  <span className="text-foreground font-medium">Finance (Purchase)</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="loanType"
                    value="lease"
                    checked={loanType === "lease"}
                    onChange={(e) => setLoanType(e.target.value as "finance" | "lease")}
                    className="w-4 h-4"
                  />
                  <span className="text-foreground font-medium">Lease (Rent)</span>
                </label>
              </div>
            </Card>

            <Card className="p-6 border border-border space-y-4">
              <h2 className="text-xl font-bold text-foreground mb-4">
                {loanType === "lease" ? "Lease Term" : "Loan Term"}
              </h2>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {loanTerm} months ({(loanTerm / 12).toFixed(1)} years)
                </p>
                <Slider
                  value={[loanTerm]}
                  onValueChange={(value) => setLoanTerm(value[0])}
                  min={minTerm}
                  max={maxTerm}
                  step={termStep}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {loanType === "lease" 
                    ? "Most common: 36 months" 
                    : "Most common: 60-72 months"}
                </p>
              </div>
            </Card>
          </div>

          {/* Results */}
          <div className="space-y-6">
            <Card className="p-8 border border-primary bg-primary/5">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Estimated Monthly Payment</p>
                <p className="text-5xl font-bold text-primary mb-2">${monthlyPayment.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">
                  {loanType === "finance" ? "Finance" : "Lease"} for {loanTerm} months
                </p>
                {loanType === "lease" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Plus taxes, fees, and disposition fee at lease end
                  </p>
                )}
              </div>
            </Card>

            <Card className="p-6 border border-border space-y-4">
              <h3 className="text-lg font-bold text-foreground mb-4">Payment Summary</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Down Payment</span>
                  </div>
                  <span className="font-bold text-foreground">
                    ${downPayment.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">Monthly Payment</span>
                  </div>
                  <span className="font-bold text-foreground">${monthlyPayment.toLocaleString()}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Percent className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      {loanType === "lease" ? "Money Factor (APR)" : "Interest Rate (APR)"}
                    </span>
                  </div>
                  <span className="font-bold text-foreground">{interestRate.toFixed(2)}%</span>
                </div>

                {loanType === "lease" && residualValue > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Residual Value</span>
                    </div>
                    <span className="font-bold text-foreground">
                      ${residualValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-muted-foreground">
                      {loanType === "lease" ? "Total Lease Cost" : "Total Amount Paid"}
                    </span>
                  </div>
                  <span className="font-bold text-accent">${totalPayment.toLocaleString()}</span>
                </div>

                {loanType === "finance" && totalInterest > 0 && (
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Percent className="w-5 h-5 text-primary" />
                      <span className="text-sm text-muted-foreground">Total Interest Paid</span>
                    </div>
                    <span className="font-bold text-foreground">${totalInterest.toLocaleString()}</span>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <h3 className="font-bold text-foreground mb-3">Credit Score Impact</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your credit score significantly affects the interest rate offered by lenders. Rates shown are estimates based on current market conditions (2024-2025). Actual rates may vary.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• 750+: 5.0-6.0% APR (Excellent) - Best rates available</p>
                <p>• 700-749: 6.0-7.0% APR (Very Good) - Competitive rates</p>
                <p>• 650-699: 7.5-9.5% APR (Good) - Average rates</p>
                <p>• 600-649: 10.0-13.0% APR (Fair) - Higher rates</p>
                <p>• Below 600: 13.5%+ APR (Poor) - Subprime rates</p>
                <p className="mt-3 text-xs italic">
                  Note: Longer loan terms (72-84 months) typically have slightly higher rates. Lease rates are generally higher than finance rates.
                </p>
              </div>
            </Card>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => router.back()} className="flex-1 border-border">
                Back
              </Button>
              <Button
                onClick={() => router.push("/results")}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Find More Vehicles
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
