import { ChevronLeft, ChevronRight, Gpu, Package, Cpu } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { ProductDetail, CurrentVariant } from "@/lib/types/product";
import { MdPhoneIphone, MdMemory, MdVerified } from "react-icons/md";
import { IoRadioButtonOn } from "react-icons/io5";
import { FaUserCog, FaShippingFast } from "react-icons/fa";
import ProductSpecsModal, {
   type ProductSpecsModalRef,
} from "./ProductSpecsModal";

interface ProductDetailLeftProps {
   product: ProductDetail;
   selectedVariant?: CurrentVariant;
   images: {
      id: string;
      imageUrl: string;
      altText?: string;
      position?: number;
   }[];
}

// Mock data cho modal (giữ tạm để modal không bị lỗi)
const mockProductSpecs = {
   name: "Nubia A76 4GB 128GB (NFC)",
   image: "https://bizweb.dktcdn.net/100/177/937/products/nubia-a76-19-2136.jpg?v=1756891533433",
   specs: {
      general: [
         { label: "Thương hiệu", value: "Nubia" },
         { label: "Model", value: "A76" },
         { label: "Năm ra mắt", value: "2024" },
         { label: "Bảo hành", value: "18 tháng" },
      ],
      design: [
         { label: "Kích thước", value: "167.3 x 77.37 x 8.3 mm" },
         { label: "Trọng lượng sản phẩm", value: "197 g" },
         { label: "Chất liệu khung viền", value: "Nhựa" },
         { label: "Chất liệu mặt lưng", value: "Nhựa" },
         { label: "Kháng nước/bụi", value: "Không" },
      ],
      cpu: [
         { label: "Phiên bản CPU", value: "Unisoc T7250" },
         { label: "Loại CPU", value: "Octa-Core" },
         { label: "Số nhân", value: "8" },
         { label: "Tốc độ tối đa", value: "1.8 GHz" },
         { label: "GPU", value: "Mali-G57" },
      ],
      memory: [
         { label: "RAM", value: "4 GB" },
         { label: "Bộ nhớ trong", value: "128 GB" },
         { label: "Hỗ trợ thẻ nhớ", value: "MicroSD, tối đa 512 GB" },
      ],
      display: [
         { label: "Kích thước màn hình", value: "6.75 inch" },
         { label: "Công nghệ màn hình", value: "IPS LCD" },
         { label: "Độ phân giải", value: "HD+ (720 x 1600 pixels)" },
         { label: "Tần số quét", value: "90 Hz" },
         { label: "Độ sáng tối đa", value: "450 nits" },
         { label: "Dung lượng pin", value: "5000 mAh" },
         { label: "Hỗ trợ sạc", value: "Sạc nhanh 18W" },
         { label: "Loại pin", value: "Li-Po" },
      ],
   },
};

