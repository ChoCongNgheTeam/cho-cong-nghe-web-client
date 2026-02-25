import apiRequest from "@/lib/api";
import { HomeApiResponse } from "../types";

export interface BlogAuthor {
   id: string;
   fullName: string;
   email: string;
}

export interface Blog {
   id: string;
   title: string;
   slug: string;
   thumbnail: string;
   excerpt: string;
   viewCount: number;
   status: string;
   author: BlogAuthor;
   createdAt: string;
   publishedAt: string;
}

export interface BlogPagination {
   data: Blog[];
   page: number;
   limit: number;
   total: number;
   totalPages: number;
}


export async function getBlogs(): Promise<BlogPagination> {
   try {
      const response = await apiRequest.get<HomeApiResponse>("/home", {
         noAuth: true,
      });
      return response.data.blogs;
   } catch (error) {
      console.error("Failed to fetch blogs:", error);
      return { data: [], page: 1, limit: 7, total: 0, totalPages: 0 };
   }
}
