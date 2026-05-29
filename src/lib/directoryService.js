import { supabase } from "./supabase";

async function createSadhakCode() {
  const { data, error } = await supabase.rpc("get_next_sadhak_code");

  if (error) {
    throw new Error("Sadhak ID generation failed: " + error.message);
  }

  return data;
}

export async function getDashboardStats() {
  const [
    sadhakCountResult,
    sevaCountResult,
    teamLeaderCountResult,
    accessCountResult,
    recentSadhaksResult,
  ] = await Promise.all([
    supabase
      .from("sadhaks")
      .select("id", { count: "exact", head: true })
      .eq("active", true),

    supabase
      .from("sevas")
      .select("id", { count: "exact", head: true })
      .eq("active", true),

    supabase
      .from("users")
      .select("login_id", { count: "exact", head: true })
      .eq("role", "team_leader")
      .eq("active", true),

    supabase
      .from("access_areas")
      .select("id", { count: "exact", head: true })
      .eq("active", true),

    supabase
      .from("sadhaks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  if (sadhakCountResult.error) {
    throw new Error("Sadhak count failed: " + sadhakCountResult.error.message);
  }

  if (sevaCountResult.error) {
    throw new Error("Seva count failed: " + sevaCountResult.error.message);
  }

  if (teamLeaderCountResult.error) {
    throw new Error(
      "Team leader count failed: " + teamLeaderCountResult.error.message
    );
  }

  if (accessCountResult.error) {
    throw new Error("Access count failed: " + accessCountResult.error.message);
  }

  if (recentSadhaksResult.error) {
    throw new Error(
      "Recent sadhaks failed: " + recentSadhaksResult.error.message
    );
  }

  return {
    totalSadhaks: sadhakCountResult.count || 0,
    totalSevas: sevaCountResult.count || 0,
    totalTeamLeaders: teamLeaderCountResult.count || 0,
    totalAccessAreas: accessCountResult.count || 0,
    recentSadhaks: (recentSadhaksResult.data || []).map(mapSadhak),
  };
}

export async function getSevas({ searchText = "" } = {}) {
  const text = searchText.trim().toLowerCase();

  let query = supabase
    .from("sevas")
    .select("*")
    .order("name", { ascending: true });

  if (text) {
    query = query.ilike("name_lower", `%${text}%`);
  }

  const { data, error } = await query.limit(500);

  if (error) {
    throw new Error("Unable to load sevas: " + error.message);
  }

  return (data || []).map(mapSeva);
}

export async function createSeva({
  name,
  description = "",
  timing = "",
  createdBy,
}) {
  if (!name?.trim()) {
    throw new Error("Seva name is required");
  }

  const cleanName = name.trim();

  const { data, error } = await supabase
    .from("sevas")
    .insert({
      name: cleanName,
      name_lower: cleanName.toLowerCase(),
      description: description.trim(),
      timing: timing.trim(),
      active: true,
      created_by_login_id: createdBy?.loginId || "",
      created_by_name: createdBy?.name || "",
    })
    .select("*")
    .single();

  if (error) {
    throw new Error("Seva save failed: " + error.message);
  }

  return mapSeva(data);
}

export async function updateSeva({
  sevaId,
  name,
  description = "",
  timing = "",
  active,
}) {
  if (!sevaId) {
    throw new Error("Seva ID missing");
  }

  if (!name?.trim()) {
    throw new Error("Seva name is required");
  }

  const cleanName = name.trim();

  const { data, error } = await supabase
    .from("sevas")
    .update({
      name: cleanName,
      name_lower: cleanName.toLowerCase(),
      description: description.trim(),
      timing: timing.trim(),
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

export async function getAccessAreas({ searchText = "" } = {}) {
  const text = searchText.trim().toLowerCase();

  let query = supabase
    .from("access_areas")
    .select("*")
    .order("name", { ascending: true });

  if (text) {
    query = query.ilike("name_lower", `%${text}%`);
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

  const cleanName = name.trim();

  const { data, error } = await supabase
    .from("access_areas")
    .insert({
      name: cleanName,
      name_lower: cleanName.toLowerCase(),
      description: description.trim(),
      active: true,
    })
    .select("*")
    .single();

  if (error) {
    if (error.message?.toLowerCase().includes("duplicate")) {
      const existing = await getAccessAreas({ searchText: cleanName });

      const matched = existing.find(
        (item) => item.nameLower === cleanName.toLowerCase()
      );

      if (matched) return matched;
    }

    throw new Error("Access area save failed: " + error.message);
  }

  return mapAccessArea(data);
}

export async function updateAccessArea({
  accessAreaId,
  name,
  description = "",
  active,
}) {
  if (!accessAreaId) {
    throw new Error("Access area ID missing");
  }

  if (!name?.trim()) {
    throw new Error("Access area name is required");
  }

  const cleanName = name.trim();

  const { data, error } = await supabase
    .from("access_areas")
    .update({
      name: cleanName,
      name_lower: cleanName.toLowerCase(),
      description: description.trim(),
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

export async function getSadhaks({
  searchText = "",
  sevaId = "",
  activeOnly = true,
} = {}) {
  const text = searchText.trim().toLowerCase();

  if (sevaId) {
    const { data, error } = await supabase
      .from("sadhak_sevas")
      .select(
        `
        sadhak_id,
        sadhaks (*)
      `
      )
      .eq("seva_id", sevaId)
      .limit(1000);

    if (error) {
      throw new Error("Unable to load sadhaks by seva: " + error.message);
    }

    let list = (data || [])
      .map((item) => item.sadhaks)
      .filter(Boolean)
      .map(mapSadhak);

    if (activeOnly) {
      list = list.filter((item) => item.active);
    }

    if (text) {
      list = list.filter((item) => {
        return (
          item.nameLower.includes(text) ||
          item.sadhakCode.toLowerCase().includes(text) ||
          item.mobile.includes(text)
        );
      });
    }

    return list;
  }

  let query = supabase
    .from("sadhaks")
    .select("*")
    .order("created_at", { ascending: false });

  if (activeOnly) {
    query = query.eq("active", true);
  }

  if (text) {
    query = query.or(
      `name_lower.ilike.%${text}%,sadhak_code.ilike.%${text}%,mobile.ilike.%${text}%`
    );
  }

  const { data, error } = await query.limit(1000);

  if (error) {
    throw new Error("Unable to load sadhaks: " + error.message);
  }

  return (data || []).map(mapSadhak);
}

export async function createSadhak({
  name,
  mobile = "",
  address = "",
  comment = "",
  sevaIds = [],
  accessAreaIds = [],
  customAccessAreaNames = [],
  photoFile = null,
  createdBy,
}) {
  if (!name?.trim()) {
    throw new Error("Sadhak name is required");
  }

  if (!createdBy?.loginId) {
    throw new Error("Login session missing");
  }

  if (!photoFile) {
    throw new Error("Sadhak photo is required");
  }

  const cleanMobileForCheck = mobile.trim();

  if (!cleanMobileForCheck) {
    throw new Error("Mobile number is required. Use 00 only if not available.");
  }

  if (
    cleanMobileForCheck !== "00" &&
    !/^[0-9]{10}$/.test(cleanMobileForCheck)
  ) {
    throw new Error(
      "Mobile number must be 10 digits, or use 00 if not available."
    );
  }

  if (!address.trim()) {
    throw new Error("Address is required");
  }

  if (!Array.isArray(sevaIds) || sevaIds.length === 0) {
    throw new Error("At least one seva is required");
  }

  const cleanName = name.trim();
  const cleanMobile = cleanMobileForCheck;
  const cleanAddress = address.trim();
  const cleanComment = comment.trim();

  const sadhakCode = await createSadhakCode();
  const finalAccessAreaIds = [...accessAreaIds];

  for (const accessName of customAccessAreaNames) {
    if (!accessName?.trim()) continue;

    const accessArea = await createAccessArea({
      name: accessName.trim(),
      description: "Added while creating sadhak profile",
    });

    if (accessArea?.id && !finalAccessAreaIds.includes(accessArea.id)) {
      finalAccessAreaIds.push(accessArea.id);
    }
  }

  const { data: insertedSadhak, error: insertError } = await supabase
    .from("sadhaks")
    .insert({
      sadhak_code: sadhakCode,
      name: cleanName,
      name_lower: cleanName.toLowerCase(),
      father_name: "",
      mobile: cleanMobile,
      alternate_mobile: "",
      address: cleanAddress,
      city: "",
      state: "",
      notes: cleanComment,
      active: true,
      photo_url: "",
      photo_path: "",
      created_by_login_id: createdBy.loginId,
      created_by_name: createdBy.name || createdBy.loginId,
      updated_by_login_id: createdBy.loginId,
      updated_by_name: createdBy.name || createdBy.loginId,
    })
    .select("*")
    .single();

  if (insertError) {
    throw new Error("Sadhak save failed: " + insertError.message);
  }

  if (sevaIds.length > 0) {
    const sevaRows = sevaIds.map((sevaId) => ({
      sadhak_id: insertedSadhak.id,
      seva_id: sevaId,
    }));

    const { error: sevaError } = await supabase
      .from("sadhak_sevas")
      .insert(sevaRows);

    if (sevaError) {
      throw new Error("Sadhak seva save failed: " + sevaError.message);
    }
  }

  if (finalAccessAreaIds.length > 0) {
    const accessRows = finalAccessAreaIds.map((accessAreaId) => ({
      sadhak_id: insertedSadhak.id,
      access_area_id: accessAreaId,
    }));

    const { error: accessError } = await supabase
      .from("sadhak_access")
      .insert(accessRows);

    if (accessError) {
      throw new Error("Sadhak access save failed: " + accessError.message);
    }
  }

  const fileExtension = photoFile.name?.split(".").pop() || "jpg";
  const photoPath = `sadhaks/${insertedSadhak.id}-${Date.now()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("sadhak-photos")
    .upload(photoPath, photoFile, {
      upsert: false,
      contentType: photoFile.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error("Photo upload failed: " + uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("sadhak-photos")
    .getPublicUrl(photoPath);

  const { data: updatedSadhak, error: updateError } = await supabase
    .from("sadhaks")
    .update({
      photo_url: publicUrlData.publicUrl,
      photo_path: photoPath,
    })
    .eq("id", insertedSadhak.id)
    .select("*")
    .single();

  if (updateError) {
    throw new Error("Photo URL update failed: " + updateError.message);
  }

  return mapSadhak(updatedSadhak);
}

export async function updateSadhak({
  sadhakId,
  name,
  mobile = "",
  address = "",
  comment = "",
  sevaIds = [],
  accessAreaIds = [],
  customAccessAreaNames = [],
  photoFile = null,
  oldPhotoPath = "",
  updatedBy,
}) {
  if (!sadhakId) {
    throw new Error("Sadhak ID missing");
  }

  if (!name?.trim()) {
    throw new Error("Sadhak name is required");
  }

  if (!updatedBy?.loginId) {
    throw new Error("Login session missing");
  }

  const cleanMobileForCheck = mobile.trim();

  if (!cleanMobileForCheck) {
    throw new Error("Mobile number is required. Use 00 only if not available.");
  }

  if (
    cleanMobileForCheck !== "00" &&
    !/^[0-9]{10}$/.test(cleanMobileForCheck)
  ) {
    throw new Error(
      "Mobile number must be 10 digits, or use 00 if not available."
    );
  }

  if (!address.trim()) {
    throw new Error("Address is required");
  }

  if (!Array.isArray(sevaIds) || sevaIds.length === 0) {
    throw new Error("At least one seva is required");
  }

  const cleanName = name.trim();
  const cleanMobile = cleanMobileForCheck;
  const cleanAddress = address.trim();
  const cleanComment = comment.trim();

  const finalAccessAreaIds = [...accessAreaIds];

  for (const accessName of customAccessAreaNames) {
    if (!accessName?.trim()) continue;

    const accessArea = await createAccessArea({
      name: accessName.trim(),
      description: "Added while updating sadhak profile",
    });

    if (accessArea?.id && !finalAccessAreaIds.includes(accessArea.id)) {
      finalAccessAreaIds.push(accessArea.id);
    }
  }

  const { data: updatedSadhak, error: updateError } = await supabase
    .from("sadhaks")
    .update({
      name: cleanName,
      name_lower: cleanName.toLowerCase(),
      mobile: cleanMobile,
      address: cleanAddress,
      notes: cleanComment,
      updated_by_login_id: updatedBy.loginId,
      updated_by_name: updatedBy.name || updatedBy.loginId,
    })
    .eq("id", sadhakId)
    .select("*")
    .single();

  if (updateError) {
    throw new Error("Sadhak update failed: " + updateError.message);
  }

  const { error: deleteSevaError } = await supabase
    .from("sadhak_sevas")
    .delete()
    .eq("sadhak_id", sadhakId);

  if (deleteSevaError) {
    throw new Error("Old seva clear failed: " + deleteSevaError.message);
  }

  const sevaRows = sevaIds.map((sevaId) => ({
    sadhak_id: sadhakId,
    seva_id: sevaId,
  }));

  const { error: sevaError } = await supabase
    .from("sadhak_sevas")
    .insert(sevaRows);

  if (sevaError) {
    throw new Error("Sadhak seva update failed: " + sevaError.message);
  }

  const { error: deleteAccessError } = await supabase
    .from("sadhak_access")
    .delete()
    .eq("sadhak_id", sadhakId);

  if (deleteAccessError) {
    throw new Error("Old access clear failed: " + deleteAccessError.message);
  }

  if (finalAccessAreaIds.length > 0) {
    const accessRows = finalAccessAreaIds.map((accessAreaId) => ({
      sadhak_id: sadhakId,
      access_area_id: accessAreaId,
    }));

    const { error: accessError } = await supabase
      .from("sadhak_access")
      .insert(accessRows);

    if (accessError) {
      throw new Error("Sadhak access update failed: " + accessError.message);
    }
  }

  if (!photoFile) {
    return mapSadhak(updatedSadhak);
  }

  if (oldPhotoPath) {
    const { error: oldPhotoError } = await supabase.storage
      .from("sadhak-photos")
      .remove([oldPhotoPath]);

    if (oldPhotoError) {
      console.error("Old photo delete failed:", oldPhotoError.message);
    }
  }

  const fileExtension = photoFile.name?.split(".").pop() || "jpg";
  const photoPath = `sadhaks/${sadhakId}-${Date.now()}.${fileExtension}`;

  const { error: uploadError } = await supabase.storage
    .from("sadhak-photos")
    .upload(photoPath, photoFile, {
      upsert: false,
      contentType: photoFile.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error("Photo upload failed: " + uploadError.message);
  }

  const { data: publicUrlData } = supabase.storage
    .from("sadhak-photos")
    .getPublicUrl(photoPath);

  const { data: photoUpdatedSadhak, error: photoUpdateError } = await supabase
    .from("sadhaks")
    .update({
      photo_url: publicUrlData.publicUrl,
      photo_path: photoPath,
      updated_by_login_id: updatedBy.loginId,
      updated_by_name: updatedBy.name || updatedBy.loginId,
    })
    .eq("id", sadhakId)
    .select("*")
    .single();

  if (photoUpdateError) {
    throw new Error("Photo update failed: " + photoUpdateError.message);
  }

  return mapSadhak(photoUpdatedSadhak);
}

export async function deleteSadhak(sadhak) {
  if (!sadhak?.id) {
    throw new Error("Sadhak ID missing");
  }

  if (sadhak.photoPath) {
    const { error: photoError } = await supabase.storage
      .from("sadhak-photos")
      .remove([sadhak.photoPath]);

    if (photoError) {
      console.error("Photo delete failed:", photoError.message);
    }
  }

  const { error } = await supabase.from("sadhaks").delete().eq("id", sadhak.id);

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
        sevas (*)
      ),
      sadhak_access (
        access_area_id,
        access_areas (*)
      )
    `
    )
    .eq("id", sadhakId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load sadhak profile: " + error.message);
  }

  if (!data) {
    throw new Error("Sadhak profile not found");
  }

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
        sevas (*)
      ),
      sadhak_access (
        access_area_id,
        access_areas (*)
      )
    `
    )
    .eq("qr_token", qrToken)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load QR profile: " + error.message);
  }

  if (!data) {
    throw new Error("No sadhak found for this QR");
  }

  return mapSadhakProfile(data);
}

function mapSeva(item) {
  return {
    id: item.id,
    name: item.name,
    nameLower: item.name_lower,
    description: item.description || "",
    timing: item.timing || "",
    active: item.active,
    createdByLoginId: item.created_by_login_id,
    createdByName: item.created_by_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapAccessArea(item) {
  return {
    id: item.id,
    name: item.name,
    nameLower: item.name_lower,
    description: item.description || "",
    active: item.active,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapSadhak(item) {
  return {
    id: item.id,
    sadhakCode: item.sadhak_code,
    name: item.name,
    nameLower: item.name_lower,
    fatherName: item.father_name || "",
    mobile: item.mobile || "",
    alternateMobile: item.alternate_mobile || "",
    address: item.address || "",
    city: item.city || "",
    state: item.state || "",
    photoUrl: item.photo_url || "",
    photoPath: item.photo_path || "",
    notes: item.notes || "",
    active: item.active,
    qrToken: item.qr_token,
    createdByLoginId: item.created_by_login_id,
    createdByName: item.created_by_name,
    updatedByLoginId: item.updated_by_login_id,
    updatedByName: item.updated_by_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapSadhakProfile(item) {
  const base = mapSadhak(item);

  return {
    ...base,
    sevas: (item.sadhak_sevas || [])
      .map((row) => row.sevas)
      .filter(Boolean)
      .map(mapSeva),

    accessAreas: (item.sadhak_access || [])
      .map((row) => row.access_areas)
      .filter(Boolean)
      .map(mapAccessArea),
  };
}