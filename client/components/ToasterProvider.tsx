"use client";

import { Toaster } from "sonner";

export function ToasterProvider() {
  return (
    <Toaster
      position="bottom-right"
      richColors
      duration={4500}
      gap={8}
      toastOptions={{
        style: {
          fontFamily: "var(--font-inter, system-ui, sans-serif)",
          fontSize: "13.5px",
          borderRadius: "12px",
          border: "1px solid transparent",
        },
        classNames: {
          toast:   "pc-toast",
          success: "pc-toast--success",
          error:   "pc-toast--error",
          warning: "pc-toast--warning",
          info:    "pc-toast--info",
        },
      }}
    />
  );
}
