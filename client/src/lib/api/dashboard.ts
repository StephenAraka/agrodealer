import { apiRequest } from "./client";
import { API_BASE_URL } from "./client";

type Product = {
  id: number;
  name: string;
  price: string;
};

type Wallet = {
  id: number;
  user_id: number;
  balance: string;
};

type PurchasePayload = {
  product_id: number;
  quantity: number;
};

type PurchaseResponse = {
  transaction: {
    id: number;
    amount: string;
    created_at: string;
  };
  balance: number;
};

type TransactionItem = {
  product_id: number | null;
  product_name: string;
  unit_price: string;
  quantity: number;
  line_total: string;
};

type TransactionRow = {
  id: number;
  transaction_type: string;
  status: string;
  amount: string;
  balance_before: string;
  balance_after: string;
  description: string;
  created_at: string;
};

export const getProducts = () =>
  apiRequest<{ products: Product[] }>("/products");

export const getWallet = (token: string) =>
  apiRequest<{ wallet: Wallet }>("/wallet", { token });

export const purchaseProduct = (token: string, payload: PurchasePayload) =>
  apiRequest<PurchaseResponse>("/transactions/purchase", {
    method: "POST",
    token,
    body: payload,
  });

export const getTransactions = (token: string, limit = 50) =>
  apiRequest<{ transactions: TransactionRow[] }>(`/transactions?limit=${limit}`, {
    token,
  });

export const getTransactionDetails = (token: string, transactionId: string | number) =>
  apiRequest<{ transaction: TransactionRow; items: TransactionItem[] }>(
    `/transactions/${transactionId}`,
    {
      token,
    },
  );

export const topupWallet = (token: string, amount: number) =>
  apiRequest<{ balance: number }>("/wallet/topup", {
    method: "POST",
    token,
    body: { amount },
  });

export const getTransactionReceiptHtml = async (token: string, transactionId: string | number) => {
  const response = await fetch(`${API_BASE_URL}/transactions/${transactionId}/receipt-html`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to load receipt");
  }

  return response.text();
};
