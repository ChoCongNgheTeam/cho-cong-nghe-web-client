
import apiRequest from "@/lib/api";

export async function deleteUser(id: string): Promise<void> {
  return apiRequest.delete(`/users/admin/${id}`);
}