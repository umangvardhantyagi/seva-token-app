import { supabase } from "./supabase";

export function isAdminUser(user) {
  return user?.role === "admin" || user?.loginId === "admin";
}

export function isTeamLeaderUser(user) {
  return user?.role === "team_leader";
}

export function canAddSadhak(user) {
  return isAdminUser(user) || isTeamLeaderUser(user);
}

export async function getTeamLeaderSevaIds(loginId) {
  if (!loginId) return [];

  const { data, error } = await supabase
    .from("team_leader_sevas")
    .select("seva_id")
    .eq("team_leader_login_id", loginId);

  if (error) {
    throw new Error("Unable to load team leader sevas: " + error.message);
  }

  return (data || []).map((item) => item.seva_id);
}

export async function getTeamLeaderSevaRows() {
  const { data, error } = await supabase
    .from("team_leader_sevas")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Unable to load team leader assignments: " + error.message);
  }

  return data || [];
}

export async function getAllowedSevasForUser(user, allSevas) {
  if (isAdminUser(user)) {
    return allSevas;
  }

  if (!isTeamLeaderUser(user)) {
    return [];
  }

  const allowedSevaIds = await getTeamLeaderSevaIds(user.loginId);

  return allSevas.filter((seva) => allowedSevaIds.includes(seva.id));
}

export async function canManageSadhakProfile(user, sadhakProfile) {
  if (isAdminUser(user)) {
    return true;
  }

  if (!isTeamLeaderUser(user)) {
    return false;
  }

  const allowedSevaIds = await getTeamLeaderSevaIds(user.loginId);
  const sadhakSevaIds = (sadhakProfile?.sevas || []).map((seva) => seva.id);

  return sadhakSevaIds.some((sevaId) => allowedSevaIds.includes(sevaId));
}

export async function setTeamLeaderSevas(loginId, sevaIds = []) {
  if (!loginId) {
    throw new Error("Team leader login ID missing");
  }

  const { error: deleteError } = await supabase
    .from("team_leader_sevas")
    .delete()
    .eq("team_leader_login_id", loginId);

  if (deleteError) {
    throw new Error("Old assignment clear failed: " + deleteError.message);
  }

  if (sevaIds.length === 0) {
    return true;
  }

  const rows = sevaIds.map((sevaId) => ({
    team_leader_login_id: loginId,
    seva_id: sevaId,
  }));

  const { error: insertError } = await supabase
    .from("team_leader_sevas")
    .insert(rows);

  if (insertError) {
    throw new Error("Team leader assignment failed: " + insertError.message);
  }

  return true;
}