import { supabase } from "./supabase";
import { compressImageFile } from "./imageUtils";

export async function getDashboardStats() {
  const [
    totalSadhaksResult,
    activeSadhaksResult,
    totalSevasResult,
    totalAccessAreasResult,
  ] = await Promise.all([
    supabase.from("sadhaks").select("id", { count: "exact", head: true }),
    supabase
      .from("sadhaks")
      .select("id", { count: "exact", head: true })
      .eq("active", true),
    supabase.from("sevas").select("id", { count: "exact", head: true }),
    supabase.from("access_areas").select("id", { count: "exact", head: true }),
  ]);

  if (totalSadhaksResult.error) {
    throw new Error(
      "Unable to load sadhak count: " + totalSadhaksResult.error.message
    );
  }

  if (activeSadhaksResult.error) {
    throw new Error(
      "Unable to load active sadhak count: " +
        activeSadhaksResult.error.message
    );
  }

  if (totalSevasResult.error) {
    throw new Error(
      "Unable to load seva count: " + totalSevasResult.error.message
    );
  }

  if (totalAccessAreasResult.error) {
    throw new Error(
      "Unable to load access count: " + totalAccessAreasResult.error.message
    );
  }

  return {
    totalSadhaks: totalSadhaksResult.count || 0,
    activeSadhaks: activeSadhaksResult.count || 0,
    totalSevas: totalSevasResult.count || 0,
    totalAccessAreas: totalAccessAreasResult.count || 0,
  };
}

/* -------------------- SEVAS -------------------- */

export async function getSevas({ searchText = "", activeOnly = false } = {}) {
  let query = supabase.from("sevas").select("*").order("name");

  if (activeOnly) {
    query = query.eq("active", true);
  }

  if (searchText?.trim()) {
    query = query.ilike("name", `%${searchText.trim()}%`);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    throw new Error("Unable to load sevas: " + error.message);
  }

  return (data || []).map(mapSeva);
}

