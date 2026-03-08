"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Popzy } from "@/components/Modal";
import { MapPin, Home, Building2, Plus, Star } from "lucide-react";
import apiRequest from "@/lib/api";
import { getProvinces } from "../_lib/get-provice";
import { getWards } from "../_lib/get-wards";

interface Province {
   id: string;
   name: string;
   fullName: string;
}

interface Ward {
   id: string;
   name: string;
   fullName: string;
}

interface Address {
   id: string;
   contactName: string;
   phone: string;
   province: Province;
   ward: Ward;
   detailAddress: string;
   fullAddress: string;
   type: "HOME" | "OFFICE" | "OTHER";
   isDefault: boolean;
}

interface ApiResponse {
   success: boolean;
   data: Address[];
   total: number;
   message: string;
}

interface AddressForm {
   contactName: string;
   phone: string;
   provinceId: string;
   wardId: string;
   detailAddress: string;
   type: "HOME" | "OFFICE" | "OTHER";
   isDefault: boolean;
}

const defaultForm: AddressForm = {
   contactName: "",
   phone: "",
   provinceId: "",
   wardId: "",
   detailAddress: "",
   type: "HOME",
   isDefault: false,
};

export default function AddressPage() {
   const router = useRouter();
   const searchParams = useSearchParams();
   const redirectTo = searchParams.get("redirect"); // "checkout" nếu đến từ checkout

   const [isOpen, setIsOpen] = useState(false);
   const [editingId, setEditingId] = useState<string | null>(null);
   const [addresses, setAddresses] = useState<Address[]>([]);
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [deletingId, setDeletingId] = useState<string | null>(null);
   const [provinces, setProvinces] = useState<Province[]>([]);
   const [wards, setWards] = useState<Ward[]>([]);
   const [errors, setErrors] = useState<Partial<AddressForm>>({});
   const [form, setForm] = useState<AddressForm>(defaultForm);

   useEffect(() => {
      const fetchAddresses = async () => {
         try {
            const res = await apiRequest.get<ApiResponse>("/addresses");
            setAddresses(res?.data || []);
            const provinceData = await getProvinces();
            setProvinces(provinceData);
         } catch (error) {
            console.error("Lỗi khi lấy địa chỉ:", error);
         } finally {
            setLoading(false);
         }
      };
      fetchAddresses();
   }, []);

   // Tự động mở modal nếu đến từ checkout và chưa có địa chỉ
   useEffect(() => {
      if (!loading && redirectTo === "checkout" && addresses.length === 0) {
         setIsOpen(true);
      }
   }, [loading, redirectTo, addresses.length]);

   useEffect(() => {
      if (!form.provinceId) return;
      const fetchWards = async () => {
         const data = await getWards(form.provinceId);
         setWards(data);
      };
      fetchWards();
   }, [form.provinceId]);

   const setField = <K extends keyof AddressForm>(key: K, value: AddressForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
   };

   const validate = (): boolean => {
      const newErrors: Partial<AddressForm> = {};
      if (!form.contactName.trim()) newErrors.contactName = "Vui lòng nhập họ tên";
      if (!form.phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
      else if (!/^(0[3-9])\d{8}$/.test(form.phone)) newErrors.phone = "Số điện thoại không hợp lệ";
      if (!form.provinceId) newErrors.provinceId = "Vui lòng chọn tỉnh/thành phố";
      if (!form.wardId) newErrors.wardId = "Vui lòng chọn phường/xã";
      if (!form.detailAddress.trim()) newErrors.detailAddress = "Vui lòng nhập địa chỉ cụ thể";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleClose = () => {
      setIsOpen(false);
      setEditingId(null);
      setForm(defaultForm);
      setWards([]);
      setErrors({});
   };

   const handleOpenEdit = (addr: Address) => {
      setEditingId(addr.id);
      setForm({
         contactName: addr.contactName,
         phone: addr.phone,
         provinceId: addr.province.id,
         wardId: addr.ward.id,
         detailAddress: addr.detailAddress,
         type: addr.type,
         isDefault: addr.isDefault,
      });
      setIsOpen(true);
   };

   const handleCreate = async () => {
      if (!validate()) return;
      setSubmitting(true);
      try {
         const res = await apiRequest.post<{ success: boolean; data: Address }>("/addresses", form);
         if (res?.success) {
            handleClose();
            // Nếu đến từ checkout → quay lại checkout với flag newAddress=1
            // Checkout sẽ detect flag này để re-fetch và tự chọn địa chỉ vừa thêm
            if (redirectTo === "checkout") {
               // Ghi newAddressId vào checkoutData trong localStorage
               // để checkout đọc và tự chọn đúng địa chỉ vừa thêm
               try {
                  const raw = localStorage.getItem("checkoutData");
                  if (raw) {
                     const parsed = JSON.parse(raw);
                     parsed.newAddressId = res.data.id;
                     localStorage.setItem("checkoutData", JSON.stringify(parsed));
                  }
               } catch { /* silent */ }
               router.push("/checkout?newAddress=1");
            } else {
               setAddresses((prev) => {
                  const updated = res.data.isDefault
                     ? prev.map((a) => ({ ...a, isDefault: false }))
                     : prev;
                  return [...updated, res.data];
               });
            }
         }
      } catch (error) {
         console.error("Lỗi khi tạo địa chỉ:", error);
      } finally {
         setSubmitting(false);
      }
   };

   const handleUpdate = async () => {
      if (!validate() || !editingId) return;
      setSubmitting(true);
      try {
         const res = await apiRequest.patch<{ success: boolean; data: Address }>(
            `/addresses/${editingId}`,
            form,
         );
         if (res?.success) {
            setAddresses((prev) =>
               prev.map((a) => {
                  if (a.id === editingId) return res.data;
                  if (res.data.isDefault) return { ...a, isDefault: false };
                  return a;
               }),
            );
            handleClose();
         }
      } catch (error) {
         console.error("Lỗi khi cập nhật địa chỉ:", error);
      } finally {
         setSubmitting(false);
      }
   };

   const handleSubmit = () => (editingId ? handleUpdate() : handleCreate());

   const handleDelete = async (id: string) => {
      if (!confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
      setDeletingId(id);
      try {
         const res = await apiRequest.delete<{ success: boolean }>(`/addresses/${id}`);
         if (res?.success) {
            setAddresses((prev) => prev.filter((a) => a.id !== id));
         }
      } catch (error) {
         console.error("Lỗi khi xóa địa chỉ:", error);
      } finally {
         setDeletingId(null);
      }
   };

   const typeLabel = (type: string) => {
      if (type === "HOME") return { label: "Nhà riêng", icon: <Home size={14} /> };
      if (type === "OFFICE") return { label: "Văn phòng", icon: <Building2 size={14} /> };
      return { label: "Khác", icon: <MapPin size={14} /> };
   };

   const inputClass =
      "w-full rounded-lg border border-neutral bg-neutral-light px-4 py-3 text-sm text-primary outline-none transition-all duration-200 focus:border-promotion focus:ring-2 focus:ring-promotion-light placeholder:text-primary-dark";

   if (loading) return <div className="p-4 text-primary">Đang tải...</div>;

   return (
      <>
         <div>
            <div className="flex items-center justify-between mt-2 mb-4">
               <div className="flex items-center gap-3">
                  {redirectTo === "checkout" && (
                     <button
                        onClick={() => router.push("/checkout")}
                        className="flex items-center gap-1 text-sm text-primary-dark hover:text-primary transition-colors cursor-pointer"
                     >
                        ← Quay lại thanh toán
                     </button>
                  )}
                  <h1 className="text-2xl font-semibold text-primary">Sổ địa chỉ nhận hàng</h1>
               </div>
               {addresses.length > 0 && (
                  <button
                     onClick={() => setIsOpen(true)}
                     className="flex items-center gap-1 bg-promotion hover:bg-promotion-hover text-white px-4 py-2 rounded-full text-base font-semibold transition-colors shadow-md cursor-pointer"
                  >
                     <Plus size={24} />
                     Thêm địa chỉ
                  </button>
               )}
            </div>

            {addresses.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="mb-2">
                     <img
                        src="https://cdn2.fptshop.com.vn/unsafe/750x0/filters:format(webp):quality(75)/estore-v2/img/empty_address_book.png"
                        alt="Không có địa chỉ"
                        className="object-contain w-60 h-60 mx-auto"
                     />
                  </div>
                  <h3 className="text-lg font-semibold text-primary mb-2">Bạn chưa có lưu địa chỉ nào</h3>
                  <p className="text-primary-dark mb-6 text-center text-sm">
                     Cập nhật địa chỉ ngay để có trải nghiệm mua hàng nhanh nhất!
                  </p>
                  <button
                     onClick={() => setIsOpen(true)}
                     className="bg-promotion hover:bg-promotion-hover text-white px-8 py-3 rounded-full font-semibold transition-colors shadow-md hover:shadow-lg"
                  >
                     Cập nhật ngay
                  </button>
               </div>
            ) : (
               <div className="space-y-3">
                  {addresses.map((addr) => {
                     const { label, icon } = typeLabel(addr.type);
                     return (
                        <div key={addr.id} className="bg-neutral-light border border-neutral rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                           <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 space-y-3">
                                 <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-semibold text-primary">{addr.contactName}</span>
                                    <span className="text-primary">|</span>
                                    <span className="text-primary-dark text-sm">{addr.phone}</span>
                                    {addr.isDefault && (
                                       <span className="flex items-center gap-1 text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 px-2 py-0.5 rounded-full font-medium">
                                          <Star size={11} className="fill-yellow-500 text-yellow-500" />
                                          Mặc định
                                       </span>
                                    )}
                                 </div>
                                 <p className="text-sm text-primary-dark">{addr.fullAddress}</p>
                                 <span className="inline-flex items-center gap-1 text-sm text-primary-dark bg-neutral-light-active px-2 py-0.5 rounded-full">
                                    {icon}
                                    {label}
                                 </span>
                              </div>
                              <div className="flex gap-4 text-base shrink-0">
                                 <button onClick={() => handleOpenEdit(addr)} className="text-accent hover:underline cursor-pointer">Sửa</button>
                                 {!addr.isDefault && (
                                    <button onClick={() => handleDelete(addr.id)} disabled={deletingId === addr.id} className="text-promotion hover:underline cursor-pointer disabled:opacity-50">
                                       {deletingId === addr.id ? "Đang xóa..." : "Xóa"}
                                    </button>
                                 )}
                              </div>
                           </div>
                        </div>
                     );
                  })}
               </div>
            )}

            <Popzy
               isOpen={isOpen}
               scrollLockTarget={() => document.documentElement}
               onClose={handleClose}
               closeMethods={["escape", "overlay", "button"]}
               footer={true}
               cssClass="max-w-[600px] w-full"
               content={
                  <div className="overflow-y-auto scrollbar-thin pl-2 mt-6">
                     <h2 className="text-lg font-semibold text-primary mb-4 border-b pb-2 border-neutral">
                        {editingId ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
                     </h2>
                     <div className="divide-y divide-neutral">
                        <div className="py-4 space-y-2">
                           <label className="block text-sm font-medium text-primary">Thông tin người nhận</label>
                           <input type="text" value={form.contactName} onChange={(e) => setField("contactName", e.target.value)} placeholder="Nhập họ và tên người nhận" className={inputClass} />
                           {errors.contactName && <p className="text-xs text-promotion">{errors.contactName}</p>}
                        </div>
                        <div className="py-4 space-y-2">
                           <label className="block text-sm font-medium text-primary">Số điện thoại</label>
                           <input type="text" value={form.phone} onChange={(e) => setField("phone", e.target.value)} placeholder="Nhập số điện thoại" className={inputClass} />
                           {errors.phone && <p className="text-xs text-promotion">{errors.phone}</p>}
                        </div>
                        <div className="py-4 space-y-2">
                           <label className="block text-sm font-medium text-primary">Tỉnh/Thành phố</label>
                           <select value={form.provinceId} onChange={(e) => { setField("provinceId", e.target.value); setField("wardId", ""); setWards([]); }} className={inputClass}>
                              <option value="">Chọn Tỉnh/Thành phố</option>
                              {provinces.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
                           </select>
                           {errors.provinceId && <p className="text-xs text-promotion">{errors.provinceId}</p>}
                        </div>
                        <div className="py-4 space-y-2">
                           <label className="block text-sm font-medium text-primary">Phường/Xã</label>
                           <select value={form.wardId} onChange={(e) => setField("wardId", e.target.value)} disabled={!form.provinceId} className={`${inputClass} disabled:bg-neutral-light-active disabled:text-primary-dark disabled:cursor-not-allowed`}>
                              <option value="">Chọn Phường/Xã</option>
                              {wards.map((w) => <option key={w.id} value={w.id}>{w.fullName}</option>)}
                           </select>
                           {errors.wardId && <p className="text-xs text-promotion">{errors.wardId}</p>}
                        </div>
                        <div className="py-4 space-y-2">
                           <label className="block text-sm font-medium text-primary">Địa chỉ cụ thể</label>
                           <input type="text" value={form.detailAddress} onChange={(e) => setField("detailAddress", e.target.value)} placeholder="Nhập địa chỉ cụ thể" className={inputClass} />
                           {errors.detailAddress && <p className="text-xs text-promotion">{errors.detailAddress}</p>}
                        </div>
                        <div className="py-4 space-y-2">
                           <label className="block text-sm font-medium text-primary">Loại địa chỉ</label>
                           <div className="flex gap-3">
                              {(["HOME", "OFFICE", "OTHER"] as const).map((t) => {
                                 const { label, icon } = typeLabel(t);
                                 return (
                                    <button key={t} type="button" onClick={() => setField("type", t)}
                                       className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm transition-colors cursor-pointer ${form.type === t ? "border-promotion text-promotion bg-promotion-light" : "border-neutral text-primary-dark hover:border-neutral-dark"}`}>
                                       {icon}{label}
                                    </button>
                                 );
                              })}
                           </div>
                        </div>
                        <div className="py-4">
                           <label className="flex items-center gap-2 cursor-pointer select-none">
                              <input type="checkbox" checked={form.isDefault} onChange={(e) => setField("isDefault", e.target.checked)} className="w-4 h-4 accent-promotion" />
                              <span className="text-sm text-primary">Đặt làm địa chỉ mặc định</span>
                           </label>
                        </div>
                     </div>
                  </div>
               }
               footerButtons={[
                  {
                     title: "Hủy",
                     onClick: handleClose,
                     className: "px-4 py-2 bg-neutral-light-active hover:bg-neutral text-primary rounded-lg cursor-pointer transition-colors",
                  },
                  {
                     title: submitting ? "Đang lưu..." : editingId ? "Cập nhật" : "Lưu địa chỉ",
                     onClick: handleSubmit,
                     className: "px-4 py-2 bg-promotion hover:bg-promotion-hover text-white rounded-lg cursor-pointer transition-colors disabled:opacity-50",
                  },
               ]}
            />
         </div>
      </>
   );
}