export type ToastType = "success" | "error" | "warning" | "info" | "loading";
export type ToastPosition =
   | "top-left"
   | "top-center"
   | "top-right"
   | "bottom-left"
   | "bottom-center"
   | "bottom-right";

export interface ToastButton {
   label: string;
   onClick: () => void;
   variant?: "primary" | "secondary" | "ghost";
}

export interface ToastOptions {
   id?: string;
   type?: ToastType;
   title?: string;
   description?: string;
   duration?: number;
   position?: ToastPosition;
   dismissible?: boolean;
   pauseOnHover?: boolean;
   showProgress?: boolean;
   icon?: React.ReactNode;
   buttons?: ToastButton[];
   onDismiss?: () => void;
   onClick?: () => void;
}

export interface Toast extends Required<
   Omit<ToastOptions, "icon" | "buttons" | "onDismiss" | "onClick">
> {
   id: string;
   icon?: React.ReactNode;
   buttons?: ToastButton[];
   onDismiss?: () => void;
   onClick?: () => void;
   createdAt: number;
}

export interface ToastContextType {
   toasts: Toast[];
   toast: (options: ToastOptions) => string;
   success: (message: string, options?: Partial<ToastOptions>) => string;
   error: (message: string, options?: Partial<ToastOptions>) => string;
   warning: (message: string, options?: Partial<ToastOptions>) => string;
   info: (message: string, options?: Partial<ToastOptions>) => string;
   loading: (message: string, options?: Partial<ToastOptions>) => string;
   promise: <T>(
      promise: Promise<T>,
      options: {
         loading: string;
         success: string | ((data: T) => string);
         error: string | ((error: any) => string);
      },
   ) => Promise<T>;
   dismiss: (id: string) => void;
   dismissAll: () => void;
   update: (id: string, options: Partial<ToastOptions>) => void;
}
