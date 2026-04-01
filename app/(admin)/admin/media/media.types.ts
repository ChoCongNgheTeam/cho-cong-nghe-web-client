// ─── Types ────────────────────────────────────────────────────────────────────
export type MediaType = "SLIDER" | "BANNER";
export type MediaPosition =
   | "HOME_TOP"
   | "BELOW_SLIDER"
   | "HOME_SECTION_1"
   | "HOME_SECTION_2";

export interface Media {
   id: string;
   type: MediaType;
   position: MediaPosition;
   title: string | null;
   subTitle: string | null;
   imagePath: string | null;
   imageUrl: string | null;
   linkUrl: string | null;
   order: number;
   isActive: boolean;
   createdAt: string;
   updatedAt: string;
   deletedAt: string | null;
   deletedBy: string | null;
}

export interface ApiResponse<T> {
   data: T;
   total?: number;
   message: string;
}

export const MEDIA_TYPES: MediaType[] = ["SLIDER", "BANNER"];
export const MEDIA_POSITIONS: MediaPosition[] = [
   "HOME_TOP",
   "BELOW_SLIDER",
   "HOME_SECTION_1",
   "HOME_SECTION_2",
];

export const positionLabel: Record<MediaPosition, string> = {
   HOME_TOP: "Home Top",
   BELOW_SLIDER: "Below Slider",
   HOME_SECTION_1: "Home Section 1",
   HOME_SECTION_2: "Home Section 2",
};
