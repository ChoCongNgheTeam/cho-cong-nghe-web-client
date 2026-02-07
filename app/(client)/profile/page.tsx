"use client";
import { useState, useEffect, use } from "react";
import { Pencil } from "lucide-react";

type Profile = {
  userName: string;
  email: string;
  fullName: string;
  phone: string;
  gender: string;
  role: string;
  avatarImage: string;
};

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<Profile | null>(null);



  useEffect(() => {
    const fecthProfile = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/v1/users/me");
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      }
    };
    fecthProfile();
  }, []);

  if (!profileData) return <div className="p-4">Đang tải...</div>;
  return (
    <div>
      {/* Header */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-4 text-left mt-2">
        Thông tin cá nhân
      </h1>
      <div className="px-4 py-10 bg-white">
        {/* Header */}
        <div className="w-full max-w-md mx-auto">
          {/* Card */}
          <div className=" overflow-hidden">
            {/* Avatar */}
            <div className="relative flex justify-center pt-8">
              <div className="relative">
                {/* Glow phía sau */}
                <div className="absolute inset-0 rounded-full bg-orange-200/40 blur-xl" />

                {/* Avatar */}
                <div className="relative w-28 h-28 rounded-full bg-white p-1 shadow-lg">
                  <img
                    src="https://i.pravatar.cc/300"
                    alt="Avatar"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="px-6 py-8 space-y-6">
              <InfoRow label="Họ và tên" value={profileData?.fullName || "Chưa có"} />
              <InfoRow label="Số điện thoại" value={profileData?.phone || "Chưa có"} />

              {/* Button */}
              <div className="pt-4">
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full flex items-center justify-center gap-2
                  bg-red-600 hover:bg-red-700
                  text-white font-semibold
                  py-3 rounded-xl
                  shadow-md hover:shadow-lg
                  transition-all active:scale-95 cursor-pointer"
                >
                  <Pencil size={18} />
                  Chỉnh sửa thông tin
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Row component */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-gray-100 pb-3">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-gray-800 font-medium">{value}</span>
    </div>
  );
}
