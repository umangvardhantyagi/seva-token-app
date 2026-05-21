import { supabase } from "./supabase";

function getDateBefore(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export async function cleanupOldData(days = 3) {
  const cutoffDate = getDateBefore(days);

  const { data, error } = await supabase
    .from("tokens")
    .select("id, photo_path")
    .lt("created_date", cutoffDate);

  if (error) throw new Error(error.message);

  if (!data || data.length === 0) {
    return 0;
  }

  const photoPaths = data
    .map((item) => item.photo_path)
    .filter(Boolean);

  if (photoPaths.length > 0) {
    await supabase.storage.from("token-photos").remove(photoPaths);
  }

  const ids = data.map((item) => item.id);

  const { error: deleteError } = await supabase
    .from("tokens")
    .delete()
    .in("id", ids);

  if (deleteError) throw new Error(deleteError.message);

  return data.length;
}