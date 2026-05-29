"use client";

import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import {
  createUser,
  deleteUser,
  getLocalSession,
  getUsers,
  updateUser,
} from "@/lib/authService";
import {
  createAccessArea,
  deleteAccessArea,
  getAccessAreas,
  getSadhaks,
  getSevas,
  updateAccessArea,
} from "@/lib/directoryService";
import {
  getTeamLeaderSevaRows,
  isAdminUser,
  setTeamLeaderSevas,
} from "@/lib/permissionService";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "team_leader", label: "Team Leader" },
  { value: "view_only", label: "View Only" },
];

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("users");

  const [users, setUsers] = useState([]);
  const [sadhaks, setSadhaks] = useState([]);
  const [sevas, setSevas] = useState([]);
  const [accessAreas, setAccessAreas] = useState([]);
  const [teamLeaderRows, setTeamLeaderRows] = useState([]);

  const [loading, setLoading] = useState(true);

  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const [userName, setUserName] = useState("");
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("view_only");
  const [userActive, setUserActive] = useState(true);
  const [linkedSadhakId, setLinkedSadhakId] = useState("");
  const [sadhakSearch, setSadhakSearch] = useState("");

  const [showAccessForm, setShowAccessForm] = useState(false);
  const [editingAccessArea, setEditingAccessArea] = useState(null);
  const [accessName, setAccessName] = useState("");
  const [accessDescription, setAccessDescription] = useState("");
  const [accessActive, setAccessActive] = useState(true);

  const [selectedTeamLeaderLoginId, setSelectedTeamLeaderLoginId] = useState("");
  const [selectedSevaIds, setSelectedSevaIds] = useState([]);
  const [sevaSearch, setSevaSearch] = useState("");

  const [saving, setSaving] = useState(false);

  const isAdmin = isAdminUser(currentUser);

  const teamLeaders = useMemo(() => {
    return users.filter((user) => user.role === "team_leader" && user.active);
  }, [users]);

  const filteredSadhaks = useMemo(() => {
    const text = sadhakSearch.trim().toLowerCase();

    if (!text) return sadhaks.slice(0, 80);

    return sadhaks
      .filter((sadhak) => {
        return (
          sadhak.nameLower?.includes(text) ||
          sadhak.sadhakCode?.toLowerCase().includes(text) ||
          sadhak.mobile?.includes(text)
        );
      })
      .slice(0, 80);
  }, [sadhaks, sadhakSearch]);

  const filteredSevas = useMemo(() => {
    const text = sevaSearch.trim().toLowerCase();

    if (!text) return sevas;

    return sevas.filter((seva) => seva.nameLower.includes(text));
  }, [sevas, sevaSearch]);

  const selectedTeamLeader = useMemo(() => {
    return users.find((user) => user.loginId === selectedTeamLeaderLoginId);
  }, [users, selectedTeamLeaderLoginId]);

  const selectedTeamLeaderSevas = useMemo(() => {
    return sevas.filter((seva) => selectedSevaIds.includes(seva.id));
  }, [sevas, selectedSevaIds]);

  useEffect(() => {
    const session = getLocalSession();
    setCurrentUser(session);

    if (isAdminUser(session)) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, []);

  async function loadAdminData() {
    setLoading(true);

    try {
      const [userData, sadhakData, sevaData, accessData, assignmentData] =
        await Promise.all([
          getUsers(),
          getSadhaks({ searchText: "", sevaId: "", activeOnly: false }),
          getSevas({ searchText: "" }),
          getAccessAreas({ searchText: "" }),
          getTeamLeaderSevaRows(),
        ]);

      setUsers(userData);
      setSadhaks(sadhakData);
      setSevas(sevaData);
      setAccessAreas(accessData);
      setTeamLeaderRows(assignmentData);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  function openAddUserForm() {
    setEditingUser(null);
    setUserName("");
    setLoginId("");
    setPassword("");
    setRole("view_only");
    setUserActive(true);
    setLinkedSadhakId("");
    setSadhakSearch("");
    setShowUserForm(true);
  }

  function openEditUserForm(user) {
    setEditingUser(user);
    setUserName(user.name || "");
    setLoginId(user.loginId || "");
    setPassword("");
    setRole(user.role || "view_only");
    setUserActive(Boolean(user.active));
    setLinkedSadhakId(user.linkedSadhakId || "");
    setSadhakSearch("");
    setShowUserForm(true);
  }

  async function handleUserSubmit(e) {
    e.preventDefault();

    if (!userName.trim()) {
      alert("Please enter name");
      return;
    }

    if (!loginId.trim()) {
      alert("Please enter login ID");
      return;
    }

    if (!editingUser && !password.trim()) {
      alert("Please enter password");
      return;
    }

    if (role === "team_leader" && !linkedSadhakId) {
      alert("Please link Team Leader with a Sadhak profile first");
      return;
    }

    setSaving(true);

    try {
      if (editingUser) {
        await updateUser({
          loginId: editingUser.loginId,
          name: userName,
          role,
          active: userActive,
          password,
          linkedSadhakId,
        });
      } else {
        await createUser({
          name: userName,
          loginId,
          password,
          role,
          linkedSadhakId,
        });
      }

      setShowUserForm(false);
      setEditingUser(null);
      setUserName("");
      setLoginId("");
      setPassword("");
      setRole("view_only");
      setUserActive(true);
      setLinkedSadhakId("");
      setSadhakSearch("");

      await loadAdminData();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteUser(user) {
    const ok = window.confirm(`Delete user "${user.name}"?`);

    if (!ok) return;

    try {
      await deleteUser(user.loginId);
      await loadAdminData();
    } catch (error) {
      alert(error.message);
    }
  }

  function openAddAccessForm() {
    setEditingAccessArea(null);
    setAccessName("");
    setAccessDescription("");
    setAccessActive(true);
    setShowAccessForm(true);
  }

  function openEditAccessForm(area) {
    setEditingAccessArea(area);
    setAccessName(area.name || "");
    setAccessDescription(area.description || "");
    setAccessActive(Boolean(area.active));
    setShowAccessForm(true);
  }

  async function handleAccessSubmit(e) {
    e.preventDefault();

    if (!accessName.trim()) {
      alert("Please enter access area name");
      return;
    }

    setSaving(true);

    try {
      if (editingAccessArea) {
        await updateAccessArea({
          accessAreaId: editingAccessArea.id,
          name: accessName,
          description: accessDescription,
          active: accessActive,
        });
      } else {
        await createAccessArea({
          name: accessName,
          description: accessDescription,
        });
      }

      setShowAccessForm(false);
      setEditingAccessArea(null);
      setAccessName("");
      setAccessDescription("");
      setAccessActive(true);

      await loadAdminData();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccessArea(area) {
    const ok = window.confirm(`Delete access area "${area.name}"?`);

    if (!ok) return;

    try {
      await deleteAccessArea(area.id);
      await loadAdminData();
    } catch (error) {
      alert(error.message);
    }
  }

  function handleTeamLeaderChange(loginId) {
    setSelectedTeamLeaderLoginId(loginId);

    const assignedSevaIds = teamLeaderRows
      .filter((row) => row.team_leader_login_id === loginId)
      .map((row) => row.seva_id);

    setSelectedSevaIds(assignedSevaIds);
  }

  function toggleLeaderSeva(sevaId) {
    setSelectedSevaIds((prev) => {
      if (prev.includes(sevaId)) {
        return prev.filter((id) => id !== sevaId);
      }

      return [...prev, sevaId];
    });
  }

  async function handleSaveLeaderSevas() {
    if (!selectedTeamLeaderLoginId) {
      alert("Please select team leader");
      return;
    }

    setSaving(true);

    try {
      await setTeamLeaderSevas(selectedTeamLeaderLoginId, selectedSevaIds);
      alert("Team leader seva assignment saved");
      await loadAdminData();
    } catch (error) {
      alert(error.message);
    } finally {
      setSaving(false);
    }
  }

  if (!isAdmin) {
    return (
      <AppShell title="Admin" subtitle="Restricted Access">
        <div className="rounded-[28px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-red-700 shadow-sm">
          You do not have admin access.
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Admin" subtitle="Control Panel">
      <div className="space-y-4">
        <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
            Settings
          </p>

          <h2 className="mt-1 text-2xl font-black text-[#172033]">
            Admin Panel
          </h2>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-[#eef3fb] p-2">
            <TabButton
              label="Users"
              active={activeTab === "users"}
              onClick={() => setActiveTab("users")}
            />

            <TabButton
              label="Leaders"
              active={activeTab === "leaders"}
              onClick={() => setActiveTab("leaders")}
            />

            <TabButton
              label="Access"
              active={activeTab === "access"}
              onClick={() => setActiveTab("access")}
            />
          </div>
        </section>

        {activeTab === "users" && (
          <>
            <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                    Accounts
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#172033]">
                    User Accounts
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={openAddUserForm}
                  className="rounded-2xl bg-[#102a56] px-4 py-3 text-sm font-black text-white"
                >
                  Add User
                </button>
              </div>
            </section>

            {showUserForm && (
              <form
                onSubmit={handleUserSubmit}
                className="space-y-4 rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]"
              >
                <h3 className="text-xl font-black text-[#172033]">
                  {editingUser ? "Edit User" : "Create User"}
                </h3>

                <Input label="Name" value={userName} onChange={setUserName} />

                <Input
                  label="Login ID"
                  value={loginId}
                  onChange={setLoginId}
                  disabled={Boolean(editingUser)}
                />

                <Input
                  label={`Password ${editingUser ? "Optional" : ""}`}
                  value={password}
                  onChange={setPassword}
                  type="password"
                  placeholder={
                    editingUser ? "Leave blank to keep old password" : ""
                  }
                />

                <div>
                  <label className="mb-2 block text-sm font-black text-[#172033]">
                    Role
                  </label>

                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none"
                  >
                    {roleOptions.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="rounded-[26px] border border-[#d9e0ee] bg-[#f8fafc] p-4">
                  <label className="mb-2 block text-sm font-black text-[#172033]">
                    Linked Sadhak Profile{" "}
                    {role === "team_leader" && (
                      <span className="text-red-600">*</span>
                    )}
                  </label>

                  <input
                    value={sadhakSearch}
                    onChange={(e) => setSadhakSearch(e.target.value)}
                    placeholder="Search sadhak by ID, name or mobile"
                    className="mb-3 w-full rounded-2xl border border-[#d9e0ee] bg-white px-4 py-3 text-sm font-bold text-[#172033] outline-none"
                  />

                  {linkedSadhakId && (
                    <div className="mb-3 rounded-2xl bg-[#102a56] px-4 py-3 text-sm font-black text-white">
                      Selected:{" "}
                      {sadhaks.find((item) => item.id === linkedSadhakId)
                        ?.name || "Sadhak"}
                    </div>
                  )}

                  <div className="max-h-72 overflow-y-auto rounded-2xl bg-white p-2">
                    {filteredSadhaks.map((sadhak) => (
                      <button
                        key={sadhak.id}
                        type="button"
                        onClick={() => setLinkedSadhakId(sadhak.id)}
                        className={`mb-2 flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left ${
                          linkedSadhakId === sadhak.id
                            ? "bg-[#102a56] text-white"
                            : "bg-[#f8fafc] text-[#172033]"
                        }`}
                      >
                        <div className="h-10 w-10 overflow-hidden rounded-xl bg-[#eef3fb]">
                          {sadhak.photoUrl ? (
                            <img
                              src={sadhak.photoUrl}
                              alt={sadhak.name}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-black">
                            {sadhak.name}
                          </p>
                          <p className="text-xs font-bold opacity-75">
                            {sadhak.sadhakCode} • {sadhak.mobile}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {editingUser && (
                  <label className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] p-4 text-sm font-black text-[#172033]">
                    <input
                      type="checkbox"
                      checked={userActive}
                      onChange={(e) => setUserActive(e.target.checked)}
                    />
                    Active Account
                  </label>
                )}

                <FormButtons
                  saving={saving}
                  onCancel={() => setShowUserForm(false)}
                />
              </form>
            )}

            <section className="space-y-3">
              {loading ? (
                <LoadingCard text="Loading users..." />
              ) : users.length === 0 ? (
                <LoadingCard text="No users found." />
              ) : (
                users.map((user) => (
                  <div
                    key={user.loginId}
                    className="rounded-[26px] border border-[#d9e0ee] bg-white p-5 shadow-[0_12px_30px_rgba(16,42,86,0.07)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-[#172033]">
                          {user.name}
                        </h3>

                        <p className="mt-1 text-xs font-bold text-[#697386]">
                          {user.loginId}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-2 text-[11px] font-black ${
                          user.active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <Info label="Role" value={formatRole(user.role)} />

                    {user.linkedSadhak && (
                      <Info
                        label="Linked Sadhak"
                        value={`${user.linkedSadhak.name} (${user.linkedSadhak.sadhakCode})`}
                      />
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => openEditUserForm(user)}
                        className="rounded-2xl border border-[#d9e0ee] bg-[#eef3fb] px-4 py-3 text-sm font-black text-[#102a56]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.loginId === "admin"}
                        className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}

        {activeTab === "leaders" && (
          <section className="space-y-4">
            <div className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                Team Leaders
              </p>

              <h2 className="mt-1 text-xl font-black text-[#172033]">
                Assign Seva Responsibility
              </h2>

              <select
                value={selectedTeamLeaderLoginId}
                onChange={(e) => handleTeamLeaderChange(e.target.value)}
                className="mt-4 w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none"
              >
                <option value="">Select Team Leader</option>

                {teamLeaders.map((leader) => (
                  <option key={leader.loginId} value={leader.loginId}>
                    {leader.name}
                    {leader.linkedSadhak
                      ? ` - ${leader.linkedSadhak.sadhakCode}`
                      : ""}
                  </option>
                ))}
              </select>

              {selectedTeamLeader && (
                <div className="mt-4 rounded-2xl bg-[#eef3fb] p-4">
                  <p className="text-sm font-black text-[#102a56]">
                    {selectedTeamLeader.name}
                  </p>

                  {selectedTeamLeader.linkedSadhak && (
                    <p className="mt-1 text-xs font-bold text-[#697386]">
                      Linked: {selectedTeamLeader.linkedSadhak.name} (
                      {selectedTeamLeader.linkedSadhak.sadhakCode})
                    </p>
                  )}
                </div>
              )}

              <input
                value={sevaSearch}
                onChange={(e) => setSevaSearch(e.target.value)}
                placeholder="Search seva"
                className="mt-4 w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none"
              />

              <div className="mt-4 max-h-96 overflow-y-auto rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] p-2">
                {filteredSevas.map((seva) => {
                  const selected = selectedSevaIds.includes(seva.id);

                  return (
                    <button
                      key={seva.id}
                      type="button"
                      onClick={() => toggleLeaderSeva(seva.id)}
                      className={`mb-2 flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-black ${
                        selected
                          ? "bg-[#102a56] text-white"
                          : "bg-white text-[#172033]"
                      }`}
                    >
                      <span>{seva.name}</span>
                      <span>{selected ? "✓" : "+"}</span>
                    </button>
                  );
                })}
              </div>

              {selectedTeamLeaderSevas.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {selectedTeamLeaderSevas.map((seva) => (
                    <button
                      key={seva.id}
                      type="button"
                      onClick={() => toggleLeaderSeva(seva.id)}
                      className="rounded-full bg-[#102a56] px-4 py-2 text-xs font-black text-white"
                    >
                      {seva.name} ×
                    </button>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveLeaderSevas}
                disabled={saving}
                className="mt-5 w-full rounded-2xl bg-[#102a56] px-4 py-4 text-sm font-black text-white disabled:opacity-60"
              >
                {saving ? "Saving..." : "Save Assignment"}
              </button>
            </div>
          </section>
        )}

        {activeTab === "access" && (
          <>
            <section className="rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#2563eb]">
                    Permissions
                  </p>

                  <h2 className="mt-1 text-xl font-black text-[#172033]">
                    Access Areas
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={openAddAccessForm}
                  className="rounded-2xl bg-[#102a56] px-4 py-3 text-sm font-black text-white"
                >
                  Add
                </button>
              </div>
            </section>

            {showAccessForm && (
              <form
                onSubmit={handleAccessSubmit}
                className="space-y-4 rounded-[30px] border border-[#d9e0ee] bg-white p-5 shadow-[0_14px_36px_rgba(16,42,86,0.08)]"
              >
                <h3 className="text-xl font-black text-[#172033]">
                  {editingAccessArea ? "Edit Access Area" : "Add Access Area"}
                </h3>

                <Input
                  label="Access Area Name"
                  value={accessName}
                  onChange={setAccessName}
                  placeholder="Example: Seva Bhawan"
                />

                <div>
                  <label className="mb-2 block text-sm font-black text-[#172033]">
                    Description Optional
                  </label>

                  <textarea
                    value={accessDescription}
                    onChange={(e) => setAccessDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-semibold text-[#172033] outline-none"
                  />
                </div>

                {editingAccessArea && (
                  <label className="flex items-center gap-3 rounded-2xl bg-[#f8fafc] p-4 text-sm font-black text-[#172033]">
                    <input
                      type="checkbox"
                      checked={accessActive}
                      onChange={(e) => setAccessActive(e.target.checked)}
                    />
                    Active Access Area
                  </label>
                )}

                <FormButtons
                  saving={saving}
                  onCancel={() => setShowAccessForm(false)}
                />
              </form>
            )}

            <section className="space-y-3">
              {loading ? (
                <LoadingCard text="Loading access areas..." />
              ) : accessAreas.length === 0 ? (
                <LoadingCard text="No access areas found." />
              ) : (
                accessAreas.map((area) => (
                  <div
                    key={area.id}
                    className="rounded-[26px] border border-[#d9e0ee] bg-white p-5 shadow-[0_12px_30px_rgba(16,42,86,0.07)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-[#172033]">
                          {area.name}
                        </h3>

                        {area.description && (
                          <p className="mt-2 text-sm font-semibold leading-6 text-[#697386]">
                            {area.description}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-2 text-[11px] font-black ${
                          area.active
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}
                      >
                        {area.active ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => openEditAccessForm(area)}
                        className="rounded-2xl border border-[#d9e0ee] bg-[#eef3fb] px-4 py-3 text-sm font-black text-[#102a56]"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAccessArea(area)}
                        className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-black text-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function TabButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-3 text-xs font-black ${
        active ? "bg-[#102a56] text-white" : "text-[#102a56]"
      }`}
    >
      {label}
    </button>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-black text-[#172033]">
        {label}
      </label>

      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-[#d9e0ee] bg-[#f8fafc] px-4 py-4 text-sm font-bold text-[#172033] outline-none placeholder:text-[#697386] disabled:opacity-60"
      />
    </div>
  );
}

function FormButtons({ saving, onCancel }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-2xl border border-[#d9e0ee] bg-[#eef3fb] px-4 py-4 text-sm font-black text-[#102a56]"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={saving}
        className="rounded-2xl bg-[#102a56] px-4 py-4 text-sm font-black text-white disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="mt-3 rounded-2xl bg-[#f8fafc] p-3">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#697386]">
        {label}
      </p>

      <p className="mt-1 text-sm font-black text-[#102a56]">{value}</p>
    </div>
  );
}

function LoadingCard({ text }) {
  return (
    <div className="rounded-[26px] border border-[#d9e0ee] bg-white p-5 text-sm font-black text-[#102a56]">
      {text}
    </div>
  );
}

function formatRole(role) {
  if (role === "admin") return "Admin";
  if (role === "team_leader") return "Team Leader";
  return "View Only";
}