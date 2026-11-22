"use strict";

// Catatan Markdown — editor markdown dengan pratinjau langsung.
// Semua data tersimpan di localStorage browser, tanpa server.

const STORAGE_KEY = "markdown-notes-v1";
const ACTIVE_KEY = "markdown-notes-active-v1";

const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const noteList = document.getElementById("note-list");
const noteCount = document.getElementById("note-count");
const counter = document.getElementById("counter");
const saveStatus = document.getElementById("save-status");
const newNoteBtn = document.getElementById("new-note-btn");
const downloadBtn = document.getElementById("download-btn");
const copyHtmlBtn = document.getElementById("copy-html-btn");

const WELCOME_NOTE = `# Selamat datang di Catatan Markdown

Ini catatan pertamamu. Hapus aja isinya, ganti dengan tulisanmu sendiri — semua **tersimpan otomatis** di browser.

## Markdown itu gampang

Tulis biasa aja, tambahin tanda-tanda ini:

- **tebal** pakai dua bintang: \`**tebal**\`
- *miring* pakai satu bintang: \`*miring*\`
- Judul besar pakai \`#\` di awal baris, judul lebih kecil pakai \`##\`
- Tautan kayak [ini contohnya](https://github.com/kirax-12) pakai \`[teks](url)\`

## Daftar & kutipan

1. Bikin catatan baru dari tombol **+ Catatan Baru**
2. Klik catatan di samping buat membukanya
3. Unduh sebagai file \`.md\` kapan aja

> Catatan yang rapi dimulai dari satu baris pertama. Sisanya nyusul.

## Blok kode

\`\`\`
tulis kode di antara tiga backtick,
tampilannya jadi kotak kayak gini
\`\`\`

Udah, segitu dulu. Selamat nulis!
`;

function makeId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function loadNotes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed.filter(
      (n) => n && typeof n.id === "string" && typeof n.content === "string"
    );
  } catch (err) {
    return null;
  }
}

function seedNotes() {
  const notes = [
    { id: makeId(), content: WELCOME_NOTE, updatedAt: Date.now() },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  return notes;
}

let notes = loadNotes();
if (!notes || notes.length === 0) notes = seedNotes();

let activeId = localStorage.getItem(ACTIVE_KEY);
if (!notes.some((n) => n.id === activeId)) activeId = notes[0].id;

function getActive() {
  return notes.find((n) => n.id === activeId) || notes[0];
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  localStorage.setItem(ACTIVE_KEY, activeId);
  saveStatus.textContent = "Tersimpan ✓";
}

function noteTitle(content) {
  const firstLine = content
    .split("\n")
    .map((line) => line.trim())
    .find((line) => line.length > 0);
  if (!firstLine) return "Tanpa judul";
  const clean = firstLine.replace(/^#{1,6}\s*/, "").replace(/[*_`>]/g, "").trim();
  return clean || "Tanpa judul";
}

function formatTime(ts) {
  const d = new Date(ts);
  const today = new Date();
  const sameDay =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  if (sameDay) return "Hari ini, " + jam;
  return (
    d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) +
    ", " +
    jam
  );
}

function renderList() {
  const sorted = [...notes].sort((a, b) => b.updatedAt - a.updatedAt);
  noteList.innerHTML = "";
  sorted.forEach((note) => {
    const li = document.createElement("li");
    li.className = "note-item" + (note.id === activeId ? " active" : "");

    const openBtn = document.createElement("button");
    openBtn.type = "button";
    openBtn.className = "note-open";
    const title = document.createElement("span");
    title.className = "note-title";
    title.textContent = noteTitle(note.content);
    const time = document.createElement("span");
    time.className = "note-time";
    time.textContent = formatTime(note.updatedAt);
    openBtn.append(title, time);
    openBtn.addEventListener("click", () => {
      activeId = note.id;
      save();
      renderAll();
      editor.focus();
    });

    const delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "note-delete";
    delBtn.textContent = "×";
    delBtn.title = "Hapus catatan";
    delBtn.setAttribute("aria-label", "Hapus catatan " + noteTitle(note.content));
    delBtn.addEventListener("click", () => deleteNote(note.id));

    li.append(openBtn, delBtn);
    noteList.appendChild(li);
  });
  noteCount.textContent = notes.length + " catatan";
}

// Bersihkan HTML hasil render: buang elemen berbahaya & atribut event.
function sanitizeHtml(html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  const banned = tpl.content.querySelectorAll(
    "script, iframe, object, embed, form, link, meta, style"
  );
  banned.forEach((el) => el.remove());
  tpl.content.querySelectorAll("*").forEach((el) => {
    [...el.attributes].forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) el.removeAttribute(attr.name);
      if (
        (name === "href" || name === "src") &&
        attr.value.trim().toLowerCase().startsWith("javascript:")
      ) {
        el.removeAttribute(attr.name);
      }
    });
  });
  return tpl.innerHTML;
}

