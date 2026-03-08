import UserForm from "../components/UserForm";

export default function CreateUserPage() {
  return (
    <div className="min-h-screen bg-gray-50/50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <a href="/admin/users" className="hover:text-indigo-600 transition">Quản lý người dùng</a>
          <span>/</span>
          <span className="text-gray-900 font-medium">Thêm mới</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">Thêm người dùng mới</h1>
      </div>

      <UserForm />
    </div>
  );
}