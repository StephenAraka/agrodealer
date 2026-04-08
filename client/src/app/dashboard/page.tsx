"use client";

import { useEffect, useState } from "react";
import { Store, GraduationCap, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardShell } from "@/components/global";
import { Button } from "@/components/shared";
import { getWallet } from "@/lib/api/dashboard";
import { getToken } from "@/lib/session";
import { appToast } from "@/lib/toast";

export default function DashboardPage() {
  const router = useRouter();
  const [walletBalance, setWalletBalance] = useState(0);
  const [loadingWallet, setLoadingWallet] = useState(true);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const loadWallet = async () => {
      try {
        const response = await getWallet(token);
        const balance = Number(response.data?.wallet?.balance || 0);
        setWalletBalance(balance);
      } catch (error) {
        appToast.error(error instanceof Error ? error.message : "Failed to load wallet");
      } finally {
        setLoadingWallet(false);
      }
    };

    loadWallet();
  }, [router]);

  return (
    <DashboardShell>
      <h1 className="text-5xl font-bold text-textBlack">Agro Dealer Services</h1>

      <div className="mt-6 flex items-center gap-3 text-cs-16">
        <Button type="button" size="md" fullWidth={false} className="h-10 px-4" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          <span className="ml-2">Back</span>
        </Button>
        <span className="font-medium text-textGray">Home</span>
        <span className="text-textGray">›</span>
        <span className="font-semibold text-textGray">Services</span>
      </div>

      <p className="mt-7 text-3xl font-medium text-textBlack">
        Mkulima wallet balance:
        <span className="ml-3 font-bold">
          {loadingWallet ? "Loading..." : `Kes ${walletBalance.toFixed(2)}`}
        </span>
      </p>

      <div className="mt-8 grid max-w-[800px] gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-borderGray bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-textGray/50">
              <Store size={36} className="text-primaryYellow" />
            </div>

            <div>
              <h2 className="text-cs-20 font-bold text-[#d59600]">General Farm Inputs</h2>
              <p className="mt-1 text-cs-16 text-textGray">Buy food stuff</p>
              <Button
                type="button"
                size="md"
                className="mt-4 h-10 w-[140px]"
                onClick={() => router.push("/dashboard/buy?service=general")}
              >
                Buy
              </Button>
            </div>
          </div>
        </article>

        <article className="rounded-xl border border-borderGray bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-textGray/50">
              <GraduationCap size={36} className="text-primaryYellow" />
            </div>

            <div>
              <h2 className="text-cs-20 font-bold text-[#d59600]">School Farm Inputs</h2>
              <p className="mt-1 text-cs-16 text-textGray">Pay school fees easily here</p>
              <Button
                type="button"
                size="md"
                className="mt-4 h-10 w-[140px]"
                onClick={() => router.push("/dashboard/buy?service=school")}
              >
                Pay
              </Button>
            </div>
          </div>
        </article>
      </div>
    </DashboardShell>
  );
}
