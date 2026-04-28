"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  seoTitle: string | null;
  metaDescription: string | null;
  tags: string[];
  featuredImageUrl: string | null;
  featuredVideoUrl: string | null;
  redirectUrl: string | null;
  content: string;
  publishedAt: string | null;
};

const emptyForm = {
  title: "",
  slug: "",
  seoTitle: "",
  metaDescription: "",
  tags: "",
  featuredImageUrl: "",
  featuredVideoUrl: "",
  redirectUrl: "",
  content: ""
};

export default function BlogCmsPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("shiv_suman_token");
    return fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers ?? {}) }
    });
  }

  async function loadBlogs() {
    const response = await authFetch("/website-admin/blogs");
    if (response.ok) setBlogs(await response.json());
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  const selected = useMemo(() => blogs.find((blog) => blog.id === selectedId) ?? null, [blogs, selectedId]);

  useEffect(() => {
    if (!selected) {
      setForm(emptyForm);
      return;
    }
    setForm({
      title: selected.title,
      slug: selected.slug,
      seoTitle: selected.seoTitle ?? "",
      metaDescription: selected.metaDescription ?? "",
      tags: selected.tags.join(", "),
      featuredImageUrl: selected.featuredImageUrl ?? "",
      featuredVideoUrl: selected.featuredVideoUrl ?? "",
      redirectUrl: selected.redirectUrl ?? "",
      content: selected.content
    });
  }, [selected]);

  async function createBlog() {
    setMessage("Creating blog...");
    const response = await authFetch("/website-admin/blogs", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean)
      })
    });
    if (!response.ok) {
      setMessage("Blog create failed.");
      return;
    }
    setMessage("Blog created.");
    await loadBlogs();
  }

  async function updateBlog() {
    if (!selectedId) return;
    setMessage("Updating blog...");
    const response = await authFetch(`/website-admin/blogs/${selectedId}`, {
      method: "PATCH",
      body: JSON.stringify({
        ...form,
        tags: form.tags.split(",").map((item) => item.trim()).filter(Boolean)
      })
    });
    if (!response.ok) {
      setMessage("Blog update failed.");
      return;
    }
    setMessage("Blog updated.");
    await loadBlogs();
  }

  async function publish(selectedBlogId: string, publishNow: boolean) {
    const response = await authFetch(`/website-admin/blogs/${selectedBlogId}/${publishNow ? "publish" : "unpublish"}`, {
      method: "POST"
    });
    if (!response.ok) {
      setMessage("Publish action failed.");
      return;
    }
    setMessage(publishNow ? "Blog published." : "Blog unpublished.");
    await loadBlogs();
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Blog CMS</h1>
        <p className="mt-2 text-black/65">Create and manage blog posts with image, video, text, and redirect links.</p>
      </section>

      <section className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <div className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
          <button className="w-full rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={() => { setSelectedId(null); setForm(emptyForm); }} type="button">
            New Blog
          </button>
          <div className="mt-4 grid gap-3">
            {blogs.map((blog) => (
              <button
                key={blog.id}
                className={`rounded-md border p-3 text-left ${selectedId === blog.id ? "border-brand-teal bg-brand-mist" : "border-black/10 bg-white"}`}
                onClick={() => setSelectedId(blog.id)}
                type="button"
              >
                <p className="font-semibold text-brand-ink">{blog.title}</p>
                <p className="mt-1 text-xs font-semibold text-black/50">{blog.publishedAt ? "Published" : "Draft"}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
          <div className="grid gap-4 md:grid-cols-2">
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Blog title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="SEO title" value={form.seoTitle} onChange={(e) => setForm({ ...form, seoTitle: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Meta description" value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Tags comma separated" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Featured image URL" value={form.featuredImageUrl} onChange={(e) => setForm({ ...form, featuredImageUrl: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Featured video URL" value={form.featuredVideoUrl} onChange={(e) => setForm({ ...form, featuredVideoUrl: e.target.value })} />
            <input className="rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Redirect link URL" value={form.redirectUrl} onChange={(e) => setForm({ ...form, redirectUrl: e.target.value })} />
            <textarea className="min-h-40 rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Blog content" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            {!selectedId ? (
              <button className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white" onClick={createBlog} type="button">Create Blog</button>
            ) : (
              <>
                <button className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white" onClick={updateBlog} type="button">Save Changes</button>
                <button className="rounded-md bg-brand-orange px-5 py-3 font-semibold text-white" onClick={() => publish(selectedId, true)} type="button">Publish</button>
                <button className="rounded-md border border-brand-orange px-5 py-3 font-semibold text-brand-orange" onClick={() => publish(selectedId, false)} type="button">Unpublish</button>
              </>
            )}
          </div>
          {message ? <p className="mt-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
        </div>
      </section>
    </div>
  );
}