export async function createSeva({ name, description = "" }) {
  if (!name?.trim()) {
    throw new Error("Seva name is required");
  }

  const { data, error } = await supabase
    .from("sevas")
    .insert({
      name: name.trim(),
      description: description?.trim() || "",
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Seva creation failed: " + error.message);
  }

  return mapSeva(data);
}

export async function updateSeva({
  sevaId,
  name,
  description = "",
  active = true,
}) {
  if (!sevaId) {
    throw new Error("Seva ID missing");
  }

  if (!name?.trim()) {
    throw new Error("Seva name is required");
  }

  const { data, error } = await supabase
    .from("sevas")
    .update({
      name: name.trim(),
      description: description?.trim() || "",
      active: Boolean(active),
    })
    .eq("id", sevaId)
    .select("*")
    .single();

  if (error) {
    throw new Error("Seva update failed: " + error.message);
  }

  return mapSeva(data);
}

export async function deleteSeva(sevaId) {
  if (!sevaId) {
    throw new Error("Seva ID missing");
  }

  const { error } = await supabase.from("sevas").delete().eq("id", sevaId);

  if (error) {
    throw new Error("Seva delete failed: " + error.message);
  }

  return true;
}

/* -------------------- ACCESS AREAS -------------------- */

export async function getAccessAreas({
  searchText = "",
  activeOnly = false,
} = {}) {
  let query = supabase.from("access_areas").select("*").order("name");

  if (activeOnly) {
    query = query.eq("active", true);
  }

  if (searchText?.trim()) {
    query = query.ilike("name", `%${searchText.trim()}%`);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    throw new Error("Unable to load access areas: " + error.message);
  }

  return (data || []).map(mapAccessArea);
}

export async function createAccessArea({ name, description = "" }) {
  if (!name?.trim()) {
    throw new Error("Access area name is required");
  }

  const { data, error } = await supabase
    .from("access_areas")
    .insert({
      name: name.trim(),
      description: description?.trim() || "",
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Access area creation failed: " + error.message);
  }

  return mapAccessArea(data);
}

export async function updateAccessArea({
  accessAreaId,
  name,
  description = "",
  active = true,
}) {
  if (!accessAreaId) {
    throw new Error("Access area ID missing");
  }

  if (!name?.trim()) {
    throw new Error("Access area name is required");
  }

  const { data, error } = await supabase
    .from("access_areas")
    .update({
      name: name.trim(),
      description: description?.trim() || "",
      active: Boolean(active),
    })
    .eq("id", accessAreaId)
    .select("*")
    .single();

  if (error) {
    throw new Error("Access area update failed: " + error.message);
  }

  return mapAccessArea(data);
}

export async function deleteAccessArea(accessAreaId) {
  if (!accessAreaId) {
    throw new Error("Access area ID missing");
  }

  const { error } = await supabase
    .from("access_areas")
    .delete()
    .eq("id", accessAreaId);

  if (error) {
    throw new Error("Access area delete failed: " + error.message);
  }

  return true;
}

/* -------------------- SADHAKS -------------------- */

async function createSadhakCode() {
  const { data, error } = await supabase.rpc("get_next_sadhak_code");

  if (error) {
    throw new Error(
      "Unable to generate Sadhak ID. Please run get_next_sadhak_code SQL function in Supabase. " +
        error.message
    );
  }

  return data;
}

export async function getSadhaks({
  searchText = "",
  sevaId = "",
  activeOnly = false,
  limit = 100,
} = {}) {
  let sadhakIdsFromSeva = null;

  if (sevaId) {
    const { data: sevaRows, error: sevaError } = await supabase
      .from("sadhak_sevas")
      .select("sadhak_id")
      .eq("seva_id", sevaId);

    if (sevaError) {
      throw new Error("Unable to filter by seva: " + sevaError.message);
    }

    sadhakIdsFromSeva = (sevaRows || []).map((item) => item.sadhak_id);

    if (sadhakIdsFromSeva.length === 0) {
      return [];
    }
  }

  let query = supabase
    .from("sadhaks")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("active", true);
  }

  if (sadhakIdsFromSeva) {
    query = query.in("id", sadhakIdsFromSeva);
  }

  const text = searchText?.trim();

  if (text) {
    query = query.or(
      `name.ilike.%${text}%,mobile.ilike.%${text}%,sadhak_code.ilike.%${text}%`
    );
  }

  const { data, error } = await query.limit(limit);

  if (error) {
    throw new Error("Unable to load sadhaks: " + error.message);
  }

  return (data || []).map(mapSadhak);
}

export async function createSadhak({
  name,
  mobile,
  address,
  comment = "",
  photoFile,
  sevaIds = [],
  accessAreaIds = [],
  customAccessAreaNames = [],
  createdBy,
}) {
  validateSadhakPayload({
    name,
    mobile,
    address,
    photoRequired: true,
    photoFile,
    sevaIds,
  });

  const sadhakCode = await createSadhakCode();
  const qrToken =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const { data: insertedSadhak, error: insertError } = await supabase
    .from("sadhaks")
    .insert({
      sadhak_code: sadhakCode,
      name: name.trim(),
      mobile: mobile.trim(),
      address: address.trim(),
      notes: comment?.trim() || "",
      photo_url: "",
      photo_path: "",
      qr_token: qrToken,
      active: true,
      created_by: createdBy?.loginId || "",
      updated_by: createdBy?.loginId || "",
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error("Sadhak creation failed: " + insertError.message);
  }

  try {
    const compressedPhoto = await compressImageFile(photoFile, {
      maxWidth: 900,
      maxHeight: 900,
      quality: 0.72,
      maxSizeKB: 500,
    });

    const photoPath = `${insertedSadhak.id}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("sadhak-photos")
      .upload(photoPath, compressedPhoto, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error("Photo upload failed: " + uploadError.message);
    }

    const { data: publicPhotoData } = supabase.storage
      .from("sadhak-photos")
      .getPublicUrl(photoPath);

    const photoUrl = publicPhotoData?.publicUrl || "";

    const { error: photoUpdateError } = await supabase
      .from("sadhaks")
      .update({
        photo_url: photoUrl,
        photo_path: photoPath,
      })
      .eq("id", insertedSadhak.id);

    if (photoUpdateError) {
      throw new Error("Photo save failed: " + photoUpdateError.message);
    }

    await saveSadhakSevas(insertedSadhak.id, sevaIds);
    await saveSadhakAccessAreas({
      sadhakId: insertedSadhak.id,
      accessAreaIds,
      customAccessAreaNames,
    });

    return getSadhakProfileById(insertedSadhak.id);
  } catch (error) {
    await supabase.from("sadhak_sevas").delete().eq("sadhak_id", insertedSadhak.id);
    await supabase.from("sadhak_access").delete().eq("sadhak_id", insertedSadhak.id);

    if (insertedSadhak.photo_path) {
      await supabase.storage
        .from("sadhak-photos")
        .remove([insertedSadhak.photo_path]);
    }

    await supabase.from("sadhaks").delete().eq("id", insertedSadhak.id);

    throw error;
  }
}

export async function updateSadhak({
  sadhakId,
  name,
  mobile,
  address,
  comment = "",
  photoFile = null,
  sevaIds = [],
  accessAreaIds = [],
  customAccessAreaNames = [],
  active = true,
  updatedBy,
}) {
  if (!sadhakId) {
    throw new Error("Sadhak ID missing");
  }

  validateSadhakPayload({
    name,
    mobile,
    address,
    photoRequired: false,
    photoFile,
    sevaIds,
  });

  const updateData = {
    name: name.trim(),
    mobile: mobile.trim(),
    address: address.trim(),
    notes: comment?.trim() || "",
    active: Boolean(active),
    updated_by: updatedBy?.loginId || "",
    updated_at: new Date().toISOString(),
  };

  if (photoFile) {
    const compressedPhoto = await compressImageFile(photoFile, {
      maxWidth: 900,
      maxHeight: 900,
      quality: 0.72,
      maxSizeKB: 500,
    });

    const newPhotoPath = `${sadhakId}/${Date.now()}.jpg`;

    const { error: uploadError } = await supabase.storage
      .from("sadhak-photos")
      .upload(newPhotoPath, compressedPhoto, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) {
      throw new Error("Photo upload failed: " + uploadError.message);
    }

    const { data: publicPhotoData } = supabase.storage
      .from("sadhak-photos")
      .getPublicUrl(newPhotoPath);

    updateData.photo_url = publicPhotoData?.publicUrl || "";
    updateData.photo_path = newPhotoPath;
  }

  const { error: updateError } = await supabase
    .from("sadhaks")
    .update(updateData)
    .eq("id", sadhakId);

  if (updateError) {
    throw new Error("Sadhak update failed: " + updateError.message);
  }

  await saveSadhakSevas(sadhakId, sevaIds);
  await saveSadhakAccessAreas({
    sadhakId,
    accessAreaIds,
    customAccessAreaNames,
  });

  return getSadhakProfileById(sadhakId);
}

export async function deleteSadhak(sadhak) {
  const sadhakId = typeof sadhak === "string" ? sadhak : sadhak?.id;

  if (!sadhakId) {
    throw new Error("Sadhak ID missing");
  }

  const photoPath = typeof sadhak === "object" ? sadhak?.photoPath : "";

  await supabase.from("sadhak_sevas").delete().eq("sadhak_id", sadhakId);
  await supabase.from("sadhak_access").delete().eq("sadhak_id", sadhakId);

  if (photoPath) {
    await supabase.storage.from("sadhak-photos").remove([photoPath]);
  }

  const { error } = await supabase.from("sadhaks").delete().eq("id", sadhakId);

  if (error) {
    throw new Error("Sadhak delete failed: " + error.message);
  }

  return true;
}

export async function getSadhakProfileById(sadhakId) {
  if (!sadhakId) {
    throw new Error("Sadhak ID missing");
  }

  const { data, error } = await supabase
    .from("sadhaks")
    .select(
      `
      *,
      sadhak_sevas (
        seva_id,
        sevas (
          id,
          name,
          description,
          active
        )
      ),
      sadhak_access (
        access_area_id,
        access_areas (
          id,
          name,
          description,
          active
        )
      )
    `
    )
    .eq("id", sadhakId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load sadhak profile: " + error.message);
  }

  if (!data) return null;

  return mapSadhakProfile(data);
}

export async function getSadhakProfileByQrToken(qrToken) {
  if (!qrToken) {
    throw new Error("QR token missing");
  }

  const { data, error } = await supabase
    .from("sadhaks")
    .select(
      `
      *,
      sadhak_sevas (
        seva_id,
        sevas (
          id,
          name,
          description,
          active
        )
      ),
      sadhak_access (
        access_area_id,
        access_areas (
          id,
          name,
          description,
          active
        )
      )
    `
    )
    .eq("qr_token", qrToken)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to verify QR profile: " + error.message);
  }

  if (!data) return null;

  return mapSadhakProfile(data);
}

/* -------------------- RELATION HELPERS -------------------- */

async function saveSadhakSevas(sadhakId, sevaIds = []) {
  await supabase.from("sadhak_sevas").delete().eq("sadhak_id", sadhakId);

  const uniqueSevaIds = [...new Set(sevaIds)].filter(Boolean);

  if (uniqueSevaIds.length === 0) return true;

  const rows = uniqueSevaIds.map((sevaId) => ({
    sadhak_id: sadhakId,
    seva_id: sevaId,
  }));

  const { error } = await supabase.from("sadhak_sevas").insert(rows);

  if (error) {
    throw new Error("Sadhak seva save failed: " + error.message);
  }

  return true;
}

async function saveSadhakAccessAreas({
  sadhakId,
  accessAreaIds = [],
  customAccessAreaNames = [],
}) {
  await supabase.from("sadhak_access").delete().eq("sadhak_id", sadhakId);

  const finalAccessAreaIds = [...new Set(accessAreaIds)].filter(Boolean);

  for (const customName of customAccessAreaNames || []) {
    const cleanName = customName?.trim();

    if (!cleanName) continue;

    const accessArea = await findOrCreateAccessArea(cleanName);
    finalAccessAreaIds.push(accessArea.id);
  }

  const uniqueAccessAreaIds = [...new Set(finalAccessAreaIds)].filter(Boolean);

  if (uniqueAccessAreaIds.length === 0) return true;

  const rows = uniqueAccessAreaIds.map((accessAreaId) => ({
    sadhak_id: sadhakId,
    access_area_id: accessAreaId,
  }));

  const { error } = await supabase.from("sadhak_access").insert(rows);

  if (error) {
    throw new Error("Sadhak access save failed: " + error.message);
  }

  return true;
}

async function findOrCreateAccessArea(name) {
  const { data: existing, error: existingError } = await supabase
    .from("access_areas")
    .select("*")
    .ilike("name", name)
    .maybeSingle();

  if (existingError) {
    throw new Error("Access area check failed: " + existingError.message);
  }

  if (existing) {
    return mapAccessArea(existing);
  }

  const { data, error } = await supabase
    .from("access_areas")
    .insert({
      name,
      description: "Custom access area",
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Custom access area creation failed: " + error.message);
  }

  return mapAccessArea(data);
}

/* -------------------- VALIDATION -------------------- */

function validateSadhakPayload({
  name,
  mobile,
  address,
  photoRequired,
  photoFile,
  sevaIds,
}) {
  if (photoRequired && !photoFile) {
    throw new Error("Please upload sadhak photo");
  }

  if (!name?.trim()) {
    throw new Error("Sadhak name is required");
  }

  if (!mobile?.trim()) {
    throw new Error("Mobile number is required. Use 00 if not available.");
  }

  if (!isValidMobile(mobile)) {
    throw new Error("Mobile number must be 10 digits, or use 00 if not available.");
  }

  if (!address?.trim()) {
    throw new Error("Address is required");
  }

  if (!Array.isArray(sevaIds) || sevaIds.length === 0) {
    throw new Error("Please select at least one seva");
  }
}

function isValidMobile(value) {
  const clean = value.trim();

  if (clean === "00") return true;

  return /^[0-9]{10}$/.test(clean);
}

/* -------------------- MAPPERS -------------------- */

function mapSeva(item) {
  return {
    id: item.id,
    name: item.name || "",
    nameLower: (item.name || "").toLowerCase(),
    description: item.description || "",
    active: item.active,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapAccessArea(item) {
  return {
    id: item.id,
    name: item.name || "",
    nameLower: (item.name || "").toLowerCase(),
    description: item.description || "",
    active: item.active,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapSadhak(item) {
  return {
    id: item.id,
    sadhakCode: item.sadhak_code || "",
    name: item.name || "",
    nameLower: (item.name || "").toLowerCase(),
    mobile: item.mobile || "",
    address: item.address || "",
    notes: item.notes || "",
    photoUrl: item.photo_url || "",
    photoPath: item.photo_path || "",
    qrToken: item.qr_token || "",
    active: item.active,
    createdBy: item.created_by || "",
    updatedBy: item.updated_by || "",
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapSadhakProfile(item) {
  const base = mapSadhak(item);

  const sevas = (item.sadhak_sevas || [])
    .map((row) => row.sevas)
    .filter(Boolean)
    .map(mapSeva);

  const accessAreas = (item.sadhak_access || [])
    .map((row) => row.access_areas)
    .filter(Boolean)
    .map(mapAccessArea);

  return {
    ...base,
    sevas,
    accessAreas,
    createdByName: item.created_by || "",
    updatedByName: item.updated_by || "",
  };
}