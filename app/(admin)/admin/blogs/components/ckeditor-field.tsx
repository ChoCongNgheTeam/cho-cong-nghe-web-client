"use client";

import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  ChevronDown,
  Highlighter,
  ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  Loader2,
  Palette,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import apiRequest from "@/lib/api";
import { useToasty } from "@/components/Toast";

type CkEditorFieldProps = {
  value: string;
  onChange: (nextValue: string) => void;
};

type BlockType = "p" | "h1" | "h2" | "h3";

type ToolbarState = {
  block: BlockType;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikeThrough: boolean;
  justifyLeft: boolean;
  justifyCenter: boolean;
  justifyRight: boolean;
  justifyFull: boolean;
  orderedList: boolean;
  unorderedList: boolean;
  fontSize: string;
  hasImage: boolean;
};

type ImageAlign = "left" | "center" | "right" | "none";

const defaultToolbarState: ToolbarState = {
  block: "p",
  bold: false,
  italic: false,
  underline: false,
  strikeThrough: false,
  justifyLeft: false,
  justifyCenter: false,
  justifyRight: false,
  justifyFull: false,
  orderedList: false,
  unorderedList: false,
  fontSize: "",
  hasImage: false,
};

function isEditorEmpty(html: string): boolean {
  const plain = html
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  return plain.length === 0;
}

function safeQueryCommandState(command: string): boolean {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
}

function safeQueryCommandValue(command: string): string {
  try {
    const value = document.queryCommandValue(command);
    return typeof value === "string" ? value : String(value ?? "");
  } catch {
    return "";
  }
}

function normalizeBlockType(blockValue: string): BlockType {
  const normalized = blockValue.toLowerCase().replace(/[<>]/g, "").trim();
  if (normalized === "h1" || normalized.endsWith("h1")) return "h1";
  if (normalized === "h2" || normalized.endsWith("h2")) return "h2";
  if (normalized === "h3" || normalized.endsWith("h3")) return "h3";
  return "p";
}

