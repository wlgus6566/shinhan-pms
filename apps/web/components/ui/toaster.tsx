'use client';

import { Toaster as Sonner } from 'sonner';
import { CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react';

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      duration={3000}
      gap={8}
      icons={{
        success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        error: <XCircle className="h-5 w-5 text-rose-500" />,
        warning: <AlertTriangle className="h-5 w-5 text-amber-500" />,
        info: <Info className="h-5 w-5 text-blue-500" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-900 group-[.toaster]:border group-[.toaster]:border-slate-200 group-[.toaster]:shadow-lg group-[.toaster]:shadow-slate-200/50 group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3',
          description: 'group-[.toast]:text-slate-500 group-[.toast]:text-sm',
          actionButton:
            'group-[.toast]:bg-blue-500 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:text-sm group-[.toast]:font-medium',
          cancelButton:
            'group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:rounded-lg group-[.toast]:text-sm',
          success:
            'group-[.toaster]:!border-emerald-200 group-[.toaster]:!bg-emerald-50',
          error:
            'group-[.toaster]:!border-rose-200 group-[.toaster]:!bg-rose-50',
          warning:
            'group-[.toaster]:!border-amber-200 group-[.toaster]:!bg-amber-50',
          info:
            'group-[.toaster]:!border-blue-200 group-[.toaster]:!bg-blue-50',
        },
      }}
    />
  );
}
