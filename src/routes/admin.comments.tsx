import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  AdminHeader,
  AdminTable,
  AdminStatus,
  adminBtn,
  adminBtnOutline,
} from "@/components/admin/AdminLayout";
import {
  adminGetAllComments,
  adminApproveComment,
  adminDeleteComment,
} from "@/lib/comments.functions";
import type { ArticleComment } from "@/lib/db.server";

export const Route = createFileRoute("/admin/comments")({
  component: AdminComments,
  loader: async () => {
    const comments = await adminGetAllComments();
    return { comments };
  },
});

function AdminComments() {
  const { comments: initial } = Route.useLoaderData();
  const [comments, setComments] = useState<ArticleComment[]>(initial);

  const refresh = async () => {
    const updated = await adminGetAllComments();
    setComments(updated);
  };

  const toggle = async (id: string, approved: boolean) => {
    await adminApproveComment({ data: { id, approved } });
    await refresh();
  };

  const del = async (id: string) => {
    if (!confirm("Delete this comment?")) return;
    await adminDeleteComment({ data: { id } });
    await refresh();
  };

  const pending = comments.filter((c) => !c.approved).length;

  return (
    <div>
      <AdminHeader
        title="Comments"
        subtitle={`${comments.length} total · ${pending} pending moderation`}
      />
      <div className="p-6 md:p-10">
        {comments.length === 0 ? (
          <div className="border border-dashed border-foreground/30 p-12 text-center text-sm text-muted-foreground">
            No comments yet.
          </div>
        ) : (
          <AdminTable
            headers={["Comment", "Article ID", "Status", "Date", "Actions"]}
            rows={comments.map((c) => [
              <div>
                <div className="font-bold text-sm">{c.authorName}</div>
                <div className="text-xs text-muted-foreground mb-1">{c.authorEmail}</div>
                <p className="text-sm leading-snug line-clamp-3">{c.body}</p>
              </div>,
              <span className="font-mono text-xs text-muted-foreground">{c.articleId}</span>,
              <AdminStatus status={c.approved ? "published" : "pending"} />,
              <span className="font-mono text-xs">
                {new Date(c.createdAt).toLocaleDateString("en-GB")}
              </span>,
              <div className="flex gap-2 flex-wrap">
                {c.approved ? (
                  <button
                    onClick={() => toggle(c.id, false)}
                    className={adminBtnOutline + " text-[10px]"}
                  >
                    Unpublish
                  </button>
                ) : (
                  <button onClick={() => toggle(c.id, true)} className={adminBtn + " text-[10px]"}>
                    Approve
                  </button>
                )}
                <button
                  onClick={() => del(c.id)}
                  className="text-[10px] font-bold uppercase text-red-600 underline"
                >
                  Delete
                </button>
              </div>,
            ])}
          />
        )}
      </div>
    </div>
  );
}
