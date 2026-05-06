"use client";

import { useAuthStore } from "@/stores/auth-store";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SessionExpiredModal() {
  const { isSessionExpired, setSessionExpired, logout } = useAuthStore();
  const router = useRouter();

  const handleLoginRedirect = async () => {
    setSessionExpired(false);
    await logout();
    router.replace("/login");
  };

  return (
    <Dialog open={isSessionExpired} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md bg-[#0A0A0B] border-white/5 text-white rounded-[2rem] overflow-hidden">
        <DialogHeader className="flex flex-col items-center pt-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-rose-500 animate-pulse" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight text-center">Session Expired</DialogTitle>
          <DialogDescription className="text-center text-white/40 font-bold uppercase tracking-widest text-[10px] mt-2">
            Security Protocol Re-authentication Required
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center">
          <p className="text-sm text-white/60 leading-relaxed font-medium">
            Your secure session has expired or been invalidated. To maintain data integrity and security, please log in again.
          </p>
        </div>
        <DialogFooter className="sm:justify-center pb-6">
          <Button
            onClick={handleLoginRedirect}
            className="bg-white text-black hover:bg-white/90 font-black uppercase tracking-widest text-[10px] h-12 px-10 rounded-xl shadow-xl transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Login Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
