"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import styles from "./RichTextEditor.module.css";

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Start writing...",
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: styles.editor,
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          className={`${styles.button} ${
            editor.isActive("bold") ? styles.active : ""
          }`}
          title="Bold"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          className={`${styles.button} ${
            editor.isActive("italic") ? styles.active : ""
          }`}
          title="Italic"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`${styles.button} ${
            editor.isActive("bulletList") ? styles.active : ""
          }`}
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`${styles.button} ${
            editor.isActive("orderedList") ? styles.active : ""
          }`}
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={`${styles.button} ${
            editor.isActive("heading", { level: 2 }) ? styles.active : ""
          }`}
          title="Heading"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`${styles.button} ${
            editor.isActive("blockquote") ? styles.active : ""
          }`}
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          className={styles.button}
          title="Horizontal Rule"
        >
          ─
        </button>
      </div>
      <div className={styles.content}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
