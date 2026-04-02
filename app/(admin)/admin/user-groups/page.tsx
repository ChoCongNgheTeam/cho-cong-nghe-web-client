"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Pencil, Users, X } from "lucide-react";

type Member = {
  id: string;
  name: string;
  avatar?: string;
};

type Group = {
  id: string;
  name: string;
  roles: string[];
  members: Member[];
};

const ROLE_OPTIONS = ["Owner", "Admin", "Editor", "Reviewer", "Support"];

const GROUPS: Group[] = [
  {
    id: "g-01",
    name: "Core Admins",
    roles: ["Owner", "Admin"],
    members: [
      { id: "m-01", name: "Ava Nguyen" },
      { id: "m-02", name: "Liam Tran" },
      { id: "m-03", name: "Minh Pham" },
      { id: "m-04", name: "Sofia Le" },
      { id: "m-05", name: "Quang Ho" },
    ],
  },
  {
    id: "g-02",
    name: "Content Ops",
    roles: ["Editor", "Reviewer"],
    members: [
      { id: "m-06", name: "Chloe Nguyen" },
      { id: "m-07", name: "Noah Vo" },
      { id: "m-08", name: "Han Le" },
    ],
  },
  {
    id: "g-03",
    name: "Customer Success",
    roles: ["Support", "Reviewer"],
    members: [
      { id: "m-09", name: "Gia Bui" },
      { id: "m-10", name: "Ethan Tran" },
      { id: "m-11", name: "Thao Mai" },
      { id: "m-12", name: "Khanh Do" },
    ],
  },
  {
    id: "g-04",
    name: "Growth Team",
    roles: ["Editor"],
    members: [
      { id: "m-13", name: "Luna Pham" },
      { id: "m-14", name: "Huy Truong" },
    ],
  },
];

function getInitials(name: string) {
  const parts = name.trim().split(" ").filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

export default function UserGroupsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [draftName, setDraftName] = useState("");
  const [draftRoles, setDraftRoles] = useState<string[]>([]);

  const isCreate = modalOpen && !editingGroup;

  useEffect(() => {
    if (!modalOpen) return;
    setDraftName(editingGroup?.name ?? "");
    setDraftRoles(editingGroup?.roles ?? []);
  }, [modalOpen, editingGroup]);

  const previewMembers = useMemo(() => editingGroup?.members ?? [], [editingGroup]);

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

  return (
    <div className="space-y-5 p-4 sm:p-6 bg-neutral-light min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neutral-light-active flex items-center justify-center border border-neutral">
            <Users size={18} className="text-primary/70" />
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-primary">User Groups</h1>
            <p className="text-[12px] text-neutral-dark">
              Manage group permissions and memberships
            </p>
          </div>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
        >
          <Plus size={14} /> Create Group
        </button>
      </div>

      {/* Group list */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {GROUPS.map((group) => {
          const extraMembers = Math.max(0, group.members.length - 4);
          return (
            <div
              key={group.id}
              className="rounded-2xl border border-neutral/60 bg-white/80 shadow-sm hover:shadow-md transition-all"
            >
              <div className="p-4 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[15px] font-semibold text-primary">
                      {group.name}
                    </h3>
                    <p className="text-[12px] text-neutral-dark">
                      {group.members.length} members
                    </p>
                  </div>
                  <button
                    onClick={() => openEdit(group)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-primary border border-neutral hover:bg-neutral-light-active transition-all"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                </div>

                {/* Role tags */}
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

              {/* Members */}
              <div className="px-4 pb-4 flex items-center justify-between">
                <div className="flex -space-x-2">
                  {group.members.slice(0, 4).map((member) => (
                    <div
                      key={member.id}
                      className="w-8 h-8 rounded-full border-2 border-white bg-neutral-light-active flex items-center justify-center text-[10px] font-semibold text-primary/80 overflow-hidden"
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
                    +{extraMembers} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
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
                  {isCreate ? "Create Group" : "Edit Group"}
                </h2>
                <p className="text-[12px] text-neutral-dark">
                  Define roles and membership visibility
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
                  Group name
                </label>
                <input
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="e.g. Core Admins"
                  className="mt-2 w-full px-3 py-2 rounded-lg border border-neutral bg-white text-[13px] text-primary placeholder:text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <p className="text-[12px] font-medium text-primary">Assigned roles</p>
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
                            ? "bg-primary/10 text-primary border-primary/30"
                            : "bg-neutral-light-active text-primary/70 border-neutral/70 hover:bg-neutral-light",
                        ].join(" ")}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-[12px] font-medium text-primary">Members</p>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex -space-x-2">
                    {previewMembers.slice(0, 4).map((member) => (
                      <div
                        key={member.id}
                        className="w-8 h-8 rounded-full border-2 border-white bg-neutral-light-active flex items-center justify-center text-[10px] font-semibold text-primary/80 overflow-hidden"
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
                  <span className="text-[11px] text-neutral-dark">
                    {previewMembers.length
                      ? `${previewMembers.length} members`
                      : "No members yet"}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-2 rounded-lg border border-neutral text-[12px] font-medium text-primary hover:bg-neutral-light-active transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => setModalOpen(false)}
                className="px-3.5 py-2 rounded-lg bg-primary text-white text-[12px] font-medium hover:bg-primary/90 transition-all shadow-sm"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
