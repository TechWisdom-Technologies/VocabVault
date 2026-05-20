import Image from "next/image";

import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export default function BrandLogo({ className, priority = false }: BrandLogoProps) {
  return (
    <div className={cn("relative shrink-0 overflow-hidden", className)}>
      <Image
        src="/VocabVault.png"
        alt="VocabVault"
        fill
        priority={priority}
        sizes="(max-width: 768px) 64px, 160px"
        className="object-contain"
      />
    </div>
  );
}