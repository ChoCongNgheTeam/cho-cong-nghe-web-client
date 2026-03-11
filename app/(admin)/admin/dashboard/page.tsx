import {
   TrendingUp,
   TrendingDown,
   DollarSign,
   ShoppingCart,
   Users,
   UserCheck,
   Search,
   Bell,
   Settings2,
} from "lucide-react";

// ── Static data ────────────────────────────────────────────────────────────────

const stats = [
   {
      label: "Tổng doanh thu",
      value: "20,000đ",
      change: "+5%",
      up: true,
      icon: DollarSign,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
   },
   {
      label: "Tổng đơn hàng",
      value: "123",
      change: "-5%",
      up: false,
      icon: ShoppingCart,
      iconBg: "bg-red-100",
      iconColor: "text-red-500",
   },
   {
      label: "Người dùng truy cập",
      value: "12,532",
      change: "+5%",
      up: true,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
   },
   {
      label: "Người dùng truy cập",
      value: "12,532",
      change: "+5%",
      up: true,
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
   },
];

const productTabs = [
   "Sắp hết hàng",
   "Hết hàng",
   "Sản phẩm ngừng kinh doanh",
   "Sản phẩm mới",
];
const tabCounts = [4, 4, 4, 4];

const products = Array.from({ length: 10 }, (_, i) => ({
   id: i,
   name: "iPhone 13 Pro",
   sku: "SKU: IPHONE-13-PRO",
   category: "Điện thoại",
   price: "1,225,000.00",
   stock: 8,
   status: i % 4 === 3 ? "Sắp hết hàng" : "Cần nhập ngay",
   date: "1/2/2026",
}));

const bestSellerColors: Record<string, string> = {
   "Điện thoại": "#3B82F6",
   Laptop: "#F59E0B",
   "Máy lạnh": "#10B981",
   "Đồng hồ": "#D1D5DB",
};

const stockColors: Record<string, string> = {
   "Sắp hết hàng": "#F59E0B",
   "Hết hàng": "#EF4444",
   "Sản phẩm ngừng kinh doanh": "#6B7280",
   "Sản phẩm mới": "#3B82F6",
};

// ── Tiny SVG line chart placeholder ───────────────────────────────────────────

function MiniLineChart({ color = "#F97316" }: { color?: string }) {
   return (
      <svg
         viewBox="0 0 300 80"
         className="w-full h-20"
         preserveAspectRatio="none"
      >
         <polyline
            points="0,60 30,50 60,55 90,35 120,45 150,30 180,40 210,55 240,38 270,45 300,35"
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
         />
      </svg>
   );
}

function TinyWaveLine({ color = "#10B981" }: { color?: string }) {
   return (
      <svg viewBox="0 0 120 30" className="w-24 h-6" preserveAspectRatio="none">
         <polyline
            points="0,15 20,8 40,18 60,5 80,20 100,10 120,15"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
         />
      </svg>
   );
}

// ── Donut SVG ─────────────────────────────────────────────────────────────────

