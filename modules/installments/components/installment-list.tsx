"use client"

import { useState } from "react"
import Link from "next/link"
import { InstallmentWithPayments } from "../types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/format"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function InstallmentList({ installments, userCurrency }: { installments: InstallmentWithPayments[], userCurrency: string }) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL")

  if (installments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed bg-muted/20">
        <p className="text-muted-foreground text-sm">No installments found. Create one to get started.</p>
      </div>
    )
  }

  const activeCount = installments.filter(i => i.status === "ACTIVE").length
  const completedCount = installments.filter(i => i.status === "COMPLETED").length

  const filteredInstallments = installments.filter(installment => {
    if (filter === "ACTIVE") return installment.status === "ACTIVE"
    if (filter === "COMPLETED") return installment.status === "COMPLETED"
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={filter} onValueChange={(val) => setFilter(val as "ALL" | "ACTIVE" | "COMPLETED")}>
          <TabsList>
            <TabsTrigger value="ALL">All ({installments.length})</TabsTrigger>
            <TabsTrigger value="ACTIVE">Active ({activeCount})</TabsTrigger>
            <TabsTrigger value="COMPLETED">Completed ({completedCount})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {filteredInstallments.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center border rounded-xl border-dashed bg-muted/20">
          <p className="text-muted-foreground text-sm">
            No {filter.toLowerCase()} installments found.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredInstallments.map(installment => {
            const paidPayments = installment.payments.filter(p => p.isPaid).length
            const totalPayments = installment.durationMonths
            const paidAmount = installment.payments.filter(p => p.isPaid).reduce((sum, p) => sum + p.amount, 0)
            const progress = Math.min((paidAmount / installment.totalAmount) * 100, 100)

            return (
              <Link href={`/installments/${installment.id}`} key={installment.id}>
                <Card className="hover:border-primary/50 transition-colors h-full flex flex-col">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{installment.name}</CardTitle>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center rounded-md bg-secondary/50 px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/10">
                            {installment.category || "Other"}
                          </span>
                          <CardDescription>
                            {totalPayments} Months
                          </CardDescription>
                        </div>

                      </div>
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${installment.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                        {installment.status}
                      </span>
                    </div>

                  </CardHeader>
                  <CardContent className="mt-auto">
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Amount</span>
                        <span className="font-semibold">
                          {formatCurrency(installment.totalAmount, userCurrency)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Monthly Payment</span>
                        <span className="font-semibold text-primary">
                          {formatCurrency(installment.monthlyPayment, userCurrency)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>{paidPayments} paid</span>
                          <span>{totalPayments - paidPayments} remaining</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
