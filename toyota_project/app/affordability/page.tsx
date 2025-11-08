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

  const [downPayment, setDownPayment] = useState(carPrice * 0.2)
  const [creditScore, setCreditScore] = useState(750)
  const [loanType, setLoanType] = useState<"finance" | "lease">("finance")
  const [loanTerm, setLoanTerm] = useState(60)

  const [monthlyPayment, setMonthlyPayment] = useState(0)
  const [totalPayment, setTotalPayment] = useState(0)
  const [interestRate, setInterestRate] = useState(0)

  // Calculate affordability when inputs change
  useEffect(() => {
    calculatePayment()
  }, [downPayment, creditScore, loanType, loanTerm])

  const calculatePayment = () => {
    const principal = carPrice - downPayment

    // Determine interest rate based on credit score
    let rate = 0
    if (creditScore >= 750) rate = 3.5
    else if (creditScore >= 700) rate = 4.5
    else if (creditScore >= 650) rate = 6.0
    else rate = 8.5

    setInterestRate(rate)

    if (loanType === "finance") {
      // Calculate monthly payment using standard auto loan formula
      const monthlyRate = rate / 100 / 12
      const payment =
        (principal * (monthlyRate * Math.pow(1 + monthlyRate, loanTerm))) / (Math.pow(1 + monthlyRate, loanTerm) - 1)
      setMonthlyPayment(isFinite(payment) ? Math.round(payment) : 0)
      setTotalPayment(isFinite(payment) ? Math.round(payment * loanTerm + downPayment) : downPayment)
    } else {
      // Lease calculation (typically lower monthly payment)
      const monthlyLease = (carPrice * 0.05) / (loanTerm / 12)
      setMonthlyPayment(Math.round(monthlyLease))
      setTotalPayment(Math.round(monthlyLease * loanTerm + downPayment))
    }
  }

  const getCreditScoreCategory = (score: number) => {
    if (score >= 750) return "Excellent"
    if (score >= 700) return "Very Good"
    if (score >= 650) return "Good"
    return "Fair"
  }

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
              <h2 className="text-xl font-bold text-foreground mb-4">Loan Term</h2>
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {loanTerm} months ({(loanTerm / 12).toFixed(1)} years)
                </p>
                <Slider
                  value={[loanTerm]}
                  onValueChange={(value) => setLoanTerm(value[0])}
                  min={24}
                  max={84}
                  step={12}
                  className="w-full"
                />
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
                    <span className="text-sm text-muted-foreground">Interest Rate</span>
                  </div>
                  <span className="font-bold text-foreground">{interestRate.toFixed(2)}%</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-accent/10 rounded-lg border border-accent">
                  <div className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-accent" />
                    <span className="text-sm font-medium text-muted-foreground">Total Payment</span>
                  </div>
                  <span className="font-bold text-accent">${totalPayment.toLocaleString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 border border-border">
              <h3 className="font-bold text-foreground mb-3">Credit Score Impact</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Your credit score affects the interest rate offered by lenders. Higher scores qualify for lower rates.
              </p>
              <div className="space-y-2 text-xs text-muted-foreground">
                <p>• 750+: 3.5% APR (Excellent)</p>
                <p>• 700-749: 4.5% APR (Very Good)</p>
                <p>• 650-699: 6.0% APR (Good)</p>
                <p>• Below 650: 8.5% APR (Fair)</p>
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
