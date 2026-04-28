"use client";

import { Fragment, useEffect, useState } from "react";
import { DocumentUploadPanel } from "@/components/document-upload-panel";
import { apiBaseUrl } from "@/lib/api";

type Branch = { id: string; name: string };

type StaffMeta = {
  fatherFullName?: string | null;
  bloodGroup?: string | null;
  education?: string | null;
  salary?: number | null;
  address?: {
    addressLine1?: string | null;
    addressLine2?: string | null;
    state?: string | null;
    district?: string | null;
    tehsil?: string | null;
    pincode?: string | null;
  } | null;
} | null;

type User = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  accessStatus: string;
  branchId?: string | null;
  branch: { name: string } | null;
  staff?: {
    id: string;
    employeeCode: string;
    designation: string;
    salaryMeta?: StaffMeta;
    photoUrl?: string | null;
    signatureUrl?: string | null;
    thumbUrl?: string | null;
  } | null;
};

type CreateUserResponse = User & {
  credentials?: {
    userId: string;
    password: string;
    loginId: string;
    email: string;
  };
};

type FileState = {
  photo: File | null;
  signature: File | null;
  thumb: File | null;
};

const roles = ["RECEPTIONIST", "SUPERVISOR", "TRAINER", "BRANCH_ADMIN", "ACCOUNTANT"];
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const emptyFiles: FileState = { photo: null, signature: null, thumb: null };
const emptyForm = {
  userId: "",
  fullName: "",
  fatherFullName: "",
  email: "",
  phone: "",
  role: "TRAINER",
  branchId: "",
  designation: "",
  bloodGroup: "",
  education: "",
  salary: "",
  addressLine1: "",
  addressLine2: "",
  state: "Maharashtra",
  district: "",
  tehsil: "",
  pincode: "",
  password: ""
};

function toUpperTrim(value: string) {
  return value.toUpperCase().replace(/\s+/g, " ").trimStart();
}