function renderPreview() {
  const note = getActive();
  if (!note || note.content.trim() === "") {
    preview.innerHTML =
      '<p class="preview-empty">masih kosong… tulis sesuatu di sebelah kiri</p>';
    return "";
  }
  const html = sanitizeHtml(marked.parse(note.content));
  preview.innerHTML = html;
  return html;
}

function renderCounter() {
  const text = editor.value;
  const words = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
  counter.textContent = words + " kata · " + text.length + " karakter";
}

function renderAll() {
  const note = getActive();
  editor.value = note ? note.content : "";
  renderList();
  renderPreview();
  renderCounter();
}

function deleteNote(id) {
  const note = notes.find((n) => n.id === id);
  if (!note) return;
  const ok = window.confirm(
    'Hapus catatan "' + noteTitle(note.content) + '"? Gak bisa dibalikin.'
  );
  if (!ok) return;
  notes = notes.filter((n) => n.id !== id);
  if (notes.length === 0) {
    notes = [
      { id: makeId(), content: "", updatedAt: Date.now() },
    ];
  }
  if (activeId === id) activeId = notes[0].id;
  save();
  renderAll();
}

newNoteBtn.addEventListener("click", () => {
  const note = { id: makeId(), content: "", updatedAt: Date.now() };
  notes.unshift(note);
  activeId = note.id;
  save();
  renderAll();
  editor.focus();
});

let saveTimer = null;
editor.addEventListener("input", () => {
  const note = getActive();
  if (!note) return;
  note.content = editor.value;
  note.updatedAt = Date.now();
  saveStatus.textContent = "Menyimpan…";
  renderPreview();
  renderCounter();
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    save();
    renderList();
  }, 300);
});

// Toolbar: sisipkan sintaks markdown di posisi kursor / teks terpilih.
function wrapSelection(before, after, placeholder) {
  const start = editor.selectionStart;
  const end = editor.selectionEnd;
  const selected = editor.value.slice(start, end) || placeholder;
  const replacement = before + selected + after;
  editor.setRangeText(replacement, start, end, "end");
  editor.focus();
  // Posisikan kursor tepat setelah teks sisipan biar enak lanjut nulis.
  const cursor = start + replacement.length;
  if (selected === placeholder) {
    editor.setSelectionRange(start + before.length, start + before.length + placeholder.length);
  } else {
    editor.setSelectionRange(cursor, cursor);
  }
  editor.dispatchEvent(new Event("input"));
}

function insertAtLineStart(prefix) {
  const start = editor.selectionStart;
  const lineStart = editor.value.lastIndexOf("\n", start - 1) + 1;
  editor.setRangeText(prefix, lineStart, lineStart, "end");
  editor.focus();
  editor.setSelectionRange(start + prefix.length, start + prefix.length);
  editor.dispatchEvent(new Event("input"));
}

document.querySelectorAll(".tool-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const kind = btn.dataset.format;
    if (kind === "bold") wrapSelection("**", "**", "teks tebal");
    else if (kind === "italic") wrapSelection("*", "*", "teks miring");
    else if (kind === "heading") insertAtLineStart("# ");
    else if (kind === "link") wrapSelection("[", "](https://)", "teks tautan");
    else if (kind === "code") wrapSelection("```\n", "\n```", "kode di sini");
  });
});

function fileNameFor(note) {
  const base = noteTitle(note.content)
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 50);
  return (base || "catatan") + ".md";
}

downloadBtn.addEventListener("click", () => {
  const note = getActive();
  if (!note) return;
  const blob = new Blob([note.content], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileNameFor(note);
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
});

copyHtmlBtn.addEventListener("click", async () => {
  const html = renderPreview();
  const label = copyHtmlBtn.textContent;
  try {
    await navigator.clipboard.writeText(html);
    copyHtmlBtn.textContent = "HTML Tersalin ✓";
  } catch (err) {
    // Clipboard API bisa ditolak (mis. file:// tanpa izin) — salin manual via textarea.
    const tmp = document.createElement("textarea");
    tmp.value = html;
    document.body.appendChild(tmp);
    tmp.select();
    document.execCommand("copy");
    tmp.remove();
    copyHtmlBtn.textContent = "HTML Tersalin ✓";
  }
  window.setTimeout(() => {
    copyHtmlBtn.textContent = label;
  }, 1600);
});

renderAll();
