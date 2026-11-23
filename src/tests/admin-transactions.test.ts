import assert from "node:assert/strict"
import { describe, it } from "node:test"

import {
  formatTransactionAmount,
  formatTransactionDate,
  parseAdminTransactionList,
} from "../lib/admin-transactions"

describe("admin transactions parsing", () => {
  it("unwraps the backend envelope and keeps real records", () => {
    const parsed = parseAdminTransactionList({
      success: true,
      data: {
        transactions: [
          {
            id: "txn-1",
            vendorId: "vendor-1",
            vendorName: "Test Vendor",
            plan: "premium",
            amount: 20,
            currency: "USD",
            status: "paid",
            stripeSessionId: "cs_test",
            stripeSubscriptionId: "sub_test",
            createdAt: "2026-01-01T00:00:00.000Z",
          },
        ],
      },
    })

    assert.equal(parsed.length, 1)
    assert.equal(parsed[0]?.vendorName, "Test Vendor")
    assert.equal(parsed[0]?.plan, "premium")
    assert.equal(parsed[0]?.amount, 20)
    assert.equal(parsed[0]?.status, "paid")
  })

  it("drops malformed records and returns an empty list when data is missing", () => {
    assert.deepEqual(
      parseAdminTransactionList({ success: true, data: { transactions: [{ id: "bad" }] } }),
      [],
    )
    assert.deepEqual(parseAdminTransactionList({ success: true }), [])
  })

  it("formats amounts and dates without inventing data", () => {
    assert.equal(formatTransactionAmount(20, "USD"), "$20.00")
    assert.equal(formatTransactionDate(null), "—")
    assert.equal(formatTransactionDate("2026-01-01T00:00:00.000Z"), "Jan 1, 2026")
  })
})
