"use client";
"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = BlogDetailClient;
var image_1 = require("next/image");
var link_1 = require("next/link");
var react_1 = require("react");
var BlogCategoryBar_1 = require("../components/BlogCategoryBar");
var Commentsection_1 = require("@/(client)/products/product-comment/Commentsection");
var _lib_1 = require("@/(client)/products/_lib");
var articleClassMap = {
    small: "text-[14px] leading-[1.75]",
    base: "text-[16px] leading-[1.85]",
    large: "text-[18px] leading-[1.95]",
};
function stripHtml(value) {
    return value
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
function createExcerptFromHtml(value, maxLength) {
    if (maxLength === void 0) { maxLength = 220; }
    var plain = stripHtml(value);
    if (!plain)
        return "";
    if (plain.length <= maxLength)
        return plain;
    return "".concat(plain.slice(0, maxLength).trim(), "...");
}
function extractHeadingList(html, limit) {
    var _a;
    if (limit === void 0) { limit = 10; }
    var matches = (_a = html.match(/<h[1-3][^>]*>[\s\S]*?<\/h[1-3]>/gi)) !== null && _a !== void 0 ? _a : [];
    return matches
        .map(function (item) { return stripHtml(item); })
        .filter(Boolean)
        .slice(0, limit);
}
function formatDateTime(value) {
    var date = new Date(value);
    if (Number.isNaN(date.getTime()))
        return "Vừa đăng";
    return new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}
function BlogDetailClient(_a) {
    var _this = this;
    var _b, _c, _d;
    var blog = _a.blog;
    var _e = (0, react_1.useState)("base"), fontSize = _e[0], setFontSize = _e[1];
    var contentSections = (0, react_1.useMemo)(function () { return extractHeadingList(blog.content); }, [blog.content]);
    var excerpt = (0, react_1.useMemo)(function () { return createExcerptFromHtml(blog.content); }, [blog.content]);
    var articleHtml = ((_b = blog.content) === null || _b === void 0 ? void 0 : _b.trim())
        ? blog.content
        : "<p>Nội dung bài viết đang được cập nhật.</p>";
    var publishedAtLabel = formatDateTime(blog.publishedAt || blog.createdAt);
    var _f = (0, react_1.useState)([]), comments = _f[0], setComments = _f[1];
    var _g = (0, react_1.useState)(false), loadingComments = _g[0], setLoadingComments = _g[1];
    var fetchComments = (0, react_1.useCallback)(function () { return __awaiter(_this, void 0, void 0, function () {
        var result, error_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    setLoadingComments(true);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, 4, 5]);
                    return [4 /*yield*/, (0, _lib_1.getComments)("BLOG", blog.id)];
                case 2:
                    result = _b.sent();
                    setComments((_a = result === null || result === void 0 ? void 0 : result.data) !== null && _a !== void 0 ? _a : []);
                    return [3 /*break*/, 5];
                case 3:
                    error_1 = _b.sent();
                    console.error("Lỗi khi lấy bình luận blog:", error_1);
                    setComments([]);
                    return [3 /*break*/, 5];
                case 4:
                    setLoadingComments(false);
                    return [7 /*endfinally*/];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [blog.id]);
    var fetchReplies = (0, react_1.useCallback)(function (commentId) { return __awaiter(_this, void 0, void 0, function () {
        var result, replies_1, error_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, _lib_1.getReplies)(commentId)];
                case 1:
                    result = _b.sent();
                    replies_1 = (_a = result === null || result === void 0 ? void 0 : result.data) !== null && _a !== void 0 ? _a : [];
                    setComments(function (prev) {
                        return prev.map(function (c) {
                            return c.id === commentId ? __assign(__assign({}, c), { replies: replies_1, _repliesCount: replies_1.length }) : c;
                        });
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.error("Lỗi khi lấy replies:", error_2);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); }, []);
    var handleCommentSubmit = (0, react_1.useCallback)(function (content) { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, _lib_1.postComment)({
                        content: content,
                        targetType: "BLOG",
                        targetId: blog.id,
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, fetchComments()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, response === null || response === void 0 ? void 0 : response.data];
            }
        });
    }); }, [blog.id, fetchComments]);
    var handleReplySubmit = (0, react_1.useCallback)(function (parentId, content) { return __awaiter(_this, void 0, void 0, function () {
        var response;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, _lib_1.postComment)({
                        content: content,
                        targetType: "BLOG",
                        targetId: blog.id,
                        parentId: parentId,
                    })];
                case 1:
                    response = _a.sent();
                    return [4 /*yield*/, fetchReplies(parentId)];
                case 2:
                    _a.sent();
                    return [2 /*return*/, response === null || response === void 0 ? void 0 : response.data];
            }
        });
    }); }, [blog.id, fetchReplies]);
    (0, react_1.useEffect)(function () {
        fetchComments();
    }, [fetchComments]);
    return (<main className="mx-auto max-w-[1240px] px-4 py-8 lg:px-6">
      <div className="mb-6 text-[13px] text-primary-light">
        <link_1.default href="/" className="hover:text-primary">
          Trang chủ
        </link_1.default>{" "}
        /{" "}
        <link_1.default href="/blog" className="hover:text-primary">
          Tin tức
        </link_1.default>{" "}
        {((_c = blog.category) === null || _c === void 0 ? void 0 : _c.name) ? (<>
            /{" "}
            <link_1.default href={"/blog?category=".concat(blog.category.slug, "&page=1")} className="hover:text-primary">
              {blog.category.name}
            </link_1.default>{" "}
          </>) : null}
        /{" "}
        <span className="text-primary line-clamp-1 inline-block align-bottom">
          {blog.title}
        </span>
      </div>

      <section className="mb-8">
        <BlogCategoryBar_1.default active={(_d = blog.category) === null || _d === void 0 ? void 0 : _d.slug} className="gap-5 border-b border-neutral pb-2 text-[14px]" itemClassName="pb-1 font-medium"/>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="overflow-hidden rounded-xl bg-neutral-light lg:col-span-5">
          <div className="relative aspect-[5/4] w-full">
            <image_1.default src={blog.thumbnail || "/images/avatar.png"} alt={blog.title} fill className="object-cover" sizes="(min-width: 1024px) 520px, 100vw"/>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="mb-2 text-[14px] text-primary-light">
            {blog.author.fullName || "Tác giả"} • {publishedAtLabel}
          </div>
          <h1 className="text-[34px] font-bold leading-[1.15] text-primary xl:text-[52px]">
            {blog.title}
          </h1>
          {excerpt ? (<p className="mt-4 max-w-[640px] text-[16px] leading-[1.7] text-primary-light">
              {excerpt}
            </p>) : null}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="sticky top-24">
            <div className="mb-3 grid grid-cols-3 gap-2">
              <button type="button" onClick={function () { return setFontSize("small"); }} className={"rounded-md border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide ".concat(fontSize === "small"
            ? "border-primary bg-primary text-white"
            : "border-neutral bg-white text-primary hover:border-primary-light")}>
                Nhỏ
              </button>
              <button type="button" onClick={function () { return setFontSize("base"); }} className={"rounded-md border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide ".concat(fontSize === "base"
            ? "border-primary bg-primary text-white"
            : "border-neutral bg-white text-primary hover:border-primary-light")}>
                Vừa
              </button>
              <button type="button" onClick={function () { return setFontSize("large"); }} className={"rounded-md border px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide ".concat(fontSize === "large"
            ? "border-primary bg-primary text-white"
            : "border-neutral bg-white text-primary hover:border-primary-light")}>
                Lớn
              </button>
            </div>

            <div className="overflow-hidden rounded-md bg-[#f3f4f6] text-sm">
              <div className="border-b border-[#e5e7eb] px-4 py-3 font-semibold text-primary">
                Nội dung bài viết
              </div>
              <ul className="px-4 py-2">
                {(contentSections.length > 0
            ? contentSections
            : ["Nội dung chính đang được cập nhật."]).map(function (item, index) { return (<li key={"".concat(blog.id, "-").concat(index, "-").concat(item)} className={"border-l py-2 pl-3 text-[13px] leading-5 ".concat(index === 0
                ? "border-primary font-medium text-primary"
                : "border-transparent text-primary-light")}>
                    {item}
                  </li>); })}
              </ul>
            </div>
          </div>
        </aside>

        <article className={"lg:col-span-9 ".concat(articleClassMap[fontSize], " text-primary")}>
          <div className="[&_h1]:mb-3 [&_h1]:text-[2.2em] [&_h1]:font-bold [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:text-[1.7em] [&_h2]:font-bold [&_h2]:leading-tight [&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[1.35em] [&_h3]:font-semibold [&_h3]:leading-tight [&_img]:my-5 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-xl [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-4 [&_ol]:list-decimal [&_ol]:pl-5 [&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-neutral [&_blockquote]:pl-4 [&_blockquote]:italic" dangerouslySetInnerHTML={{ __html: articleHtml }}/>
        </article>
      </section>

      <section className="mt-12">
        <div className="bg-neutral-light rounded-xl p-6">
          <Commentsection_1.default productId={blog.id} comments={comments} loading={loadingComments} onCommentSubmit={handleCommentSubmit} onReplySubmit={handleReplySubmit} onFetchReplies={fetchReplies}/>
        </div>
      </section>
    </main>);
}
