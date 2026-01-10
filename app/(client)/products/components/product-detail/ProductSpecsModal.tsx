"use client";

import { X } from "lucide-react";
import {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

/**
 * Interface cho một thông số kỹ thuật
 */
interface ProductSpec {
  label: string; // Tên thông số (VD: "RAM")
  value: string; // Giá trị (VD: "4 GB")
}

/**
 * Interface cho toàn bộ thông số sản phẩm
 */
interface ProductSpecs {
  name: string; // Tên sản phẩm
  image: string; // URL ảnh sản phẩm
  specs: {
    general: ProductSpec[]; // Tab: Thông tin hàng hóa
    design: ProductSpec[]; // Tab: Thiết kế & Trọng lượng
    cpu: ProductSpec[]; // Tab: Bộ xử lý
    memory: ProductSpec[]; // Tab: RAM & Bộ nhớ
    display: ProductSpec[]; // Tab: Màn hình & Pin
  };
}

/**
 * Props của component
 */
interface ProductSpecsModalProps {
  productSpecs: ProductSpecs;
}

/**
 * Ref interface - Các methods mà parent component có thể gọi
 */
export interface ProductSpecsModalRef {
  open: () => void; // Mở modal
  close: () => void; // Đóng modal
}

// ============================================================================
// COMPONENT
// ============================================================================

const ProductSpecsModal = forwardRef<
  ProductSpecsModalRef,
  ProductSpecsModalProps
>(({ productSpecs }, ref) => {
  // --------------------------------------------------------------------------
  // STATE & REFS
  // --------------------------------------------------------------------------

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedTab, setSelectedTab] = useState(0); // Tab đang được chọn (0-4)
  const tabsListRef = useRef<HTMLDivElement>(null); // Ref để scroll tabs

  // Drag to scroll state
  const [isDragging, setIsDragging] = useState(false); // Đang kéo chuột?
  const [startX, setStartX] = useState(0); // Vị trí X khi bắt đầu kéo
  const [scrollLeft, setScrollLeft] = useState(0); // Vị trí scroll ban đầu

  // --------------------------------------------------------------------------
  // EXPOSE METHODS TO PARENT COMPONENT
  // Cho phép parent gọi modal.open() và modal.close()
  // --------------------------------------------------------------------------

  useImperativeHandle(ref, () => ({
    open: () => {
      dialogRef.current?.showModal();
    },
    close: () => {
      dialogRef.current?.close();
    },
  }));

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------

  /**
   * Effect: Auto scroll đến tab đang active
   * - Chỉ chạy khi selectedTab thay đổi
   * - Không chạy khi đang kéo chuột (isDragging = true)
   * - Scroll tab vào giữa viewport để dễ nhìn
   */
  useEffect(() => {
    if (!tabsListRef.current || isDragging) return;

    const activeTab = tabsListRef.current.children[selectedTab] as HTMLElement;
    if (activeTab) {
      // Delay 100ms để tránh conflict với animation
      setTimeout(() => {
        activeTab.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest",
        });
      }, 100);
    }
  }, [selectedTab]);

  // --------------------------------------------------------------------------
  // DRAG TO SCROLL HANDLERS
  // Cho phép user kéo chuột để scroll tabs ngang
  // --------------------------------------------------------------------------

  /**
   * Handler: Bắt đầu kéo chuột
   * - Lưu vị trí chuột và scroll position hiện tại
   * - Tắt smooth scroll để kéo mượt
   * - Đổi cursor thành 'grabbing'
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!tabsListRef.current) return;

    setIsDragging(true);
    setStartX(e.pageX - tabsListRef.current.offsetLeft);
    setScrollLeft(tabsListRef.current.scrollLeft);

    // UI feedback
    tabsListRef.current.style.cursor = "grabbing";
    tabsListRef.current.style.scrollBehavior = "auto"; // Tắt smooth scroll
  };

  /**
   * Handler: Di chuyển chuột khi đang kéo
   * - Tính khoảng cách di chuyển
   * - Scroll tabs theo chuột
   * - Nhân với 2 để tăng tốc độ kéo
   */
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !tabsListRef.current) return;

    e.preventDefault(); // Ngăn select text
    const x = e.pageX - tabsListRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Nhân 2 = kéo nhanh hơn
    tabsListRef.current.scrollLeft = scrollLeft - walk;
  };

  /**
   * Handler: Thả chuột sau khi kéo
   * - Reset state
   * - Bật lại smooth scroll
   * - Đổi cursor về 'grab'
   */
  const handleMouseUp = () => {
    setIsDragging(false);
    if (tabsListRef.current) {
      tabsListRef.current.style.cursor = "grab";
      tabsListRef.current.style.scrollBehavior = "smooth";
    }
  };

  /**
   * Handler: Chuột rời khỏi vùng tabs
   * - Dừng kéo nếu đang kéo
   */
  const handleMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      if (tabsListRef.current) {
        tabsListRef.current.style.cursor = "grab";
        tabsListRef.current.style.scrollBehavior = "smooth";
      }
    }
  };

  // --------------------------------------------------------------------------
  // DIALOG FUNCTIONS
  // --------------------------------------------------------------------------

  /**
   * Đóng modal
   */
  const closeDialog = () => {
    dialogRef.current?.close();
  };

  // --------------------------------------------------------------------------
  // TABS CONFIGURATION
  // Định nghĩa các tabs với label và data
  // --------------------------------------------------------------------------

  const tabs = [
    {
      id: "general",
      label: "Thông tin hàng hóa",
      data: productSpecs.specs.general,
    },
    {
      id: "design",
      label: "Thiết kế & Trọng lượng",
      data: productSpecs.specs.design,
    },
    {
      id: "cpu",
      label: "Bộ xử lý",
      data: productSpecs.specs.cpu,
    },
    {
      id: "memory",
      label: "RAM & Bộ nhớ",
      data: productSpecs.specs.memory,
    },
    {
      id: "display",
      label: "Màn hình & Pin",
      data: productSpecs.specs.display,
    },
  ];

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <>
      {/* ====================================================================
            NATIVE HTML DIALOG ELEMENT
            
            Ưu điểm:
            - Backdrop tự động
            - ESC key tự động đóng
            - Focus trap built-in
            - Semantic HTML
        ==================================================================== */}
      <dialog
        ref={dialogRef}
        className="specs-dialog"
        onClick={(e) => {
          // Click vào backdrop (chính dialog element) để đóng
          if (e.target === dialogRef.current) {
            closeDialog();
          }
        }}
      >
        <div className="dialog-content">
          {/* ================================================================
                HEADER - Sticky top với tiêu đề và nút đóng
            ================================================================ */}
          <div className="dialog-header">
            <h2 className="text-lg font-semibold text-primary dark:text-primary">
              Thông số kỹ thuật
            </h2>
            <button
              onClick={closeDialog}
              className="p-2 rounded-full hover:bg-neutral dark:hover:bg-neutral transition-colors"
              aria-label="Đóng modal"
            >
              <X className="w-5 h-5 text-primary dark:text-primary" />
            </button>
          </div>

          {/* ================================================================
                BODY - Scrollable content area
            ================================================================ */}
          <div className="dialog-body">
            {/* Product Info - Ảnh và tên sản phẩm */}
            <div className="flex items-center gap-3">
              <img
                src={productSpecs.image}
                alt={productSpecs.name}
                className="w-24 h-24 object-cover rounded bg-neutral dark:bg-neutral p-1"
              />
              <p className="font-medium text-base text-primary dark:text-primary">
                {productSpecs.name}
              </p>
            </div>

            {/* ============================================================
                  TABS WITH DRAG-TO-SCROLL
                  
                  Features:
                  - Click tab để chuyển
                  - Kéo chuột để scroll ngang
                  - Auto scroll đến tab active
                  - Sticky khi scroll body
              ============================================================ */}
            <div className="sticky top-0 bg-neutral-light dark:bg-neutral-light z-10 -mx-4 px-4 pb-3 border-y border-neutral-dark dark:border-neutral-dark p-4 mt-6">
              <div
                ref={tabsListRef}
                className="flex overflow-x-auto gap-6 select-none"
                style={{
                  scrollbarWidth: "none", // Hide scrollbar Firefox
                  msOverflowStyle: "none", // Hide scrollbar IE/Edge
                  cursor: "grab",
                  scrollBehavior: "smooth",
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
              >
                {tabs.map((tab, index) => (
                  <button
                    key={tab.id}
                    onClick={() => {
                      // Chỉ chuyển tab khi KHÔNG đang kéo
                      // Tránh trigger onClick khi user chỉ muốn scroll
                      if (!isDragging) {
                        setSelectedTab(index);
                      }
                    }}
                    className={`flex-shrink-0 px-2 py-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                      selectedTab === index
                        ? "text-accent dark:text-accent border-accent dark:border-accent" // Active state
                        : "text-neutral-darker dark:text-neutral-darker border-transparent hover:text-accent-hover dark:hover:text-accent-hover" // Default/Hover
                    }`}
                    style={{ userSelect: "none" }} // Không cho select text khi kéo
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ============================================================
                  TAB CONTENT - Hiển thị specs của tab đang active
                  
                  Render dựa trên selectedTab index
              ============================================================ */}
            <div className="text-sm mt-4">
              <div className="space-y-0">
                {tabs[selectedTab].data.map((spec, index) => (
                  <div
                    key={index}
                    className={`flex justify-between py-3 gap-4 ${
                      index !== tabs[selectedTab].data.length - 1
                        ? "border-b border-neutral dark:border-neutral" // Border cho tất cả trừ item cuối
                        : ""
                    }`}
                  >
                    {/* Label - Tên thông số */}
                    <span className="text-neutral-darker dark:text-neutral-darker font-medium">
                      {spec.label}
                    </span>

                    {/* Value - Giá trị thông số */}
                    <span className="text-primary dark:text-primary text-right font-semibold">
                      {spec.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </dialog>

      {/* ====================================================================
            STYLES - CSS cho dialog và animations
        ==================================================================== */}
      <style jsx>{`
        /* Dialog reset - Xóa tất cả style mặc định của browser */
        .specs-dialog {
          border: none;
          padding: 0;
          max-width: none;
          max-height: none;
          width: 100%;
          height: 100%;
          background: transparent; /* Backdrop sẽ xử lý màu nền */
        }

        /* Backdrop - Lớp phủ tối phía sau modal */
        .specs-dialog::backdrop {
          background: rgba(0, 0, 0, 0.4); /* Đen 40% opacity */
          backdrop-filter: blur(2px); /* Blur nhẹ background */
        }

        /* Dark mode - Backdrop tối hơn */
        :global(.dark) .specs-dialog::backdrop {
          background: rgba(0, 0, 0, 0.7); /* Đen 70% opacity */
          backdrop-filter: blur(4px); /* Blur nhiều hơn */
        }

        /* Layout khi dialog open - Đẩy content sang bên phải */
        .specs-dialog[open] {
          display: flex;
          justify-content: flex-end; /* Align content to right */
          align-items: stretch; /* Full height */
        }

        /* Dialog content container */
        .dialog-content {
          width: 100%;
          max-width: 28rem; /* 448px */
          height: 100%;
          background: rgb(var(--neutral-light));
          box-shadow: -4px 0 24px rgba(0, 0, 0, 0.15); /* Shadow bên trái */
          display: flex;
          flex-direction: column;
          transition: background-color 0.3s ease;
        }

        /* Dark mode - Shadow mạnh hơn */
        :global(.dark) .dialog-content {
          box-shadow: -4px 0 32px rgba(0, 0, 0, 0.5);
        }

        /* Header section - Fixed top */
        .dialog-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem;
          border-bottom: 1px solid rgb(var(--neutral-dark));
          background: rgb(var(--neutral-light));
          transition: all 0.3s ease;
        }

        /* Body section - Scrollable area */
        .dialog-body {
          flex: 1; /* Take remaining space */
          overflow-y: auto; /* Enable vertical scroll */
          padding: 1rem;
          background: rgb(var(--neutral-light));
          transition: background-color 0.3s ease;
        }

        /* Custom scrollbar cho dialog body */
        .dialog-body::-webkit-scrollbar {
          width: 8px;
        }

        .dialog-body::-webkit-scrollbar-track {
          background: rgb(var(--neutral));
        }

        .dialog-body::-webkit-scrollbar-thumb {
          background: rgb(var(--neutral-dark));
          border-radius: 4px;
        }

        .dialog-body::-webkit-scrollbar-thumb:hover {
          background: rgb(var(--neutral-darker));
        }

        /* Responsive - Full width on mobile */
        @media (max-width: 640px) {
          .dialog-content {
            max-width: 100%;
          }
        }
      `}</style>
    </>
  );
});

// Set displayName for better debugging in React DevTools
ProductSpecsModal.displayName = "ProductSpecsModal";

export default ProductSpecsModal;