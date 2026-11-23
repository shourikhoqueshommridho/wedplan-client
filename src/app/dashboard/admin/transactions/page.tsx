import type { Metadata } from "next"

import { AdminTransactionsClient } from "@/components/admin/admin-transactions-client"
import { fetchWithSession, requireServerRole } from "@/lib/auth-server"
import { parseAdminTransactionList } from "@/lib/admin-transactions"

export const metadata: Metadata = {
  title: "Transactions - Admin Dashboard",
  robots: { index: false, follow: false },
}

export const instant = false

export default async function AdminTransactionsPage() {
  await requireServerRole("admin", "/dashboard/admin/transactions")
  const response = await fetchWithSession("/api/admin/transactions")
  const transactions = response?.ok
    ? parseAdminTransactionList(await response.json().catch(() => null))
    : []

  return <AdminTransactionsClient transactions={transactions} dataError={!response?.ok} />
}