function DonutChart({
   segments,
   cx = 80,
   cy = 80,
   r = 60,
   innerR = 38,
}: {
   segments: { value: number; color: string; label: string }[];
   cx?: number;
   cy?: number;
   r?: number;
   innerR?: number;
}) {
   const total = segments.reduce((s, seg) => s + seg.value, 0);
   let cumAngle = -Math.PI / 2;
   const paths: { d: string; color: string }[] = [];

   for (const seg of segments) {
      const angle = (seg.value / total) * 2 * Math.PI;
      const x1 = cx + r * Math.cos(cumAngle);
      const y1 = cy + r * Math.sin(cumAngle);
      const x2 = cx + r * Math.cos(cumAngle + angle);
      const y2 = cy + r * Math.sin(cumAngle + angle);
      const ix1 = cx + innerR * Math.cos(cumAngle);
      const iy1 = cy + innerR * Math.sin(cumAngle);
      const ix2 = cx + innerR * Math.cos(cumAngle + angle);
      const iy2 = cy + innerR * Math.sin(cumAngle + angle);
      const largeArc = angle > Math.PI ? 1 : 0;

      paths.push({
         color: seg.color,
         d: `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix1} ${iy1} Z`,
      });
      cumAngle += angle;
   }

   return (
      <svg viewBox="0 0 160 160" className="w-36 h-36">
         {paths.map((p, i) => (
            <path key={i} d={p.d} fill={p.color} />
         ))}
      </svg>
   );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
   const activeTab = 0;

   return (
      <div className="min-h-screen bg-gray-50">
         <div className="p-6 space-y-6">
            {/* Stats row */}
            <div className="grid grid-cols-4 gap-4">
               {stats.map((s, i) => {
                  const Icon = s.icon;
                  return (
                     <div
                        key={i}
                        className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm"
                     >
                        <div className="flex items-center justify-between mb-3">
                           <span className="text-sm text-gray-500">
                              {s.label}
                           </span>
                           <div
                              className={`w-9 h-9 rounded-lg ${s.iconBg} flex items-center justify-center`}
                           >
                              <Icon size={18} className={s.iconColor} />
                           </div>
                        </div>
                        <div className="text-2xl font-bold text-gray-900">
                           {s.value}
                        </div>
                        <div
                           className={`flex items-center gap-1 mt-1 text-xs ${s.up ? "text-green-600" : "text-red-500"}`}
                        >
                           {s.up ? (
                              <TrendingUp size={12} />
                           ) : (
                              <TrendingDown size={12} />
                           )}
                           <span>{s.change} so với tháng trước</span>
                        </div>
                     </div>
                  );
               })}
            </div>

            {/* Middle row */}
            <div className="grid grid-cols-3 gap-4">
               {/* New users chart */}
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 col-span-1">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                     Người dùng mới
                  </h3>
                  <MiniLineChart color="#F97316" />
                  <div className="flex justify-between text-xs text-gray-400 mt-1 px-1">
                     {[
                        "01 Jan",
                        "02",
                        "03",
                        "04",
                        "05",
                        "06",
                        "07",
                        "08",
                        "09",
                     ].map((d) => (
                        <span key={d}>{d}</span>
                     ))}
                  </div>
               </div>

               {/* Rating */}
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                     Lượt đánh giá trung bình
                  </h3>
                  <div className="text-5xl font-bold text-gray-900 mt-4 mb-2">
                     4.5
                  </div>
                  <div className="flex items-center gap-1 mb-1">
                     {[1, 2, 3, 4].map((s) => (
                        <svg
                           key={s}
                           className="w-5 h-5 text-yellow-400"
                           fill="currentColor"
                           viewBox="0 0 20 20"
                        >
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                     ))}
                     <svg
                        className="w-5 h-5 text-gray-300"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                     >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                     </svg>
                     <span className="text-gray-500 text-sm ml-1">(318)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                     <span className="text-green-600 text-sm font-medium">
                        ↑ +35
                     </span>
                     <span className="text-gray-400 text-xs">
                        So với tháng trước
                     </span>
                  </div>
                  <TinyWaveLine color="#10B981" />
               </div>

               {/* Best selling */}
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                     Sản phẩm bán chạy
                  </h3>
                  <div className="flex items-center justify-center mb-3 relative">
                     <DonutChart
                        segments={[
                           { value: 4, color: "#3B82F6", label: "Điện thoại" },
                           { value: 3, color: "#F59E0B", label: "Laptop" },
                           { value: 2, color: "#10B981", label: "Máy lạnh" },
                           { value: 1, color: "#D1D5DB", label: "Đồng hồ" },
                        ]}
                     />
                     <div className="absolute text-center">
                        <div className="text-xs text-gray-500">
                           Tổng doanh thu
                        </div>
                        <div className="text-xs font-bold text-gray-800">
                           12,142,000đ
                        </div>
                     </div>
                  </div>
                  <div className="space-y-1">
                     {Object.entries(bestSellerColors).map(([label, color]) => (
                        <div
                           key={label}
                           className="flex items-center justify-between text-xs"
                        >
                           <div className="flex items-center gap-2">
                              <span
                                 className="w-2.5 h-2.5 rounded-full inline-block"
                                 style={{ background: color }}
                              />
                              <span className="text-gray-600">{label}</span>
                           </div>
                           <span className="text-gray-700 font-medium">
                              12,000,000đ
                           </span>
                        </div>
                     ))}
                  </div>
               </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-3 gap-4">
               {/* Product table */}
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm col-span-2 overflow-hidden">
                  {/* Tabs */}
                  <div className="flex gap-1 px-4 pt-4 pb-0 border-b border-gray-100">
                     {productTabs.map((tab, i) => (
                        <button
                           key={tab}
                           className={`flex items-center gap-1.5 px-3 py-2 text-sm rounded-t-lg font-medium transition-colors ${
                              i === activeTab
                                 ? "bg-blue-50 text-blue-600 border-b-2 border-blue-600"
                                 : "text-gray-500 hover:text-gray-700"
                           }`}
                        >
                           {tab}
                           <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                              {tabCounts[i]}
                           </span>
                        </button>
                     ))}
                  </div>

                  {/* Table */}
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="text-left px-4 py-3 text-gray-500 font-medium">
                                 <input type="checkbox" className="rounded" />
                              </th>
                              <th className="text-left px-3 py-3 text-gray-500 font-medium">
                                 Tên sản phẩm
                              </th>
                              <th className="text-left px-3 py-3 text-gray-500 font-medium">
                                 Danh mục
                              </th>
                              <th className="text-left px-3 py-3 text-gray-500 font-medium">
                                 Giá sản phẩm
                              </th>
                              <th className="text-left px-3 py-3 text-gray-500 font-medium">
                                 Tồn Kho
                              </th>
                              <th className="text-left px-3 py-3 text-gray-500 font-medium">
                                 Trạng thái
                              </th>
                              <th className="text-left px-3 py-3 text-gray-500 font-medium">
                                 Ngày tạo
                              </th>
                           </tr>
                        </thead>
                        <tbody>
                           {products.map((p) => (
                              <tr
                                 key={p.id}
                                 className="border-b border-gray-50 hover:bg-gray-50"
                              >
                                 <td className="px-4 py-2.5">
                                    <input
                                       type="checkbox"
                                       className="rounded"
                                    />
                                 </td>
                                 <td className="px-3 py-2.5">
                                    <div className="flex items-center gap-2">
                                       <div className="w-8 h-8 bg-gray-100 rounded-lg shrink-0" />
                                       <div>
                                          <div className="font-medium text-gray-800 text-xs">
                                             {p.name}
                                          </div>
                                          <div className="text-gray-400 text-xs">
                                             {p.sku}
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-3 py-2.5 text-gray-600 text-xs">
                                    {p.category}
                                 </td>
                                 <td className="px-3 py-2.5 text-gray-600 text-xs">
                                    {p.price}
                                 </td>
                                 <td className="px-3 py-2.5 text-gray-600 text-xs">
                                    {p.stock}
                                 </td>
                                 <td className="px-3 py-2.5">
                                    <span
                                       className={`px-2 py-1 rounded-md text-xs font-medium ${p.status === "Sắp hết hàng" ? "bg-orange-100 text-orange-600" : "bg-red-100 text-red-600"}`}
                                    >
                                       {p.status}
                                    </span>
                                 </td>
                                 <td className="px-3 py-2.5 text-gray-500 text-xs">
                                    {p.date}
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  {/* Pagination */}
                  <div className="px-4 py-3 flex items-center justify-between text-xs text-gray-500 border-t border-gray-100">
                     <div className="flex items-center gap-2">
                        <select className="border border-gray-200 rounded px-2 py-1">
                           <option>10</option>
                           <option>20</option>
                           <option>50</option>
                        </select>
                        <span>Sản phẩm trên 1 trang</span>
                        <span>1-10 của 200 sản phẩm</span>
                     </div>
                     <div className="flex items-center gap-2">
                        <span>1</span>
                        <span>of 44 pages</span>
                        <button className="px-2 py-1 border border-gray-200 rounded">
                           ‹
                        </button>
                        <button className="px-2 py-1 border border-gray-200 rounded">
                           ›
                        </button>
                     </div>
                  </div>
               </div>

               {/* Stock chart */}
               <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                     Sản phẩm tồn kho
                  </h3>
                  <div className="flex justify-center mb-4">
                     <DonutChart
                        segments={[
                           {
                              value: 10,
                              color: "#F59E0B",
                              label: "Sắp hết hàng",
                           },
                           { value: 21, color: "#EF4444", label: "Hết hàng" },
                           {
                              value: 32,
                              color: "#6B7280",
                              label: "Sản phẩm ngừng kinh doanh",
                           },
                           {
                              value: 14,
                              color: "#3B82F6",
                              label: "Sản phẩm mới",
                           },
                        ]}
                     />
                  </div>
                  <div className="space-y-2">
                     {Object.entries(stockColors).map(([label, color]) => {
                        const counts: Record<string, number> = {
                           "Sắp hết hàng": 10,
                           "Hết hàng": 21,
                           "Sản phẩm ngừng kinh doanh": 32,
                           "Sản phẩm mới": 14,
                        };
                        return (
                           <div
                              key={label}
                              className="flex items-center justify-between text-xs"
                           >
                              <div className="flex items-center gap-2">
                                 <span
                                    className="w-2.5 h-2.5 rounded-full inline-block"
                                    style={{ background: color }}
                                 />
                                 <span className="text-gray-600">{label}</span>
                              </div>
                              <span className="text-gray-700 font-semibold">
                                 {counts[label]}
                              </span>
                           </div>
                        );
                     })}
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
}
