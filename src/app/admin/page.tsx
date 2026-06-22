"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Plus, Trash2, Download, Upload, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  getCustomEntities,
  addCustomEntity,
  deleteCustomEntity,
  updateCustomEntity,
  replaceAllCustomEntities,
  makeNewEntityId,
} from "@/lib/custom-entities";
import { getAdminAuthed, setAdminAuthed } from "@/lib/storage";
import type { GameEntity } from "@/types";

// Simple local password — change this before sharing the admin link widely.
// For a real deployment, swap this for a proper auth provider.
const ADMIN_PASSWORD = "false9admin";

const EMPTY_FORM: Omit<GameEntity, "id"> = {
  name: "",
  type: "player",
  hintEasy: "",
  hintMedium: "",
  hintHard: "",
  categories: [],
};

export default function AdminPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState(false);

  const [entities, setEntities] = useState<GameEntity[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from sessionStorage
    setAuthed(getAdminAuthed());
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time hydration from localStorage
    if (authed) setEntities(getCustomEntities());
  }, [authed]);

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAdminAuthed(true);
      setAuthed(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  }

  function refresh() {
    setEntities(getCustomEntities());
  }

  function startNew() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowForm(true);
  }

  function startEdit(e: GameEntity) {
    setForm({ name: e.name, type: e.type, hintEasy: e.hintEasy, hintMedium: e.hintMedium, hintHard: e.hintHard, categories: e.categories });
    setEditingId(e.id);
    setShowForm(true);
  }

  function saveForm() {
    if (!form.name.trim()) return;
    if (editingId) {
      updateCustomEntity(editingId, form);
    } else {
      addCustomEntity({ ...form, id: makeNewEntityId(form.type) });
    }
    setShowForm(false);
    refresh();
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(entities, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "false9-custom-entities.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as GameEntity[];
        replaceAllCustomEntities(parsed);
        refresh();
      } catch {
        alert("Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  }

  const filtered = entities.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()));

  if (!authed) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-6 safe-top safe-bottom">
        <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-4">
          <Lock size={22} className="text-pitch" />
        </div>
        <h1 className="text-2xl font-bold mb-1">Admin Access</h1>
        <p className="text-muted text-sm mb-6">Enter the admin password to continue</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          placeholder="Password"
          className="w-full max-w-xs glass rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-pitch mb-3"
        />
        {authError && <p className="text-danger text-sm mb-3">Incorrect password.</p>}
        <Button className="w-full max-w-xs" onClick={handleLogin}>
          Unlock
        </Button>
        <button onClick={() => router.push("/")} className="text-muted text-sm mt-6">
          Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col safe-top safe-bottom px-5 pb-10">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-2xl font-bold">Admin</h1>
        <Button size="sm" onClick={startNew}>
          <Plus size={16} /> Add
        </Button>
      </div>

      <p className="text-xs text-muted mb-4 leading-relaxed">
        Entries here are custom additions stored on this device and merged into every game
        automatically. Export to JSON and add the file to a data pack to ship it for everyone.
      </p>

      <div className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center gap-2 glass rounded-xl px-3">
          <Search size={16} className="text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search entries…"
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
          />
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        <Button variant="secondary" size="sm" className="flex-1" onClick={handleExport}>
          <Download size={14} /> Export JSON
        </Button>
        <label className="flex-1">
          <span className="glass rounded-xl px-4 py-2 text-sm font-medium flex items-center justify-center gap-2 cursor-pointer">
            <Upload size={14} /> Import JSON
          </span>
          <input type="file" accept="application/json" onChange={handleImport} className="hidden" />
        </label>
      </div>

      <div className="space-y-2">
        {filtered.length === 0 && (
          <p className="text-muted text-sm text-center py-10">
            No custom entries yet. Tap &quot;Add&quot; to create one.
          </p>
        )}
        {filtered.map((e) => (
          <Card key={e.id} className="flex items-center justify-between py-3">
            <button className="text-left flex-1" onClick={() => startEdit(e)}>
              <p className="font-medium">{e.name}</p>
              <p className="text-xs text-muted capitalize">
                {e.type} · {e.categories.join(", ") || "no tags"}
              </p>
            </button>
            <button
              onClick={() => {
                deleteCustomEntity(e.id);
                refresh();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-danger"
            >
              <Trash2 size={16} />
            </button>
          </Card>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="glass w-full max-w-sm rounded-3xl p-5 max-h-[85vh] overflow-y-auto safe-bottom">
            <h2 className="text-lg font-bold mb-4">{editingId ? "Edit Entry" : "New Entry"}</h2>

            <label className="text-xs text-muted">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none mb-3 mt-1"
            />

            <label className="text-xs text-muted">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as GameEntity["type"] })}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none mb-3 mt-1"
            >
              <option value="player">Player</option>
              <option value="club">Club</option>
              <option value="manager">Manager</option>
            </select>

            <label className="text-xs text-muted">Easy Hint</label>
            <input
              value={form.hintEasy}
              onChange={(e) => setForm({ ...form, hintEasy: e.target.value })}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none mb-3 mt-1"
            />

            <label className="text-xs text-muted">Medium Hint</label>
            <input
              value={form.hintMedium}
              onChange={(e) => setForm({ ...form, hintMedium: e.target.value })}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none mb-3 mt-1"
            />

            <label className="text-xs text-muted">Hard Hint</label>
            <input
              value={form.hintHard}
              onChange={(e) => setForm({ ...form, hintHard: e.target.value })}
              className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none mb-3 mt-1"
            />

            <label className="text-xs text-muted">Categories (comma separated)</label>
            <input
              value={form.categories.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  categories: e.target.value
                    .split(",")
                    .map((c) => c.trim())
                    .filter(Boolean),
                })
              }
              className="w-full glass rounded-xl px-3 py-2.5 text-sm outline-none mb-5 mt-1"
            />

            <div className="flex gap-3">
              <Button variant="ghost" className="flex-1" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveForm}>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
