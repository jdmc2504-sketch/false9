"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarPicker } from "@/components/online/avatar-picker";
import { createRoom, joinRoomByCode, addPlayer, generateId } from "@/lib/room";

type Step = "profile" | "action";

export default function OnlinePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("profile");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("⚽");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const playerId = generateId();
      const { roomId, code } = await createRoom(playerId);
      await addPlayer({ playerId, roomId, name: name.trim(), avatar, isHost: true });
      // Store player info in sessionStorage
      sessionStorage.setItem("online_player_id", playerId);
      sessionStorage.setItem("online_player_name", name.trim());
      sessionStorage.setItem("online_player_avatar", avatar);
      sessionStorage.setItem("online_room_id", roomId);
      sessionStorage.setItem("online_room_code", code);
      sessionStorage.setItem("online_is_host", "true");
      router.push("/online/lobby");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim() || !joinCode.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const roomId = await joinRoomByCode(joinCode.trim());
      const playerId = generateId();
      await addPlayer({ playerId, roomId, name: name.trim(), avatar, isHost: false });
      sessionStorage.setItem("online_player_id", playerId);
      sessionStorage.setItem("online_player_name", name.trim());
      sessionStorage.setItem("online_player_avatar", avatar);
      sessionStorage.setItem("online_room_id", roomId);
      sessionStorage.setItem("online_is_host", "false");
      router.push("/online/lobby");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 flex flex-col hud-bg safe-top safe-bottom">
      {/* Header */}
      <div className="flex items-center gap-3 p-5">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => step === "action" ? setStep("profile") : router.push("/")}
          className="neon-card w-10 h-10 rounded-xl flex items-center justify-center"
        >
          <ChevronLeft size={18} />
        </motion.button>
        <p className="text-xs font-black uppercase tracking-[0.25em] text-muted">
          {step === "profile" ? "Your Profile" : "Join or Create"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 no-scrollbar">
        <AnimatePresence mode="wait">

          {/* Step 1 — Profile */}
          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="flex flex-col gap-6"
            >
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
                  Who are you?
                </h2>
                <p className="text-sm text-muted">Pick a name and avatar before joining</p>
              </div>

              {/* Name input */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={16}
                  placeholder="Enter your name..."
                  className="neon-card px-4 py-3 text-sm font-bold bg-transparent outline-none placeholder:text-muted w-full"
                />
              </div>

              {/* Avatar picker */}
              <div className="flex flex-col gap-3">
                <label className="text-xs font-black uppercase tracking-widest text-muted">
                  Pick your avatar
                </label>
                <div className="neon-card p-4">
                  <AvatarPicker selected={avatar} onSelect={setAvatar} />
                </div>
                <div className="flex items-center gap-3 neon-card px-4 py-3">
                  <span className="text-3xl">{avatar}</span>
                  <div>
                    <p className="text-sm font-black">{name || "Your name"}</p>
                    <p className="text-xs text-muted">This is how others will see you</p>
                  </div>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full"
                disabled={!name.trim()}
                onClick={() => setStep("action")}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 2 — Create or Join */}
          {step === "action" && (
            <motion.div
              key="action"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              className="flex flex-col gap-4"
            >
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight mb-1">
                  Create or Join
                </h2>
                <p className="text-sm text-muted">Start a new room or enter a code</p>
              </div>

              {/* Create room */}
              <div className="neon-card p-4 flex flex-col gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Create Room</p>
                  <p className="text-xs text-muted mt-0.5">
                    You'll be the host and pick the game settings
                  </p>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Room"}
                </Button>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs font-bold text-muted uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Join room */}
              <div className="neon-card p-4 flex flex-col gap-3">
                <div>
                  <p className="text-sm font-black uppercase tracking-wide">Join Room</p>
                  <p className="text-xs text-muted mt-0.5">
                    Enter the 4-character code from the host
                  </p>
                </div>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={4}
                  placeholder="e.g. X4K9"
                  className="neon-card px-4 py-3 text-2xl font-black text-center tracking-[0.5em] bg-transparent outline-none placeholder:text-muted placeholder:tracking-widest w-full uppercase"
                />
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={handleJoin}
                  disabled={loading || joinCode.length < 4}
                >
                  {loading ? "Joining..." : "Join Room"}
                </Button>
              </div>

              {error && (
                <p className="text-danger text-sm font-bold text-center">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
