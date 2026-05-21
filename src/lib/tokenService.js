import { supabase } from "./supabase";
import { compressImage } from "./compressImage";

function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function createTokenFast({ name, seva, comment }) {
  if (!name?.trim()) throw new Error("Name is required");
  if (!seva) throw new Error("Please select seva");

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

  const { data: insertedToken, error: insertError } = await supabase
    .from("tokens")
    .insert({
      token_no: nextTokenNo,
      name: cleanName,
      name_lower: cleanName.toLowerCase(),
      seva,
      comment: comment?.trim() || "",
      photo_url: "",
      photo_path: "",
      status: "Assigned",
      created_date: getTodayDate(),
    })
    .select("*")
    .single();

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

  return mapToken(insertedToken);
}

export async function uploadPhotoForToken({ tokenId, tokenNo, photoFile }) {
  if (!tokenId || !photoFile) return null;

  try {
    const compressedPhoto = await compressImage(photoFile);

    const fileName = `${Date.now()}-token-${tokenNo}.jpg`;
    const photoPath = `tokens/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("token-photos")
      .upload(photoPath, compressedPhoto, {
        contentType: "image/jpeg",
        upsert: false,
      });

    if (uploadError) {
      console.error("Photo upload failed:", uploadError.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from("token-photos")
      .getPublicUrl(photoPath);

    const photoUrl = publicUrlData.publicUrl;

    const { data, error: updateError } = await supabase
      .from("tokens")
      .update({
        photo_url: photoUrl,
        photo_path: photoPath,
        status: "Assigned",
      })
      .eq("id", tokenId)
      .select("*")
      .single();

    if (updateError) {
      console.error("Photo update failed:", updateError.message);
      return null;
    }

    return mapToken(data);
  } catch (error) {
    console.error("Background photo upload failed:", error.message);
    return null;
  }
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
  const { error } = await supabase.from("settings").upsert(
    {
      key: "tokenCounter",
      value: { currentTokenNo: 0 },
      updated_at: new Date().toISOString(),
    },
    {
      onConflict: "key",
    }
  );

  if (error) {
    throw new Error("Counter reset failed: " + error.message);
  }
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