function digitsOnly(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, "");
  return maxLength ? digits.slice(0, maxLength) : digits;
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string") return payload.message;
    if (Array.isArray(payload?.message)) return payload.message.join(", ");
  } catch {}
  return "Request failed.";
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [openDocumentsFor, setOpenDocumentsFor] = useState<string | null>(null);
  const [files, setFiles] = useState<FileState>(emptyFiles);
  const [form, setForm] = useState(emptyForm);

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("shiv_suman_token");
    return fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(options.headers ?? {})
      }
    });
  }

  async function loadData() {
    const [usersResponse, branchesResponse] = await Promise.all([authFetch("/users"), authFetch("/branches")]);
    if (usersResponse.ok) setUsers(await usersResponse.json());
    if (branchesResponse.ok) setBranches(await branchesResponse.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  function updateForm<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFiles(emptyFiles);
  }

  function startEdit(user: User) {
    const meta = user.staff?.salaryMeta;
    setEditingId(user.id);
    setForm({
      userId: "",
      fullName: user.fullName ?? "",
      fatherFullName: meta?.fatherFullName ?? "",
      email: user.email ?? "",
      phone: user.phone ?? "",
      role: user.role ?? "TRAINER",
      branchId: user.branchId ?? "",
      designation: user.staff?.designation ?? user.role,
      bloodGroup: meta?.bloodGroup ?? "",
      education: meta?.education ?? "",
      salary: meta?.salary ? String(meta.salary) : "",
      addressLine1: meta?.address?.addressLine1 ?? "",
      addressLine2: meta?.address?.addressLine2 ?? "",
      state: meta?.address?.state ?? "Maharashtra",
      district: meta?.address?.district ?? "",
      tehsil: meta?.address?.tehsil ?? "",
      pincode: meta?.address?.pincode ?? "",
      password: ""
    });
    setFiles(emptyFiles);
    setMessage("");
  }

  async function uploadStaffAsset(staffId: string, type: "PHOTO" | "SIGNATURE" | "THUMB", file: File | null) {
    if (!file) return;
    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", file);
    const response = await authFetch(`/documents/staff/${staffId}`, {
      method: "POST",
      body: formData
    });
    if (!response.ok) {
      throw new Error(await readErrorMessage(response));
    }
  }

  async function saveUser() {
    if (!form.fullName.trim()) {
      setMessage("Full name is required.");
      return;
    }
    if (!form.fatherFullName.trim()) {
      setMessage("Father full name is required.");
      return;
    }
    if (!form.phone || digitsOnly(form.phone, 10).length !== 10) {
      setMessage("Mobile number must be 10 digits.");
      return;
    }
    if (!form.branchId) {
      setMessage("Branch is required.");
      return;
    }
    if (!editingId && (!files.photo || !files.signature || !files.thumb)) {
      setMessage("Photo, signature, and thumb are required for new user profile.");
      return;
    }

    setMessage(editingId ? "Updating user profile..." : "Creating user profile...");

    const payload = {
      ...form,
      fullName: toUpperTrim(form.fullName),
      fatherFullName: toUpperTrim(form.fatherFullName),
      email: form.email.trim(),
      phone: digitsOnly(form.phone, 10),
      designation: toUpperTrim(form.designation || form.role),
      education: toUpperTrim(form.education),
      addressLine1: toUpperTrim(form.addressLine1),
      addressLine2: toUpperTrim(form.addressLine2),
      state: toUpperTrim(form.state),
      district: toUpperTrim(form.district),
      tehsil: toUpperTrim(form.tehsil),
      pincode: digitsOnly(form.pincode, 6),
      salary: digitsOnly(form.salary)
    };

    const response = await authFetch(editingId ? `/users/${editingId}` : "/users", {
      method: editingId ? "PATCH" : "POST",
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      setMessage(await readErrorMessage(response));
      return;
    }

    const saved = await response.json() as CreateUserResponse;
    if (saved.staff?.id) {
      try {
        await uploadStaffAsset(saved.staff.id, "PHOTO", files.photo);
        await uploadStaffAsset(saved.staff.id, "SIGNATURE", files.signature);
        await uploadStaffAsset(saved.staff.id, "THUMB", files.thumb);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Profile saved but document upload failed.");
        await loadData();
        return;
      }
    }

    resetForm();
    setMessage(
      saved.credentials
        ? `User created. Login ID: ${saved.credentials.loginId} | Password: ${saved.credentials.password}`
        : "User profile updated."
    );
    await loadData();
  }

  async function setAccess(id: string, action: "pause" | "reactivate") {
    const response = await authFetch(`/users/${id}/${action}`, { method: "POST" });
    if (response.ok) await loadData();
  }

  async function deleteUser(id: string) {
    const response = await authFetch(`/users/${id}`, { method: "DELETE" });
    if (response.ok) await loadData();
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">User Access And Profiles</h1>
        <p className="mt-2 text-black/65">Create a full user profile with branch access, salary, address, photo, signature, and thumb. Branch assignment controls which branch data that user can work with.</p>
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-brand-ink">{editingId ? "Edit user profile" : "Create user profile"}</h2>
            <p className="mt-2 text-sm text-black/65">Add the core profile once here, then that staff member is ready for branch-wise work.</p>
          </div>
          {editingId ? (
            <button className="rounded-md border border-brand-teal px-4 py-2 font-semibold text-brand-teal" onClick={resetForm} type="button">
              Cancel Edit
            </button>
          ) : null}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-4">
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Access ID optional" value={form.userId} onChange={(e) => updateForm("userId", toUpperTrim(e.target.value).replace(/\s/g, ""))} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Full name" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Father full name" value={form.fatherFullName} onChange={(e) => updateForm("fatherFullName", e.target.value)} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Mobile number" value={form.phone} onChange={(e) => updateForm("phone", digitsOnly(e.target.value, 10))} />

          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Email optional" value={form.email} onChange={(e) => updateForm("email", e.target.value)} />
          <select className="rounded-md border border-black/15 px-3 py-2 disabled:bg-black/5" disabled={Boolean(editingId)} value={form.role} onChange={(e) => updateForm("role", e.target.value)}>
            {roles.map((role) => <option key={role} value={role}>{role}</option>)}
          </select>
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Designation" value={form.designation} onChange={(e) => updateForm("designation", e.target.value)} />
          <select className="rounded-md border border-black/15 px-3 py-2" value={form.branchId} onChange={(e) => updateForm("branchId", e.target.value)}>
            <option value="">Select branch access</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>

          <select className="rounded-md border border-black/15 px-3 py-2" value={form.bloodGroup} onChange={(e) => updateForm("bloodGroup", e.target.value)}>
            <option value="">Select blood group</option>
            {bloodGroups.map((group) => <option key={group} value={group}>{group}</option>)}
          </select>
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Education" value={form.education} onChange={(e) => updateForm("education", e.target.value)} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Salary" value={form.salary} onChange={(e) => updateForm("salary", digitsOnly(e.target.value))} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder={editingId ? "Password optional" : "Password optional (auto if blank)"} value={form.password} onChange={(e) => updateForm("password", e.target.value)} />

          <input className="rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Address line 1" value={form.addressLine1} onChange={(e) => updateForm("addressLine1", e.target.value)} />
          <input className="rounded-md border border-black/15 px-3 py-2 md:col-span-2" placeholder="Address line 2" value={form.addressLine2} onChange={(e) => updateForm("addressLine2", e.target.value)} />

          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="State" value={form.state} onChange={(e) => updateForm("state", e.target.value)} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="District" value={form.district} onChange={(e) => updateForm("district", e.target.value)} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Tehsil" value={form.tehsil} onChange={(e) => updateForm("tehsil", e.target.value)} />
          <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Pincode" value={form.pincode} onChange={(e) => updateForm("pincode", digitsOnly(e.target.value, 6))} />
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-medium">
            Photo
            <input className="rounded-md border border-black/15 px-3 py-2" type="file" accept="image/*" onChange={(e) => setFiles((current) => ({ ...current, photo: e.target.files?.[0] ?? null }))} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Signature
            <input className="rounded-md border border-black/15 px-3 py-2" type="file" accept="image/*" onChange={(e) => setFiles((current) => ({ ...current, signature: e.target.files?.[0] ?? null }))} />
          </label>
          <label className="grid gap-2 text-sm font-medium">
            Thumb
            <input className="rounded-md border border-black/15 px-3 py-2" type="file" accept="image/*" onChange={(e) => setFiles((current) => ({ ...current, thumb: e.target.files?.[0] ?? null }))} />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={saveUser} type="button">
            {editingId ? "Save Profile Changes" : "Create User Profile"}
          </button>
        </div>
        {message ? <p className="mt-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
      </section>

      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Role</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Father Name</th>
                <th className="p-3">Blood Group</th>
                <th className="p-3">Education</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Profile Files</th>
                <th className="p-3">Access</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.filter((user) => user.role !== "STUDENT").map((user) => {
                const meta = user.staff?.salaryMeta;
                const fileSummary = [
                  user.staff?.photoUrl ? "Photo" : null,
                  user.staff?.signatureUrl ? "Sign" : null,
                  user.staff?.thumbUrl ? "Thumb" : null
                ].filter(Boolean).join(", ");

                return (
                  <Fragment key={user.id}>
                    <tr key={user.id} className="border-t border-brand-teal/10 align-top">
                      <td className="p-3 font-semibold text-brand-ink">
                        <div>{user.fullName}</div>
                        <div className="mt-1 text-xs text-black/55">{user.staff?.employeeCode ?? user.email}</div>
                      </td>
                      <td className="p-3">
                        <div>{user.role}</div>
                        <div className="mt-1 text-xs text-black/55">{user.staff?.designation ?? "-"}</div>
                      </td>
                      <td className="p-3">{user.branch?.name ?? "All branches"}</td>
                      <td className="p-3">{meta?.fatherFullName ?? "-"}</td>
                      <td className="p-3">{meta?.bloodGroup ?? "-"}</td>
                      <td className="p-3">{meta?.education ?? "-"}</td>
                      <td className="p-3">{meta?.salary ? `Rs ${meta.salary}` : "-"}</td>
                      <td className="p-3">{fileSummary || "Pending"}</td>
                      <td className="p-3">{user.accessStatus}</td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-2">
                          <button className="rounded-md border border-brand-teal px-3 py-2 font-semibold text-brand-teal" onClick={() => startEdit(user)} type="button">Edit</button>
                          {user.staff?.id ? (
                            <button
                              className="rounded-md border border-brand-teal px-3 py-2 font-semibold text-brand-teal"
                              onClick={() => setOpenDocumentsFor((current) => current === user.id ? null : user.id)}
                              type="button"
                            >
                              {openDocumentsFor === user.id ? "Close Files" : "Files"}
                            </button>
                          ) : null}
                          {user.accessStatus === "ACTIVE" ? (
                            <button className="rounded-md bg-brand-orange px-3 py-2 font-semibold text-white" onClick={() => setAccess(user.id, "pause")} type="button">Pause</button>
                          ) : (
                            <button className="rounded-md bg-brand-teal px-3 py-2 font-semibold text-white" onClick={() => setAccess(user.id, "reactivate")} type="button">Reactivate</button>
                          )}
                          <button className="rounded-md border border-red-500 px-3 py-2 font-semibold text-red-600" onClick={() => deleteUser(user.id)} type="button">Delete</button>
                        </div>
                      </td>
                    </tr>
                    {openDocumentsFor === user.id && user.staff?.id ? (
                      <tr className="border-t border-brand-teal/10">
                        <td className="p-3" colSpan={10}>
                          <div className="mb-3 grid gap-2 text-sm text-black/65 md:grid-cols-2">
                            <div>
                              Address: {[meta?.address?.addressLine1, meta?.address?.addressLine2, meta?.address?.tehsil, meta?.address?.district, meta?.address?.state, meta?.address?.pincode].filter(Boolean).join(", ") || "-"}
                            </div>
                            <div>
                              Branch Access: {user.branch?.name ?? "All branches"}
                            </div>
                          </div>
                          <DocumentUploadPanel ownerType="staff" ownerId={user.staff.id} documentTypes={["PHOTO", "SIGNATURE", "THUMB", "AADHAAR", "PAN", "DRIVING_LICENSE", "POLICE_VERIFICATION", "EXPERIENCE_CERTIFICATE", "OTHER"]} />
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
