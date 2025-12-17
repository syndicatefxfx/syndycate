"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import blogStyles from "./BlogAdmin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict, useAdminLocale } from "@/components/AdminLocaleProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

const RichTextEditor = dynamic(
  () => import("@/components/admin/RichTextEditor"),
  {
    ssr: false,
    loading: () => <div className={styles.muted}>Loading editor...</div>,
  }
);

const locales = [
  { code: "en", label: "English" },
  { code: "he", label: "Hebrew" },
];

const emptyPost = {
  id: null,
  slug: "",
  title: "",
  subtitle: "",
  excerpt: "",
  content: "",
  read_time: "",
  status: "draft",
  og_image: "",
  meta_title: "",
  meta_description: "",
  meta_h1: "",
  published_at: "",
};

const BLOG_BUCKET = "blog-uploads";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const formatDateForInput = (dateString, language) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  if (language === "en") return date.toISOString().slice(0, 10);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
};

const parseDateToISO = (dateString, language) => {
  if (!dateString) return null;
  let date;
  if (language === "en") {
    date = new Date(dateString);
  } else {
    const parts = dateString.split(".");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      date = new Date(`${year}-${month}-${day}`);
    } else {
      date = new Date(dateString);
    }
  }
  if (isNaN(date.getTime())) return null;
  return date.toISOString();
};

const defaultLocaleForLanguage = (lang) => (lang === "he" ? "he" : "en");
const normalizeSlug = (value = "") =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
const isSlugValid = (slug) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);

// Convert old array format to HTML string
const contentArrayToHTML = (content) => {
  if (!content) return "";
  if (typeof content === "string") {
    // If it's already HTML, return as is
    if (content.trim().startsWith("<")) return content;
    // If it's plain text, wrap in paragraph
    return `<p>${content}</p>`;
  }
  if (Array.isArray(content)) {
    return content
      .filter((p) => p && p.trim())
      .map((p) => {
        // If paragraph already contains HTML tags, use as is
        if (p.trim().startsWith("<")) return p;
        // Otherwise wrap in paragraph tag
        return `<p>${p}</p>`;
      })
      .join("");
  }
  return "";
};

// Convert HTML string to array format for backward compatibility with database
const contentHTMLToArray = (html) => {
  if (!html || !html.trim()) return [""];
  if (Array.isArray(html)) return html;

  // Parse HTML to extract text content
  const tempDiv =
    typeof document !== "undefined" ? document.createElement("div") : null;
  if (tempDiv) {
    tempDiv.innerHTML = html;
    const paragraphs = Array.from(tempDiv.querySelectorAll("p"))
      .map((p) => p.innerHTML.trim())
      .filter((p) => p.length > 0);
    return paragraphs.length > 0 ? paragraphs : [""];
  }

  // Fallback: simple regex parsing
  const paragraphs = html
    .split(/<\/p>/)
    .map((p) =>
      p
        .replace(/<p[^>]*>/, "")
        .replace(/<[^>]+>/g, "")
        .trim()
    )
    .filter((p) => p.length > 0);
  return paragraphs.length > 0 ? paragraphs : [""];
};

