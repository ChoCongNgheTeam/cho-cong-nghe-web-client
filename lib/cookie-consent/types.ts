export interface ConsentCategories {
  /** Ghi nhớ cài đặt và tùy chọn cá nhân (VD: theme, ngôn ngữ...) */
  preferences: boolean;
  /** Nâng cao chất lượng dịch vụ và cá nhân hóa trải nghiệm — gate cho module recommendation (view-event, for-you theo sessionId) */
  personalization: boolean;
  /** Cung cấp thông tin sản phẩm, dịch vụ, khuyến mại phù hợp sở thích */
  marketing: boolean;
}

export interface ConsentState extends ConsentCategories {
  /** true = khách đã từng bấm chọn (chấp nhận/từ chối/tuỳ chỉnh) — false = chưa hiện banner lần nào */
  decided: boolean;
}
