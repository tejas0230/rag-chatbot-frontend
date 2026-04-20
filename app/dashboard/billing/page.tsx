"use client"
import { Card, CardContent } from "@/components/ui/card"
import { useProfile } from "@/components/profile-provider"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { api } from "@/lib/api"
import {
  RiCheckLine,
  RiShieldCheckLine,
  RiSparklingLine,
  RiArrowRightUpLine,
  RiTimeLine,
} from "@remixicon/react"
import { cn } from "@/lib/utils"

type PlanPrice = {
  id?: string
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

type CheckoutResponse = {
  checkout_url: string
}

export default function BillingPage() {
  const { profile } = useProfile()
  const [plans, setPlans] = useState<Plan[]>([])
  const [billingCycle, setBillingCycle] = useState<"month" | "year">("month")
  const [checkoutLoadingPlanId, setCheckoutLoadingPlanId] = useState<string | null>(null)

  const retrievePlans = async () => {
    try {
      const response = await api.get("/plans")
      const payload = response.data
      const list = Array.isArray(payload?.plans) ? payload.plans : payload
      setPlans(Array.isArray(list) ? list : [])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    void retrievePlans()
  }, [])

  const pro = plans.find((p) => p.slug === "pro") ?? plans.find((p) => p.name === "Pro")
  const proPlus =
    plans.find((p) => p.slug === "pro_plus") ?? plans.find((p) => p.name === "Pro Plus")

  const planCards = [
    {
      key: "pro",
      plan: pro,
      fallbackName: "Pro",
      description: "For individuals and small teams.",
      popular: false,
      buttonLabel: "Get Pro",
    },
    {
      key: "pro_plus",
      plan: proPlus,
      fallbackName: "Pro Plus",
      description: "For growing teams needing more scale.",
      popular: false,
      buttonLabel: "Get Pro Plus",
    },
  ]

  const formatPrice = (plan?: Plan) => {
    const raw = plan?.prices?.[billingCycle]?.price
    if (!raw) return null
    const amount = Number(raw)
    if (!Number.isFinite(amount)) return raw
    return amount.toLocaleString(undefined, { style: "currency", currency: "USD", minimumFractionDigits: 2 })
  }

  const checkoutPlanId = (plan?: Plan) =>
    plan?.prices?.[billingCycle]?.id ??
    plan?.prices?.[billingCycle]?.polar_product_id ??
    plan?.id

  const startCheckout = async (plan?: Plan) => {
    const id = checkoutPlanId(plan)
    if (!id || checkoutLoadingPlanId) return
    setCheckoutLoadingPlanId(id)
    try {
      const { data } = await api.get<CheckoutResponse>(`/checkout/${id}`)
      if (data?.checkout_url) window.location.assign(data.checkout_url)
    } catch (error) {
      console.error(error)
    } finally {
      setCheckoutLoadingPlanId(null)
    }
  }

  const sub = profile?.userSubscription
  const trialExpiry = sub?.freeExpiresAt ? new Date(sub.freeExpiresAt) : null
  const isTrialValid = trialExpiry && trialExpiry > new Date(0)

  return (
    <div className="flex flex-col gap-6 mx-auto max-w-3xl">
      {/* Page header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Billing</h1>
        <p className="text-sm text-muted-foreground">Manage your plan and billing cycle.</p>
      </div>

      {/* Current plan banner */}
      <Card className="border-l-2 border-l-green-500/60">
        <CardContent className="flex items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <RiShieldCheckLine className="mt-0.5 size-4 shrink-0 text-green-400" />
            <div className="space-y-1.5">
              <p className="text-sm font-medium">
                You&apos;re on the{" "}
                <span className="text-green-400">{sub?.plan?.name ?? "—"}</span> plan
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">{sub?.plan?.max_projects ?? "—"}</span> projects
                </span>
                <span>
                  <span className="font-medium text-foreground">
                    {sub?.plan?.monthly_request_limit?.toLocaleString() ?? "—"}
                  </span>{" "}
                  requests / month
                </span>
                {isTrialValid && (
                  <span className="flex items-center gap-1 text-amber-400">
                    <RiTimeLine className="size-3" />
                    Trial ends {trialExpiry!.toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Billing cycle toggle */}
      <div className="flex items-center justify-center">
        <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-card p-1">
          <button
            onClick={() => setBillingCycle("month")}
            className={cn(
              "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              billingCycle === "month"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("year")}
            className={cn(
              "flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
              billingCycle === "year"
                ? "bg-muted text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Yearly
            <span className="rounded-full bg-green-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-green-400">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {planCards.map((c) => {
          const idForCheckout = checkoutPlanId(c.plan)
          const isLoadingThis = checkoutLoadingPlanId === idForCheckout
          const price = formatPrice(c.plan)

          return (
            <Card
              key={c.key}
              className={cn(
                "relative flex flex-col",
                c.popular && "ring-2 ring-primary/30",
              )}
            >
              {c.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground">
                    <RiSparklingLine className="size-3" />
                    Popular
                  </span>
                </div>
              )}

              <CardContent className="flex flex-1 flex-col gap-5 pt-6">
                {/* Plan name + description */}
                <div>
                  <h3 className="text-base font-semibold">{c.plan?.name ?? c.fallbackName}</h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">{c.description}</p>
                </div>

                {/* Price */}
                <div className="flex items-end gap-1">
                  {price ? (
                    <>
                      <span className="text-4xl font-bold tracking-tight">{price}</span>
                      <span className="mb-1 text-sm text-muted-foreground">/ {billingCycle}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-bold tracking-tight text-muted-foreground">—</span>
                  )}
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <RiCheckLine className="size-4 shrink-0 text-green-400" />
                    <span>
                      <span className="font-medium">{c.plan?.max_projects ?? "—"}</span> projects
                    </span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <RiCheckLine className="size-4 shrink-0 text-green-400" />
                    <span>
                      <span className="font-medium">
                        {c.plan?.monthly_request_limit?.toLocaleString() ?? "—"}
                      </span>{" "}
                      requests / month
                    </span>
                  </li>
                </ul>

                {/* CTA */}
                <Button
                  type="button"
                  variant={c.popular ? "default" : "outline"}
                  className="w-full gap-1.5"
                  disabled={!idForCheckout || checkoutLoadingPlanId !== null}
                  onClick={() => void startCheckout(c.plan)}
                >
                  {isLoadingThis ? (
                    "Opening checkout…"
                  ) : (
                    <>
                      {c.buttonLabel}
                      <RiArrowRightUpLine className="size-3.5" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}