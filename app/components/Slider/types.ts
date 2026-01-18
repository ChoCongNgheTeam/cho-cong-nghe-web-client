export interface SlidezyOptions {
   items?: number | { mobile?: number; tablet?: number; desktop?: number };
   speed?: number;
   gap?: number;
   loop?: boolean;
   nav?: boolean;
   controls?: boolean;
   controlsText?: [string, string];
   slideBy?: number | "page";
   autoplay?: boolean;
   autoplayTimeout?: number;
   autoplayHoverPause?: boolean;
   draggable?: boolean;
   className?: string;
   onSlideChange?: (index: number) => void;
}

export interface SlideProps {
   children: React.ReactNode;
   className?: string;
}