export default function ProductDetailBanner({
   product,
   images,
}: ProductDetailLeftProps) {
   const modalRef = useRef<ProductSpecsModalRef>(null);

   const [currentImageIndex, setCurrentImageIndex] = useState(0);

   //  khi đổi images → reset về ảnh đầu
   useEffect(() => {
      if (images && images.length > 0) {
         setCurrentImageIndex(0);
      }
   }, [images]);

   const gallery = images || [];
   const currentImageObj = gallery[currentImageIndex];
   const currentImage = currentImageObj?.imageUrl || "";
   const totalImages = gallery.length;

   const goToImage = (index: number) => setCurrentImageIndex(index);

   const goToPrevious = () => {
      setCurrentImageIndex((prev) =>
         prev === 0 ? gallery.length - 1 : prev - 1,
      );
   };

   const goToNext = () => {
      setCurrentImageIndex((prev) =>
         prev === gallery.length - 1 ? 0 : prev + 1,
      );
   };

   const openDialog = () => modalRef.current?.open();

   const highlights = product.highlights || [];

   const iconMap: Record<string, any> = {
      gpu: Gpu,
      storage: Package,
      cpu: Cpu,
   };

   return (
      <>
         <div>
            {/* IMAGE CAROUSEL */}
            <div className="relative w-full h-64 sm:h-80 lg:h-96 bg-neutral-light dark:bg-neutral rounded-lg shadow-2xl transition-colors duration-300">
               <div className="relative w-full h-full flex items-center justify-center">
                  <img
                     src={currentImage}
                     className="max-w-full max-h-full object-contain transition-opacity duration-500"
                     alt={currentImageObj?.altText || "Product image"}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
               </div>

               <button
                  onClick={goToPrevious}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-neutral-light/90 dark:bg-neutral/90 hover:bg-neutral-light dark:hover:bg-neutral text-primary dark:text-primary rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                  aria-label="Ảnh trước"
               >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>

               <button
                  onClick={goToNext}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-neutral-light/90 dark:bg-neutral/90 hover:bg-neutral-light dark:hover:bg-neutral text-primary dark:text-primary rounded-full p-1.5 sm:p-2 shadow-lg transition-all duration-200 hover:scale-110 z-10"
                  aria-label="Ảnh sau"
               >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
               </button>

               <div className="absolute bottom-2 sm:bottom-4 left-2 sm:left-4 bg-primary-dark/80 dark:bg-primary-darker/80 text-neutral-light dark:text-primary px-2 sm:px-3 py-1 sm:py-2 rounded-lg backdrop-blur-sm z-10 transition-colors duration-300">
                  <div className="text-xs text-neutral dark:text-neutral-darker mt-1">
                     {currentImageIndex + 1}/{totalImages}
                  </div>
               </div>
            </div>

            {/* THUMBNAILS */}
            <div className="mt-4">
               <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
                  {gallery.map((image, index) => (
                     <button
                        key={image.id}
                        onClick={() => goToImage(index)}
                        className={`relative group rounded-lg overflow-hidden transition-all duration-300 ${
                           index === currentImageIndex
                              ? "ring-2 ring-accent dark:ring-accent scale-105"
                              : "ring-2 ring-neutral-dark dark:ring-neutral-dark hover:ring-accent dark:hover:ring-accent hover:scale-105"
                        }`}
                        aria-label={`Xem ảnh ${index + 1}`}
                     >
                        <div className="relative h-16 sm:h-20 flex items-center justify-center bg-neutral dark:bg-neutral rounded-lg overflow-hidden transition-colors duration-300">
                           <img
                              src={image.imageUrl}
                              alt={
                                 image.altText || `Product image ${index + 1}`
                              }
                              className={`max-w-full max-h-full object-contain transition-opacity duration-300 p-2 ${
                                 index === currentImageIndex
                                    ? "opacity-100"
                                    : "opacity-70 group-hover:opacity-100"
                              }`}
                           />
                        </div>

                        <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-primary-darker/80 dark:bg-primary-darker/90 text-neutral-light dark:text-primary text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded backdrop-blur-sm transition-colors duration-300">
                           {index + 1}
                        </div>
                     </button>
                  ))}
               </div>

               {/* PRODUCT HIGHLIGHTS */}
               <div className="mt-6">
                  <div className="text-base flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
                     <h2 className="font-semibold text-primary dark:text-primary">
                        Thông số nổi bật
                     </h2>
                     <button
                        onClick={openDialog}
                        className="border border-promotion dark:border-promotion px-4 sm:px-6 py-1 rounded-full text-sm sm:text-base text-promotion dark:text-promotion cursor-pointer hover:bg-promotion dark:hover:bg-promotion hover:text-neutral-light dark:hover:text-primary transition-colors duration-200"
                     >
                        Xem tất cả thông số
                     </button>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 lg:gap-8 border-b border-neutral-dark dark:border-neutral-dark pb-6 transition-colors duration-300">
                     {highlights.map((highlight, index) => {
                        const IconComponent = highlight?.icon
                           ? iconMap[highlight.icon]
                           : null;
                        return (
                           <div className="flex-1" key={index}>
                              <span className="text-sm text-neutral-darker dark:text-neutral-darker">
                                 {highlight?.name || "N/A"}
                              </span>
                              <div className="flex items-center gap-2 mt-3 sm:mt-6">
                                 {IconComponent && (
                                    <IconComponent
                                       size={28}
                                       className="text-neutral-darker dark:text-neutral-darker"
                                    />
                                 )}
                                 <span className="text-base font-semibold text-primary dark:text-primary">
                                    {highlight?.value || "N/A"}
                                 </span>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </div>

               {/* PRODUCT POLICIES */}
               <div>
                  <div className="flex flex-col sm:flex-row justify-between mt-4 items-start sm:items-center gap-2">
                     <h2 className="text-base font-semibold text-primary dark:text-primary">
                        Chính sách sản phẩm
                     </h2>
                     <button className="text-base text-accent dark:text-accent hover:text-accent-hover dark:hover:text-accent-hover hover:underline cursor-pointer transition-colors duration-200">
                        Tìm hiểu thêm
                     </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 flex-wrap mt-6">
                     <div className="flex items-center gap-2 sm:mr-12">
                        <MdVerified
                           size={28}
                           className="text-neutral-darker dark:text-neutral-darker"
                        />
                        <p className="text-sm text-primary dark:text-primary">
                           Hàng chính hãng - Bảo hành 18 tháng
                        </p>
                     </div>

                     <div className="flex items-center gap-2">
                        <FaShippingFast
                           size={28}
                           className="text-neutral-darker dark:text-neutral-darker"
                        />
                        <p className="text-sm text-primary dark:text-primary">
                           Miễn phí giao hàng toàn quốc
                        </p>
                     </div>

                     <div className="flex items-center gap-2">
                        <FaUserCog
                           size={28}
                           className="text-neutral-darker dark:text-neutral-darker"
                        />
                        <p className="text-sm text-primary dark:text-primary">
                           Kỹ thuật viên hỗ trợ trực tuyến
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

         <ProductSpecsModal ref={modalRef} productSpecs={mockProductSpecs} />
      </>
   );
}
