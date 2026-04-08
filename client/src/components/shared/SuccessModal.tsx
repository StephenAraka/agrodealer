"use client";

import { Check } from "lucide-react";
import { Button } from "./Button";

type SuccessModalProps = {
  open: boolean;
  title?: string;
  subtitle?: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
};

export function SuccessModal({
  open,
  title = "Success",
  subtitle,
  message,
  buttonText = "OK",
  onClose,
}: SuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
      <div className="w-full max-w-190 rounded-xl bg-white px-6 py-10 text-center shadow-2xl sm:px-10 sm:py-14">
        <h2 className="text-4xl font-bold text-black">{title}</h2>
        {subtitle ? <p className="mt-2 text-4xl text-textGray">{subtitle}</p> : null}

        <div className="mx-auto mt-8 flex h-24 w-24 items-center justify-center rounded-full border border-black/60 bg-[#efede3]">
          <Check className="h-12 w-12 text-black" strokeWidth={3} />
        </div>

        <p className="mx-auto mt-8 max-w-105 text-4xl font-medium text-[#5e636f]">
          {message}
        </p>

        <Button
          type="button"
          variant="dark"
          size="md"
          className="mx-auto mt-10 max-w-95"
          onClick={onClose}
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
