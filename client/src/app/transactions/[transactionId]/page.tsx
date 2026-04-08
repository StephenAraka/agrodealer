type TransactionDetailsPageProps = {
  params: Promise<{ transactionId: string }>;
};

export default async function TransactionDetailsPage({
  params,
}: TransactionDetailsPageProps) {
  const { transactionId } = await params;

  return (
    <main className="p-8">
      <h1 className="text-3xl font-semibold text-textBlack">Transaction Details</h1>
      <p className="mt-2 text-textGray">Viewing transaction: {transactionId}</p>
    </main>
  );
}
