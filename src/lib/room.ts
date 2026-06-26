import { supabase } from "./supabase";
import { generateGameRound } from "@/game-logic/engine";
import { getCustomEntities } from "@/lib/custom-entities";
import type { GameMode, Difficulty, GameFilters } from "@/types";

/** Generate a random alphanumeric room code e.g. "X4K9" */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusable chars
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Generate a unique player/room ID */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/** Create a new room, returns { roomId, code } */
export async function createRoom(hostId: string): Promise<{ roomId: string; code: string }> {
  let code = generateRoomCode();
  let attempts = 0;

  // Ensure code is unique
  while (attempts < 10) {
    const { data } = await supabase
      .from("rooms")
      .select("id")
      .eq("code", code)
      .eq("status", "lobby")
      .single();
    if (!data) break;
    code = generateRoomCode();
    attempts++;
  }

  const roomId = generateId();

  const { error } = await supabase.from("rooms").insert({
    id: roomId,
    code,
    host_id: hostId,
    status: "lobby",
    phase: "lobby",
  });

  if (error) throw new Error("Failed to create room: " + error.message);

  return { roomId, code };
}

/** Join an existing room by code, returns roomId or throws */
export async function joinRoomByCode(code: string): Promise<string> {
const { data, error } = await supabase
    .from("rooms")
    .select("id, status")
    .eq("code", code.toUpperCase())
    .maybeSingle();

  if (error || !data) throw new Error("Room not found. Check the code and try again.");
  if (data.status !== "lobby") throw new Error("This game has already started.");

  return data.id;
}

/** Add a player to a room */
export async function addPlayer(params: {
  playerId: string;
  roomId: string;
  name: string;
  avatar: string;
  isHost: boolean;
}): Promise<void> {
  const { error } = await supabase.from("players").insert({
    id: params.playerId,
    room_id: params.roomId,
    name: params.name,
    avatar: params.avatar,
    is_host: params.isHost,
    is_ready: false,
    connected: true,
  });

  if (error) throw new Error("Failed to join room: " + error.message);
}

/** Toggle ready status for a player */
export async function setReady(playerId: string, ready: boolean): Promise<void> {
  await supabase.from("players").update({ is_ready: ready }).eq("id", playerId);
}

/** Start the game — host only */
export async function startGame(params: {
  roomId: string;
  mode: GameMode;
  difficulty: Difficulty;
  filters: GameFilters;
}): Promise<void> {
  const { roomId, mode, difficulty, filters } = params;

  // Fetch all players in room
  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId)
    .eq("connected", true)
    .order("created_at");

  if (!players || players.length < 3) {
    throw new Error("Need at least 3 players to start.");
  }

  const extraEntities = getCustomEntities();
  const playerNames = players.map((p: { name: string }) => p.name);

  const round = generateGameRound({
    mode,
    difficulty,
    filters,
    playerNames,
    extraEntities,
  });

  // Write roles back to each player row
  const updates = players.map((p: { id: string }, i: number) => ({
    id: p.id,
    role: round.roles[i].isFalse9 ? "false9" : "regular",
    reveal_text: round.roles[i].revealText,
    has_voted: false,
    voted_for: null,
  }));

  for (const u of updates) {
    await supabase
      .from("players")
      .update({ role: u.role, reveal_text: u.reveal_text, has_voted: false, voted_for: null })
      .eq("id", u.id);
  }

  // Update room with game state
  await supabase.from("rooms").update({
    status: "active",
    mode,
    difficulty,
    filters,
    entity: round.entity,
    phase: "reveal",
  }).eq("id", roomId);
}

/** Submit a vote */
export async function submitVote(playerId: string, votedForId: string, roomId: string): Promise<void> {
  await supabase.from("players").update({ has_voted: true, voted_for: votedForId }).eq("id", playerId);
  await supabase.from("votes").insert({ room_id: roomId, voter_id: playerId, voted_for_id: votedForId });
}

/** Move room to voting phase */
export async function startVoting(roomId: string): Promise<void> {
  await supabase.from("rooms").update({ phase: "voting" }).eq("id", roomId);
}

/** Move room to results phase */
export async function showResults(roomId: string): Promise<void> {
  await supabase.from("rooms").update({ phase: "results" }).eq("id", roomId);
}

/** Play again — reset players and regenerate with same settings */
export async function playAgain(roomId: string): Promise<void> {
  // Fetch current room settings
  const { data: room } = await supabase.from("rooms").select("*").eq("id", roomId).single();
  if (!room) throw new Error("Room not found");

  const { data: players } = await supabase
    .from("players")
    .select("*")
    .eq("room_id", roomId)
    .eq("connected", true)
    .order("created_at");

  if (!players || players.length < 3) throw new Error("Not enough players");

  const extraEntities = getCustomEntities();
  const playerNames = players.map((p: { name: string }) => p.name);

  const round = generateGameRound({
    mode: room.mode,
    difficulty: room.difficulty,
    filters: room.filters,
    playerNames,
    extraEntities,
  });

  for (let i = 0; i < players.length; i++) {
    await supabase.from("players").update({
      role: round.roles[i].isFalse9 ? "false9" : "regular",
      reveal_text: round.roles[i].revealText,
      has_voted: false,
      voted_for: null,
      is_ready: false,
    }).eq("id", players[i].id);
  }

  // Delete old votes
  await supabase.from("votes").delete().eq("room_id", roomId);

  await supabase.from("rooms").update({
    entity: round.entity,
    phase: "reveal",
    status: "active",
  }).eq("id", roomId);
}

/** Kick a player — host only, ends game if active */
export async function kickPlayer(playerId: string, roomId: string): Promise<void> {
  await supabase.from("players").update({ connected: false }).eq("id", playerId);
}

/** Transfer host to another player */
export async function transferHost(newHostId: string, roomId: string): Promise<void> {
  await supabase.from("players").update({ is_host: false }).eq("room_id", roomId);
  await supabase.from("players").update({ is_host: true }).eq("id", newHostId);
  await supabase.from("rooms").update({ host_id: newHostId }).eq("id", roomId);
}

/** Mark player as disconnected */
export async function leaveRoom(playerId: string, roomId: string): Promise<void> {
  await supabase.from("players").update({ connected: false }).eq("id", playerId);
}

/** End/close room entirely */
export async function endRoom(roomId: string): Promise<void> {
  await supabase.from("rooms").update({ status: "ended" }).eq("id", roomId);
}

/** Clean up old ended/inactive rooms — call periodically */
export async function cleanupRooms(): Promise<void> {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  await supabase.from("rooms").delete().lt("updated_at", tenMinutesAgo).eq("status", "ended");
  await supabase.from("rooms").delete().lt("updated_at", tenMinutesAgo).eq("status", "lobby");
}
