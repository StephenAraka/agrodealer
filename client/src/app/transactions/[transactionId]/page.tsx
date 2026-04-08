"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";
import { DashboardShell } from "@/components/global";
import { Button } from "@/components/shared";
import { getTransactionDetails, getTransactionReceiptHtml } from "@/lib/api/dashboard";
import { getToken } from "@/lib/session";
import { appToast } from "@/lib/toast";

type Transaction = {
  id: number;
  transaction_type: string;
  status: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  created_at: string;
};

type TransactionItem = {
  product_id: number | null;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export default function TransactionDetailsPage() {
  const params = useParams<{ transactionId: string }>();
  const router = useRouter();
  const transactionId = params.transactionId;

  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [items, setItems] = useState<TransactionItem[]>([]);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const load = async () => {
      try {
        const response = await getTransactionDetails(token, transactionId);
        setTransaction((response.data?.transaction || null) as Transaction | null);
        setItems((response.data?.items || []) as TransactionItem[]);
      } catch (error) {
        appToast.error(error instanceof Error ? error.message : "Failed to load transaction details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router, transactionId]);

  const handlePrintReceipt = async () => {
    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setPrinting(true);
    try {
      const html = await getTransactionReceiptHtml(token, transactionId);
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        throw new Error("Please allow popups to open receipt");
      }

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Failed to print receipt");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <DashboardShell>
      <h1 className="text-5xl font-bold text-textBlack">Transaction Details</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="button" variant="outline" size="md" fullWidth={false} onClick={() => router.back()}>
          <ArrowLeft size={16} />
          <span className="ml-2">Back</span>
        </Button>
        <Button type="button" variant="dark" size="md" fullWidth={false} onClick={handlePrintReceipt} disabled={printing || loading}>
          <Printer size={16} />
          <span className="ml-2">{printing ? "Preparing..." : "Print Receipt"}</span>
        </Button>
      </div>

      {loading ? (
        <p className="mt-8 text-cs-20 text-textGray">Loading details...</p>
      ) : !transaction ? (
        <p className="mt-8 text-cs-20 text-textGray">Transaction not found.</p>
      ) : (
        <>
          <div className="mt-8 grid max-w-225 gap-3 rounded-xl border border-borderGray bg-white p-5 text-cs-16">
            <p>
              <span className="font-semibold">Reference:</span> TXN-{transaction.id}
            </p>
            <p>
              <span className="font-semibold">Date:</span> {new Date(transaction.created_at).toLocaleString()}
            </p>
            <p className="capitalize">
              <span className="font-semibold">Type:</span> {transaction.transaction_type}
            </p>
            <p className="capitalize">
              <span className="font-semibold">Status:</span> {transaction.status}
            </p>
            <p>
              <span className="font-semibold">Amount:</span> KES {Number(transaction.amount).toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Balance Before:</span> KES {Number(transaction.balance_before).toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Balance After:</span> KES {Number(transaction.balance_after).toFixed(2)}
            </p>
            <p>
              <span className="font-semibold">Description:</span> {transaction.description || "-"}
            </p>
          </div>

          <div className="mt-6 overflow-x-auto rounded-xl border border-borderGray bg-white">
            <table className="min-w-full text-left">
              <thead className="bg-[#e9edf2]">
                <tr className="text-cs-16 font-semibold text-textBlack">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Qty</th>
                  <th className="px-4 py-3">Unit Price</th>
                  <th className="px-4 py-3">Total</th>
                </tr>
              </thead>

              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-textGray" colSpan={4}>
                      No line items for this transaction.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={`${item.product_name}-${index}`} className="border-t border-borderGray/70 text-cs-16 text-textGray">
                      <td className="px-4 py-3">{item.product_name}</td>
                      <td className="px-4 py-3">{item.quantity}</td>
                      <td className="px-4 py-3">KES {Number(item.unit_price).toFixed(2)}</td>
                      <td className="px-4 py-3">KES {Number(item.line_total).toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </DashboardShell>
  );
}
