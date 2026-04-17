"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useProfile } from "@/components/profile-provider"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import { Switch } from "@/components/ui/switch"

type PlanPrice = {
  polar_product_id: string
  price: string
}

type Plan = {
  id: string
  name: string
  slug: string
  max_projects: number
  monthly_request_limit: number
  prices?: {
    month?: PlanPrice
    year?: PlanPrice
  }
}
export default function BillingPage() {
  const { profile } = useProfile();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month")

  const retrievePlans = async () => {
    try {
      const response = await api.get("/plans");
      const payload = response.data
      const list = Array.isArray(payload?.plans) ? payload.plans : payload
      setPlans(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    void retrievePlans();
  }, []);

  const pro = plans.find((p) => p.slug === "pro") ?? plans.find((p) => p.name === "Pro")
  const proPlus =
    plans.find((p) => p.slug === "pro_plus") ?? plans.find((p) => p.name === "Pro Plus")

  const planCards = [
    {
      key: "pro",
      plan: pro,
      fallbackName: "Pro",
      description: "For individuals and small teams.",
      badge: null as null | string,
      cardClassName: "relative overflow-hidden",
      buttonLabel: "Choose Pro",
    },
    {
      key: "pro_plus",
      plan: proPlus,
      fallbackName: "Pro Plus",
      description: "For growing teams needing more scale.",
      badge: "Popular",
      cardClassName: "relative overflow-hidden border-primary/30",
      buttonLabel: "Choose Pro Plus",
    },
  ]

  const formatPrice = (plan?: Plan) => {
    const raw = plan?.prices?.[billingCycle]?.price
    if (!raw) return "—"
    const amount = Number(raw)
    if (!Number.isFinite(amount)) return raw
    return amount.toLocaleString(undefined, { style: "currency", currency: "USD" })
  }

  return (
    <div className="flex flex-col gap-4 mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold">Billing</h1>
          <p className="text-sm text-muted-foreground">Manage your plan and billing cycle.</p>
        </div>

        <div className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2">
          <span className={billingCycle === "month" ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
            Monthly
          </span>
          <Switch
            checked={billingCycle === "year"}
            onCheckedChange={(v) => setBillingCycle(v ? "year" : "month")}
            aria-label="Billing cycle"
          />
          <span className={billingCycle === "year" ? "text-sm font-medium" : "text-sm text-muted-foreground"}>
            Yearly
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-row  gap-4">
          <div className="flex flex-col gap-2 flex-1">
            <p className="text-muted-foreground text-lg">You are currently on the <span className="font-bold text-green-300">{profile?.userSubscription?.plan?.name}</span> plan.</p>
            <div className="flex flex-col text-sm gap-1">
              <p className="text-muted-foreground">Allows creation of <span className="font-bold text-foreground">{profile?.userSubscription?.plan?.max_projects}</span> projects.</p>
              <p className="text-muted-foreground">Allowed monthly requests:  <span className="font-bold text-foreground">{profile?.userSubscription?.plan?.monthly_request_limit}</span> requests.</p>
              <p className="text-muted-foreground">Free trial ends on: <span className="font-bold text-red-300">{new Date(profile?.userSubscription?.freeExpiresAt).toLocaleDateString()}</span></p>
            </div>
          </div>
          <Button variant="outline" className="">Upgrade</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {planCards.map((c) => (
          <Card key={c.key} className={c.cardClassName}>
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">{c.plan?.name ?? c.fallbackName}</CardTitle>
                {c.badge && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary">
                    {c.badge}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{c.description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-end">
                <div className="text-3xl font-semibold tracking-tight">{formatPrice(c.plan)}</div>
                <div className="text-sm text-muted-foreground">/ {billingCycle}</div>
              </div>
              <Separator />
              <div className="space-y-2 text-sm">
                <p>
                  <span className="font-medium">{c.plan?.max_projects ?? "—"}</span> projects
                </p>
                <p>
                  <span className="font-medium">{c.plan?.monthly_request_limit ?? "—"}</span> requests / month
                </p>
              </div>
              <Button variant="outline" className="w-full py-4 hover:cursor-pointer">
                {c.buttonLabel}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}