export default function CkEditorField({ value, onChange }: CkEditorFieldProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const toast = useToasty();
  const [toolbarState, setToolbarState] = useState<ToolbarState>(defaultToolbarState);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const selectedImageRef = useRef<HTMLImageElement | null>(null);
  const [imageSize, setImageSize] = useState<string>("");
  const [imageAlign, setImageAlign] = useState<ImageAlign>("none");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === value) return;
    editorRef.current.innerHTML = value;
  }, [value]);

  const refreshToolbarState = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode;

    if (!anchorNode || !editor.contains(anchorNode)) {
      setToolbarState(defaultToolbarState);
      selectedImageRef.current = null;
      setImageSize("");
      setImageAlign("none");
      return;
    }

    const imageNode = anchorNode.nodeType === Node.ELEMENT_NODE
      ? (anchorNode as Element).closest("img")
      : (anchorNode.parentElement?.closest("img") ?? null);

    const resolvedImage =
      (imageNode && imageNode instanceof HTMLImageElement ? imageNode : null) ||
      (selectedImageRef.current instanceof HTMLImageElement ? selectedImageRef.current : null) ||
      (editor.querySelector("img") as HTMLImageElement | null);

    if (resolvedImage) {
      selectedImageRef.current = resolvedImage;
      setImageSize(resolvedImage.style.width || `${resolvedImage.width}`);

      const floatStyle = resolvedImage.style.float as ImageAlign;
      if (floatStyle === "left" || floatStyle === "right") {
        setImageAlign(floatStyle);
      } else if (resolvedImage.style.display === "block" && resolvedImage.style.margin === "0 auto") {
        setImageAlign("center");
      } else {
        setImageAlign("none");
      }
    } else {
      selectedImageRef.current = null;
      setImageSize("");
      setImageAlign("none");
    }

    setToolbarState({
      block: normalizeBlockType(safeQueryCommandValue("formatBlock")),
      bold: safeQueryCommandState("bold"),
      italic: safeQueryCommandState("italic"),
      underline: safeQueryCommandState("underline"),
      strikeThrough: safeQueryCommandState("strikeThrough"),
      justifyLeft: safeQueryCommandState("justifyLeft"),
      justifyCenter: safeQueryCommandState("justifyCenter"),
      justifyRight: safeQueryCommandState("justifyRight"),
      justifyFull: safeQueryCommandState("justifyFull"),
      orderedList: safeQueryCommandState("insertOrderedList"),
      unorderedList: safeQueryCommandState("insertUnorderedList"),
      fontSize: mapExecCommandFontSizeValue(safeQueryCommandValue("fontSize")),
      hasImage: Boolean(resolvedImage),
    });
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      refreshToolbarState();
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [refreshToolbarState]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const ensureFigureCaption = (img: HTMLImageElement) => {
    const parent = img.parentElement;
    if (!parent) return;

    // If already wrapped in a <figure>, keep it as-is.
    if (parent.tagName.toLowerCase() === "figure") return;

    const figure = document.createElement("figure");
    figure.style.margin = "0";
    figure.style.padding = "0";
    figure.style.textAlign = "center";

    const caption = document.createElement("figcaption");
    caption.contentEditable = "true";
    caption.dataset.placeholder = "Chú thích ảnh...";
    caption.className = "text-center text-sm text-slate-500 mt-1";
    caption.innerHTML = "<br>";

    parent.insertBefore(figure, img);
    figure.appendChild(img);
    figure.appendChild(caption);
  };

  const handleInput = () => {
    const nextValue = editorRef.current?.innerHTML ?? "";
    onChange(nextValue);
    refreshToolbarState();
  };

  const applyCommand = (command: string, commandValue?: string) => {
    focusEditor();
    document.execCommand(command, false, commandValue);
    handleInput();
    requestAnimationFrame(refreshToolbarState);
  };

  const mapExecCommandFontSizeValue = (value: string): string => {
    // document.execCommand("fontSize") uses a 1-7 scale; map it to a pixel value for UI.
    const mapping: Record<string, string> = {
      "1": "12px",
      "2": "14px",
      "3": "16px",
      "4": "18px",
      "5": "20px",
      "6": "24px",
      "7": "28px",
    };

    return mapping[value] ?? "";
  };

  const applyFontSize = (fontSize: string) => {
    focusEditor();
    // Use execCommand to insert a <font size="7"> wrapper, then convert it to inline style.
    document.execCommand("styleWithCSS", false, "true");
    document.execCommand("fontSize", false, "7");
    document.execCommand("styleWithCSS", false, "false");

    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const parent = range.commonAncestorContainer as HTMLElement | null;
      const fontNode = parent?.closest("font[size=7]") as HTMLElement | null;

      if (fontNode) {
        if (fontSize) {
          fontNode.style.fontSize = fontSize;
        }
        fontNode.removeAttribute("size");
      }
    }

    handleInput();
    requestAnimationFrame(refreshToolbarState);
  };

  const applyBlock = (block: BlockType) => {
    focusEditor();
    document.execCommand("formatBlock", false, block);
    handleInput();
    requestAnimationFrame(refreshToolbarState);
  };

  const handleAddLink = () => {
    const url = window.prompt("Nhập liên kết (ví dụ: https://google.com):");
    if (url) applyCommand("createLink", url);
  };

  const handleAddMedia = () => {
    imageInputRef.current?.click();
  };

  const uploadImageToServer = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", "blogs");

    const response = await apiRequest.post<{ message: string; data: { url: string } }>(
      "/upload",
      formData,
      { timeout: 60000, noAuth: true },
    );

    return response.data.url;
  };

  const handlePickImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const blobUrl = URL.createObjectURL(file);
    applyCommand("insertImage", blobUrl);

    // After inserting, keep the newly inserted image active so the size/alignment controls appear.
    requestAnimationFrame(() => {
      const insertedImage = editorRef.current?.querySelector("img:last-of-type");
      if (insertedImage instanceof HTMLImageElement) {
        ensureFigureCaption(insertedImage);

        selectedImageRef.current = insertedImage;
        setImageSize(insertedImage.style.width || `${insertedImage.width}`);

        const floatStyle = insertedImage.style.float as ImageAlign;
        if (floatStyle === "left" || floatStyle === "right") {
          setImageAlign(floatStyle);
        } else if (insertedImage.style.display === "block" && insertedImage.style.margin === "0 auto") {
          setImageAlign("center");
        } else {
          setImageAlign("none");
        }

        setToolbarState((current) => ({
          ...current,
          hasImage: true,
        }));
      }
    });

    // Upload image and replace blob src with server URL.
    (async () => {
      setIsUploading(true);
      try {
        const uploadedUrl = await uploadImageToServer(file);
        requestAnimationFrame(() => {
          const replacedImg = editorRef.current?.querySelector(`img[src="${blobUrl}"]`);
          if (replacedImg instanceof HTMLImageElement) {
            replacedImg.src = uploadedUrl;
            selectedImageRef.current = replacedImg;
            handleInput();
          }
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err ?? "Không thể upload ảnh");
        toast.error(message);
      } finally {
        setIsUploading(false);
        URL.revokeObjectURL(blobUrl);
      }
    })();

    event.currentTarget.value = "";
  };

  const updateSelectedImage = (updates: Partial<{ width: string; align: ImageAlign }>) => {
    const img = selectedImageRef.current;
    if (!img) return;

    if (updates.width !== undefined) {
      img.style.width = updates.width;
      img.style.height = "auto";
      setImageSize(updates.width);
    }

    if (updates.align !== undefined) {
      setImageAlign(updates.align);
      // Reset style cũ trước khi áp dụng style mới
      img.style.float = "";
      img.style.display = "";
      img.style.margin = "";

      if (updates.align === "center") {
        img.style.display = "block";
        img.style.margin = "0 auto";
      } else if (updates.align === "left") {
        img.style.float = "left";
        img.style.display = "inline";
        img.style.margin = "0 1rem 1rem 0";
      } else if (updates.align === "right") {
        img.style.float = "right";
        img.style.display = "inline";
        img.style.margin = "0 0 1rem 1rem";
      }
    }

    handleInput();
  };

  const toolbarGroupClass = "flex items-center gap-0.5 rounded-lg border border-slate-200 bg-slate-50 p-1";
  const toolbarBtnBaseClass =
    "inline-flex h-8 w-8 items-center justify-center rounded-md transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300";
  const getToolbarBtnClass = (isActive = false) =>
    `${toolbarBtnBaseClass} ${
      isActive
        ? "bg-slate-200 text-slate-900 shadow-sm"
        : "text-slate-600 hover:bg-slate-200 hover:text-slate-900 active:bg-slate-300"
    }`;

  const isEmpty = !isEditorFocused && isEditorEmpty(value);

  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.06)]">
      {/* Top Header: Add Media */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/70 px-4 py-2.5">
        <button
          type="button"
          onClick={handleAddMedia}
          disabled={isUploading}
          className={`inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
            isUploading ? "cursor-wait opacity-70" : ""
          }`}
        >
          {isUploading ? <Loader2 size={16} className="animate-spin text-blue-500" /> : <ImageIcon size={16} className="text-blue-500" />}
          {isUploading ? "Đang upload..." : "Thêm nội dung đa phương tiện"}
        </button>
        <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handlePickImage} />
      </div>

      {/* Main Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-white p-2">
        {/* Group 1: Text Style */}
        <div className={toolbarGroupClass}>
          <div className="relative flex items-center">
            <select
              className="h-8 cursor-pointer appearance-none bg-transparent pl-3 pr-8 text-[13px] font-semibold text-slate-700 outline-none"
              onChange={(e) => applyBlock(e.target.value as BlockType)}
              value={toolbarState.block}
            >
              <option value="p">Paragraph</option>
              <option value="h1">Heading 1</option>
              <option value="h2">Heading 2</option>
              <option value="h3">Heading 3</option>
            </select>
            <ChevronDown size={14} className="absolute right-2 pointer-events-none text-slate-400" />
          </div>
        </div>

        {/* Group 2: Basic Formatting */}
        <div className={toolbarGroupClass}>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.block === "p")}
            onClick={() => applyBlock("p")}
            title="Văn bản thường"
          >
            <Type size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.bold)}
            onClick={() => applyCommand("bold")}
            title="In đậm"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.italic)}
            onClick={() => applyCommand("italic")}
            title="In nghiêng"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.underline)}
            onClick={() => applyCommand("underline")}
            title="Gạch chân"
          >
            <Underline size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.strikeThrough)}
            onClick={() => applyCommand("strikeThrough")}
            title="Gạch ngang"
          >
            <Strikethrough size={16} />
          </button>

          <select
            value={toolbarState.fontSize}
            onChange={(e) => applyFontSize(e.target.value)}
            className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[13px] font-semibold text-slate-700 outline-none"
          >
            <option value="">Cỡ chữ</option>
            <option value="12px">12px</option>
            <option value="14px">14px</option>
            <option value="16px">16px</option>
            <option value="18px">18px</option>
            <option value="20px">20px</option>
            <option value="24px">24px</option>
          </select>
        </div>

        {/* Group 3: Alignment */}
        <div className={toolbarGroupClass}>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.justifyLeft)}
            onClick={() => applyCommand("justifyLeft")}
            title="Căn trái"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.justifyCenter)}
            onClick={() => applyCommand("justifyCenter")}
            title="Căn giữa"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.justifyRight)}
            onClick={() => applyCommand("justifyRight")}
            title="Căn phải"
          >
            <AlignRight size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.justifyFull)}
            onClick={() => applyCommand("justifyFull")}
            title="Căn đều"
          >
            <AlignJustify size={16} />
          </button>
        </div>

        {/* Group 4: Colors */}
        <div className={toolbarGroupClass}>
          <div className="relative group">
            <input
              type="color"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => applyCommand("foreColor", e.target.value)}
            />
            <button type="button" className={getToolbarBtnClass()} title="Màu chữ">
              <Palette size={16} />
            </button>
          </div>
          <div className="relative group">
            <input
              type="color"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => applyCommand("hiliteColor", e.target.value)}
            />
            <button type="button" className={getToolbarBtnClass()} title="Màu nền chữ">
              <Highlighter size={16} />
            </button>
          </div>
        </div>

        {/* Group 5: Lists & Links */}
        <div className={toolbarGroupClass}>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.orderedList)}
            onClick={() => applyCommand("insertOrderedList")}
            title="Danh sách số"
          >
            <ListOrdered size={16} />
          </button>
          <button
            type="button"
            className={getToolbarBtnClass(toolbarState.unorderedList)}
            onClick={() => applyCommand("insertUnorderedList")}
            title="Danh sách chấm"
          >
            <List size={16} />
          </button>
          <button type="button" className={getToolbarBtnClass()} onClick={handleAddLink} title="Chèn liên kết">
            <Link2 size={16} />
          </button>
        </div>

        {/* Group 6: Image Settings (size + alignment) */}
        {toolbarState.hasImage ? (
          <div className={toolbarGroupClass}>
            <select
              value={imageSize}
              onChange={(event) => updateSelectedImage({ width: event.target.value })}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-[13px] font-semibold text-slate-700 outline-none"
            >
              <option value="">Kích thước</option>
              <option value="100%">100%</option>
              <option value="75%">75%</option>
              <option value="50%">50%</option>
              <option value="25%">25%</option>
            </select>

            <button
              type="button"
              className={getToolbarBtnClass(imageAlign === "left")}
              onClick={() => updateSelectedImage({ align: "left" })}
              title="Căn trái"
            >
              <AlignLeft size={16} />
            </button>
            <button
              type="button"
              className={getToolbarBtnClass(imageAlign === "center")}
              onClick={() => updateSelectedImage({ align: "center" })}
              title="Căn giữa"
            >
              <AlignCenter size={16} />
            </button>
            <button
              type="button"
              className={getToolbarBtnClass(imageAlign === "right")}
              onClick={() => updateSelectedImage({ align: "right" })}
              title="Căn phải"
            >
              <AlignRight size={16} />
            </button>
          </div>
        ) : null}
      </div>

      {/* Editor Content Area */}
      <div className="relative grow bg-white">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          className="min-h-[340px] px-8 py-7 text-[16px] leading-8 text-slate-800 outline-none [&_h1]:mb-3 [&_h1]:text-[40px] [&_h1]:font-semibold [&_h1]:leading-tight [&_h2]:mb-3 [&_h2]:text-[32px] [&_h2]:font-semibold [&_h2]:leading-tight [&_h3]:mb-2 [&_h3]:text-[24px] [&_h3]:font-semibold [&_h3]:leading-tight [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-lg [&_p]:mb-3"
          onInput={handleInput}
          onFocus={() => {
            setIsEditorFocused(true);
            refreshToolbarState();
          }}
          onBlur={() => {
            setIsEditorFocused(false);
            refreshToolbarState();
          }}
          onKeyUp={refreshToolbarState}
          onMouseUp={refreshToolbarState}
          data-placeholder="Bắt đầu viết nội dung tin tức tại đây..."
        />

        {isEmpty && (
          <div className="pointer-events-none absolute left-8 top-7 select-none">
            {/* <p className="text-[40px] font-semibold leading-[1.1] text-slate-300">Heading 1</p> */}
            <p className="mt-3 text-[16px] text-slate-400">Bắt đầu viết nội dung tin tức tại đây...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        div[contenteditable]:empty:before {
          content: none;
        }

        /* Placeholder for caption */
        figcaption:empty:before {
          content: attr(data-placeholder);
          color: #94a3b8; /* slate-400 */
          font-size: 0.875rem;
        }

        figcaption:empty {
          min-height: 1.5rem;
        }
      `}</style>
    </div>
  );
}
