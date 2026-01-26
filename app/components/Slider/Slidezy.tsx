// components/Slidezy/Slidezy.tsx
"use client";

import React, {
   useEffect,
   useRef,
   useState,
   useCallback,
   Children,
} from "react";
import { SlidezyOptions } from "./types";

interface SlidezyProps extends SlidezyOptions {
   children: React.ReactNode;
}

export default function Slidezy({
   children,
   items = 1,
   speed = 300,
   gap = 0,
   loop = false,
   nav = true,
   controls = true,
   controlsText = ["‹", "›"],
   slideBy = 1,
   autoplay = false,
   autoplayTimeout = 3000,
   autoplayHoverPause = true,
   draggable = true,
   className = "",
   onSlideChange,
}: SlidezyProps) {
   const trackRef = useRef<HTMLDivElement>(null);
   const containerRef = useRef<HTMLDivElement>(null);
   const [currentIndex, setCurrentIndex] = useState(0);
   const [isAnimating, setIsAnimating] = useState(false);
   const [isDragging, setIsDragging] = useState(false);
   const [startX, setStartX] = useState(0);
   const [dragOffset, setDragOffset] = useState(0);
   const autoplayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
   const isInitializedRef = useRef(false);

   // Get responsive items count
   const getItemsCount = useCallback(() => {
      if (typeof items === "number") return items;

      if (typeof window !== "undefined") {
         const width = window.innerWidth;
         if (width < 768) return items.mobile || 1;
         if (width < 1024) return items.tablet || 2;
         return items.desktop || 3;
      }
      return 1;
   }, [items]);

   const [itemsCount, setItemsCount] = useState(() => {
      // Always use default value on server to match initial client render
      if (typeof items === "number") return items;
      // Use desktop as default for SSR to prevent hydration mismatch
      return typeof items === "object" ? items.desktop || 3 : 1;
   });

   const originalSlides = Children.toArray(children);
   const slideCount = originalSlides.length;

   // Adjust itemsCount if slides are fewer
   const actualItemsCount = Math.min(itemsCount, slideCount);
   const showNav = slideCount > actualItemsCount;

   // Calculate clone count for infinite loop
   const cloneCount =
      loop && slideCount > actualItemsCount
         ? Math.max(
              actualItemsCount,
              slideBy === "page"
                 ? actualItemsCount
                 : typeof slideBy === "number"
                   ? slideBy
                   : 1,
           )
         : 0;

   // Create slides with clones
   const slides = (() => {
      if (!loop || cloneCount === 0) return originalSlides;

      const cloneHead = originalSlides.slice(-cloneCount);
      const cloneTail = originalSlides.slice(0, cloneCount);
      return [...cloneHead, ...originalSlides, ...cloneTail];
   })();

   const totalSlides = slides.length;

   // Max index for non-loop mode
   const maxIndex = loop ? totalSlides : slideCount - itemsCount;

   // Calculate translate position
   const getTranslateX = useCallback(
      (index: number) => {
         if (!trackRef.current) return 0;
         const containerWidth = trackRef.current.offsetWidth;
         const slideWidth = (containerWidth + gap) / itemsCount;
         return -(index * slideWidth);
      },
      [gap, itemsCount],
   );

   // Update position
   const updatePosition = useCallback(
      (index: number, instant = false) => {
         if (!trackRef.current) return;

         const translateX = getTranslateX(index);
         const track = trackRef.current;

         track.style.transition = instant
            ? "none"
            : `transform ${speed}ms cubic-bezier(0.4, 0, 0.2, 1)`;
         track.style.transform = `translateX(${translateX}px)`;
      },
      [getTranslateX, speed],
   );

   // Get real index (without clones)
   const getRealIndex = useCallback(
      (index: number) => {
         if (!loop || cloneCount === 0) return index;

         let realIndex = index - cloneCount;
         if (realIndex < 0) {
            realIndex = slideCount + (realIndex % slideCount);
         } else if (realIndex >= slideCount) {
            realIndex = realIndex % slideCount;
         }
         return realIndex;
      },
      [loop, cloneCount, slideCount],
   );

   // Move slide
   const moveSlide = useCallback(
      (step: number) => {
         if (isAnimating || !showNav) return;

         setIsAnimating(true);

         let newIndex = currentIndex + step;

         // Clamp index for non-loop mode
         if (!loop) {
            newIndex = Math.max(0, Math.min(newIndex, maxIndex));
         }

         setCurrentIndex(newIndex);
         updatePosition(newIndex);

         // Handle infinite loop reset
         setTimeout(() => {
            if (loop && cloneCount > 0) {
               let resetIndex: number | null = null;

               if (newIndex < cloneCount) {
                  resetIndex = newIndex + slideCount;
               } else if (newIndex >= cloneCount + slideCount) {
                  resetIndex = newIndex - slideCount;
               }

               if (resetIndex !== null) {
                  setCurrentIndex(resetIndex);
                  requestAnimationFrame(() => {
                     updatePosition(resetIndex!, true);
                  });
               }
            }
            setIsAnimating(false);
         }, speed);

         if (onSlideChange) {
            const realIndex = getRealIndex(newIndex);
            onSlideChange(realIndex);
         }
      },
      [
         currentIndex,
         isAnimating,
         showNav,
         loop,
         cloneCount,
         slideCount,
         maxIndex,
         speed,
         updatePosition,
         getRealIndex,
         onSlideChange,
      ],
   );

   // Go to specific slide
   const goToSlide = useCallback(
      (realIndex: number) => {
         if (isAnimating || !showNav) return;

         setIsAnimating(true);
         const targetIndex =
            loop && cloneCount > 0 ? realIndex + cloneCount : realIndex;

         setCurrentIndex(targetIndex);
         updatePosition(targetIndex);
         onSlideChange?.(realIndex);

         setTimeout(() => setIsAnimating(false), speed);
      },
      [
         isAnimating,
         showNav,
         loop,
         cloneCount,
         speed,
         updatePosition,
         onSlideChange,
      ],
   );

   // Initialize position
   useEffect(() => {
      if (!isInitializedRef.current && trackRef.current) {
         const initialIndex = loop && cloneCount > 0 ? cloneCount : 0;
         setCurrentIndex(initialIndex);
         setTimeout(() => {
            updatePosition(initialIndex, true);
            isInitializedRef.current = true;
         }, 0);
      }
   }, [loop, cloneCount, updatePosition]);

   // Handle responsive items count after mount
   useEffect(() => {
      if (typeof items === "object") {
         // Set correct value on client side
         const updateItemsCount = () => {
            const newCount = getItemsCount();
            if (newCount !== itemsCount) {
               setItemsCount(newCount);
               const initialIndex = loop && cloneCount > 0 ? cloneCount : 0;
               setCurrentIndex(initialIndex);
               isInitializedRef.current = false;
            }
         };

         // Update once on mount
         updateItemsCount();

         // Listen for resize
         window.addEventListener("resize", updateItemsCount);
         return () => window.removeEventListener("resize", updateItemsCount);
      }
   }, [items, getItemsCount, itemsCount, loop, cloneCount]);

   // Handle resize repositioning
   useEffect(() => {
      const handleReposition = () => {
         if (trackRef.current && isInitializedRef.current) {
            updatePosition(currentIndex, true);
         }
      };

      window.addEventListener("resize", handleReposition);
      return () => window.removeEventListener("resize", handleReposition);
   }, [currentIndex, updatePosition]);

   // Autoplay
   useEffect(() => {
      if (!autoplay || !showNav || !isInitializedRef.current) return;

      const slideByValue =
         slideBy === "page"
            ? actualItemsCount
            : typeof slideBy === "number"
              ? slideBy
              : 1;

      const startAutoplay = () => {
         if (autoplayTimerRef.current) return;
         autoplayTimerRef.current = setInterval(() => {
            // Check if we can move forward in non-loop mode
            if (!loop && currentIndex >= maxIndex) {
               // Reset to beginning in non-loop mode when autoplay
               setCurrentIndex(0);
               updatePosition(0);
            } else {
               moveSlide(slideByValue);
            }
         }, autoplayTimeout);
      };

      const stopAutoplay = () => {
         if (autoplayTimerRef.current !== null) {
            clearInterval(autoplayTimerRef.current);
            autoplayTimerRef.current = null;
         }
      };

      startAutoplay();

      if (autoplayHoverPause && containerRef.current) {
         const container = containerRef.current;
         container.addEventListener("mouseenter", stopAutoplay);
         container.addEventListener("mouseleave", startAutoplay);

         return () => {
            container.removeEventListener("mouseenter", stopAutoplay);
            container.removeEventListener("mouseleave", startAutoplay);
            stopAutoplay();
         };
      }

      return () => stopAutoplay();
   }, [
      autoplay,
      autoplayTimeout,
      autoplayHoverPause,
      showNav,
      slideBy,
      actualItemsCount,
      loop,
      currentIndex,
      maxIndex,
      moveSlide,
      updatePosition,
   ]);

   // Drag functionality
   const handleDragStart = useCallback(
      (clientX: number) => {
         if (!draggable || isAnimating || !trackRef.current) return;
         setIsDragging(true);
         setStartX(clientX);
         setDragOffset(0);

         trackRef.current.style.transition = "none";
      },
      [draggable, isAnimating],
   );

   const handleDragMove = useCallback(
      (clientX: number) => {
         if (!isDragging || !trackRef.current) return;

         const diff = clientX - startX;
         setDragOffset(diff);

         const currentTranslate = getTranslateX(currentIndex);
         trackRef.current.style.transform = `translateX(${currentTranslate + diff}px)`;
      },
      [isDragging, startX, currentIndex, getTranslateX],
   );

   const handleDragEnd = useCallback(() => {
      if (!isDragging || !trackRef.current) return;
      setIsDragging(false);

      const containerWidth = trackRef.current.offsetWidth;
      const threshold = containerWidth / actualItemsCount / 3;
      const slideByValue =
         slideBy === "page"
            ? actualItemsCount
            : typeof slideBy === "number"
              ? slideBy
              : 1;

      if (Math.abs(dragOffset) > threshold) {
         if (dragOffset < 0) {
            // Dragged left - go next
            if (loop || currentIndex < maxIndex) {
               moveSlide(slideByValue);
            } else {
               updatePosition(currentIndex);
            }
         } else {
            // Dragged right - go prev
            if (loop || currentIndex > 0) {
               moveSlide(-slideByValue);
            } else {
               updatePosition(currentIndex);
            }
         }
      } else {
         updatePosition(currentIndex);
      }

      setDragOffset(0);
   }, [
      isDragging,
      dragOffset,
      currentIndex,
      maxIndex,
      actualItemsCount,
      loop,
      slideBy,
      moveSlide,
      updatePosition,
   ]);

   // Mouse events
   const handleMouseDown = (e: React.MouseEvent) => {
      e.preventDefault();
      handleDragStart(e.clientX);
   };

   const handleMouseMove = (e: React.MouseEvent) => {
      handleDragMove(e.clientX);
   };

   const handleMouseUp = () => {
      handleDragEnd();
   };

   const handleMouseLeave = () => {
      if (isDragging) {
         handleDragEnd();
      }
   };

   // Touch events
   const handleTouchStart = (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientX);
   };

   const handleTouchMove = (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientX);
   };

   const handleTouchEnd = () => {
      handleDragEnd();
   };

   // Get active page for nav dots
   const getActivePage = () => {
      const realIndex = getRealIndex(currentIndex);
      return Math.floor(realIndex / actualItemsCount);
   };

   const pageCount = Math.ceil(slideCount / actualItemsCount);
   const slideByValue =
      slideBy === "page"
         ? actualItemsCount
         : typeof slideBy === "number"
           ? slideBy
           : 1;

   return (
      <div
         ref={containerRef}
         className={`slidezy-container w-full overflow-hidden ${className}`}
      >
         <div className="relative">
            {/* Track */}
            <div
               ref={trackRef}
               className="flex"
               style={{
                  gap: `${gap}px`,
                  cursor: draggable
                     ? isDragging
                        ? "grabbing"
                        : "grab"
                     : "default",
                  userSelect: "none",
                  WebkitUserSelect: "none",
                  touchAction: "pan-y",
               }}
               onMouseDown={handleMouseDown}
               onMouseMove={handleMouseMove}
               onMouseUp={handleMouseUp}
               onMouseLeave={handleMouseLeave}
               onTouchStart={handleTouchStart}
               onTouchMove={handleTouchMove}
               onTouchEnd={handleTouchEnd}
            >
               {slides.map((slide, index) => (
                  <div
                     key={`slide-${index}`}
                     className="shrink-0"
                     style={{
                        width: `calc((100% - ${gap * (actualItemsCount - 1)}px) / ${actualItemsCount})`,
                     }}
                  >
                     {slide}
                  </div>
               ))}
            </div>

            {/* Controls */}
            {controls && showNav && (
               <>
                  <button
                     onClick={() => moveSlide(-slideByValue)}
                     disabled={isAnimating || (!loop && currentIndex === 0)}
                     className="absolute top-1/2 -translate-y-1/2 left-2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                     aria-label="Previous slide"
                  >
                     {controlsText[0]}
                  </button>
                  <button
                     onClick={() => moveSlide(slideByValue)}
                     disabled={
                        isAnimating || (!loop && currentIndex >= maxIndex)
                     }
                     className="absolute top-1/2 -translate-y-1/2 right-2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg flex items-center justify-center text-2xl text-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                     aria-label="Next slide"
                  >
                     {controlsText[1]}
                  </button>
               </>
            )}
         </div>

         {/* Navigation Dots */}
         {nav && showNav && (
            <div className="flex items-center justify-center gap-2 mt-4">
               {Array.from({ length: pageCount }).map((_, index) => (
                  <button
                     key={index}
                     onClick={() => goToSlide(index * actualItemsCount)}
                     disabled={isAnimating}
                     className={`h-2 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                        getActivePage() === index
                           ? "w-8 bg-gray-800"
                           : "w-2 bg-gray-300 hover:bg-gray-400"
                     }`}
                     aria-label={`Go to slide ${index + 1}`}
                  />
               ))}
            </div>
         )}
      </div>
   );
}
