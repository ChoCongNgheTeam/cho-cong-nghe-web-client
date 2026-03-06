import { UsersResponse } from "../user.types";
import apiRequest from "@/lib/api";

export async function getAllUsers(): Promise<UsersResponse> {
  return apiRequest.get<UsersResponse>("/users/admin");
}




