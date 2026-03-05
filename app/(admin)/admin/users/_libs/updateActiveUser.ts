
import apiRequest from "@/lib/api";

export async function updateActiveUser(
  id: string,
  data: {
    isActive: boolean;
  },
) {
  return apiRequest.patch(`/users/admin/${id}`, data);
}