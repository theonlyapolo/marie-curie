import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function toast(options: ToastOptions) {
  const message = options.title;
  const sonnerOptions = options.description ? { description: options.description } : undefined;

  if (options.variant === "destructive") {
    sonnerToast.error(message, sonnerOptions);
  } else {
    sonnerToast.success(message, sonnerOptions);
  }
}

export const useToast = () => {
  return { toast };
};