export default function BlogPage() {
  const {
    supabase: supabaseFromAuth,
    session,
    loading: authLoading,
    logout,
  } = useAdminAuth();
  const supabase = useMemo(
    () => supabaseFromAuth || createBrowserSupabaseClient(),
    [supabaseFromAuth]
  );
  const dict = useAdminDict();
  const { language } = useAdminLocale();

  const [locale, setLocale] = useState("en");
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyPost);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("main");
  const [isCreatingMode, setIsCreatingMode] = useState(false);

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    fetchPosts();
  }, [authLoading, locale, session, supabase]);

  useEffect(() => {
    setLocale(defaultLocaleForLanguage(language));
  }, [language]);

  const fetchPosts = () => {
    setLoading(true);
    setError("");
    supabase
      .from("blog_posts")
      .select(
        `
          id,
          slug,
          locale,
          title,
          subtitle,
          excerpt,
          read_time,
          status,
          og_image,
          meta_title,
          meta_description,
          meta_h1,
          published_at,
          content
        `
      )
      .eq("locale", locale)
      .order("published_at", { ascending: false, nullsLast: true })
      .order("created_at", { ascending: false })
      .then(({ data, error: fetchError }) => {
        if (fetchError) {
          setError(fetchError.message);
        } else {
          setPosts(data || []);
        }
        setLoading(false);
      });
  };

  const selectPost = (post) => {
    setSelectedId(post?.id || null);
    setIsCreatingMode(false);
    const content = contentArrayToHTML(post?.content);
    setForm({
      ...emptyPost,
      ...post,
      content,
      published_at: post?.published_at
        ? formatDateForInput(post.published_at, language)
        : "",
    });
    setMessage("");
    setError("");
    setActiveTab("main");
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(emptyPost);
    setMessage("");
    setError("");
    setActiveTab("main");
    setIsCreatingMode(true);
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async (event) => {
    if (!supabase || !session) return;
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      setError(dict.blog.uploadTooBig);
      return;
    }
    setUploading(true);
    setError("");
    setMessage("");
    const ext = file.name.split(".").pop() || "jpg";
    const safeSlug = (form.slug || "post").trim() || "post";
    const path = `${locale}/${safeSlug}-${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from(BLOG_BUCKET)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type || undefined,
      });
    if (uploadError) {
      setError(`${dict.blog.uploadError}: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from(BLOG_BUCKET).getPublicUrl(path);
    if (data?.publicUrl) {
      updateField("og_image", data.publicUrl);
      setMessage(dict.common.saved);
    } else {
      setError(dict.blog.uploadError);
    }
    setUploading(false);
  };

  const savePost = async () => {
    if (!supabase || !session) return;
    const slug = normalizeSlug(form.slug);
    if (!slug) {
      setError(dict.blog.slugRequired);
      return;
    }
    if (!isSlugValid(slug)) {
      setError(dict.blog.slugInvalid);
      return;
    }
    updateField("slug", slug);
    setSaving(true);
    setMessage("");
    setError("");

    // Save content as HTML string if it's HTML, otherwise as array for backward compatibility
    let contentToSave;
    if (
      form.content &&
      typeof form.content === "string" &&
      form.content.trim().startsWith("<")
    ) {
      // It's HTML from Rich Text Editor, save as string
      contentToSave = form.content;
    } else if (form.content && typeof form.content === "string") {
      // Plain text string, convert to array format
      contentToSave = [form.content];
    } else if (Array.isArray(form.content)) {
      // Already an array
      contentToSave = form.content.filter((p) => p && p.trim().length > 0);
    } else {
      contentToSave = [""];
    }

    const payload = {
      id: selectedId || undefined,
      locale,
      slug,
      title: form.title,
      subtitle: form.subtitle,
      excerpt: form.excerpt,
      content: contentToSave,
      read_time: form.read_time,
      status: form.status,
      og_image: form.og_image,
      meta_title: form.meta_title,
      meta_description: form.meta_description,
      meta_h1: form.meta_h1,
      published_at: parseDateToISO(form.published_at, language),
    };

    const { data: upserted, error: upsertError } = await supabase
      .from("blog_posts")
      .upsert(payload, { onConflict: "slug,locale" })
      .select("id")
      .maybeSingle();

    if (upsertError) {
      setError(upsertError.message);
    } else {
      const newId = upserted?.id || selectedId;
      setSelectedId(newId || null);
      setIsCreatingMode(false);
      setMessage(dict.common.saved);
      fetchPosts();
    }
    setSaving(false);
  };

  const deletePost = async (id) => {
    if (!supabase || !session || !id) return;
    const confirmed = confirm(dict.blog.deleteConfirm);
    if (!confirmed) return;
    const { error: deleteError } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage(dict.blog.deleted);
      fetchPosts();
      if (selectedId === id) {
        resetForm();
      }
    }
  };

  const hasSelectedPost = selectedId !== null;
  const isCreating = isCreatingMode && !hasSelectedPost;

  if (authLoading || !session || !supabase) {
    return (
      <main className={styles.page}>
        <div className={styles.panel}>{dict.common.loading}</div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <div>
            <div className={styles.kicker}>{dict.blog.kicker}</div>
            <div className={styles.heading}>{dict.blog.heading}</div>
            <div className={styles.breadcrumbs}>
              <Link href="/admin">{dict.common.backSections}</Link>
            </div>
          </div>
          <div className={styles.actions}>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className={styles.select}
            >
              {locales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            {(hasSelectedPost || isCreating) && (
              <button
                onClick={savePost}
                className={styles.primaryBtn}
                disabled={saving}
              >
                {saving
                  ? isCreating
                    ? dict.blog.posting
                    : dict.common.saving
                  : isCreating
                  ? dict.blog.postBtn
                  : dict.common.save}
              </button>
            )}
            <button onClick={logout} className={styles.secondaryBtn}>
              {dict.common.logout}
            </button>
          </div>
        </header>

        <div className={blogStyles.masterDetail}>
          {/* Left sidebar - Articles list */}
          <aside className={blogStyles.sidebar}>
            <div className={blogStyles.sidebarHeader}>
              <div className={styles.kicker}>
                {dict.blog.heading} ({posts.length})
              </div>
              <button onClick={resetForm} className={blogStyles.newButton}>
                + {dict.blog.addNew}
              </button>
            </div>
            <div className={blogStyles.articlesList}>
              {loading ? (
                <div className={styles.muted}>{dict.common.loading}</div>
              ) : posts.length === 0 ? (
                <div className={styles.muted}>{dict.common.noItems}</div>
              ) : (
                posts.map((post) => (
                  <div
                    key={post.id}
                    className={`${blogStyles.articleItem} ${
                      selectedId === post.id ? blogStyles.active : ""
                    }`}
                    onClick={() => selectPost(post)}
                  >
                    <div className={blogStyles.articleHeader}>
                      <span className={blogStyles.status}>{post.status}</span>
                      {post.published_at && (
                        <span className={blogStyles.date}>
                          {new Date(post.published_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className={blogStyles.articleTitle}>
                      {post.title || "Untitled"}
                    </div>
                    <div className={blogStyles.articleSlug}>{post.slug}</div>
                  </div>
                ))
              )}
            </div>
          </aside>

          {/* Right panel - Editor */}
          <div className={blogStyles.editorPanel}>
            {hasSelectedPost || isCreating ? (
              <>
                <div className={blogStyles.tabs}>
                  <button
                    className={`${blogStyles.tab} ${
                      activeTab === "main" ? blogStyles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("main")}
                  >
                    {dict.editor.section}
                  </button>
                  <button
                    className={`${blogStyles.tab} ${
                      activeTab === "content" ? blogStyles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("content")}
                  >
                    {dict.blog.contentParagraphs}
                  </button>
                  <button
                    className={`${blogStyles.tab} ${
                      activeTab === "seo" ? blogStyles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("seo")}
                  >
                    SEO
                  </button>
                  <button
                    className={`${blogStyles.tab} ${
                      activeTab === "preview" ? blogStyles.activeTab : ""
                    }`}
                    onClick={() => setActiveTab("preview")}
                  >
                    {dict.blog.preview}
                  </button>
                </div>

                <div className={blogStyles.tabContent}>
                  {activeTab === "main" && (
                    <div className={blogStyles.formSection}>
                      <div className={styles.row}>
                        <label className={styles.label}>
                          {dict.blog.title}
                          <input
                            value={form.title}
                            onChange={(e) =>
                              updateField("title", e.target.value)
                            }
                            className={styles.input}
                            placeholder="Title"
                          />
                        </label>
                        <label className={styles.label}>
                          Slug
                          <input
                            value={form.slug}
                            onChange={(e) =>
                              updateField("slug", normalizeSlug(e.target.value))
                            }
                            className={styles.input}
                            placeholder="trading-mindset"
                          />
                        </label>
                      </div>
                      <label className={styles.label}>
                        {dict.blog.subtitle}
                        <input
                          value={form.subtitle}
                          onChange={(e) =>
                            updateField("subtitle", e.target.value)
                          }
                          className={styles.input}
                          placeholder="Subtitle"
                        />
                      </label>
                      <label className={styles.label}>
                        {dict.blog.excerpt}
                        <textarea
                          value={form.excerpt}
                          onChange={(e) =>
                            updateField("excerpt", e.target.value)
                          }
                          className={styles.input}
                          rows={3}
                          placeholder="Brief description..."
                        />
                      </label>
                      <div className={styles.row}>
                        <label className={styles.label}>
                          {dict.blog.status}
                          <select
                            value={form.status}
                            onChange={(e) =>
                              updateField("status", e.target.value)
                            }
                            className={styles.select}
                          >
                            <option value="draft">draft</option>
                            <option value="published">published</option>
                          </select>
                        </label>
                        <label className={styles.label}>
                          {dict.blog.publishDate}
                          <input
                            type="text"
                            lang={language}
                            value={form.published_at}
                            onChange={(e) =>
                              updateField("published_at", e.target.value)
                            }
                            className={styles.input}
                            placeholder={
                              language === "en" ? "YYYY-MM-DD" : "ДД.ММ.ГГГГ"
                            }
                          />
                        </label>
                        <label className={styles.label}>
                          {dict.blog.readTime}
                          <input
                            value={form.read_time}
                            onChange={(e) =>
                              updateField("read_time", e.target.value)
                            }
                            className={styles.input}
                            placeholder="6 min"
                          />
                        </label>
                      </div>
                    </div>
                  )}

                  {activeTab === "content" && (
                    <div className={blogStyles.formSection}>
                      <RichTextEditor
                        content={form.content}
                        onChange={(html) => updateField("content", html)}
                        placeholder="Start writing your article..."
                      />
                    </div>
                  )}

                  {activeTab === "seo" && (
                    <div className={blogStyles.formSection}>
                      <div className={styles.row}>
                        <label className={styles.label}>
                          Meta Title
                          <input
                            value={form.meta_title}
                            onChange={(e) =>
                              updateField("meta_title", e.target.value)
                            }
                            className={styles.input}
                            maxLength={70}
                            placeholder="SEO title (up to 70 chars)"
                          />
                          <div className={blogStyles.charCount}>
                            {form.meta_title.length}/70
                          </div>
                        </label>
                        <label className={styles.label}>
                          Meta Description
                          <textarea
                            value={form.meta_description}
                            onChange={(e) =>
                              updateField("meta_description", e.target.value)
                            }
                            className={styles.input}
                            rows={2}
                            maxLength={160}
                            placeholder="SEO description (up to 160 chars)"
                          />
                          <div className={blogStyles.charCount}>
                            {form.meta_description.length}/160
                          </div>
                        </label>
                      </div>
                      <label className={styles.label}>
                        H1
                        <input
                          value={form.meta_h1}
                          onChange={(e) =>
                            updateField("meta_h1", e.target.value)
                          }
                          className={styles.input}
                          placeholder="H1 for SEO"
                        />
                      </label>
                      <label className={styles.label}>
                        {dict.blog.uploadLabel}
                        {form.og_image && (
                          <div className={blogStyles.imagePreview}>
                            <img src={form.og_image} alt="OG Preview" />
                          </div>
                        )}
                        <input
                          value={form.og_image}
                          onChange={(e) =>
                            updateField("og_image", e.target.value)
                          }
                          className={styles.input}
                          placeholder={dict.blog.ogImagePlaceholder}
                        />
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          style={{ marginTop: "8px" }}
                        />
                        {uploading && (
                          <div className={styles.muted}>
                            {dict.blog.uploading}
                          </div>
                        )}
                      </label>
                    </div>
                  )}

                  {activeTab === "preview" && (
                    <div className={blogStyles.previewSection}>
                      <article className={blogStyles.previewArticle}>
                        <header>
                          <h1>{form.title || "Untitled"}</h1>
                          {form.subtitle && (
                            <p className={blogStyles.subtitle}>
                              {form.subtitle}
                            </p>
                          )}
                          {form.excerpt && (
                            <p className={blogStyles.excerpt}>{form.excerpt}</p>
                          )}
                        </header>
                        <div
                          className={blogStyles.previewContent}
                          dangerouslySetInnerHTML={{
                            __html: form.content || "<p>No content yet...</p>",
                          }}
                        />
                      </article>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={blogStyles.emptyState}>
                <div className={styles.kicker}>Select an article</div>
                <p className={styles.muted}>
                  Choose an article from the list to edit, or create a new one.
                </p>
              </div>
            )}
          </div>
        </div>

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
      </div>
    </main>
  );
}
