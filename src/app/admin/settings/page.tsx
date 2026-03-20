"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, RefreshCw } from "lucide-react";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        const data = await res.json();
        setSettings(data);
      } catch {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMessage("Cilësimet u ruajtën me sukses!");
      } else {
        setMessage("Gabim gjatë ruajtjes.");
      }
    } catch {
      setMessage("Gabim rrjeti.");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <RefreshCw className="w-6 h-6 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kthehu te paneli
      </Link>

      <h1 className="text-2xl font-bold text-text-primary mb-8">Cilësimet</h1>

      <div className="space-y-6">
        {/* Publish mode */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Mënyra e publikimit
          </h3>
          <div className="flex gap-3">
            {["manual", "auto"].map((mode) => (
              <button
                key={mode}
                onClick={() => setSettings({ ...settings, publish_mode: mode })}
                className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                  (settings.publish_mode || "manual") === mode
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-bg-primary text-text-secondary hover:border-border-light"
                }`}
              >
                {mode === "manual" ? "Manual (Rishikim)" : "Automatik"}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-muted mt-2">
            {(settings.publish_mode || "manual") === "manual"
              ? "Artikujt do të krijohen si draft dhe duhet të aprovohen manualisht."
              : "Artikujt do të publikohen automatikisht pas gjenerimit."}
          </p>
        </div>

        {/* Image mode */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Mënyra e imazheve
          </h3>
          <div className="flex gap-3">
            {[
              { value: "generated", label: "Gjeneruar" },
              { value: "source-link", label: "Link burimi" },
              { value: "admin-approved", label: "Aprovim admin" },
            ].map((mode) => (
              <button
                key={mode.value}
                onClick={() => setSettings({ ...settings, image_mode: mode.value })}
                className={`flex-1 p-3 rounded-lg border text-sm font-medium transition-all ${
                  (settings.image_mode || "generated") === mode.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-bg-primary text-text-secondary hover:border-border-light"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Telegram channels */}
        <div className="bg-bg-card border border-border rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">
            Kanale Telegram
          </h3>
          <input
            value={settings.telegram_channels || ""}
            onChange={(e) => setSettings({ ...settings, telegram_channels: e.target.value })}
            placeholder="ClashReport, channel2, channel3"
            className="w-full bg-bg-primary border border-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
          <p className="text-xs text-text-muted mt-2">
            Ndani kanalet me presje. Kanalet duhet të jenë publike.
          </p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm ${
            message.includes("sukses")
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              : "bg-red-500/10 text-red-400 border border-red-500/20"
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? "Duke ruajtur..." : "Ruaj Cilësimet"}
        </button>
      </div>
    </div>
  );
}
