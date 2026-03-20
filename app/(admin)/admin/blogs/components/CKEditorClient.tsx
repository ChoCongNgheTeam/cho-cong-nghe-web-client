"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Paragraph,
  Heading,
  BlockQuote,
  List,
  TodoList,
  Link,
  AutoLink,
  Image,
  ImageUpload,
  ImageResize,
  ImageStyle,
  ImageToolbar,
  ImageCaption,
  MediaEmbed,
  Table,
  TableToolbar,
  TableProperties,
  TableCellProperties,
  HorizontalLine,
  CodeBlock,
  Indent,
  IndentBlock,
  Alignment,
  FontSize,
  FontColor,
  FontBackgroundColor,
  RemoveFormat,
  Undo,
  FindAndReplace,
  WordCount,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";
import { createUploadAdapterPlugin } from "./CKEditorUploadAdapter";

interface CKEditorClientProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: number;
  /** Cloudinary folder nhận ảnh upload, mặc định "products" */
  uploadFolder?: string;
}

export default function CKEditorClient({ value, onChange, placeholder = "Nhập nội dung...", minHeight = 400, uploadFolder = "products" }: CKEditorClientProps) {
  return (
    <div className="ck-editor-wrapper rounded-xl overflow-hidden border border-neutral" style={{ "--ck-min-height": `${minHeight}px` } as React.CSSProperties}>
      <style>{`
        .ck-editor-wrapper .ck-editor__editable {
          min-height: ${minHeight}px;
          font-size: 14px;
          line-height: 1.7;
          padding: 1rem 1.25rem;
        }
        .ck-editor-wrapper .ck.ck-editor__top .ck-sticky-panel .ck-toolbar {
          border-radius: 0;
          border-top: none;
          border-left: none;
          border-right: none;
          background: var(--color-neutral-light, #fafafa);
          border-color: var(--color-neutral, #e5e7eb);
        }
        .ck-editor-wrapper .ck.ck-editor__main > .ck-editor__editable {
          border: none;
          box-shadow: none;
          background: var(--color-neutral-light, #fafafa);
        }
        .ck-editor-wrapper .ck.ck-editor__main > .ck-editor__editable:focus {
          box-shadow: none;
        }
      `}</style>

      <CKEditor
        editor={ClassicEditor}
        data={value}
        onChange={(_, editor) => onChange(editor.getData())}
        config={{
          licenseKey: "GPL",
          placeholder,

          // ── Upload adapter ───────────────────────────────────────────────
          // Phải khai báo qua extraPlugins để CKEditor khởi tạo FileRepository
          // trước khi adapter được gắn vào.
          extraPlugins: [createUploadAdapterPlugin(uploadFolder as "products" | "avatars" | "banners" | "blogs" | "documents")],

          plugins: [
            Essentials,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            Code,
            Paragraph,
            Heading,
            BlockQuote,
            List,
            TodoList,
            Link,
            AutoLink,
            Image,
            ImageUpload, // kích hoạt nút "Insert Image" + kéo thả
            ImageResize,
            ImageStyle,
            ImageToolbar,
            ImageCaption,
            MediaEmbed,
            Table,
            TableToolbar,
            TableProperties,
            TableCellProperties,
            HorizontalLine,
            CodeBlock,
            Indent,
            IndentBlock,
            Alignment,
            FontSize,
            FontColor,
            FontBackgroundColor,
            RemoveFormat,
            Undo,
            FindAndReplace,
            WordCount,
          ],

          toolbar: {
            items: [
              "undo",
              "redo",
              "|",
              "heading",
              "|",
              "bold",
              "italic",
              "underline",
              "strikethrough",
              "|",
              "fontSize",
              "fontColor",
              "fontBackgroundColor",
              "removeFormat",
              "|",
              "bulletedList",
              "numberedList",
              "todoList",
              "outdent",
              "indent",
              "|",
              "alignment",
              "|",
              "link",
              "insertImage",
              "mediaEmbed",
              "blockQuote",
              "insertTable",
              "horizontalLine",
              "codeBlock",
              "|",
              "findAndReplace",
            ],
            shouldNotGroupWhenFull: false,
          },

          heading: {
            options: [
              { model: "paragraph", title: "Đoạn văn", class: "ck-heading_paragraph" },
              { model: "heading1", view: "h1", title: "Tiêu đề 1", class: "ck-heading_heading1" },
              { model: "heading2", view: "h2", title: "Tiêu đề 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Tiêu đề 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Tiêu đề 4", class: "ck-heading_heading4" },
            ],
          },

          image: {
            toolbar: ["imageStyle:inline", "imageStyle:block", "imageStyle:side", "|", "toggleImageCaption", "imageTextAlternative", "|", "resizeImage"],
          },

          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells", "tableProperties", "tableCellProperties"],
          },

          codeBlock: {
            languages: [
              { language: "plaintext", label: "Plain text" },
              { language: "javascript", label: "JavaScript" },
              { language: "typescript", label: "TypeScript" },
              { language: "html", label: "HTML" },
              { language: "css", label: "CSS" },
              { language: "python", label: "Python" },
              { language: "php", label: "PHP" },
              { language: "java", label: "Java" },
              { language: "sql", label: "SQL" },
              { language: "bash", label: "Bash" },
            ],
          },

          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
          },

          fontSize: {
            options: [10, 11, 12, 13, 14, 16, 18, 20, 24, 28, 32],
            supportAllValues: false,
          },
        }}
      />
    </div>
  );
}
