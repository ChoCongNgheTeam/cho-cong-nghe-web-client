"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { User } from "../../user.types";
import UserForm from "../../components/UserForm";

export default function EditUserPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        // TODO: thay bằng API lấy user theo id
        // const res = await getUserById(id);
        // setUser(res);

        // Tạm thời dùng getAllUsers rồi filter
        const { getAllUsers } = await import("../../_libs/getAllUsers");
        const res = await getAllUsers();
        const found = res.data.find((u: User) => u.id === id);
        if (!found) throw new Error("Không tìm thấy người dùng");
        setUser(found);
      } catch (err) {
        setError("Không tìm thấy người dùng");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center gap-4">
        <p className="text-gray-600 text-lg">{error || "Không tìm thấy người dùng"}</p>
        <button onClick={() => router.push("/admin/users")}
          className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          ← Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className=" mx-auto mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <a href="/admin/users" className="hover:text-indigo-600 transition">Quản lý người dùng</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Chỉnh sửa</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900 text-center">Chỉnh sửa người dùng</h1>
        <p className="text-sm text-gray-500 mt-1 text-center">ID: <span className="font-mono">{id}</span></p>
      </div>

      <UserForm editingUser={user} />
    </div>
  );
}