import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { parseVendorSubscriptionResponse } from "../lib/subscription-data"
import {
  currentPlanLabel,
  getEffectivePlan,
  isPremiumPlan,
  nextSubscriptionState,
  serviceAllowanceLabel,
  shouldShowPremiumBadge,
  shouldShowUpgradeButton,
} from "../lib/subscription-ui"

const premiumSnapshot = {
  plan: "premium",
  status: "active",
  active: true,
  serviceLimit: null,
  activeServiceCount: 5,
  canCreateService: true,
  renewalDate: "2026-12-01T00:00:00.000Z",
  cancelAtPeriodEnd: false,
  stripeSessionId: null,
  stripeSubscriptionId: "sub_test",
  lastPayment: { status: "paid", amount: 20, currency: "usd", createdAt: null },
}

const freeSnapshot = {
  ...premiumSnapshot,
  plan: "free",
  status: "none",
  active: false,
  serviceLimit: 3,
  activeServiceCount: 2,
  canCreateService: true,
  renewalDate: null,
  stripeSubscriptionId: null,
  lastPayment: null,
}

describe("subscription response parsing", () => {
  it("unwraps the backend success envelope", () => {
    const parsed = parseVendorSubscriptionResponse({ success: true, data: premiumSnapshot })
    assert.notEqual(parsed, null)
    assert.equal(parsed?.active, true)
    assert.equal(parsed?.plan, "premium")
    assert.equal(parsed?.serviceLimit, null)
  })

  it("also accepts a raw snapshot", () => {
    const parsed = parseVendorSubscriptionResponse(premiumSnapshot)
    assert.equal(parsed?.active, true)
  })

  it("rejects an envelope whose data is missing", () => {
    assert.equal(parseVendorSubscriptionResponse({ success: true }), null)
  })
})

describe("consistent effective plan for both dashboard and subscription page", () => {
  it("shows a coherent Premium state (the reported contradictory state is gone)", () => {
    const subscription = parseVendorSubscriptionResponse({
      success: true,
      data: premiumSnapshot,
    })

    assert.equal(getEffectivePlan(subscription), "premium")
    assert.equal(isPremiumPlan(subscription), true)
    assert.equal(currentPlanLabel(subscription), "Premium Plan")
    assert.equal(shouldShowPremiumBadge(subscription), true)
    assert.equal(serviceAllowanceLabel(subscription), "Unlimited")
    assert.equal(shouldShowUpgradeButton(subscription), false)
  })

  it("shows a coherent Free state with a 3-service allowance", () => {
    const subscription = parseVendorSubscriptionResponse({ success: true, data: freeSnapshot })

    assert.equal(getEffectivePlan(subscription), "free")
    assert.equal(currentPlanLabel(subscription), "Free Plan")
    assert.equal(shouldShowPremiumBadge(subscription), false)
    assert.equal(serviceAllowanceLabel(subscription), "3 services")
    assert.equal(shouldShowUpgradeButton(subscription), true)
  })

  it("restores Free after expiration even if stale premium fields remain", () => {
    const subscription = parseVendorSubscriptionResponse({
      success: true,
      data: { ...premiumSnapshot, status: "expired", active: false, serviceLimit: 3 },
    })

    assert.equal(currentPlanLabel(subscription), "Free Plan")
    assert.equal(serviceAllowanceLabel(subscription), "3 services")
    assert.equal(shouldShowUpgradeButton(subscription), true)
  })

  it("keeps Premium while cancellation is scheduled at period end", () => {
    const subscription = parseVendorSubscriptionResponse({
      success: true,
      data: { ...premiumSnapshot, cancelAtPeriodEnd: true },
    })

    assert.equal(currentPlanLabel(subscription), "Premium Plan")
    assert.equal(serviceAllowanceLabel(subscription), "Unlimited")
    assert.equal(shouldShowUpgradeButton(subscription), false)
  })

  it("never treats missing data as unlimited Premium", () => {
    assert.equal(currentPlanLabel(null), "Free Plan")
    assert.equal(serviceAllowanceLabel(null), "3 services")
    assert.equal(shouldShowUpgradeButton(null), true)
    assert.equal(shouldShowPremiumBadge(null), false)
  })
})

describe("failed refresh never overwrites a confirmed plan", () => {
  it("preserves a server-confirmed Premium plan on HTTP/network failure", () => {
    const premium = parseVendorSubscriptionResponse({ success: true, data: premiumSnapshot })
    const afterFailure = nextSubscriptionState(premium, {
      ok: false,
      message: "We could not read your subscription status.",
    })

    assert.equal(currentPlanLabel(afterFailure), "Premium Plan")
    assert.equal(serviceAllowanceLabel(afterFailure), "Unlimited")
    assert.equal(shouldShowUpgradeButton(afterFailure), false)
  })

  it("accepts a fresh successful server snapshot", () => {
    const premium = parseVendorSubscriptionResponse({ success: true, data: premiumSnapshot })
    const free = parseVendorSubscriptionResponse({ success: true, data: freeSnapshot })
    const refreshed = nextSubscriptionState(premium, { ok: true, data: free })

    assert.equal(currentPlanLabel(refreshed), "Free Plan")
    assert.equal(serviceAllowanceLabel(refreshed), "3 services")
    assert.equal(shouldShowUpgradeButton(refreshed), true)
  })

  it("keeps an unknown state unknown until the server responds", () => {
    const afterFailure = nextSubscriptionState(null, {
      ok: false,
      message: "The WedPlan API is unavailable.",
    })
    assert.equal(afterFailure, null)
  })
})
