"use client";

import { Check } from "lucide-react";
import { Button } from "@/components/shared";

type PaymentSuccessModalProps = {
  open: boolean;
  amount: number;
  transactionIds: number[];
  onClose: () => void;
  onDownloadReceipt: () => void;
};

export function PaymentSuccessModal({
  open,
  amount,
  transactionIds,
  onClose,
  onDownloadReceipt,
}: PaymentSuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-[680px] rounded-xl bg-white px-8 py-9 text-center shadow-2xl">
        <h2 className="text-5xl font-bold text-black">Payment Successful</h2>
        <p className="mt-3 text-cs-20 text-textGray">Ref Number: {transactionIds.join(", ")}</p>

        <div className="mx-auto mt-6 flex h-24 w-24 items-center justify-center rounded-full border border-black/60 bg-[#efede3]">
          <Check className="h-12 w-12 text-black" strokeWidth={3} />
        </div>

        <p className="mt-6 text-5xl font-bold text-black">KES {amount.toFixed(2)}</p>

        <div className="mt-9 grid grid-cols-2 gap-3">
          <Button type="button" variant="outline" size="md" onClick={onDownloadReceipt}>
            Download Receipt
          </Button>
          <Button type="button" variant="dark" size="md" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}
