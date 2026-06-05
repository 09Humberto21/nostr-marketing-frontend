import { create } from "zustand";

export type ToastVariant = "default" | "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, "id">) => string;
  dismiss: (id: string) => void;
  clear: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (toast) => {
    const id = Math.random().toString(36).slice(2);
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
    return id;
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
  clear: () => set({ toasts: [] }),
}));

type ToastInput = string | { title?: string; description?: string; duration?: number };

function normalize(
  input: ToastInput,
  variant: ToastVariant
): Omit<Toast, "id"> {
  if (typeof input === "string") {
    return { description: input, variant, duration: 5000 };
  }
  return {
    title: input.title,
    description: input.description,
    variant,
    duration: input.duration ?? 5000,
  };
}

/**
 * Imperative toast API usable anywhere (event handlers, mutation callbacks).
 *   toast.success("Campaign launched");
 *   toast.error({ title: "Failed", description: msg });
 */
export const toast = {
  show: (input: ToastInput, variant: ToastVariant = "default") =>
    useToastStore.getState().push(normalize(input, variant)),
  success: (input: ToastInput) =>
    useToastStore.getState().push(normalize(input, "success")),
  error: (input: ToastInput) =>
    useToastStore.getState().push(normalize(input, "error")),
  warning: (input: ToastInput) =>
    useToastStore.getState().push(normalize(input, "warning")),
  info: (input: ToastInput) =>
    useToastStore.getState().push(normalize(input, "info")),
};
