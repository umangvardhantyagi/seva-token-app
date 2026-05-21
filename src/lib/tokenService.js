import { supabase } from "./supabase";
import { compressImage } from "./compressImage";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function createToken({ name, seva, comment, photoFile }) {
  if (!name?.trim()) throw new Error("Name is required");
  if (!seva) throw new Error("Please select seva");
  if (!photoFile) throw new Error("Photo is required");

  const cleanName = name.trim();

  let { data: settingData, error: settingError } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "tokenCounter")
    .maybeSingle();

  if (settingError) {
    throw new Error("Unable to read token counter: " + settingError.message);
  }

  if (!settingData) {
    const { error: createCounterError } = await supabase.from("settings").insert({
      key: "tokenCounter",
      value: { currentTokenNo: 0 },
      updated_at: new Date().toISOString(),
    });

    if (createCounterError) {
      throw new Error(
        "Unable to create token counter: " + createCounterError.message
      );
    }

    settingData = { value: { currentTokenNo: 0 } };
  }

  const currentTokenNo = settingData?.value?.currentTokenNo || 0;
  const nextTokenNo = currentTokenNo + 1;

  let compressedPhoto;

  try {
    compressedPhoto = await compressImage(photoFile);
  } catch (error) {
    throw new Error("Photo compression failed: " + error.message);
  }

  const fileName = `${Date.now()}-token-${nextTokenNo}.jpg`;
  const photoPath = `tokens/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from("token-photos")
    .upload(photoPath, compressedPhoto, {
      contentType: "image/jpeg",
      upsert: false,
    });

  if (uploadError) {
    throw new Error("Photo upload failed: " + uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("token-photos")
    .getPublicUrl(photoPath);

  const photoUrl = publicUrlData.publicUrl;

  const { error: insertError } = await supabase.from("tokens").insert({
    token_no: nextTokenNo,
    name: cleanName,
    name_lower: cleanName.toLowerCase(),
    seva,
    comment: comment?.trim() || "",
    photo_url: photoUrl,
    photo_path: photoPath,
    status: "Assigned",
    created_date: getTodayDate(),
  });

  if (insertError) {
    throw new Error("Token save failed: " + insertError.message);
  }

  const { error: updateError } = await supabase
    .from("settings")
    .update({
      value: { currentTokenNo: nextTokenNo },
      updated_at: new Date().toISOString(),
    })
    .eq("key", "tokenCounter");

  if (updateError) {
    throw new Error("Counter update failed: " + updateError.message);
  }

  return {
    tokenNo: nextTokenNo,
    name: cleanName,
    seva,
    comment: comment?.trim() || "",
    photoUrl,
    status: "Assigned",
    createdAt: new Date().toISOString(),
  };
}

export async function searchTokens({ searchText, seva }) {
  const text = searchText?.trim();

  let query = supabase.from("tokens").select("*");

  if (text && !Number.isNaN(Number(text))) {
    query = query.eq("token_no", Number(text));
  } else if (text) {
    query = query.ilike("name_lower", `${text.toLowerCase()}%`);
  }

  if (seva) {
    query = query.eq("seva", seva);
  }

  const { data, error } = await query
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error("Search failed: " + error.message);

  return (data || []).map(mapToken);
}

export async function getTodayTokens() {
  const { data, error } = await supabase
    .from("tokens")
    .select("*")
    .eq("created_date", getTodayDate())
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) throw new Error("Today tokens failed: " + error.message);

  return (data || []).map(mapToken);
}

export async function resetTokenCounter() {
  const { error } = await supabase
    .from("settings")
    .update({
      value: { currentTokenNo: 0 },
      updated_at: new Date().toISOString(),
    })
    .eq("key", "tokenCounter");

  if (error) throw new Error(error.message);
}

function mapToken(item) {
  return {
    id: item.id,
    tokenNo: item.token_no,
    name: item.name,
    seva: item.seva,
    comment: item.comment,
    photoUrl: item.photo_url,
    photoPath: item.photo_path,
    status: item.status,
    createdDate: item.created_date,
    createdAt: item.created_at,
  };
}