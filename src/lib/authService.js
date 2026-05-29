import { supabase } from "./supabase";

const SESSION_KEY = "sadhak_directory_session";

export function getLocalSession() {
  if (typeof window === "undefined") return null;

  const session = localStorage.getItem(SESSION_KEY);

  if (!session) return null;

  try {
    return JSON.parse(session);
  } catch {
    return null;
  }
}

function saveLocalSession(user) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    SESSION_KEY,
    JSON.stringify({
      name: user.name,
      loginId: user.loginId,
      role: user.role,
      active: user.active,
      linkedSadhakId: user.linkedSadhakId || "",
    })
  );
}

export function logoutUser() {
  if (typeof window === "undefined") return;

  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem("seva_token_session");
}

export async function checkUserExists(loginId) {
  if (!loginId?.trim()) return false;

  const { data, error } = await supabase
    .from("users")
    .select("login_id")
    .eq("login_id", loginId.trim())
    .maybeSingle();

  if (error) {
    throw new Error("User check failed: " + error.message);
  }

  return Boolean(data);
}

export async function createFirstAdmin({ name, loginId, password }) {
  if (!name?.trim()) {
    throw new Error("Name is required");
  }

  if (!loginId?.trim()) {
    throw new Error("Login ID is required");
  }

  if (!password?.trim()) {
    throw new Error("Password is required");
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      name: name.trim(),
      login_id: loginId.trim(),
      password_hash: password.trim(),
      role: "admin",
      active: true,
      linked_sadhak_id: null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Admin creation failed: " + error.message);
  }

  return mapUser(data);
}

export async function loginUser({ loginId, password }) {
  if (!loginId?.trim()) {
    throw new Error("Login ID is required");
  }

  if (!password?.trim()) {
    throw new Error("Password is required");
  }

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("login_id", loginId.trim())
    .eq("password_hash", password.trim())
    .maybeSingle();

  if (error) {
    throw new Error("Login failed: " + error.message);
  }

  if (!data) {
    throw new Error("Invalid login ID or password");
  }

  if (!data.active) {
    throw new Error("This account is inactive");
  }

  const user = mapUser(data);
  saveLocalSession(user);

  return user;
}

export async function verifyAdminPassword(password) {
  const session = getLocalSession();

  if (!session?.loginId) {
    throw new Error("Login session missing");
  }

  if (!password?.trim()) {
    throw new Error("Password is required");
  }

  const { data, error } = await supabase
    .from("users")
    .select("login_id")
    .eq("login_id", session.loginId)
    .eq("password_hash", password.trim())
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    throw new Error("Admin verification failed: " + error.message);
  }

  return Boolean(data);
}

export async function getUsers() {
  const { data, error } = await supabase
    .from("users")
    .select(
      `
      *,
      sadhaks (
        id,
        sadhak_code,
        name,
        mobile,
        photo_url
      )
    `
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load users: " + error.message);
  }

  return (data || []).map(mapUser);
}

export async function createUser({
  name,
  loginId,
  password,
  role = "view_only",
  linkedSadhakId = "",
}) {
  if (!name?.trim()) {
    throw new Error("Name is required");
  }

  if (!loginId?.trim()) {
    throw new Error("Login ID is required");
  }

  if (!password?.trim()) {
    throw new Error("Password is required");
  }

  if (role === "team_leader" && !linkedSadhakId) {
    throw new Error("Team Leader must be linked with a Sadhak profile");
  }

  const { data, error } = await supabase
    .from("users")
    .insert({
      name: name.trim(),
      login_id: loginId.trim(),
      password_hash: password.trim(),
      role,
      active: true,
      linked_sadhak_id: linkedSadhakId || null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("User creation failed: " + error.message);
  }

  return mapUser(data);
}

export async function updateUser({
  loginId,
  name,
  role,
  active,
  password = "",
  linkedSadhakId = "",
}) {
  if (!loginId?.trim()) {
    throw new Error("Login ID missing");
  }

  if (!name?.trim()) {
    throw new Error("Name is required");
  }

  if (role === "team_leader" && !linkedSadhakId) {
    throw new Error("Team Leader must be linked with a Sadhak profile");
  }

  const updateData = {
    name: name.trim(),
    role,
    active: Boolean(active),
    linked_sadhak_id: linkedSadhakId || null,
  };

  if (password?.trim()) {
    updateData.password_hash = password.trim();
  }

  const { data, error } = await supabase
    .from("users")
    .update(updateData)
    .eq("login_id", loginId)
    .select("*")
    .single();

  if (error) {
    throw new Error("User update failed: " + error.message);
  }

  const session = getLocalSession();

  if (session?.loginId === loginId) {
    saveLocalSession(mapUser(data));
  }

  return mapUser(data);
}

export async function deleteUser(loginId) {
  if (!loginId?.trim()) {
    throw new Error("Login ID missing");
  }

  if (loginId === "admin") {
    throw new Error("Default admin cannot be deleted");
  }

  const { error } = await supabase
    .from("users")
    .delete()
    .eq("login_id", loginId);

  if (error) {
    throw new Error("User delete failed: " + error.message);
  }

  return true;
}

function mapUser(item) {
  return {
    name: item.name || "",
    loginId: item.login_id || "",
    password: item.password_hash || "",
    role: item.role || "view_only",
    active: item.active,
    linkedSadhakId: item.linked_sadhak_id || "",
    linkedSadhak: item.sadhaks
      ? {
          id: item.sadhaks.id,
          sadhakCode: item.sadhaks.sadhak_code,
          name: item.sadhaks.name,
          mobile: item.sadhaks.mobile,
          photoUrl: item.sadhaks.photo_url || "",
        }
      : null,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}