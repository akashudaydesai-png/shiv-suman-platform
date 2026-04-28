import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  tags: string[];
  featuredImageUrl: string | null;
  featuredVideoUrl: string | null;
  redirectUrl: string | null;
};

export default async function BlogPage() {
  const posts = await apiGet<BlogPost[]>("/public/blog", []);
  return (
    <main>
      <PublicNav />
      <section className="mx-auto max-w-5xl px-5 py-14">
        <h1 className="text-4xl font-bold text-brand-ink">Blog</h1>
        <div className="mt-8 grid gap-5">
          {posts.map((post) => (
            <article key={post.id} className="rounded-md border border-brand-teal/20 bg-white p-6 shadow-soft">
              {post.featuredImageUrl ? (
                <img alt={post.title} className="mb-4 h-48 w-full rounded-md object-cover" src={post.featuredImageUrl} />
              ) : null}
              {post.featuredVideoUrl ? (
                <video className="mb-4 h-56 w-full rounded-md object-cover" controls src={post.featuredVideoUrl} />
              ) : null}
              <h2 className="text-2xl font-bold text-brand-ink">{post.title}</h2>
              <p className="mt-3 text-black/65">{post.metaDescription}</p>
              <p className="mt-4 text-sm font-semibold text-brand-teal">{post.tags.join(" | ")}</p>
              {post.redirectUrl ? (
                <a className="mt-4 inline-flex rounded-md bg-brand-orange px-4 py-2 text-sm font-semibold text-white" href={post.redirectUrl} target="_blank" rel="noreferrer">
                  Open Link
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
