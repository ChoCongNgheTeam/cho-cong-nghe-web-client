import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyRound, Users, Plus, Pencil, X } from "lucide-react";
import { getAllUsers } from "../../users/_libs/getAllUsers";
import { updateUserApi } from "../../users/_libs/updateUser";
import type { UserRole } from "../../users/user.types";

type Member = {
  id: string;
  name: string;
  avatar?: string;
};

type GroupSource = "api" | "custom";

type Group = {
  id: string;
  name: string;
  roles: string[];
  members: Member[];
  totalMembers: number;
  source: GroupSource;
};

const roles = [
  {
    name: "Admin",
    desc: "Toàn quyền hệ thống",
    badge: "Toàn quyền",
  },
  {
    name: "Editor",
    desc: "Quản lý nội dung và bài viết",
    badge: "Biên tập",
  },
  {
    name: "Viewer",
    desc: "Chỉ xem dữ liệu",
    badge: "Giới hạn",
  },
];

const ROLE_OPTIONS = ["Owner", "Admin", "Editor", "Reviewer", "Support"];

const ROLE_GROUPS: { role: UserRole; label: string; tag: string }[] = [
  { role: "ADMIN", label: "Quản trị hệ thống", tag: "Admin" },
  { role: "STAFF", label: "Quản lý nội dung", tag: "Staff" },
  { role: "CUSTOMER", label: "Khách hàng", tag: "Customer" },
];

