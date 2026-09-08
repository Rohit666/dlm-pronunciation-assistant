import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import DOMPurify from "dompurify";
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Eraser,
} from "lucide-react";

// Allowlist mirrors exactly what @tiptap/starter-kit can produce —
// runs on every keystroke so nothing unsanitized ever reaches parent
// state. This is defense in depth, not the authority: the backend
// (backend/utils/sentenceBlocks.js) sanitizes again server-side with
// the same allowlist, since block.text is later rendered to OTHER
// users (mentees) via dangerouslySetInnerHTML and a direct API call
// can bypass this editor entirely.
const ALLOWED_TAGS = [
  "p", "br", "strong", "em", "s", "code",
  "ul", "ol", "li", "blockquote",
  "h1", "h2", "h3", "hr",
];

function sanitize(html) {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: [],
  });
}

function ToolbarButton({ onClick, active, disabled, label, icon: Icon }) {
  return (
    <button
      type="button"
      // Keep the editor's selection/focus — without this, clicking the
      // button steals focus first and the format toggle loses its target.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-150 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
        active
          ? "bg-indigo-600 border-indigo-600 text-white"
          : "bg-white border-gray-200 hover:bg-gray-100 text-gray-600"
      }`}
    >
      <Icon size={14} />
    </button>
  );
}

// 100% offline rich text editor for sentence block text.
// @tiptap/react + @tiptap/starter-kit — bundled locally via Vite from
// npm, no CDN/remote-font/runtime network calls. Replaces the plain
// <textarea> in SentenceBlockBuilder.jsx.
//
// Controlled by HTML string: `value` seeds initial content on mount,
// `onChange(html)` fires (already sanitized) on every edit. Each block
// gets its own React-keyed instance (see SentenceBlockBuilder.jsx),
// so there's no need to resync `value` back into an already-mounted
// editor — that would fight the user's cursor position mid-typing.
function RichTextEditor({ value, onChange }) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value || "",
    onUpdate: ({ editor: instance }) => {
      onChange(sanitize(instance.getHTML()));
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[80px] px-4 py-3 focus:outline-none text-sm leading-6 " +
          "[&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 " +
          "[&_blockquote]:border-l-4 [&_blockquote]:border-gray-200 [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-gray-500 " +
          "[&_code]:bg-gray-100 [&_code]:px-1 [&_code]:rounded [&_code]:font-mono [&_code]:text-xs " +
          "[&_h1]:text-lg [&_h1]:font-bold [&_h2]:text-base [&_h2]:font-bold [&_h3]:text-sm [&_h3]:font-bold",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500">
      <div className="flex items-center gap-1.5 border-b bg-gray-50/60 px-2 py-1.5">
        <ToolbarButton
          icon={BoldIcon}
          label="Bold"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <ToolbarButton
          icon={ItalicIcon}
          label="Italic"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <ToolbarButton
          icon={Strikethrough}
          label="Strikethrough"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        />
        <ToolbarButton
          icon={List}
          label="Bullet list"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        />
        <ToolbarButton
          icon={ListOrdered}
          label="Numbered list"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <ToolbarButton
          icon={Quote}
          label="Quote"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <ToolbarButton
          icon={Eraser}
          label="Clear formatting"
          onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}

export default RichTextEditor;
