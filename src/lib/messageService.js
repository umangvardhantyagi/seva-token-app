import { supabase } from "./supabase";

export async function getActiveUsers() {
  const { data, error } = await supabase
    .from("users")
    .select("login_id, name, active")
    .eq("active", true)
    .order("name", { ascending: true });

  if (error) {
    throw new Error("Unable to load users: " + error.message);
  }

  return (data || []).map((user) => ({
    loginId: user.login_id,
    name: user.name || user.login_id,
  }));
}

export async function addTokenMessage({
  tokenId,
  message,
  taggedUsers = [],
  createdBy,
}) {
  if (!tokenId) throw new Error("Token ID missing");
  if (!createdBy?.loginId) throw new Error("Login session missing");

  const cleanMessage = message?.trim() || "Token assigned to you.";

  const { data: insertedMessage, error: messageError } = await supabase
    .from("token_messages")
    .insert({
      token_id: tokenId,
      message: cleanMessage,
      is_private: false,
      created_by_login_id: createdBy.loginId,
      created_by_name: createdBy.name || createdBy.loginId,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (messageError) {
    throw new Error("Message save failed: " + messageError.message);
  }

  const uniqueTaggedUsers = [];
  const usedLoginIds = new Set();

  taggedUsers.forEach((user) => {
    if (!user?.loginId) return;

    // Do not send notification to the same user who created the token.
    if (user.loginId === createdBy.loginId) return;

    if (!usedLoginIds.has(user.loginId)) {
      usedLoginIds.add(user.loginId);
      uniqueTaggedUsers.push(user);
    }
  });

  if (uniqueTaggedUsers.length > 0) {
    const rows = uniqueTaggedUsers.map((user) => ({
      token_id: tokenId,
      message_id: insertedMessage.id,
      tagged_user_login_id: user.loginId,
      tagged_user_name: user.name || user.loginId,
      tagged_by_login_id: createdBy.loginId,
      tagged_by_name: createdBy.name || createdBy.loginId,
      is_read: false,
      hidden_for_user: false,
      response_message: "",
      responded_at: null,
      dismissed_at: null,
    }));

    const { error: tagError } = await supabase
      .from("token_message_users")
      .insert(rows);

    if (tagError) {
      throw new Error("User tag failed: " + tagError.message);
    }
  }

  return mapMessage(insertedMessage);
}

export async function getUnreadNotificationCount(loginId) {
  if (!loginId) return 0;

  const { count, error } = await supabase
    .from("token_message_users")
    .select("id", { count: "exact", head: true })
    .eq("tagged_user_login_id", loginId)
    .eq("is_read", false)
    .eq("hidden_for_user", false);

  if (error) {
    console.error("Notification count failed:", error.message);
    return 0;
  }

  return count || 0;
}

export async function getUnreadNotifications(loginId) {
  if (!loginId) return [];

  const { data, error } = await supabase
    .from("token_message_users")
    .select(
      `
      *,
      token_messages (
        id,
        token_id,
        message,
        created_by_login_id,
        created_by_name,
        created_at
      ),
      tokens (
        id,
        token_no,
        name,
        seva,
        comment,
        photo_url,
        created_date,
        created_at
      )
    `
    )
    .eq("tagged_user_login_id", loginId)
    .eq("is_read", false)
    .eq("hidden_for_user", false)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    throw new Error("Unable to load unread notifications: " + error.message);
  }

  return (data || []).map(mapNotification);
}

export async function getMyNotifications(loginId) {
  if (!loginId) return [];

  const { data, error } = await supabase
    .from("token_message_users")
    .select(
      `
      *,
      token_messages (
        id,
        token_id,
        message,
        created_by_login_id,
        created_by_name,
        created_at
      ),
      tokens (
        id,
        token_no,
        name,
        seva,
        comment,
        photo_url,
        created_date,
        created_at
      )
    `
    )
    .eq("tagged_user_login_id", loginId)
    .eq("hidden_for_user", false)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw new Error("Unable to load notifications: " + error.message);
  }

  return (data || []).map(mapNotification);
}

export async function dismissNotification(notificationId) {
  if (!notificationId) throw new Error("Notification ID missing");

  const { error } = await supabase
    .from("token_message_users")
    .update({
      is_read: true,
      hidden_for_user: true,
      dismissed_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    throw new Error("Dismiss notification failed: " + error.message);
  }
}

export async function respondToNotification({ notificationId, responseMessage }) {
  if (!notificationId) throw new Error("Notification ID missing");

  const cleanResponse = responseMessage?.trim();

  if (!cleanResponse) {
    throw new Error("Please write a response");
  }

  const { error } = await supabase
    .from("token_message_users")
    .update({
      is_read: true,
      response_message: cleanResponse,
      responded_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (error) {
    throw new Error("Response save failed: " + error.message);
  }
}

export async function cleanupOldTokenCommunication() {
  const { error } = await supabase.rpc("cleanup_old_token_communication");

  if (error) {
    throw new Error("Communication cleanup failed: " + error.message);
  }
}

function mapMessage(item) {
  return {
    id: item.id,
    tokenId: item.token_id,
    message: item.message,
    isPrivate: item.is_private,
    createdByLoginId: item.created_by_login_id,
    createdByName: item.created_by_name,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
  };
}

function mapNotification(item) {
  return {
    id: item.id,
    tokenId: item.token_id,
    messageId: item.message_id,

    taggedUserLoginId: item.tagged_user_login_id,
    taggedUserName: item.tagged_user_name,

    taggedByLoginId: item.tagged_by_login_id,
    taggedByName: item.tagged_by_name,

    isRead: item.is_read,
    hiddenForUser: item.hidden_for_user,

    responseMessage: item.response_message || "",
    respondedAt: item.responded_at,
    dismissedAt: item.dismissed_at,
    createdAt: item.created_at,

    message: item.token_messages?.message || "",
    messageCreatedBy: item.token_messages?.created_by_name || "",
    messageCreatedAt: item.token_messages?.created_at || "",

    tokenNo: item.tokens?.token_no,
    tokenName: item.tokens?.name,
    tokenSeva: item.tokens?.seva,
    tokenComment: item.tokens?.comment,
    tokenPhotoUrl: item.tokens?.photo_url,
    tokenCreatedAt: item.tokens?.created_at,
  };
}