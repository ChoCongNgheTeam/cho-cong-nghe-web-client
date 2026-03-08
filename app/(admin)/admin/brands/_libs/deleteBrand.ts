import apiRequest from "@/lib/api";

export const deleteBrand = async (id: string): Promise<void> => {
   await apiRequest.delete(`/brands/admin/${id}`);
};
