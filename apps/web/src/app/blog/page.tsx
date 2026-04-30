import { PublicNav } from "@/components/public-nav";
import { apiGet } from "@/lib/api";
import { fallbackBlogPosts, PublicBlogPost, withFallback } from "@/lib/public-fallbacks";

export default async function BlogPage() {
  const livePosts = await apiGet<PublicBlogPost[]>("/public/blog", []);
  const posts = withFallback(livePosts, fallbackBlogPosts);

  return (
    <main className="bg-[#f7fbfa]">
      <PublicNav />
      <section className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-sm font-bold uppercase text-brand-orange">Blog</p>
        <h1 className="mt-2 text-4xl font-bold text-brand-ink">Guides for learners and license work.</h1>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {posts.map((post) => (
            <article key={post.id} className="overflow-hidden rounded-md border border-black/10 bg-white shadow-soft">
              {post.featuredImageUrl ? (
                <img alt={post.title} className="h-60 w-full object-cover" src={post.featuredImageUrl} />
              ) : null}
              {post.featuredVideoUrl ? (
                <video className="h-60 w-full object-cover" controls src={post.featuredVideoUrl} />
              ) : null}
              <div className="p-6">
                <h2 className="text-2xl font-bold text-brand-ink">{post.title}</h2>
                <p className="mt-3 leading-7 text-black/65">{post.metaDescription}</p>
                <p className="mt-4 text-sm font-semibold text-brand-teal">{post.tags.join(" | ")}</p>
                {post.redirectUrl ? (
                  <a className="mt-4 inline-flex rounded-md bg-brand-orange px-4 py-2 text-sm font-semibold text-white" href={post.redirectUrl} target="_blank" rel="noreferrer">
                    Open Link
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
