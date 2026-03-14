export interface ResponsiveBreakpoints {
   mobile?: number; // < 480px
   tablet?: number; // 480–768px
   lg?: number; // 768–1024px
   desktop?: number; // ≥ 1024px
}

export interface ResponsiveControls {
   mobile?: boolean;
   tablet?: boolean;
   lg?: boolean;
   desktop?: boolean;
}

export interface SlidezyOptions {
   items?: number | ResponsiveBreakpoints;
   speed?: number;
   gap?: number;
   loop?: boolean;
   nav?: boolean;
   controls?: boolean | ResponsiveControls;
   controlsText?: [string, string];
   slideBy?: number | "page";
   autoplay?: boolean;
   autoplayTimeout?: number;
   autoplayHoverPause?: boolean;
   draggable?: boolean;
   className?: string;
   onSlideChange?: (index: number) => void;
}
