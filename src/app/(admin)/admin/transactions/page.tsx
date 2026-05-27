"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle2, XCircle, Copy, RefreshCw, ReceiptText, ArrowUpRight } from "lucide-react";
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
  user: TransactionUser | null;
}

export default function AdminTransactionsPage() {
  const { getAuthHeaders } = useAuthStore();
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [status, setStatus] = useState<TransactionStatus | "ALL">("PENDING");
  const [search, setSearch] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [activeTxId, setActiveTxId] = useState<string | null>(null);
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchTransactions = async () => {
    try {
      setIsRefreshing(true);
      const headers = await getAuthHeaders();
      const params = new URLSearchParams();
      params.set("limit", "100");
      if (status !== "ALL") params.set("status", status);

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

  const summary = useMemo(() => ({
    total: transactions.length,
    pending: transactions.filter((tx) => tx.status === "PENDING").length,
    verified: transactions.filter((tx) => tx.status === "VERIFIED").length,
    rejected: transactions.filter((tx) => tx.status === "REJECTED").length,
  }), [transactions]);

  const filteredTransactions = useMemo(() => {
    const query = search.toLowerCase();
    return transactions.filter((tx) =>
      tx.transactionId.toLowerCase().includes(query) ||
      tx.mobileNumber.toLowerCase().includes(query) ||
      (tx.user?.email || "").toLowerCase().includes(query) ||
      (tx.user?.name || "").toLowerCase().includes(query) ||
      tx.userId.toLowerCase().includes(query)
    );
  }, [transactions, search]);

  const copyText = async (text: string) => {
    await navigator.clipboard.writeText(text);
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
        setActiveTxId(null);
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
        setActiveTxId(null);
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
    <div className="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-black tracking-tight text-white uppercase italic flex items-center gap-3">
            <ReceiptText className="w-8 h-8 text-primary" />
            Payment Requests
          </h1>
          <p className="text-white/40 text-sm max-w-2xl leading-relaxed">
            Review payment submissions in one contained queue. Payer info, transaction IDs, and actions stay inside each card.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="ghost" onClick={fetchTransactions} className="h-10 px-4 rounded-xl bg-white/5 border border-white/5 text-white/50 hover:text-white hover:border-white/10 text-[10px] font-black uppercase tracking-widest transition-all">
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Link href="/admin">
            <Button variant="ghost" className="h-10 px-4 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">
              <ArrowUpRight className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Total", value: summary.total },
          { label: "Pending", value: summary.pending },
          { label: "Verified", value: summary.verified },
          { label: "Rejected", value: summary.rejected },
        ].map((item) => (
          <Card key={item.label} className="rounded-2xl border-white/5 bg-white/5">
            <CardContent className="p-5">
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/25">{item.label}</p>
              <p className="mt-2 text-3xl font-black text-white">{item.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search transaction, user, phone..."
            className="h-12 rounded-xl bg-white/5 border-white/5 text-white placeholder:text-white/20 pl-11"
          />
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
      </div>

      {filteredTransactions.length === 0 ? (
        <Card className="rounded-3xl border-white/5 bg-white/5">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="w-10 h-10 text-white/15 mx-auto" />
            <p className="mt-4 text-sm font-bold text-white/50">No payment requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTransactions.map((tx) => {
            const isActive = activeTxId === tx.id;

            return (
              <Card key={tx.id} className="rounded-[28px] border-white/5 bg-white/5 overflow-hidden">
                <CardContent className="p-5 sm:p-6 space-y-5">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="border-0 text-[9px] font-black uppercase bg-white/10 text-white">{tx.status}</Badge>
                    <Badge className="border-0 text-[9px] font-black uppercase bg-cyan-500/20 text-cyan-300">{tx.paymentMethod}</Badge>
                    <Badge className="border-0 text-[9px] font-black uppercase bg-emerald-500/10 text-emerald-300">PRO</Badge>
                  </div>

                  <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
                    <div className="space-y-4 min-w-0">
                      <div className="space-y-1 min-w-0">
                        <h3 className="text-lg font-black text-white truncate">
                          {tx.user?.name || tx.user?.email || "Unlinked payer"}
                        </h3>
                        <p className="text-sm text-white/40 wrap-break-word">
                          {tx.user?.email || "No email on file"} · {tx.mobileNumber}
                        </p>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-2xl bg-black/20 border border-white/5 p-4 min-w-0">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Transaction</p>
                            <button onClick={() => copyText(tx.transactionId)} className="text-white/30 hover:text-white">
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="mt-2 text-sm text-white/80 font-mono break-all">{tx.transactionId}</p>
                        </div>

                        <div className="rounded-2xl bg-black/20 border border-white/5 p-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Amount</p>
                          <p className="mt-2 text-sm text-white/80 font-medium">৳{tx.amount}</p>
                        </div>

                        <div className="rounded-2xl bg-black/20 border border-white/5 p-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Plan</p>
                          <p className="mt-2 text-sm text-white/80 font-medium">{tx.user?.plan || "Unknown"}</p>
                        </div>

                        <div className="rounded-2xl bg-black/20 border border-white/5 p-4">
                          <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/20">Created</p>
                          <p className="mt-2 text-sm text-white/80 font-medium">{formatDate(tx.createdAt)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-3 min-w-0">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20">Payer details</span>
                        <button onClick={() => copyText(tx.user?.phone || tx.mobileNumber)} className="text-white/30 hover:text-white">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2 text-sm text-white/45">
                        <p className="wrap-break-word">User ID: {tx.userId}</p>
                        <p className="wrap-break-word">Phone: {tx.user?.phone || tx.mobileNumber}</p>
                        {tx.verifiedAt && <p>Verified: {formatDate(tx.verifiedAt)}</p>}
                        {tx.rejectionReason && <p className="text-rose-200">Reason: {tx.rejectionReason}</p>}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-white/5 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-white/45">Use the buttons to approve or reject this request.</p>

                    {tx.status === "PENDING" ? (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          onClick={() => {
                            setActiveTxId(tx.id);
                            setActionMode("approve");
                          }}
                          className="h-10 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px]"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setActiveTxId(tx.id);
                            setActionMode("reject");
                          }}
                          className="h-10 rounded-xl border-rose-500/20 text-rose-300 hover:bg-rose-500/10 font-black uppercase tracking-widest text-[10px]"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="text-[10px] font-black uppercase tracking-widest text-white/25">{tx.status === "VERIFIED" ? "Approved" : "Rejected"}</div>
                    )}
                  </div>

                  {isActive && actionMode && (
                    <div className="rounded-2xl border border-white/5 bg-black/20 p-4 space-y-3">
                      {actionMode === "approve" ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm text-white/45">Approve this request to activate the user plan.</p>
                          <Button disabled={isProcessing} onClick={() => handleApprove(tx)} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-[10px]">
                            {isProcessing ? "Processing..." : "Confirm Approve"}
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Input
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                            placeholder="Enter rejection reason"
                            className="rounded-xl bg-white/5 border-white/5 text-white placeholder:text-white/20"
                          />
                          <div className="flex flex-wrap justify-end gap-3">
                            <Button
                              variant="ghost"
                              onClick={() => {
                                setActiveTxId(null);
                                setActionMode(null);
                                setRejectReason("");
                              }}
                              className="rounded-xl text-white/40 hover:text-white"
                            >
                              Cancel
                            </Button>
                            <Button disabled={isProcessing || !rejectReason.trim()} onClick={() => handleReject(tx)} className="rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px]">
                              {isProcessing ? "Processing..." : "Confirm Reject"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
