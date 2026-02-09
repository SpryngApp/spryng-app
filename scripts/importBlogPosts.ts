// scripts/importBlogPosts.ts
import dotenv from "dotenv";

// IMPORTANT: Next.js loads .env.local automatically for the app,
// but standalone scripts (tsx/node) often do not. Load it explicitly.
dotenv.config({ path: ".env.local" });
dotenv.config(); // fallback for .env

import fs from "node:fs/promises";
import path from "node:path";
import fg from "fast-glob";
import matter from "gray-matter";
import { createClient } from "@supabase/supabase-js";

type Category =
  | "Employer Setup"
  | "Audit-Ready Records"
  | "State Guides"
  | "Paying Helpers"
  | "Templates"
  | "Product Updates"
  | "Stories";

type Status = "draft" | "published" | "archived";

type Frontmatter = {
  title: string;
  slug: string;
  excerpt: string;
  category: Category;
  state_code: string | null;
  tags: string[];
  cover_image_url: string | null;
  seo_title: string;
  seo_description: string;
  published_at: string | null;
  updated_at: string | null;
  status: Status;
  reading_minutes: number;
};

function must<T>(v: T | undefined | null, msg: string): T {
  if (v === undefined || v === null) throw new Error(msg);
  return v;
}

function normalizeNull(v: any) {
  if (v === "null" || v === "" || v === undefined) return null;
  return v;
}

function isIsoOrNull(v: any) {
  if (v === null) return true;
  const d = new Date(v);
  return !Number.isNaN(d.getTime());
}

function isCategory(v: any): v is Category {
  return (
    v === "Employer Setup" ||
    v === "Audit-Ready Records" ||
    v === "State Guides" ||
    v === "Paying Helpers" ||
    v === "Templates" ||
    v === "Product Updates" ||
    v === "Stories"
  );
}

function isStatus(v: any): v is Status {
  return v === "draft" || v === "published" || v === "archived";
}

function validateFrontmatter(fm: any, file: string): Frontmatter {
  const title = must(fm.title, `${file}: missing title`);
  const slug = must(fm.slug, `${file}: missing slug`);
  const excerpt = must(fm.excerpt, `${file}: missing excerpt`);
  const categoryRaw = must(fm.category, `${file}: missing category`);

  if (!isCategory(categoryRaw)) {
    throw new Error(
      `${file}: category must be one of: Employer Setup | Audit-Ready Records | State Guides | Paying Helpers | Templates | Product Updates | Stories`
    );
  }
  const category: Category = categoryRaw;

  const state_code = normalizeNull(fm.state_code);
  const cover_image_url = normalizeNull(fm.cover_image_url);

  const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
  const seo_title = (fm.seo_title ?? title) as string;
  const seo_description = (fm.seo_description ?? excerpt) as string;

  const published_at = normalizeNull(fm.published_at);
  const updated_at = normalizeNull(fm.updated_at);

  const statusRaw = fm.status ?? "draft";
  if (!isStatus(statusRaw)) {
    throw new Error(`${file}: status must be draft | published | archived`);
  }
  const status: Status = statusRaw;

  const reading_minutes = Number(fm.reading_minutes ?? 0);

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`${file}: slug must be kebab-case`);
  }
  if (state_code !== null && !/^[A-Z]{2}$/.test(state_code)) {
    throw new Error(`${file}: state_code must be 2-letter uppercase or null`);
  }
  if (!isIsoOrNull(published_at)) {
    throw new Error(`${file}: published_at must be ISO or null`);
  }
  if (!isIsoOrNull(updated_at)) {
    throw new Error(`${file}: updated_at must be ISO or null`);
  }
  if (!Number.isFinite(reading_minutes) || reading_minutes < 0) {
    throw new Error(`${file}: reading_minutes must be a non-negative number`);
  }

  return {
    title,
    slug,
    excerpt,
    category,
    state_code,
    tags,
    cover_image_url,
    seo_title,
    seo_description,
    published_at,
    updated_at,
    status,
    reading_minutes,
  };
}

async function main() {
  // ✅ Load env vars (from .env.local or .env) and strongly type them
  const supabaseUrl = must(
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL,
    "Missing NEXT_PUBLIC_SUPABASE_URL (or SUPABASE_URL)"
  );
  const serviceKey = must(
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    "Missing SUPABASE_SERVICE_ROLE_KEY"
  );

  const supabase = createClient(supabaseUrl, serviceKey);

  const files = await fg(["content/blog/**/*.mdx"], { dot: false });
  if (!files.length) {
    console.log("No MDX files found in content/blog/**/*.mdx");
    process.exit(0);
  }

  const records: Array<{
    slug: string;
    title: string;
    excerpt: string;
    category: Category;
    state_code: string | null;
    tags: string[];
    cover_image_url: string | null;
    seo_title: string;
    seo_description: string;
    status: Status;
    published_at: string | null;
    updated_at: string | null;
    reading_minutes: number;
    content_mdx: string;
  }> = [];

  for (const file of files) {
    const abs = path.resolve(file);
    const raw = await fs.readFile(abs, "utf8");
    const parsed = matter(raw);

    const fm = validateFrontmatter(parsed.data, file);
    const body = parsed.content.trim();

    if (!body) throw new Error(`${file}: content body is empty`);

    records.push({
      slug: fm.slug,
      title: fm.title,
      excerpt: fm.excerpt,
      category: fm.category,
      state_code: fm.state_code,
      tags: fm.tags,
      cover_image_url: fm.cover_image_url,
      seo_title: fm.seo_title,
      seo_description: fm.seo_description,
      status: fm.status,
      published_at: fm.published_at,
      updated_at: fm.updated_at,
      reading_minutes: fm.reading_minutes,
      content_mdx: body,
    });
  }

  const { error } = await supabase
    .from("blog_posts")
    .upsert(records, { onConflict: "slug" });

  if (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }

  console.log(`Imported/updated ${records.length} posts ✅`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
