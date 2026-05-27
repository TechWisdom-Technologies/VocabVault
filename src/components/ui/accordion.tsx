"use client";

import * as React from "react";
import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({ className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" className={cn("space-y-3", className)} {...props} />;
}

function AccordionItem({ className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item data-slot="accordion-item" className={cn("rounded-2xl border border-white/10 bg-black/20 overflow-hidden", className)} {...props} />;
}

function AccordionHeader({ className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Header>) {
  return <AccordionPrimitive.Header data-slot="accordion-header" className={cn("m-0", className)} {...props} />;
}

function AccordionTrigger({ className, children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn(
        "group flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-black text-white transition-all hover:text-primary data-panel-open:text-primary",
        className
      )}
      {...props}
    >
      <span className="min-w-0 flex-1">{children}</span>
      <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-300 group-data-[panel-open=true]:rotate-180" />
    </AccordionPrimitive.Trigger>
  );
}

function AccordionPanel({ className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Panel>) {
  return <AccordionPrimitive.Panel data-slot="accordion-panel" className={cn("px-5 pb-4 text-sm text-white/50 leading-relaxed", className)} {...props} />;
}

export { Accordion, AccordionItem, AccordionHeader, AccordionTrigger, AccordionPanel };