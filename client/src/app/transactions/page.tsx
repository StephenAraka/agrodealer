"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { Eye, X } from "lucide-react";
import { DashboardShell } from "@/components/global";
import { Button } from "@/components/shared";
import { getTransactions, getWallet, topupWallet } from "@/lib/api/dashboard";
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
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);

  const loadData = async (token: string) => {
    try {
      const [txResp, walletResp] = await Promise.all([
        getTransactions(token, 100),
        getWallet(token),
      ]);
      setTransactions((txResp.data?.transactions || []) as TransactionRow[]);
      setWalletBalance(Number(walletResp.data?.wallet?.balance ?? 0));
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = getToken();
    if (!token) {
      window.location.href = "/auth/login";
      return;
    }
    loadData(token);
  }, []);

  const handleTopup = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const amount = Number(topupAmount);
    if (!amount || amount <= 0) {
      appToast.error("Enter a valid amount greater than zero");
      return;
    }
    const token = getToken();
    if (!token) return;
    setTopupLoading(true);
    try {
      const response = await topupWallet(token, amount);
      setWalletBalance(Number(response.data?.balance ?? 0));
      appToast.success(`Wallet topped up with KES ${amount.toFixed(2)}`);
      setTopupAmount("");
      setShowTopup(false);
      // Reload transactions so the new top-up entry appears
      await loadData(token);
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Top-up failed");
    } finally {
      setTopupLoading(false);
    }
  };

  const filteredTransactions = useMemo(() => {
    if (filterType === "all") return transactions;
    return transactions.filter((row) => row.transaction_type === filterType);
  }, [transactions, filterType]);

  return (
    <DashboardShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-5xl font-bold text-textBlack">Transactions</h1>

        <div className="flex items-center gap-4">
          {walletBalance !== null ? (
            <p className="text-cs-16 font-semibold text-textBlack">
              Wallet:{" "}
              <span className="text-textGreen">KES {walletBalance.toFixed(2)}</span>
            </p>
          ) : null}
          <Button
            type="button"
            size="md"
            fullWidth={false}
            className="h-10 px-5"
            onClick={() => setShowTopup(true)}
            aria-label="Top up wallet"
          >
            + Top Up Wallet
          </Button>
        </div>
      </div>

      {/* Top-up modal */}
      {showTopup ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="topup-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex items-center justify-between">
              <h2 id="topup-title" className="text-3xl font-bold text-textBlack">
                Top Up Wallet
              </h2>
              <button
                type="button"
                onClick={() => { setShowTopup(false); setTopupAmount(""); }}
                aria-label="Close top-up dialog"
                className="rounded-full p-1 text-textGray hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {walletBalance !== null ? (
              <p className="mt-1 text-cs-16 text-textGray">
                Current balance:{" "}
                <span className="font-semibold text-textBlack">KES {walletBalance.toFixed(2)}</span>
              </p>
            ) : null}

            <form className="mt-6 space-y-5" onSubmit={handleTopup} noValidate>
              <div>
                <label
                  htmlFor="topupAmount"
                  className="block text-cs-16 font-semibold text-textBlack"
                >
                  Amount (KES)
                </label>
                <input
                  id="topupAmount"
                  name="topupAmount"
                  type="number"
                  inputMode="decimal"
                  min="1"
                  step="0.01"
                  value={topupAmount}
                  onChange={(e) => setTopupAmount(e.target.value)}
                  placeholder="e.g. 500"
                  required
                  aria-required="true"
                  className="mt-2 h-12 w-full rounded-xl border border-borderGray bg-white px-4 text-cs-16 text-textBlack focus:outline-none focus:ring-2 focus:ring-primaryYellow"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => { setShowTopup(false); setTopupAmount(""); }}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="dark" size="md" disabled={topupLoading}>
                  {topupLoading ? "Processing..." : "Top Up"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

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
