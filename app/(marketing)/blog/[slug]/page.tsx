// app/blog/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";

export const revalidate = 300;

type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  state_code: string | null;
  tags: string[] | null;
  cover_image_url: string | null;
  seo_title: string | null;
  seo_description: string | null;
  status: "draft" | "published" | "archived" | string;
  published_at: string | null;
  updated_at: string | null;
  reading_minutes: number | null;
  content_mdx: string;
};

function supabasePublic() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Missing Supabase env vars.");
  return createClient(url, anon, { auth: { persistSession: false } });
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const sb = supabasePublic();

  const allowDraft = process.env.NODE_ENV !== "production";

  let q = sb
    .from("blog_posts")
    .select(
      "slug,title,excerpt,category,state_code,tags,cover_image_url,seo_title,seo_description,status,published_at,updated_at,reading_minutes,content_mdx"
    )
    .eq("slug", slug)
    .limit(1);

  if (!allowDraft) q = q.eq("status", "published");

  const { data, error } = await q.maybeSingle<BlogPost>();
  if (error) return null;
  if (!data) return null;

  // Guard: don’t show drafts in prod
  if (!allowDraft && data.status !== "published") return null;

  return data;
}

async function getRelated(post: BlogPost): Promise<Pick<BlogPost, "slug" | "title" | "category" | "reading_minutes" | "published_at">[]> {
  const sb = supabasePublic();
  const { data } = await sb
    .from("blog_posts")
    .select("slug,title,category,reading_minutes,published_at")
    .eq("status", "published")
    .neq("slug", post.slug)
    .eq("category", post.category)
    .order("published_at", { ascending: false })
    .limit(3);

  return (data as any) ?? [];
}

function fmtDate(iso?: string | null) {
  if (!iso) return null;
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return null;
  return dt.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return {};

  const title = post.seo_title || post.title;
  const description = post.seo_description || post.excerpt;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      images: post.cover_image_url ? [{ url: post.cover_image_url }] : undefined,
    },
  };
}

const mdxComponents = {
  a: (props: any) => (
    <a
      {...props}
      className="font-medium text-slate-900 underline decoration-slate-300 underline-offset-4 hover:decoration-slate-500"
      target={props.href?.startsWith("http") ? "_blank" : undefined}
      rel={props.href?.startsWith("http") ? "noreferrer" : undefined}
    />
  ),
  blockquote: (props: any) => (
    <blockquote
      {...props}
      className="my-6 border-l-2 border-slate-300 bg-slate-50 px-4 py-3 text-slate-700"
    />
  ),
};

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (!post) return notFound();

  const related = await getRelated(post);

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-slate-200">
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
          <Link href="/blog" className="text-sm font-semibold text-slate-700 hover:underline">
            ← Back to Blog
          </Link>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span
              className="rounded-full px-2.5 py-1 text-xs font-medium text-slate-900"
              style={{
                background: "rgb(var(--brand-soft) / 0.22)",
                border: "1px solid rgb(var(--brand) / 0.14)",
              }}
            >
              {post.category}
            </span>
            {post.state_code ? (
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                {post.state_code}
              </span>
            ) : null}
            {post.reading_minutes ? (
              <span className="text-xs text-slate-500">{post.reading_minutes} min</span>
            ) : null}
          </div>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            {post.title}
          </h1>

          <p className="mt-4 text-base leading-relaxed text-slate-600">{post.excerpt}</p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            {post.published_at ? <span>Published {fmtDate(post.published_at)}</span> : null}
            {post.updated_at ? <span>• Updated {fmtDate(post.updated_at)}</span> : null}
          </div>
        </div>
      </header>

      {post.cover_image_url ? (
        <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.cover_image_url}
            alt=""
            className="h-auto w-full rounded-3xl border border-slate-200 object-cover"
            loading="lazy"
          />
        </div>
      ) : null}

      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <article className="prose prose-slate max-w-none prose-headings:tracking-tight prose-a:no-underline">
          <MDXRemote
            source={post.content_mdx}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
            components={mdxComponents as any}
          />
        </article>

        {/* Soft CTA band */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-900">Want the clean setup checklist?</div>
              <div className="mt-1 text-sm text-slate-600">
                The fastest way to get employer-ready and keep records clean from day one.
              </div>
            </div>
            <Link
              href="/resources/employer-setup-checklist"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Download checklist
            </Link>
          </div>
        </div>

        {related.length ? (
          <div className="mt-12">
            <h2 className="text-lg font-semibold text-slate-900">Related posts</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                >
                  <div className="text-xs text-slate-500">{r.category}</div>
                  <div className="mt-2 text-sm font-semibold text-slate-900">{r.title}</div>
                  <div className="mt-3 text-xs text-slate-500">
                    {r.reading_minutes ? `${r.reading_minutes} min` : null}
                    {r.published_at ? ` • ${fmtDate(r.published_at)}` : ""}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
