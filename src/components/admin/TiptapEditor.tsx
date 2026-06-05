import { lazy, Suspense, useEffect, useRef } from "react";
import { adminInput } from "@/components/admin/AdminLayout";

// The inner editor is lazy-loaded so Tiptap never runs on the server
const TiptapEditorInner = lazy(() => import("./TiptapEditorInner"));

export function TiptapEditor({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const hiddenRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input ref={hiddenRef} type="hidden" name={name} defaultValue={defaultValue} />
      <div className={`${adminInput} p-0 overflow-hidden`}>
        <Suspense
          fallback={
            <div className="min-h-[320px] px-4 py-3 text-sm text-muted-foreground animate-pulse">
              Loading editor…
            </div>
          }
        >
          <TiptapEditorInner
            defaultValue={defaultValue}
            onUpdate={(html) => {
              if (hiddenRef.current) hiddenRef.current.value = html;
            }}
          />
        </Suspense>
      </div>
    </div>
  );
}
