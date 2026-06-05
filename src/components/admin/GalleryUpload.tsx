import { useRef, useState } from "react";
import { img } from "@/data/seed";
import { uploadImage } from "@/lib/media.functions";
import { setState, uid, useStore } from "@/lib/store";

interface Props {
  name: string;
  defaultValue?: string[];
  label?: string;
}

export function GalleryUpload({ name, defaultValue = [], label = "Gallery images" }: Props) {
  const [images, setImages] = useState(defaultValue);
  const [entry, setEntry] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const media = useStore((s) => s.media);

  const addImage = (value: string) => {
    const next = value.trim();
    if (!next) return;
    setImages((current) => (current.includes(next) ? current : [...current, next]));
    setEntry("");
  };

  const onFile = async (file: File | null) => {
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const dataUrl = await readFileAsDataUrl(file);
      const result = await uploadImage({ data: { fileName: file.name, dataUrl } });
      addImage(result.url);
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

  const move = (index: number, direction: -1 | 1) => {
    setImages((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="border border-foreground/20 p-3 bg-stone-50">
      <div className="text-[10px] font-mono uppercase mb-2 text-muted-foreground">{label}</div>
      <input type="hidden" name={name} value={images.join("\n")} />

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="border border-foreground px-3 py-1.5 text-[10px] font-bold uppercase"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Upload files"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []);
            void files.reduce(
              (promise, file) => promise.then(() => onFile(file)),
              Promise.resolve(),
            );
          }}
        />
        <input
          type="text"
          list={`${name}-media-library`}
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Paste image URL or pick from library"
          className="min-w-[220px] flex-1 bg-white border border-foreground/20 px-2 py-1.5 font-mono text-[11px]"
        />
        <button
          type="button"
          onClick={() => addImage(entry)}
          className="border border-foreground px-3 py-1.5 text-[10px] font-bold uppercase"
        >
          Add image
        </button>
        <datalist id={`${name}-media-library`}>
          {media.map((asset) => (
            <option key={asset.id} value={asset.url}>
              {asset.fileName}
            </option>
          ))}
        </datalist>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((image, index) => (
            <div key={`${image}-${index}`} className="border border-foreground/20 bg-white">
              <div className="aspect-[4/3] bg-stone-200 overflow-hidden">
                <img
                  src={img(image, 420, 320)}
                  alt=""
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
              <div className="p-2 space-y-2">
                <div className="font-mono text-[10px] text-muted-foreground truncate">{image}</div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => move(index, -1)}
                    disabled={index === 0}
                    className="text-[10px] font-bold uppercase underline disabled:opacity-30"
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    onClick={() => move(index, 1)}
                    disabled={index === images.length - 1}
                    className="text-[10px] font-bold uppercase underline disabled:opacity-30"
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() => setImages((current) => current.filter((_, i) => i !== index))}
                    className="text-[10px] font-bold uppercase text-red-600 underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border border-dashed border-foreground/30 p-6 text-center text-sm text-muted-foreground">
          No gallery images yet.
        </div>
      )}

      <div className="mt-3 text-[10px] font-mono uppercase text-muted-foreground">
        Uploads are saved to /uploads; image IDs and URLs still work.
      </div>
      {error && <div className="mt-2 text-xs font-bold text-red-600">{error}</div>}
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
