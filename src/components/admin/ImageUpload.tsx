import { useRef, useState } from "react";
import { img } from "@/data/seed";
import { uploadImage } from "@/lib/media.functions";
import { setState, uid, useStore } from "@/lib/store";

interface Props {
  name: string;
  defaultValue?: string;
  label?: string;
}

export function ImageUpload({ name, defaultValue = "", label = "Image" }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const media = useStore((s) => s.media);

  const preview = value ? img(value, 400, 300) : "";

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = await uploadImage({ data: { fileName: file.name, dataUrl } });
      setValue(result.url);
      setState((s) => ({
        ...s,
        media: [
          {
            id: uid(),
            url: result.url,
            fileName: file.name,
            alt: label,
            focalPoint: "center",
            createdAt: new Date().toISOString().slice(0, 10),
          },
          ...s.media,
        ],
      }));
    } catch (uploadError) {
      console.error(uploadError);
      const msg = uploadError instanceof Error ? uploadError.message : String(uploadError);
      setError(msg || "Upload failed. Try a smaller image or paste an image URL.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="border border-foreground/20 p-3 bg-stone-50">
      <div className="text-[10px] font-mono uppercase mb-2 text-muted-foreground">{label}</div>
      <input type="hidden" name={name} value={value} />
      <div className="flex gap-3 items-start">
        <div className="w-32 h-24 bg-stone-200 border border-foreground/10 overflow-hidden flex items-center justify-center text-[10px] text-muted-foreground shrink-0">
          {preview ? (
            <img src={preview} alt="" className="w-full h-full object-cover" />
          ) : (
            "No image"
          )}
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="border border-foreground px-3 py-1.5 text-[10px] font-bold uppercase"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload file"}
            </button>
            {value && (
              <button
                type="button"
                onClick={() => setValue("")}
                className="text-[10px] font-bold uppercase text-red-600 underline"
              >
                Remove
              </button>
            )}
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => void onFile(e.target.files?.[0] ?? null)}
          />
          <input
            type="text"
            list={`${name}-media-library`}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste Unsplash ID or image URL"
            className="w-full bg-white border border-foreground/20 px-2 py-1.5 font-mono text-[11px]"
          />
          <datalist id={`${name}-media-library`}>
            {media.map((asset) => (
              <option key={asset.id} value={asset.url}>
                {asset.fileName}
              </option>
            ))}
          </datalist>
          <div className="flex items-center justify-between gap-3 text-[10px] font-mono uppercase text-muted-foreground">
            <span>Uploads are saved to /uploads; IDs and URLs still work.</span>
          </div>
          {error && <div className="text-xs font-bold text-red-600">{error}</div>}
        </div>
      </div>
    </div>
  );
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
