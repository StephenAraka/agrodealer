"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, PlusCircle, MinusCircle } from "lucide-react";
import { DashboardShell, PaymentSuccessModal } from "@/components/global";
import { Button } from "@/components/shared";
import { getProducts, getTransactionReceiptHtml, getWallet, purchaseProduct } from "@/lib/api/dashboard";
import { getToken } from "@/lib/session";
import { appToast } from "@/lib/toast";

type Product = {
  id: number;
  name: string;
  price: number;
};

type CartMap = Record<number, number>;

export default function BuyProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedService = searchParams.get("service") || "general";

  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartMap>({});
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [latestTransactionIds, setLatestTransactionIds] = useState<number[]>([]);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    const loadData = async () => {
      try {
        const [productsResponse, walletResponse] = await Promise.all([
          getProducts(),
          getWallet(token),
        ]);

        const fetchedProducts = (productsResponse.data?.products || []).map((item) => ({
          id: Number(item.id),
          name: item.name,
          price: Number(item.price),
        }));

        setProducts(fetchedProducts);
        setWalletBalance(Number(walletResponse.data?.wallet?.balance || 0));
      } catch (error) {
        appToast.error(error instanceof Error ? error.message : "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [router]);

  const selectedItems = useMemo(() => {
    return products
      .filter((product) => (cart[product.id] || 0) > 0)
      .map((product) => {
        const quantity = cart[product.id] || 0;
        return {
          ...product,
          quantity,
          lineTotal: product.price * quantity,
        };
      });
  }, [products, cart]);

  const totalCost = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  }, [selectedItems]);

  const canPay = selectedItems.length > 0 && totalCost > 0 && totalCost <= walletBalance && !processing;

  const increaseProduct = (productId: number) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1,
    }));
  };

  const decreaseProduct = (productId: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const nextValue = Math.max(0, current - 1);
      return {
        ...prev,
        [productId]: nextValue,
      };
    });
  };

  const handlePay = async () => {
    const token = getToken();
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    if (selectedItems.length === 0) {
      appToast.error("Please select at least one product");
      return;
    }

    if (totalCost <= 0) {
      appToast.error("Transaction amount must be greater than zero");
      return;
    }

    if (totalCost > walletBalance) {
      appToast.error("Total exceeds wallet balance");
      return;
    }

    setProcessing(true);

    try {
      const transactionIds: number[] = [];

      for (const item of selectedItems) {
        const response = await purchaseProduct(token, {
          product_id: item.id,
          quantity: item.quantity,
        });

        const transactionId = response.data?.transaction?.id;
        if (transactionId) {
          transactionIds.push(transactionId);
        }
      }

      setWalletBalance((prev) => prev - totalCost);
      setCart({});
      setLatestTransactionIds(transactionIds);
      setShowSuccess(true);
      appToast.success("Payment successful");
    } catch (error) {
      appToast.error(error instanceof Error ? error.message : "Payment failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <DashboardShell>
        <p className="text-cs-20 text-textGray">Loading products...</p>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <h1 className="text-5xl font-bold text-textBlack">Product Details</h1>

      <div className="mt-6 flex flex-wrap items-center gap-3 text-cs-16">
        <Button type="button" size="md" fullWidth={false} className="h-10 px-4" onClick={() => router.back()}>
          <ArrowLeft size={16} />
          <span className="ml-2">Back</span>
        </Button>
        <span className="font-medium text-[#d59600] underline">Home</span>
        <span className="text-textGray">›</span>
        <span className="font-medium text-[#d59600] underline">
          {selectedService === "school" ? "School Farm Inputs" : "General Farm Inputs"}
        </span>
        <span className="text-textGray">›</span>
        <span className="font-semibold text-textGray">Product Details</span>
      </div>

      <p className="mt-6 text-3xl font-medium text-textBlack">
        Inua mkulima wallet balance:
        <span className="ml-3 font-bold">Kes {walletBalance.toFixed(2)}</span>
      </p>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <div>
          <h2 className="text-4xl font-semibold text-textBlack">Products</h2>
          <div className="mt-3 rounded-xl border border-textGray/40 bg-white p-5">
            <div className="mb-4 grid grid-cols-[1fr_120px_50px] text-cs-20 font-semibold text-textBlack">
              <p>Product name</p>
              <p>Price</p>
              <p />
            </div>

            <div className="space-y-3">
              {products.map((product) => (
                <div key={product.id} className="grid grid-cols-[1fr_120px_50px] items-center text-cs-20 text-textGray">
                  <p>{product.name}</p>
                  <p>{product.price.toFixed(0)} kes</p>
                  <button
                    type="button"
                    onClick={() => increaseProduct(product.id)}
                    className="justify-self-end text-textBlack"
                  >
                    <PlusCircle size={24} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-semibold text-textBlack">Selected Products</h2>
          <div className="mt-3 rounded-xl border border-textGray/40 bg-[#f7f4ea] p-4">
            {selectedItems.length === 0 ? (
              <p className="py-10 text-center text-cs-20 italic text-textGray">
                Please select products from the products panel first
              </p>
            ) : (
              <>
                <div className="grid grid-cols-[1fr_60px_80px_90px_44px] gap-2 text-cs-20 font-semibold text-textBlack">
                  <p>Product name</p>
                  <p>Qty</p>
                  <p>Price</p>
                  <p>Total</p>
                  <p />
                </div>

                <div className="mt-3 space-y-2">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="grid grid-cols-[1fr_60px_80px_90px_44px] items-center gap-2 text-cs-20 text-textGray">
                      <p>{item.name}</p>
                      <input
                        value={item.quantity}
                        readOnly
                        className="h-9 w-12 rounded border border-textGray/50 bg-white text-center text-cs-16 font-semibold text-textBlack"
                      />
                      <p>{item.price.toFixed(0)} kes</p>
                      <p>{item.lineTotal.toFixed(0)} kes</p>
                      <button type="button" className="text-textBlack" onClick={() => decreaseProduct(item.id)}>
                        <MinusCircle size={24} />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex justify-end border-t border-textGray/30 pt-3 text-3xl font-bold text-textBlack">
                  Total: {totalCost.toFixed(2)} kes
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 grid max-w-225 gap-4 md:grid-cols-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Back
        </Button>
        <Button
          type="button"
          variant={canPay ? "dark" : "ghost"}
          onClick={handlePay}
          disabled={!canPay}
          className="disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-white"
        >
          {processing ? "Processing..." : `Deduct ${totalCost.toFixed(2)} KES`}
        </Button>
      </div>

      {totalCost > walletBalance ? (
        <p className="mt-8 text-center text-3xl font-semibold italic text-red-500">
          Selected total exceeds wallet balance. Reduce items or top up wallet.
        </p>
      ) : null}

      <PaymentSuccessModal
        open={showSuccess}
        amount={totalCost}
        transactionIds={latestTransactionIds}
        onDownloadReceipt={async () => {
          const firstId = latestTransactionIds[0];
          if (!firstId) return;
          const token = getToken();
          if (!token) return;
          try {
            const html = await getTransactionReceiptHtml(token, firstId);
            const popup = window.open("", "_blank");
            if (!popup) return;
            popup.document.write(html);
            popup.document.close();
            popup.print();
          } catch {
            appToast.error("Failed to load receipt");
          }
        }}
        onClose={() => {
          setShowSuccess(false);
          router.push("/transactions");
        }}
      />
    </DashboardShell>
  );
}
