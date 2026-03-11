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
  Palette,
  Strikethrough,
  Type,
  Underline,
} from "lucide-react";
import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";

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
};

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
  const [toolbarState, setToolbarState] = useState<ToolbarState>(defaultToolbarState);
  const [isEditorFocused, setIsEditorFocused] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;
    if (editorRef.current.innerHTML === value) return;
    editorRef.current.innerHTML = value;
  }, [value]);

  const refreshToolbarState = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection?.anchorNode || !editor.contains(selection.anchorNode)) {
      setToolbarState(defaultToolbarState);
      return;
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

  const handlePickImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const imageUrl = URL.createObjectURL(file);
    applyCommand("insertImage", imageUrl);
    event.currentTarget.value = "";
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
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-[13px] font-semibold text-slate-700 transition hover:bg-slate-50 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300"
        >
          <ImageIcon size={16} className="text-blue-500" />
          Thêm nội dung đa phương tiện
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
            <p className="text-[40px] font-semibold leading-[1.1] text-slate-300">Heading 1</p>
            <p className="mt-3 text-[16px] text-slate-400">Bắt đầu viết nội dung tin tức tại đây...</p>
          </div>
        )}
      </div>

      <style jsx>{`
        div[contenteditable]:empty:before {
          content: none;
        }
      `}</style>
    </div>
  );
}
