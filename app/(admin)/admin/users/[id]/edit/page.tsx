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
        const { getAllUsers } = await import("../../_libs/getAllUsers");
        const res = await getAllUsers();
        const found = res.data.find((u: User) => u.id === id);
        if (!found) throw new Error("Không tìm thấy người dùng");
        setUser(found);
      } catch {
        setError("Không tìm thấy người dùng");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4">
        <p className="text-primary">{error || "Không tìm thấy người dùng"}</p>
        <button onClick={() => router.push("/admin/users")}
          className="px-4 py-2 text-sm bg-accent text-white rounded-xl hover:bg-accent-hover transition cursor-pointer">
          ← Quay lại
        </button>
      </div>
    );
  }

  return <UserForm editingUser={user} />;
}