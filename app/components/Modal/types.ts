export type CloseMethod = "button" | "overlay" | "escape";

export interface PopzyOptions {
   content?: string | React.ReactNode;
   templateId?: string;
   enableScrollLock?: boolean;
   destroyOnClose?: boolean;
   footer?: boolean;
   cssClass?: string;
   closeMethods?: CloseMethod[];
   scrollLockTarget?: () => HTMLElement;
   onOpen?: () => void;
   onClose?: () => void;
}

export interface PopzyButtonConfig {
   title: string;
   className: string;
   onClick: () => void;
}
