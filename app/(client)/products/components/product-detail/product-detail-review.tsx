"use client";
import { AiOutlineLike } from "react-icons/ai";
import React, { useState } from "react";
import { Star, Image, Video } from "lucide-react";

export default function ProductReview() {
  const [selectedRating, setSelectedRating] = useState("all");
  const [comment, setComment] = useState("");

  const reviews = [
    {
      id: 1,
      author: "HOÀNG VĂN VŨ",
      avatar: "H",
      time: "một ngày trước",
      content: "Samsung A10 dc ko shop",
      likes: 0,
      replies: [
        {
          id: 1,
          author: "Trần Thị Thanh Thư",
          role: "Quản trị viên",
          time: "một ngày trước",
          content: `Chào anh Vũ,

Dạ, khá tiếc hiện sản phẩm mình chưa nằm trong danh sách thu cũ a.
Nubia A76 4GB 128GB (NFC) giảm ngay 200.000đ giá chỉ còn 2.290.000đ
Tại Xe Công Nghệ - Giảm ngay 3%
Hàng chính hãng - Bảo hành 18 tháng
Miễn phí giao hàng toàn quốc`,
        },
      ],
    },
  ];

  const ratingStats = {
    average: 4.7,
    total: 19,
    breakdown: [
      { stars: 5, count: 17 },
      { stars: 4, count: 1 },
      { stars: 3, count: 0 },
      { stars: 2, count: 0 },
      { stars: 1, count: 1 },
    ],
  };

  const filterOptions = [
    { label: "Tất cả", value: "all" },
    { label: "5 ⭐", value: "5" },
    { label: "4 ⭐", value: "4" },
    { label: "3 ⭐", value: "3" },
    { label: "2 ⭐", value: "2" },
    { label: "1 ⭐", value: "1" },
  ];

  const getBarWidth = (count: number) => {
    const maxCount = Math.max(...ratingStats.breakdown.map((r) => r.count));
    return (count / maxCount) * 100;
  };

  return (
    <div>
      {/* Rating Summary Section */}
      <div className="mb-6 sm:mb-8">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">
          Đánh giá và bình luận
        </h2>

        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-12 mb-6">
          {/* Average Rating */}
          <div className="flex flex-col items-center w-full sm:w-auto">
            <div className="text-5xl sm:text-6xl font-bold mb-2">
              {ratingStats.average}
            </div>
            <div className="flex gap-1 mb-2 flex-wrap justify-center">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    star <= 8
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-300 text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 mb-3">
              {ratingStats.total} lượt đánh giá
            </div>
            <button className="px-6 py-2 bg-red-600 text-white rounded-full font-medium hover:bg-red-700 text-sm sm:text-base">
              Đánh giá sản phẩm
            </button>
          </div>

          {/* Rating Breakdown */}
          <div className="flex-1 w-full">
            {ratingStats.breakdown.map((rating) => (
              <div
                key={rating.stars}
                className="flex items-center gap-2 sm:gap-3 mb-2"
              >
                <span className="text-xs sm:text-sm w-7 sm:w-8">
                  {rating.stars} ⭐
                </span>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{ width: `${getBarWidth(rating.count)}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-gray-600 w-6 sm:w-8 text-right">
                  {rating.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="border-t pt-4 sm:pt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="text-lg sm:text-xl font-semibold">56 Bình luận</h3>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRating(option.value)}
                className={`px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm border whitespace-nowrap ${
                  selectedRating === option.value
                    ? "border-red-500 text-red-500"
                    : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Comment Input */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Nhập nội dung bình luận..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-3 sm:px-4 py-3 border border-gray-300 rounded-lg pr-3 sm:pr-32 focus:outline-none focus:border-gray-400 text-sm sm:text-base"
              maxLength={3000}
            />
            <div className="flex items-center gap-2 mt-2 sm:mt-0 sm:absolute sm:right-3 sm:top-1/2 sm:-translate-y-1/2">
              <span className="text-xs text-gray-400">
                {comment.length}/3000
              </span>
              <button className="px-4 sm:px-6 py-2 bg-black text-white rounded-full text-xs sm:text-sm font-medium hover:bg-gray-800 ml-auto cursor-pointer">
                Gửi bình luận
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs sm:text-sm text-blue-600">
            <Image className="w-3 h-3 sm:w-4 sm:h-4" />
            <Video className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Thêm tối đa 5 ảnh và 1 video</span>
          </div>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border-b pb-4">
              <div className="flex gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-300 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base flex-shrink-0">
                  {review.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-sm sm:text-base">
                      {review.author}
                    </span>
                    <span className="text-xs text-gray-500">
                      • {review.time}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2 text-sm sm:text-base break-words">
                    {review.content}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 text-sm ">
                    <button className="flex items-center gap-1 text-gray-600 hover:text-gray-800 cursor-pointer">
                      <AiOutlineLike width={32} /> {review.likes}
                    </button>
                    <button className="text-gray-600 hover:text-gray-800 cursor-pointer">
                      ↩️ Trả lời
                    </button>
                  </div>

                  {/* Replies */}
                  {review.replies && review.replies.length > 0 && (
                    <div className="mt-4 ml-4 sm:ml-8 bg-gray-50 rounded-lg p-3 sm:p-4">
                      {review.replies.map((reply) => (
                        <div key={reply.id} className="flex gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-sm font-semibold">
                              TT
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm sm:text-sm">
                                {reply.author}
                              </span>
                              <span className="px-2 py-0.5 bg-gray-600 text-white text-sm rounded whitespace-nowrap">
                                {reply.role}
                              </span>
                              <span className="text-sm text-gray-500">
                                • {reply.time}
                              </span>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line text-sm sm:text-sm break-words">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
