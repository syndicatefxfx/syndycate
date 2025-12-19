import BlogPostClient from "@/components/BlogPostClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getPostBySlug } from "@/data/blogPosts";

const FALLBACK_META = {
  title: "SNDCT Blog",
  description: "SNDCT articles and insights.",
  ogImage: null,
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  if (!slug) return FALLBACK_META;

  let title = FALLBACK_META.title;
  let description = FALLBACK_META.description;
  let ogImage = FALLBACK_META.ogImage;

  const fallback = getPostBySlug(slug);
  if (fallback) {
    title = fallback.title || title;
    description = fallback.excerpt || fallback.subtitle || description;
    ogImage = fallback.image || ogImage;
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: enData } = await supabase
      .from("blog_posts")
      .select("meta_title, meta_description, og_image, title, excerpt, locale")
      .eq("slug", slug)
      .eq("locale", "en")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsLast: true })
      .limit(1);

    const { data: anyData } = await supabase
      .from("blog_posts")
      .select("meta_title, meta_description, og_image, title, excerpt, locale")
      .eq("slug", slug)
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsLast: true })
      .limit(1);

    const record = enData?.[0] || anyData?.[0];
    if (record) {
      title = record.meta_title || record.title || title;
      description = record.meta_description || record.excerpt || description;
      ogImage = record.og_image || ogImage;
    }
  } catch (err) {
    console.warn("[blog meta] failed to load", err?.message || err);
  }

  return {
    title,
    description,
    openGraph: ogImage ? { images: [{ url: ogImage }] } : undefined,
  };
}

export default async function BlogPostPage({ params }) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
