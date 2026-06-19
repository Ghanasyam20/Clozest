"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT    = 3;
const TOAST_DURATION = 5000;

type ToasterToast = ToastProps & {
  id:          string;
  title?:      React.ReactNode;
  description?: React.ReactNode;
  action?:     ToastActionElement;
};

type Action =
  | { type: "ADD_TOAST";    toast: ToasterToast }
  | { type: "UPDATE_TOAST"; toast: Partial<ToasterToast> & { id: string } }
  | { type: "DISMISS_TOAST"; toastId?: string }
  | { type: "REMOVE_TOAST";  toastId?: string };

interface State {
  toasts: ToasterToast[];
}

let count = 0;
function genId() { return String(++count); }

const listeners: ((state: State) => void)[] = [];
let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((l) => l(memoryState));
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "ADD_TOAST":
      return { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "UPDATE_TOAST":
      return { toasts: state.toasts.map((t) => t.id === action.toast.id ? { ...t, ...action.toast } : t) };
    case "DISMISS_TOAST":
      return { toasts: state.toasts.map((t) =>
        (!action.toastId || t.id === action.toastId) ? { ...t, open: false } : t
      )};
    case "REMOVE_TOAST":
      return { toasts: state.toasts.filter((t) => t.id !== action.toastId) };
  }
}

function toast({ ...props }: Omit<ToasterToast, "id">) {
  const id = genId();
  const update  = (p: Partial<ToasterToast>) => dispatch({ type: "UPDATE_TOAST", toast: { ...p, id } });
  const dismiss = ()                          => dispatch({ type: "DISMISS_TOAST", toastId: id });

  dispatch({
    type:  "ADD_TOAST",
    toast: {
      ...props,
      id,
      open:         true,
      onOpenChange: (open) => { if (!open) dismiss(); },
    },
  });

  setTimeout(dismiss, TOAST_DURATION);
  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const idx = listeners.indexOf(setState);
      if (idx > -1) listeners.splice(idx, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (id?: string) => dispatch({ type: "DISMISS_TOAST", toastId: id }),
  };
}

export { useToast, toast };
