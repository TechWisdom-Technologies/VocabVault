"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle2, XCircle, Copy, RefreshCw, ReceiptText } from "lucide-react";
import { formatDate } from "@/lib/utils";

type TransactionStatus = "PENDING" | "VERIFIED" | "REJECTED";

interface TransactionUser {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  plan: string;
}

interface PaymentTransaction {
  id: string;
  userId: string;
  paymentMethod: string;
  transactionId: string;
  mobileNumber: string;
  amount: number;
  status: TransactionStatus;
  rejectionReason: string | null;
  createdAt: string;
  verifiedAt: string | null;
  user: TransactionUser;
}

export default function AdminTransactionsPage() {
  const { getAuthHeaders } = useAuthStore();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<TransactionStatus | "ALL">("PENDING");
  const [search, setSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedTx, setSelectedTx] = useState<PaymentTransaction | null>(null);
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsRefreshing(true);
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      if (status !== "ALL") params.set("status", status);
      params.set("limit", "100");

      const res = await fetch(`/api/admin/transactions/list?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch payment transactions", error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [getAuthHeaders, status]);

  const filteredTransactions = useMemo(() => {
    const q = search.toLowerCase();
    return transactions.filter((tx) =>
      tx.transactionId.toLowerCase().includes(q) ||
      tx.mobileNumber.toLowerCase().includes(q) ||
      tx.user.email.toLowerCase().includes(q) ||
      (tx.user.name || "").toLowerCase().includes(q)
    );
  }, [transactions, search]);

  const copyTransaction = async (transactionId: string) => {
    await navigator.clipboard.writeText(transactionId);
  };

  const handleApprove = async (tx: PaymentTransaction) => {
    try {
      setIsProcessing(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/transactions/approve", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id }),
      });
      if (res.ok) {
        await fetchTransactions();
        setSelectedTx(null);
        setActionMode(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (tx: PaymentTransaction) => {
    if (!rejectReason.trim()) return;
    try {
      setIsProcessing(true);
      const headers = await getAuthHeaders();
      const res = await fetch("/api/admin/transactions/reject", {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId: tx.id, rejectionReason: rejectReason.trim() }),
      });
      if (res.ok) {
        await fetchTransactions();
        setSelectedTx(null);
        setActionMode(null);
        setRejectReason("");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-40 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
            <ReceiptText className="w-9 h-9 text-primary" />
            Payment Requests
          </h1>
          <p className="text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Review manual bKash/Nagad submissions and approve PRO access
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <Button
            variant="ghost"
            onClick={fetchTransactions}
            className="h-11 px-5 rounded-2xl bg-white/5 border border-white/5 text-white/40 hover:text-white hover:border-white/10 text-[10px] font-black uppercase tracking-widest"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          <div className="relative min-w-70">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search transaction, user, phone..."
              className="pl-11 h-11 rounded-2xl bg-white/5 border-white/5 text-white placeholder:text-white/20"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["ALL", "PENDING", "VERIFIED", "REJECTED"] as const).map((item) => (
          <button
            key={item}
            onClick={() => setStatus(item)}
            className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${status === item ? "bg-primary text-white border-primary" : "bg-white/5 text-white/40 border-white/5 hover:text-white hover:border-white/10"}`}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredTransactions.length === 0 ? (
          <Card className="bg-white/5 border-white/5 rounded-[28px]">
            <CardContent className="py-20 text-center text-white/30 font-bold uppercase tracking-[0.2em] text-xs">
              No payment requests found
            </CardContent>
          </Card>
        ) : (
          filteredTransactions.map((tx) => (
            <Card key={tx.id} className="bg-white/5 border-white/5 rounded-[28px] overflow-hidden">
              <CardContent className="p-6 lg:p-8">
                <div className="flex flex-col xl:flex-row xl:items-center gap-6">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-white/10 text-white border-0 text-[9px] font-black uppercase">{tx.status}</Badge>
                      <Badge className="bg-cyan-500/20 text-cyan-300 border-0 text-[9px] font-black uppercase">{tx.paymentMethod}</Badge>
                      <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">৳{tx.amount}</span>
                    </div>
                    <h3 className="text-xl font-black text-white truncate">
                      {tx.user.name || tx.user.email}
                    </h3>
                    <p className="text-sm text-white/40 truncate">{tx.user.email} • {tx.mobileNumber}</p>
                    <p className="text-[11px] text-white/20 uppercase tracking-widest font-bold">Created {formatDate(tx.createdAt)}</p>
                  </div>

                  <div className="xl:w-95 grid gap-2 text-sm">
                    <div className="rounded-2xl bg-black/20 border border-white/5 p-4 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <span className="text-white/30 text-[10px] uppercase tracking-widest font-black">Transaction ID</span>
                        <button onClick={() => copyTransaction(tx.transactionId)} className="text-white/40 hover:text-white">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="text-white font-mono text-sm break-all">{tx.transactionId}</div>
                    </div>

                    {tx.rejectionReason && (
                      <div className="rounded-2xl bg-rose-500/10 border border-rose-500/20 p-4 text-rose-200 text-sm">
                        {tx.rejectionReason}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row xl:flex-col gap-3 xl:w-42.5">
                    {tx.status === "PENDING" ? (
                      <>
                        <Button
                          onClick={() => { setSelectedTx(tx); setActionMode("approve"); }}
                          className="h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px]"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => { setSelectedTx(tx); setActionMode("reject"); }}
                          variant="outline"
                          className="h-11 rounded-2xl border-rose-500/20 text-rose-300 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px]"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </>
                    ) : (
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/20 text-center xl:text-left">
                        {tx.status === "VERIFIED" ? "Approved" : "Rejected"}
                      </div>
                    )}
                  </div>
                </div>

                {selectedTx?.id === tx.id && actionMode && (
                  <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                    {actionMode === "approve" ? (
                      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <p className="text-sm text-white/50">Approve this transaction and notify the user that PRO is active.</p>
                        <Button disabled={isProcessing} onClick={() => handleApprove(tx)} className="rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px]">
                          {isProcessing ? "Processing..." : "Confirm Approve"}
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="Enter rejection reason"
                          className="rounded-2xl bg-white/5 border-white/5 text-white placeholder:text-white/20"
                        />
                        <div className="flex gap-3 justify-end">
                          <Button variant="ghost" onClick={() => { setSelectedTx(null); setActionMode(null); setRejectReason(""); }} className="rounded-2xl text-white/40 hover:text-white">
                            Cancel
                          </Button>
                          <Button disabled={isProcessing || !rejectReason.trim()} onClick={() => handleReject(tx)} className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px]">
                            {isProcessing ? "Processing..." : "Confirm Reject"}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}