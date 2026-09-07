"use client";

import React, { useEffect, useState } from "react";
import { Users, Plus, Search, Trash2, ShieldCheck, User as UserIcon } from "lucide-react";
import { Table, Column } from "../../src/components/ui/Table";
import { Button } from "../../src/components/ui/Button";
import { Input } from "../../src/components/ui/Input";
import { Select } from "../../src/components/ui/Select";
import { Badge } from "../../src/components/ui/Badge";
import { Modal } from "../../src/components/ui/Modal";
import { UsersApi } from "../../src/api/users.api";
import { UserDetail } from "../../src/api/types";

export default function UsersPage() {
  const [users, setUsers] = useState<UserDetail[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    role_name: "Mapper",
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await UsersApi.getUsers();
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UsersApi.createUser(formData);
      setIsModalOpen(false);
      setFormData({
        full_name: "",
        email: "",
        password: "",
        phone: "",
        role_name: "Mapper",
      });
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to create user");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await UsersApi.deleteUser(id);
      fetchUsers();
    } catch (err: any) {
      alert(err?.message || "Failed to delete user");
    }
  };

  const filtered = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const columns: Column<UserDetail>[] = [
    {
      key: "full_name",
      header: "User",
      render: (item) => (
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[var(--color-bg-surface)] text-[var(--color-accent-indigo)] flex items-center justify-center font-bold text-xs shrink-0">
            {item.full_name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="font-semibold text-[var(--color-text-heading)]">
              {item.full_name}
            </div>
            <div className="text-xs text-[var(--color-text-muted)]">
              {item.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "System Role",
      render: (item) => (
        <div className="flex items-center gap-1.5">
          {item.roles.map((r) => (
            <Badge
              key={r}
              variant={r === "Super Admin" ? "primary" : "neutral"}
              size="sm"
            >
              {r}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "phone",
      header: "Phone",
      render: (item) => (
        <span className="text-xs text-[var(--color-text-secondary)]">
          {item.phone || "-"}
        </span>
      ),
    },
    {
      key: "is_active",
      header: "Status",
      render: (item) => (
        <Badge variant={item.is_active ? "active" : "draft"}>
          {item.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (item) => (
        <button
          onClick={() => handleDelete(item.id)}
          className="p-1.5 rounded-lg text-[var(--color-status-danger-text)] hover:bg-[var(--color-status-danger-bg)] transition-colors cursor-pointer"
        >
          <Trash2 size={14} />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text-heading)]">
            Users & Permissions
          </h1>
          <p className="text-xs text-[var(--color-text-secondary)]">
            Manage system administrators, facility mappers, and reviewers.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} icon={<Plus size={16} />}>
          Add User
        </Button>
      </div>

      <div className="w-full max-w-sm">
        <Input
          placeholder="Search users by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search size={14} />}
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        emptyMessage={loading ? "Loading users..." : "No users found."}
      />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add System User"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Full Name"
            required
            value={formData.full_name}
            onChange={(e) =>
              setFormData({ ...formData, full_name: e.target.value })
            }
            placeholder="e.g. Sara Khan"
          />
          <Input
            label="Email Address"
            type="email"
            required
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            placeholder="e.g. sara@hospital.org"
          />
          <Input
            label="Password"
            type="password"
            required
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            placeholder="••••••••"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              placeholder="+92 300 1234567"
            />
            <Select
              label="Role"
              value={formData.role_name}
              onChange={(e) =>
                setFormData({ ...formData, role_name: e.target.value })
              }
              options={[
                { label: "Super Admin", value: "Super Admin" },
                { label: "Hospital Admin", value: "Hospital Admin" },
                { label: "Facility Mapper", value: "Mapper" },
                { label: "Map Reviewer", value: "Reviewer" },
              ]}
            />
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t border-[var(--color-border-subtle)]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
