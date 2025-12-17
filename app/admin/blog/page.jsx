"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import styles from "@/styles/Admin.module.css";
import { useAdminAuth } from "@/components/AdminAuthProvider";
import { useAdminDict, useAdminLocale } from "@/components/AdminLocaleProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

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
  content: [""],
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

export default function BlogPage() {
  const { supabase: supabaseFromAuth, session, loading: authLoading, logout } = useAdminAuth();
  const supabase = useMemo(() => supabaseFromAuth || createBrowserSupabaseClient(), [supabaseFromAuth]);
  const dict = useAdminDict();
  const { language } = useAdminLocale();
  const t = (ru, en) => (language === "en" ? en : ru);

  const [locale, setLocale] = useState("en");
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState(emptyPost);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("landing"); // landing | list | create | edit

  useEffect(() => {
    if (authLoading || !session || !supabase) return;
    fetchPosts();
  }, [authLoading, locale, session, supabase]);

  useEffect(() => {
    if (mode === "landing") {
      setLocale(defaultLocaleForLanguage(language));
    }
  }, [language, mode]);

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
    setForm({
      ...emptyPost,
      ...post,
      content: Array.isArray(post?.content) && post.content.length ? post.content : [""],
      published_at: post?.published_at ? formatDateForInput(post.published_at, language) : "",
    });
    setMessage("");
    setError("");
    setMode("edit");
  };

  const resetForm = () => {
    setSelectedId(null);
    setForm(emptyPost);
    setMessage("");
    setError("");
    setLocale(defaultLocaleForLanguage(language));
    setMode("create");
  };

  const goToList = () => {
    setMode("list");
    setSelectedId(null);
    setForm(emptyPost);
    setMessage("");
    setError("");
    setLocale(defaultLocaleForLanguage(language));
  };

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateContent = (index, value) => {
    setForm((prev) => {
      const next = [...(prev.content || [])];
      next[index] = value;
      return { ...prev, content: next };
    });
  };

  const addParagraph = () => {
    setForm((prev) => ({ ...prev, content: [...(prev.content || []), ""] }));
  };

  const removeParagraph = (index) => {
    setForm((prev) => ({
      ...prev,
      content: (prev.content || []).filter((_, i) => i !== index),
    }));
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

  const isCreateMode = mode === "create";
  const isEditMode = mode === "edit";
  const showList = mode === "list" || isEditMode;
  const showForm = isCreateMode || isEditMode;

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

    const payload = {
      id: selectedId || undefined,
      locale,
      slug,
      title: form.title,
      subtitle: form.subtitle,
      excerpt: form.excerpt,
      content: (form.content || [])
        .map((p) => p ?? "")
        .filter((p) => p.trim().length > 0),
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
    setMode(isCreateMode ? "edit" : mode);
      setMessage(dict.common.saved);
      fetchPosts();
    }
    setSaving(false);
  };

  const deletePost = async (id) => {
    if (!supabase || !session || !id) return;
    const confirmed = confirm(dict.blog.deleteConfirm);
    if (!confirmed) return;
    const { error: deleteError } = await supabase.from("blog_posts").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
    } else {
      setMessage(dict.blog.deleted);
      fetchPosts();
      resetForm();
      setMode("list");
    }
  };

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
            <select value={locale} onChange={(e) => setLocale(e.target.value)} className={styles.select}>
              {locales.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
            {showForm && (
              <button onClick={savePost} className={styles.primaryBtn} disabled={saving}>
                {saving
                  ? isCreateMode
                    ? dict.blog.posting
                    : dict.common.saving
                  : isCreateMode
                  ? dict.blog.postBtn
                  : dict.common.save}
              </button>
            )}
            <button onClick={logout} className={styles.secondaryBtn}>
              {dict.common.logout}
            </button>
          </div>
        </header>

        <section className={styles.panel}>
          <div className={styles.kicker}>{dict.blog.heading}</div>
          <div className={styles.actions}>
            <button
              onClick={() => setMode("list")}
              className={mode === "list" ? styles.primaryBtn : styles.secondaryBtn}
            >
              {dict.blog.editExisting}
            </button>
            <button
              onClick={resetForm}
              className={mode === "create" ? styles.primaryBtn : styles.secondaryBtn}
            >
              {dict.blog.addNew}
            </button>
          </div>
        </section>

        {showList && (
          <section className={styles.panel}>
            <div className={styles.kicker}>
              {dict.blog.heading} ({posts.length})
            </div>
            {loading ? (
              <div className={styles.muted}>{dict.common.loading}</div>
            ) : (
              <div className={styles.itemsGrid}>
                {posts.map((post) => (
                  <div key={post.id} className={styles.itemCard}>
                    <div className={styles.itemHeader}>
                      <div className={styles.itemIndex}>{post.status}</div>
                      <div className={styles.muted}>
                        {post.published_at ? new Date(post.published_at).toLocaleDateString() : "—"}
                      </div>
                    </div>
                    <div className={styles.label}>
                      <strong>{post.title}</strong>
                    </div>
                    <div className={styles.muted}>{post.slug}</div>
                    <div className={styles.actions}>
                      <button onClick={() => selectPost(post)} className={styles.secondaryBtn}>
                        {dict.blog.edit}
                      </button>
                      <button
                        onClick={() => deletePost(post.id)}
                        className={styles.linkBtn}
                        type="button"
                      >
                        {dict.blog.delete}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {showForm && (
          <section className={styles.panel}>
            <div className={styles.kicker}>{dict.blog.articleForm}</div>
            <div className={styles.row}>
              <label className={styles.label}>
                Slug
                <input
                  value={form.slug}
                  onChange={(e) => updateField("slug", normalizeSlug(e.target.value))}
                  className={styles.input}
                  placeholder="trading-mindset"
                />
              </label>
              <label className={styles.label}>
                {dict.blog.status}
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
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
                  onChange={(e) => updateField("published_at", e.target.value)}
                  className={styles.input}
                  placeholder={language === "en" ? "YYYY-MM-DD" : "ДД.ММ.ГГГГ"}
                />
              </label>
              <label className={styles.label}>
                {dict.blog.readTime}
                <input
                  value={form.read_time}
                  onChange={(e) => updateField("read_time", e.target.value)}
                  className={styles.input}
                  placeholder="6 min"
                />
              </label>
            </div>

            <label className={styles.label}>
              {dict.blog.title}
              <input
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
                className={styles.input}
                placeholder="Title"
              />
            </label>
            <label className={styles.label}>
              {dict.blog.subtitle}
              <input
                value={form.subtitle}
                onChange={(e) => updateField("subtitle", e.target.value)}
                className={styles.input}
                placeholder="Subtitle"
              />
            </label>
            <label className={styles.label}>
              {dict.blog.excerpt}
              <textarea
                value={form.excerpt}
                onChange={(e) => updateField("excerpt", e.target.value)}
                className={styles.input}
                rows={2}
              />
            </label>

            <div className={styles.kicker} style={{ marginTop: 12 }}>
              {dict.blog.contentParagraphs}
            </div>
            <div className={styles.itemsGrid}>
              {(form.content || []).map((p, idx) => (
                <div key={idx} className={styles.itemCard}>
                  <div className={styles.itemHeader}>
                    <div className={styles.itemIndex}>/{String(idx + 1).padStart(2, "0")}</div>
                    <button type="button" className={styles.linkBtn} onClick={() => removeParagraph(idx)}>
                      {dict.blog.delete}
                    </button>
                  </div>
                  <textarea
                    value={p}
                    onChange={(e) => updateContent(idx, e.target.value)}
                    className={styles.input}
                    rows={3}
                  />
                </div>
              ))}
            </div>
            <button type="button" className={styles.secondaryBtn} onClick={addParagraph}>
              {dict.blog.addParagraph}
            </button>

            <div className={styles.kicker} style={{ marginTop: 16 }}>
              SEO
            </div>
            <div className={styles.row}>
              <label className={styles.label}>
                Meta Title
                <input
                  value={form.meta_title}
                  onChange={(e) => updateField("meta_title", e.target.value)}
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                Meta Description
                <input
                  value={form.meta_description}
                  onChange={(e) => updateField("meta_description", e.target.value)}
                  className={styles.input}
                />
              </label>
            </div>
            <div className={styles.row}>
              <label className={styles.label}>
                H1
                <input
                  value={form.meta_h1}
                  onChange={(e) => updateField("meta_h1", e.target.value)}
                  className={styles.input}
                />
              </label>
              <label className={styles.label}>
                {dict.blog.uploadLabel}
                <input
                  value={form.og_image}
                  onChange={(e) => updateField("og_image", e.target.value)}
                  className={styles.input}
                  placeholder={dict.blog.ogImagePlaceholder}
                />
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                {uploading && <div className={styles.muted}>{dict.blog.uploading}</div>}
              </label>
            </div>
          </section>
        )}

        {error && <div className={styles.error}>{error}</div>}
        {message && <div className={styles.success}>{message}</div>}
      </div>
    </main>
  );
}
