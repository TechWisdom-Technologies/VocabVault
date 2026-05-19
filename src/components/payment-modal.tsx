"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Smartphone, Store, AlertCircle, Copy, Check } from "lucide-react";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmPayment: (transactionId: string, mobileNumber: string) => void;
}

const PRO_PAYMENT_AMOUNT = 499;

export default function PaymentModal({ isOpen, onClose, onConfirmPayment }: PaymentModalProps) {
  const [selectedOption, setSelectedOption] = useState<"manual" | "merchant" | "card" | null>(null);
  const [showWorkingMessage, setShowWorkingMessage] = useState(false);
  const [copied, setCopied] = useState(false);
  const [transactionId, setTransactionId] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOptionSelect = (option: "manual" | "merchant" | "card") => {
    if (option === "manual") {
      setSelectedOption("manual");
    } else {
      setSelectedOption(option);
      setShowWorkingMessage(true);
    }
  };

  const handleCopyNumber = () => {
    navigator.clipboard.writeText("01799269699");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmManualPayment = async () => {
    if (!transactionId.trim()) {
      alert("Please enter your transaction ID");
      return;
    }
    if (!mobileNumber.trim()) {
      alert("Please enter your mobile number");
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirmPayment(transactionId, mobileNumber);
      setTransactionId("");
      setMobileNumber("");
      resetSelection();
      onClose();
    } catch (error) {
      console.error("Error confirming payment:", error);
      alert("Failed to confirm payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetSelection = () => {
    setSelectedOption(null);
    setShowWorkingMessage(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Choose Payment Method</DialogTitle>
          <DialogDescription className="text-base">
            Select your preferred payment option to upgrade to VocabVault PRO
          </DialogDescription>
        </DialogHeader>

        {!selectedOption ? (
          <div className="space-y-3 mt-4">
            <Button
              onClick={() => handleOptionSelect("manual")}
              className="w-full h-16 text-left justify-start gap-4 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0"
            >
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Pay Manually</p>
                <p className="text-xs opacity-90">bKash / Nagad - ৳{PRO_PAYMENT_AMOUNT}</p>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionSelect("merchant")}
              variant="outline"
              className="w-full h-16 text-left justify-start gap-4 border-2 hover:border-primary/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Merchant Payment</p>
                <p className="text-xs text-muted-foreground">Pay via merchant account</p>
              </div>
            </Button>

            <Button
              onClick={() => handleOptionSelect("card")}
              variant="outline"
              className="w-full h-16 text-left justify-start gap-4 border-2 hover:border-primary/50"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">Card Payment</p>
                <p className="text-xs text-muted-foreground">Credit / Debit card</p>
              </div>
            </Button>
          </div>
        ) : showWorkingMessage ? (
          <div className="space-y-4 mt-4">
            <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-sm text-amber-900 dark:text-amber-100">
                  We're working on that!
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  Card and merchant payments are currently under development. Please use manual payment for now.
                </p>
              </div>
            </div>

            <Button
              onClick={() => {
                setShowWorkingMessage(false);
                setSelectedOption("manual");
              }}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold"
            >
              Proceed to Manual Payment
            </Button>

            <Button
              onClick={resetSelection}
              variant="outline"
              className="w-full h-12"
            >
              Choose Different Option
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-4">
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
              <h3 className="font-bold text-lg mb-4 text-emerald-900 dark:text-emerald-100">
                Manual Payment Instructions
              </h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-2">
                    Send payment to:
                  </p>
                  <div className="flex items-center gap-2 p-3 bg-white dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-xl">
                    <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-100 flex-1">
                      01799269699
                    </span>
                    <Button
                      onClick={handleCopyNumber}
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-emerald-600" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
                    Supported platforms:
                  </p>
                  <div className="flex gap-2">
                    <div className="px-3 py-1.5 bg-pink-500 text-white rounded-lg text-xs font-bold">
                      bKash
                    </div>
                    <div className="px-3 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-bold">
                      Nagad
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-300 dark:border-emerald-700">
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    After sending payment, enter your transaction details below to verify your upgrade.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Transaction ID <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., BXN1234567890"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-foreground">
                  Mobile Number <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="e.g., 01799269699"
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  disabled={isSubmitting}
                  className="h-10"
                />
              </div>
            </div>

            <Button
              onClick={handleConfirmManualPayment}
              disabled={isSubmitting || !transactionId.trim() || !mobileNumber.trim()}
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold disabled:opacity-50"
            >
              {isSubmitting ? "Submitting..." : "Submit Payment Details"}
            </Button>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              After submitting, your payment will be reviewed by an admin. You will receive a notification when your PRO access is activated.
            </p>

            <Button
              onClick={resetSelection}
              variant="outline"
              className="w-full h-12"
              disabled={isSubmitting}
            >
              Choose Different Option
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
