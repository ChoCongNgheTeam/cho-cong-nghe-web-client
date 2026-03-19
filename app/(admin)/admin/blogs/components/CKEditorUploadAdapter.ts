/**
 * CKEditorUploadAdapter
 *
 * Custom upload adapter cho CKEditor 5.
 * Dùng uploadEditorImage() từ _libs/products — đảm bảo
 * gọi đúng baseURL của apiRequest (http://localhost:5000/api/v1/upload).
 */

import { uploadEditorImage } from "@/(admin)/_lib/api";

interface CKLoader {
  file: Promise<File>;
}

class CKEditorUploadAdapter {
  private loader: CKLoader;
  private folder: "products" | "avatars" | "banners" | "blogs" | "documents";
  private aborted = false;

  constructor(loader: CKLoader, folder: "products" | "avatars" | "banners" | "blogs" | "documents" = "products") {
    this.loader = loader;
    this.folder = folder;
  }

  async upload(): Promise<{ default: string }> {
    const file = await this.loader.file;
    if (this.aborted) throw new Error("Upload bị hủy");
    const result = await uploadEditorImage(file, this.folder);
    return { default: result.url };
  }

  abort(): void {
    this.aborted = true;
  }
}

/**
 * createUploadAdapterPlugin
 *
 * Factory plugin — truyền vào extraPlugins[] của CKEditor config.
 * CKEditor sẽ gọi hàm này để tạo adapter cho mỗi lần upload ảnh.
 *
 * Ví dụ:
 *   extraPlugins: [createUploadAdapterPlugin("products")]
 */
export function createUploadAdapterPlugin(folder: "products" | "avatars" | "banners" | "blogs" | "documents" = "products") {
  return function UploadAdapterPlugin(editor: any) {
    editor.plugins.get("FileRepository").createUploadAdapter = (loader: CKLoader) => new CKEditorUploadAdapter(loader, folder);
  };
}
