import { supabase } from "./supabase";

const SESSION_KEY = "seva_token_session";

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(String(password));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function getLocalSession() {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem(SESSION_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function saveLocalSession(user) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      name: user.name,
      loginId: user.loginId,
      loggedInAt: new Date().toISOString(),
    })
  );
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(SESSION_KEY);
}

export async function getAccessMode() {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "access")
    .single();

  if (error) return "open";

  return data?.value?.mode || "open";
}

export async function setAccessMode(mode) {
  const { error } = await supabase
    .from("settings")
    .update({
      value: { mode },
      updated_at: new Date().toISOString(),
    })
    .eq("key", "access");

  if (error) throw new Error(error.message);
}

export async function createOrUpdateUser({ name, loginId, password, active }) {
  if (!name?.trim()) throw new Error("Name is required");
  if (!loginId?.trim()) throw new Error("Login ID is required");

  const cleanLoginId = loginId.trim().toLowerCase();

  const payload = {
    login_id: cleanLoginId,
    name: name.trim(),
    active: active ?? true,
    updated_at: new Date().toISOString(),
  };

  if (password?.trim()) {
    payload.password_hash = await hashPassword(password.trim());
  }

  const { error } = await supabase.from("users").upsert(payload, {
    onConflict: "login_id",
  });

  if (error) throw new Error(error.message);
}

export async function createInitialAdminIfNeeded(password) {
  const { data } = await supabase
    .from("users")
    .select("login_id")
    .eq("login_id", "admin")
    .maybeSingle();

  if (data) return;

  const passwordHash = await hashPassword(password);

  const { error } = await supabase.from("users").insert({
    login_id: "admin",
    name: "Admin",
    password_hash: passwordHash,
    active: true,
  });

  if (error) throw new Error(error.message);
}

export async function loginUser({ loginId, password }) {
  if (!loginId?.trim()) throw new Error("Login ID is required");
  if (!password?.trim()) throw new Error("Password is required");

  const cleanLoginId = loginId.trim().toLowerCase();

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("login_id", cleanLoginId)
    .maybeSingle();

  if (error) throw new Error(error.message);

  if (!user) {
    throw new Error("Account not found. Please contact admin.");
  }

  if (!user.active) {
    throw new Error("This account is disabled. Please contact admin.");
  }

  const enteredHash = await hashPassword(password.trim());

  if (enteredHash !== user.password_hash) {
    throw new Error("Wrong password");
  }

  const sessionUser = {
    name: user.name,
    loginId: user.login_id,
  };

  saveLocalSession(sessionUser);
  return sessionUser;
}

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) throw new Error(error.message);

  return data.map((item) => ({
    id: item.login_id,
    loginId: item.login_id,
    name: item.name,
    active: item.active,
  }));
}

export async function toggleUserStatus(loginId, active) {
  const { error } = await supabase
    .from("users")
    .update({
      active,
      updated_at: new Date().toISOString(),
    })
    .eq("login_id", loginId);

  if (error) throw new Error(error.message);
}

export async function deleteUser(loginId) {
  if (loginId === "admin") {
    throw new Error("Admin account cannot be deleted");
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("login_id", loginId);

  if (error) throw new Error(error.message);
}

export async function checkUserExists(loginId) {
  if (!loginId?.trim()) return false;

  const { data, error } = await supabase
    .from("users")
    .select("login_id")
    .eq("login_id", loginId.trim().toLowerCase())
    .maybeSingle();

  if (error) return false;

  return !!data;
}