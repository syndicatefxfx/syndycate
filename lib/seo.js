import { DEFAULT_LANGUAGE } from "@/lib/i18n/dictionaries";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const FALLBACK_META = {
  title: "SNDCT",
  description: "THE NEW ERA OF TRADING IN ISRAEL",
  h1: "THE NEW ERA OF TRADING IN ISRAEL",
  ogImage: null,
};

export async function getPageMetadata({
  slug,
  locale = DEFAULT_LANGUAGE,
} = {}) {
  if (!slug) {
    return FALLBACK_META;
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from("pages")
      .select("meta_title, meta_description, meta_h1, og_image")
      .eq("slug", slug)
      .eq("locale", locale)
      .eq("status", "published")
      .limit(1);

    if (error) {
      console.warn("[seo] failed to load metadata", { error });
      return FALLBACK_META;
    }

    const record = data?.[0];
    if (!record) {
      return FALLBACK_META;
    }

    return {
      title: record.meta_title ?? FALLBACK_META.title,
      description: record.meta_description ?? FALLBACK_META.description,
      h1: record.meta_h1 ?? FALLBACK_META.h1,
      ogImage: record.og_image ?? FALLBACK_META.ogImage,
    };
  } catch (err) {
    console.error("[seo] metadata fetch error", err);
    return FALLBACK_META;
  }
}
