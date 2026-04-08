"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { DashboardShell } from "@/components/global";
import { getTransactions } from "@/lib/api/dashboard";
import { getToken } from "@/lib/session";
import { appToast } from "@/lib/toast";

type TransactionRow = {
  id: number;
  transaction_type: string;
  status: string;
  amount: string;
  description: string;
  created_at: string;
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }

    const load = async () => {
      try {
        const response = await getTransactions(token, 100);
        setTransactions((response.data?.transactions || []) as TransactionRow[]);
      } catch (error) {
        appToast.error(error instanceof Error ? error.message : "Failed to load transactions");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredTransactions = useMemo(() => {
    if (filterType === "all") return transactions;
    return transactions.filter((row) => row.transaction_type === filterType);
  }, [transactions, filterType]);

  return (
    <DashboardShell>
      <h1 className="text-5xl font-bold text-textBlack">Transactions</h1>

      <div className="mt-6 max-w-225">
        <label htmlFor="serviceType" className="block text-cs-16 font-semibold text-textBlack">
          Service Type
        </label>
        <select
          id="serviceType"
          value={filterType}
          onChange={(event) => setFilterType(event.target.value)}
          className="mt-2 h-12 w-full rounded-xl border border-borderGray bg-white px-4 text-cs-16 text-textBlack"
        >
          <option value="all">All</option>
          <option value="purchase">Purchase</option>
          <option value="topup">Top up</option>
        </select>
      </div>

      <div className="mt-5 overflow-x-auto rounded-xl border border-borderGray bg-white">
        <table className="min-w-full text-left">
          <thead className="bg-[#e9edf2]">
            <tr className="text-cs-16 font-semibold text-textBlack">
              <th className="px-4 py-3">Tran. Date</th>
              <th className="px-4 py-3">Ref Number</th>
              <th className="px-4 py-3">Service Type</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Details</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-cs-16 text-textGray" colSpan={7}>
                  Loading transactions...
                </td>
              </tr>
            ) : filteredTransactions.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-cs-16 text-textGray" colSpan={7}>
                  No transactions found.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((row) => (
                <tr key={row.id} className="border-t border-borderGray/70 text-cs-16 text-textGray">
                  <td className="px-4 py-3">{new Date(row.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-textBlack">TXN-{row.id}</td>
                  <td className="px-4 py-3 capitalize">{row.transaction_type}</td>
                  <td className="px-4 py-3">{row.description || "-"}</td>
                  <td className="px-4 py-3 font-semibold text-textBlack">{Number(row.amount).toFixed(2)}</td>
                  <td className="px-4 py-3 capitalize">{row.status}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/transactions/${row.id}`}
                      className="mx-auto flex w-fit items-center justify-center text-textBlack"
                      aria-label={`View transaction ${row.id}`}
                    >
                      <Eye size={20} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </DashboardShell>
  );
}