const CUSTOM_GROUPS_KEY = "admin_user_groups_custom";

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export default function PermissionsSettingsView() {
  const isMounted = useRef(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftRoles, setDraftRoles] = useState<string[]>([]);
  const [draftMembers, setDraftMembers] = useState<Member[]>([]);
  const [memberQuery, setMemberQuery] = useState("");
  const [memberResults, setMemberResults] = useState<Member[]>([]);
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState<string | null>(null);
  const [customRole, setCustomRole] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [apiGroups, setApiGroups] = useState<Group[]>([]);
  const [customGroups, setCustomGroups] = useState<Group[]>([]);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [groupsError, setGroupsError] = useState<string | null>(null);

  const isCreate = modalOpen && !editingGroup;
  const memberReqId = useRef(0);

  const groups = useMemo(() => {
    const apiMap = new Map(apiGroups.map((g) => [g.id, g]));
    const overrideMap = new Map(customGroups.map((g) => [g.id, g]));
    const mergedApi = apiGroups.map((g) => overrideMap.get(g.id) ?? g);
    const standaloneCustom = customGroups.filter((g) => !apiMap.has(g.id));
    return [...standaloneCustom, ...mergedApi];
  }, [customGroups, apiGroups]);

  const fetchGroups = useCallback(async () => {
    setGroupsLoading(true);
    setGroupsError(null);
    try {
      const results = await Promise.all(
        ROLE_GROUPS.map((item) =>
          getAllUsers({ page: 1, limit: 8, role: item.role })
        )
      );

      const nextGroups: Group[] = results.map((res, idx) => {
        const meta = ROLE_GROUPS[idx];
        const members: Member[] = res.data.map((user) => ({
          id: user.id,
          name: user.fullName || user.userName || user.email,
          avatar: user.avatarImage ?? undefined,
        }));
        return {
          id: `role-${meta.role}`,
          name: meta.label,
          roles: [meta.tag],
          members,
          totalMembers: res.pagination.total ?? members.length,
          source: "api",
        };
      });

      if (isMounted.current) {
        setApiGroups(nextGroups);
      }
    } catch {
      if (isMounted.current) {
        setGroupsError("Không thể tải nhóm người dùng");
        setApiGroups([]);
      }
    } finally {
      if (isMounted.current) setGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    fetchGroups();
    return () => {
      isMounted.current = false;
    };
  }, [fetchGroups]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem(CUSTOM_GROUPS_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as Group[];
      const normalized = parsed.map((g) => ({
        id: g.id ?? `custom-${Date.now()}`,
        name: g.name ?? "Nhóm mới",
        roles: Array.isArray(g.roles) ? g.roles : [],
        members: Array.isArray(g.members) ? g.members : [],
        totalMembers:
          typeof g.totalMembers === "number"
            ? g.totalMembers
            : g.members?.length ?? 0,
        source: "custom" as const,
      }));
      setCustomGroups(normalized);
    } catch {
      setCustomGroups([]);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(CUSTOM_GROUPS_KEY, JSON.stringify(customGroups));
  }, [customGroups]);

  useEffect(() => {
    if (!modalOpen) return;
    setDraftName(editingGroup?.name ?? "");
    setDraftRoles(editingGroup?.roles ?? []);
    setDraftMembers(editingGroup?.members ?? []);
    setCustomRole("");
    setMemberQuery("");
    setMemberResults([]);
    setMemberError(null);
    setFormError(null);
    setSaveError(null);
  }, [modalOpen, editingGroup]);

  const previewMembers = useMemo(
    () => draftMembers,
    [draftMembers]
  );

  const openCreate = () => {
    setEditingGroup(null);
    setModalOpen(true);
  };

  const openEdit = (group: Group) => {
    setEditingGroup(group);
    setModalOpen(true);
  };

  const toggleRole = (role: string) => {
    setDraftRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const addCustomRole = () => {
    const next = customRole.trim();
    if (!next) return;
    setDraftRoles((prev) => {
      if (prev.some((r) => r.toLowerCase() === next.toLowerCase())) return prev;
      return [...prev, next];
    });
    setCustomRole("");
  };

  const removeRole = (role: string) => {
    setDraftRoles((prev) => prev.filter((r) => r !== role));
  };

  const addMember = (member: Member) => {
    setDraftMembers((prev) => {
      if (prev.some((m) => m.id === member.id)) return prev;
      return [...prev, member];
    });
  };

  const removeMember = (id: string) => {
    setDraftMembers((prev) => prev.filter((m) => m.id !== id));
  };

  useEffect(() => {
    if (!modalOpen) return;
    const q = memberQuery.trim();
    if (q.length < 2) {
      setMemberResults([]);
      setMemberError(null);
      setMemberLoading(false);
      return;
    }

    const reqId = ++memberReqId.current;
    setMemberLoading(true);
    setMemberError(null);

    const timer = setTimeout(async () => {
      try {
        const res = await getAllUsers({ page: 1, limit: 8, search: q });
        if (reqId !== memberReqId.current) return;
        const mapped = res.data.map((user) => ({
          id: user.id,
          name: user.fullName || user.userName || user.email,
          avatar: user.avatarImage ?? undefined,
        }));
        setMemberResults(mapped);
      } catch {
        if (reqId !== memberReqId.current) return;
        setMemberError("Không thể tìm người dùng");
        setMemberResults([]);
      } finally {
        if (reqId === memberReqId.current) setMemberLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [memberQuery, modalOpen]);

  const handleSaveGroup = () => {
    if (saving) return;
    const name = draftName.trim();
    if (!name) {
      setFormError("Vui lòng nhập tên nhóm");
      return;
    }

    const roles = draftRoles.length ? draftRoles : ["Custom"];

    const persistOverride = (groupId: string, baseTotal?: number) => {
      const nextGroup: Group = {
        id: groupId,
        name,
        roles,
        members: draftMembers,
        totalMembers: typeof baseTotal === "number" ? baseTotal : draftMembers.length,
        source: "custom",
      };

      setCustomGroups((prev) => {
        const exists = prev.some((g) => g.id === groupId);
        if (exists) {
          return prev.map((g) => (g.id === groupId ? nextGroup : g));
        }
        return [nextGroup, ...prev];
      });
    };

    const saveCustomGroup = () => {
      if (editingGroup) {
        persistOverride(editingGroup.id);
      } else {
        const newId = `custom-${Date.now()}`;
        persistOverride(newId);
      }
      setModalOpen(false);
      setEditingGroup(null);
    };

    const saveRoleGroup = async (targetRole: UserRole) => {
      setSaving(true);
      setSaveError(null);

      const originalIds = new Set(editingGroup?.members.map((m) => m.id) ?? []);
      const nextIds = new Set(draftMembers.map((m) => m.id));

      const toPromote = draftMembers.filter((m) => !originalIds.has(m.id));
      const toDemote =
        targetRole === "CUSTOMER"
          ? []
          : (editingGroup?.members ?? []).filter((m) => !nextIds.has(m.id));

      try {
        if (toPromote.length > 0) {
          await Promise.all(
            toPromote.map((m) => updateUserApi(m.id, { role: targetRole }))
          );
        }
        if (toDemote.length > 0) {
          await Promise.all(
            toDemote.map((m) => updateUserApi(m.id, { role: "CUSTOMER" }))
          );
        }

        persistOverride(
          editingGroup!.id,
          editingGroup?.totalMembers
        );
        await fetchGroups();
        setModalOpen(false);
        setEditingGroup(null);
      } catch {
        setSaveError("Không thể lưu nhóm. Vui lòng thử lại.");
      } finally {
        setSaving(false);
      }
    };

    if (editingGroup && editingGroup.id.startsWith("role-")) {
      const targetRole = editingGroup.id.replace("role-", "") as UserRole;
      if (!["ADMIN", "STAFF", "CUSTOMER"].includes(targetRole)) {
        setSaveError("Vai trò hệ thống không hợp lệ.");
        return;
      }
      void saveRoleGroup(targetRole);
      return;
    }

    saveCustomGroup();
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="border-b border-neutral px-5 py-4">
          <div className="flex items-center gap-2 text-accent">
            <KeyRound className="h-5 w-5" />
            <h2 className="text-base font-semibold text-primary">
              Vai trò và phân quyền
            </h2>
          </div>
          <p className="text-sm text-neutral-dark mt-1">
            Thiết lập quyền truy cập theo vai trò
          </p>
        </div>
        <div className="px-6 py-5 grid gap-3">
          {roles.map((role) => (
            <div
              key={role.name}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral bg-neutral-light-active px-4 py-3 text-sm"
            >
              <div>
                <p className="font-semibold text-primary">{role.name}</p>
                <p className="text-neutral-dark">{role.desc}</p>
              </div>
              <span className="rounded-full bg-accent-light px-3 py-1 text-xs font-semibold text-accent">
                {role.badge}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-neutral bg-neutral-light shadow-sm">
        <div className="border-b border-neutral px-5 py-4">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-accent">
              <Users className="h-5 w-5" />
              <h2 className="text-base font-semibold text-primary">
                Nhóm người dùng
              </h2>
            </div>
            <button
              onClick={openCreate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-neutral-light text-[12px] font-medium hover:bg-primary-hover transition-all shadow-sm cursor-pointer"
            >
              <Plus size={14} /> Tạo nhóm
            </button>
          </div>
          <p className="text-sm text-neutral-dark mt-1">
            Gán quyền theo nhóm để quản lý nhanh hơn
          </p>
        </div>
        <div className="px-6 py-5 grid gap-4 sm:grid-cols-2">
          {groupsLoading ? (
            Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={`group-skeleton-${idx}`}
                className="rounded-2xl border border-neutral bg-neutral-light/80 shadow-sm p-4 animate-pulse"
              >
                <div className="h-4 w-32 bg-neutral rounded mb-2" />
                <div className="h-3 w-20 bg-neutral rounded mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-5 w-16 bg-neutral rounded-full" />
                  <div className="h-5 w-14 bg-neutral rounded-full" />
                </div>
                <div className="flex -space-x-2">
                  {Array.from({ length: 4 }).map((__, i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-neutral border-2 border-neutral-light"
                    />
                  ))}
                </div>
              </div>
            ))
          ) : groups.length === 0 ? (
            <div className="col-span-full text-sm text-neutral-dark">
              {groupsError ?? "Không có nhóm người dùng"}
            </div>
          ) : (
            groups.map((group) => {
              const extraMembers = Math.max(0, group.totalMembers - 4);
              return (
                <div
                  key={group.id}
                  className="rounded-2xl border border-neutral bg-neutral-light/80 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="p-4 pb-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-[14px] font-semibold text-primary">
                          {group.name}
                        </h3>
                        <p className="text-[12px] text-neutral-dark">
                          {group.totalMembers} thành viên
                        </p>
                      </div>
                      <button
                        onClick={() => openEdit(group)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium border transition-all text-primary border-neutral hover:bg-neutral-light-active"
                      >
                        <Pencil size={12} /> Sửa
                      </button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {group.roles.map((role) => (
                        <span
                          key={`${group.id}-${role}`}
                          className="px-2.5 py-1 rounded-full text-[11px] font-medium border border-neutral/70 bg-neutral-light-active text-primary/80"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="px-4 pb-4 flex items-center justify-between">
                    <div className="flex -space-x-2">
                      {group.members.slice(0, 4).map((member) => (
                        <div
                          key={member.id}
                          className="w-8 h-8 rounded-full border-2 border-neutral-light bg-neutral-light-active flex items-center justify-center text-[10px] font-semibold text-primary/80 overflow-hidden"
                          title={member.name}
                        >
                          {member.avatar ? (
                            <img
                              src={member.avatar}
                              alt={member.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            getInitials(member.name)
                          )}
                        </div>
                      ))}
                    </div>
                    {extraMembers > 0 && (
                      <span className="text-[11px] text-neutral-dark">
                        +{extraMembers} khác
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        {groupsError && (
          <div className="px-6 pb-5 flex items-center gap-3 text-[11px] text-promotion">
            <span>{groupsError}</span>
            <button
              onClick={fetchGroups}
              className="text-[11px] text-accent hover:underline"
            >
              Thử lại
            </button>
          </div>
        )}
      </section>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/25 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-lg mx-4 rounded-2xl border border-neutral bg-neutral-light shadow-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-[15px] font-semibold text-primary">
                  {isCreate ? "Tạo nhóm người dùng" : "Chỉnh sửa nhóm"}
                </h2>
                <p className="text-[12px] text-neutral-dark">
                  Thiết lập vai trò và thành viên
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-lg border border-neutral flex items-center justify-center text-neutral-dark hover:bg-neutral-light-active transition-all"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[12px] font-medium text-primary">
                  Tên nhóm
                </label>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="VD: Quản trị hệ thống"
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[13px] text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
                />
                {formError && (
                  <p className="mt-2 text-[11px] text-promotion">{formError}</p>
                )}
              </div>

              <div>
                <p className="text-[12px] font-medium text-primary">
                  Vai trò gán cho nhóm
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ROLE_OPTIONS.map((role) => {
                    const active = draftRoles.includes(role);
                    return (
                      <button
                        key={role}
                        onClick={() => toggleRole(role)}
                        className={[
                          "px-3 py-1 rounded-full text-[11px] font-medium border transition-all",
                          active
                            ? "bg-accent/10 text-accent border-accent/30"
                            : "bg-neutral-light-active text-primary/70 border-neutral/70 hover:bg-neutral-light",
                        ].join(" ")}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <input
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value)}
                    placeholder="Nhập vai trò khác..."
                    className="flex-1 px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[12px] text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addCustomRole();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={addCustomRole}
                    className="px-3 py-2 rounded-lg border border-neutral text-[12px] font-medium text-primary hover:bg-neutral-light-active transition-all"
                  >
                    Thêm
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {draftRoles.length === 0 ? (
                    <span className="text-[11px] text-neutral-dark">
                      Chưa gán vai trò
                    </span>
                  ) : (
                    draftRoles.map((role) => (
                      <span
                        key={`selected-role-${role}`}
                        className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-neutral bg-neutral-light-active text-[11px] text-primary"
                      >
                        {role}
                        <button
                          type="button"
                          onClick={() => removeRole(role)}
                          className="text-neutral-dark hover:text-promotion"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium text-primary">Thành viên</p>
                <div className="mt-2 space-y-3">
                  <div className="relative">
                    <input
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder="Tìm theo tên, email hoặc username..."
                      className="w-full px-3 py-2 rounded-lg border border-neutral bg-neutral-light text-[13px] text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-accent/20"
                    />
                    {memberLoading && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-dark">
                        Đang tìm...
                      </span>
                    )}
                  </div>

                  {memberError && (
                    <p className="text-[11px] text-promotion">{memberError}</p>
                  )}

                  {memberResults.length > 0 && (
                    <div className="border border-neutral rounded-lg overflow-hidden bg-neutral-light">
                      {memberResults.map((member) => {
                        const isSelected = draftMembers.some(
                          (m) => m.id === member.id
                        );
                        return (
                          <button
                            key={member.id}
                            type="button"
                            onClick={() => addMember(member)}
                            disabled={isSelected}
                            className={[
                              "w-full flex items-center justify-between gap-3 px-3 py-2 text-left text-[12px] border-b border-neutral last:border-b-0 transition-colors",
                              isSelected
                                ? "bg-neutral-light-active text-neutral-dark cursor-not-allowed"
                                : "hover:bg-neutral-light-active text-primary",
                            ].join(" ")}
                          >
                            <span className="flex items-center gap-2 min-w-0">
                              <span className="w-7 h-7 rounded-full bg-neutral-light-active border border-neutral flex items-center justify-center text-[10px] font-semibold text-primary/80 overflow-hidden shrink-0">
                                {member.avatar ? (
                                  <img
                                    src={member.avatar}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  getInitials(member.name)
                                )}
                              </span>
                              <span className="truncate">{member.name}</span>
                            </span>
                            <span className="text-[11px]">
                              {isSelected ? "Đã chọn" : "Chọn"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {previewMembers.length === 0 ? (
                      <span className="text-[11px] text-neutral-dark">
                        Chưa có thành viên
                      </span>
                    ) : (
                      previewMembers.map((member) => (
                        <span
                          key={`selected-${member.id}`}
                          className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-neutral bg-neutral-light-active text-[11px] text-primary"
                        >
                          <span className="w-5 h-5 rounded-full bg-neutral-light border border-neutral flex items-center justify-center text-[9px] font-semibold text-primary/80 overflow-hidden">
                            {member.avatar ? (
                              <img
                                src={member.avatar}
                                alt={member.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              getInitials(member.name)
                            )}
                          </span>
                          <span className="max-w-[140px] truncate">
                            {member.name}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeMember(member.id)}
                            className="text-neutral-dark hover:text-promotion"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-neutral text-[12px] font-medium text-primary hover:bg-neutral-light-active transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={saving}
                className={[
                  "px-3.5 py-2 rounded-lg text-[12px] font-medium transition-all shadow-sm",
                  saving
                    ? "bg-neutral text-neutral-dark cursor-not-allowed"
                    : "bg-primary text-neutral-light hover:bg-primary-hover",
                ].join(" ")}
              >
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
            {saveError && (
              <p className="mt-3 text-[11px] text-promotion text-right">
                {saveError}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
