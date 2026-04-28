"use client";

import { useEffect, useMemo, useState } from "react";
import { apiBaseUrl } from "@/lib/api";

type Branch = { id: string; name: string };

type CarExpense = {
  id: string;
  type: string;
  amount: number;
  expenseDate: string;
  odometerKm: number | null;
  vendorName: string | null;
  note: string | null;
};

type Car = {
  id: string;
  name: string;
  registrationNo: string;
  fuelType: string | null;
  fleetDeviceId: string | null;
  cameraDeviceId: string | null;
  liveLatitude: string | null;
  liveLongitude: string | null;
  liveLocationText: string | null;
  dtcCodes: string | null;
  fuelLevelPercent: number | null;
  harshBrakingCount: number | null;
  harshAccelerationCount: number | null;
  idleMinutes: number | null;
  liveOdometerKm: number | null;
  registrationValidFrom: string | null;
  registrationValidUpto: string | null;
  insuranceCompanyName: string | null;
  insurancePolicyNumber: string | null;
  insuranceValidFrom: string | null;
  insuranceValidUpto: string | null;
  pucCertificateNo: string | null;
  pucValidFrom: string | null;
  pucValidUpto: string | null;
  odometerKm: number | null;
  healthStatus: string | null;
  healthNotes: string | null;
  branch: { id?: string; name: string };
  expenses: CarExpense[];
};

type CarForm = {
  name: string;
  registrationNo: string;
  branchId: string;
  fuelType: string;
  fleetDeviceId: string;
  cameraDeviceId: string;
  liveLatitude: string;
  liveLongitude: string;
  liveLocationText: string;
  dtcCodes: string;
  fuelLevelPercent: string;
  harshBrakingCount: string;
  harshAccelerationCount: string;
  idleMinutes: string;
  liveOdometerKm: string;
  registrationValidFrom: string;
  registrationValidUpto: string;
  insuranceCompanyName: string;
  insurancePolicyNumber: string;
  insuranceValidFrom: string;
  insuranceValidUpto: string;
  pucCertificateNo: string;
  pucValidFrom: string;
  pucValidUpto: string;
  odometerKm: string;
  healthStatus: string;
  healthNotes: string;
};

type ExpenseForm = {
  type: string;
  amount: string;
  expenseDate: string;
  odometerKm: string;
  vendorName: string;
  note: string;
};

type Reminder = {
  key: string;
  label: string;
  dueText: string;
  tone: string;
};

const healthOptions = ["Good", "Needs Service", "Urgent Attention"];
const expenseOptions = ["Petrol", "Oil Change", "Maintenance", "Insurance", "PUC", "Registration", "Other"];
const fuelOptions = ["PETROL", "DIESEL", "CNG", "EV", "HYBRID", "OTHER"];

function toUpper(value: string) {
  return value.toUpperCase();
}

function normalizeRegistrationInput(value: string) {
  return value.toUpperCase().replace(/\s+/g, "").slice(0, 10);
}

function isRegistrationValid(value: string) {
  return /^MH\d{2}[A-Z]{2}\d{4}$/.test(normalizeRegistrationInput(value));
}

function blankCarForm(): CarForm {
  return {
    name: "",
    registrationNo: "",
    branchId: "",
    fuelType: "PETROL",
    fleetDeviceId: "",
    cameraDeviceId: "",
    liveLatitude: "",
    liveLongitude: "",
    liveLocationText: "",
    dtcCodes: "",
    fuelLevelPercent: "",
    harshBrakingCount: "",
    harshAccelerationCount: "",
    idleMinutes: "",
    liveOdometerKm: "",
    registrationValidFrom: "",
    registrationValidUpto: "",
    insuranceCompanyName: "",
    insurancePolicyNumber: "",
    insuranceValidFrom: "",
    insuranceValidUpto: "",
    pucCertificateNo: "",
    pucValidFrom: "",
    pucValidUpto: "",
    odometerKm: "",
    healthStatus: "Good",
    healthNotes: ""
  };
}

function blankExpenseForm(): ExpenseForm {
  const today = new Date().toISOString().slice(0, 10);
  return {
    type: "Petrol",
    amount: "",
    expenseDate: today,
    odometerKm: "",
    vendorName: "",
    note: ""
  };
}

function toDateInput(value?: string | null) {
  return value ? value.slice(0, 10) : "";
}

function carToForm(car: Car): CarForm {
  return {
    name: car.name ?? "",
    registrationNo: car.registrationNo ?? "",
    branchId: car.branch.id ?? "",
    fuelType: car.fuelType ?? "PETROL",
    fleetDeviceId: car.fleetDeviceId ?? "",
    cameraDeviceId: car.cameraDeviceId ?? "",
    liveLatitude: car.liveLatitude ?? "",
    liveLongitude: car.liveLongitude ?? "",
    liveLocationText: car.liveLocationText ?? "",
    dtcCodes: car.dtcCodes ?? "",
    fuelLevelPercent: car.fuelLevelPercent === null || car.fuelLevelPercent === undefined ? "" : String(car.fuelLevelPercent),
    harshBrakingCount: car.harshBrakingCount === null || car.harshBrakingCount === undefined ? "" : String(car.harshBrakingCount),
    harshAccelerationCount: car.harshAccelerationCount === null || car.harshAccelerationCount === undefined ? "" : String(car.harshAccelerationCount),
    idleMinutes: car.idleMinutes === null || car.idleMinutes === undefined ? "" : String(car.idleMinutes),
    liveOdometerKm: car.liveOdometerKm === null || car.liveOdometerKm === undefined ? "" : String(car.liveOdometerKm),
    registrationValidFrom: toDateInput(car.registrationValidFrom),
    registrationValidUpto: toDateInput(car.registrationValidUpto),
    insuranceCompanyName: car.insuranceCompanyName ?? "",
    insurancePolicyNumber: car.insurancePolicyNumber ?? "",
    insuranceValidFrom: toDateInput(car.insuranceValidFrom),
    insuranceValidUpto: toDateInput(car.insuranceValidUpto),
    pucCertificateNo: car.pucCertificateNo ?? "",
    pucValidFrom: toDateInput(car.pucValidFrom),
    pucValidUpto: toDateInput(car.pucValidUpto),
    odometerKm: car.odometerKm === null || car.odometerKm === undefined ? "" : String(car.odometerKm),
    healthStatus: car.healthStatus ?? "Good",
    healthNotes: car.healthNotes ?? ""
  };
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN");
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

async function readErrorMessage(response: Response) {
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string") return payload.message;
    if (Array.isArray(payload?.message)) return payload.message.join(", ");
    if (typeof payload?.error === "string") return payload.error;
  } catch {}
  return `Request failed with status ${response.status}.`;
}

function getReminder(label: string, dueDate?: string | null): Reminder | null {
  if (!dueDate) return null;
  const target = new Date(dueDate);
  if (Number.isNaN(target.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86400000);

  if (diffDays < 0) {
    return { key: label, label, dueText: `${Math.abs(diffDays)} day overdue`, tone: "bg-red-100 text-red-700" };
  }
  if (diffDays <= 30) {
    return { key: label, label, dueText: `Admin alert in ${diffDays} day${diffDays === 1 ? "" : "s"}`, tone: "bg-amber-100 text-amber-800" };
  }
  return { key: label, label, dueText: `Due ${formatDate(dueDate)}`, tone: "bg-emerald-100 text-emerald-700" };
}

function reminderList(car: Car) {
  return [getReminder("Registration", car.registrationValidUpto), getReminder("Insurance", car.insuranceValidUpto), getReminder("PUC", car.pucValidUpto)].filter(Boolean) as Reminder[];
}

function summaryStats(cars: Car[]) {
  const reminders = cars.flatMap(reminderList);
  const overdue = reminders.filter((item) => item.dueText.includes("overdue")).length;
  const dueSoon = reminders.filter((item) => item.dueText.includes("Admin alert")).length;
  const expenses = cars.flatMap((car) => car.expenses);
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  return { totalCars: cars.length, overdue, dueSoon, totalExpense };
}

function Input({
  value,
  onChange,
  placeholder,
  type = "text",
  upper = true
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  upper?: boolean;
}) {
  return (
    <input
      className="rounded-md border border-black/15 px-3 py-2"
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(event) => onChange(upper && type === "text" ? toUpper(event.target.value) : event.target.value)}
    />
  );
}

function FieldBlock({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.08em] text-black/50">{label}</span>
      {children}
    </label>
  );
}

export default function CarsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState<CarForm>(blankCarForm());
  const [profileForms, setProfileForms] = useState<Record<string, CarForm>>({});
  const [expenseForms, setExpenseForms] = useState<Record<string, ExpenseForm>>({});
  const [savingProfileId, setSavingProfileId] = useState<string | null>(null);
  const [savingExpenseId, setSavingExpenseId] = useState<string | null>(null);

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("shiv_suman_token");
    return fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers ?? {}) }
    });
  }

  async function loadData() {
    const [carsResponse, branchesResponse] = await Promise.all([authFetch("/vehicles"), authFetch("/branches")]);
    if (carsResponse.ok) {
      const nextCars = (await carsResponse.json()) as Car[];
      setCars(nextCars);
      setProfileForms(Object.fromEntries(nextCars.map((car) => [car.id, carToForm(car)])));
      setExpenseForms((current) => {
        const next = { ...current };
        nextCars.forEach((car) => {
          if (!next[car.id]) next[car.id] = blankExpenseForm();
        });
        return next;
      });
    }
    if (branchesResponse.ok) setBranches(await branchesResponse.json());
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => summaryStats(cars), [cars]);

  function minimalVehiclePayload(profile: CarForm) {
    return {
      name: profile.name,
      registrationNo: profile.registrationNo,
      branchId: profile.branchId,
      fleetDeviceId: profile.fleetDeviceId,
      cameraDeviceId: profile.cameraDeviceId
    };
  }

  async function createCar() {
    if (!form.name || !form.branchId || !form.registrationNo) {
      setMessage("Car name, branch, and registration number are required.");
      return;
    }
    if (!isRegistrationValid(form.registrationNo)) {
      setMessage("Registration must be `MH09DX6256` format with no spaces.");
      return;
    }
    setMessage("Creating car profile...");
    let response = await authFetch("/vehicles", { method: "POST", body: JSON.stringify(form) });
    if (!response.ok && response.status >= 500) {
      response = await authFetch("/vehicles", { method: "POST", body: JSON.stringify(minimalVehiclePayload(form)) });
    }
    if (!response.ok) {
      const details = await readErrorMessage(response);
      setMessage(`Car profile create failed: ${details}`);
      return;
    }
    setForm(blankCarForm());
    setMessage("Car profile created.");
    await loadData();
  }

  async function saveProfile(carId: string) {
    const profile = profileForms[carId];
    if (!profile) return;
    setSavingProfileId(carId);
    setMessage("Saving car profile...");
    const response = await authFetch(`/vehicles/${carId}`, { method: "PATCH", body: JSON.stringify(profile) });
    setSavingProfileId(null);
    if (!response.ok) {
      setMessage(await readErrorMessage(response));
      return;
    }
    setMessage("Car profile saved.");
    await loadData();
  }

  async function addExpense(carId: string) {
    const expense = expenseForms[carId];
    if (!expense) return;
    setSavingExpenseId(carId);
    setMessage("Saving expense...");
    const response = await authFetch(`/vehicles/${carId}/expenses`, { method: "POST", body: JSON.stringify(expense) });
    setSavingExpenseId(null);
    if (!response.ok) {
      setMessage(await readErrorMessage(response));
      return;
    }
    setExpenseForms((current) => ({ ...current, [carId]: blankExpenseForm() }));
    setMessage("Expense saved.");
    await loadData();
  }

  async function deleteCar(id: string) {
    await authFetch(`/vehicles/${id}`, { method: "DELETE" });
    setMessage("Car archived.");
    await loadData();
  }

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Cars</h1>
        <p className="mt-2 text-black/65">Create a full car profile with registration, insurance, PUC, health notes, and ongoing fleet expenses.</p>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <article className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-black/45">Total Cars</p>
          <p className="mt-2 text-2xl font-bold text-brand-teal">{stats.totalCars}</p>
        </article>
        <article className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-black/45">Overdue Reminders</p>
          <p className="mt-2 text-2xl font-bold text-red-600">{stats.overdue}</p>
        </article>
        <article className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-black/45">Due In 30 Days</p>
          <p className="mt-2 text-2xl font-bold text-amber-600">{stats.dueSoon}</p>
        </article>
        <article className="rounded-md border border-brand-teal/20 bg-white p-4 shadow-soft">
          <p className="text-xs font-semibold uppercase text-black/45">Recorded Expenses</p>
          <p className="mt-2 text-2xl font-bold text-brand-ink">{formatCurrency(stats.totalExpense)}</p>
        </article>
      </section>

      <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
        <div>
          <h2 className="text-xl font-bold text-brand-ink">Create Car Profile</h2>
          <p className="mt-2 text-sm text-black/60">Add the vehicle once, then keep registration, insurance, PUC, health, and expense updates under that same car name.</p>
        </div>
        <div className="mt-5 grid gap-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <FieldBlock label="Car Name">
              <Input value={form.name} placeholder="Car name" onChange={(value) => setForm({ ...form, name: toUpper(value) })} />
            </FieldBlock>
            <FieldBlock label="Registration Number">
              <Input value={form.registrationNo} placeholder="MH09DX6256" onChange={(value) => setForm({ ...form, registrationNo: normalizeRegistrationInput(value) })} />
            </FieldBlock>
            <FieldBlock label="Branch">
              <select className="rounded-md border border-black/15 px-3 py-2" value={form.branchId} onChange={(event) => setForm({ ...form, branchId: event.target.value })}>
                <option value="">Select branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </FieldBlock>
            <FieldBlock label="Fuel Type">
              <select className="rounded-md border border-black/15 px-3 py-2" value={form.fuelType} onChange={(event) => setForm({ ...form, fuelType: event.target.value })}>
                {fuelOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </FieldBlock>
            <FieldBlock label="Health Status">
              <select className="rounded-md border border-black/15 px-3 py-2" value={form.healthStatus} onChange={(event) => setForm({ ...form, healthStatus: event.target.value })}>
                {healthOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </FieldBlock>
            <FieldBlock label="Fleet Device ID">
              <Input value={form.fleetDeviceId} placeholder="Fleet device ID" onChange={(value) => setForm({ ...form, fleetDeviceId: toUpper(value) })} />
            </FieldBlock>
            <FieldBlock label="Camera Device ID">
              <Input value={form.cameraDeviceId} placeholder="Camera device ID" onChange={(value) => setForm({ ...form, cameraDeviceId: toUpper(value) })} />
            </FieldBlock>
            <FieldBlock label="Odometer KM">
              <Input type="number" upper={false} value={form.odometerKm} placeholder="Odometer km" onChange={(value) => setForm({ ...form, odometerKm: value })} />
            </FieldBlock>
          </div>

          <div className="grid gap-4 rounded-md border border-brand-teal/15 p-4">
            <div>
              <h3 className="text-lg font-bold text-brand-ink">Registration</h3>
              <p className="mt-1 text-sm text-black/55">These dates belong only to this car registration.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FieldBlock label="Registration Number">
                <Input value={form.registrationNo} placeholder="MH09DX6256" onChange={(value) => setForm({ ...form, registrationNo: normalizeRegistrationInput(value) })} />
              </FieldBlock>
              <FieldBlock label="Registration Valid From">
                <Input type="date" value={form.registrationValidFrom} onChange={(value) => setForm({ ...form, registrationValidFrom: value })} />
              </FieldBlock>
              <FieldBlock label="Registration Valid Upto">
                <Input type="date" value={form.registrationValidUpto} onChange={(value) => setForm({ ...form, registrationValidUpto: value })} />
              </FieldBlock>
            </div>
          </div>

          <div className="grid gap-4 rounded-md border border-brand-teal/15 p-4">
            <div>
              <h3 className="text-lg font-bold text-brand-ink">Insurance</h3>
              <p className="mt-1 text-sm text-black/55">Insurance company, policy number, and validity stay inside this car profile. Admin alert starts 1 month before expiry.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <FieldBlock label="Insurance Company Name">
                <Input value={form.insuranceCompanyName} placeholder="Insurance company" onChange={(value) => setForm({ ...form, insuranceCompanyName: toUpper(value) })} />
              </FieldBlock>
              <FieldBlock label="Insurance Policy Number">
                <Input value={form.insurancePolicyNumber} placeholder="Insurance policy no" onChange={(value) => setForm({ ...form, insurancePolicyNumber: toUpper(value) })} />
              </FieldBlock>
              <FieldBlock label="Insurance Valid From">
                <Input type="date" value={form.insuranceValidFrom} onChange={(value) => setForm({ ...form, insuranceValidFrom: value })} />
              </FieldBlock>
              <FieldBlock label="Insurance Valid Upto">
                <Input type="date" value={form.insuranceValidUpto} onChange={(value) => setForm({ ...form, insuranceValidUpto: value })} />
              </FieldBlock>
            </div>
          </div>

          <div className="grid gap-4 rounded-md border border-brand-teal/15 p-4">
            <div>
              <h3 className="text-lg font-bold text-brand-ink">PUC</h3>
              <p className="mt-1 text-sm text-black/55">PUC certificate and validity are saved under this same car name. Admin alert starts 1 month before expiry.</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <FieldBlock label="PUC Certificate Number">
                <Input value={form.pucCertificateNo} placeholder="PUC certificate no" onChange={(value) => setForm({ ...form, pucCertificateNo: toUpper(value) })} />
              </FieldBlock>
              <FieldBlock label="PUC Valid From">
                <Input type="date" value={form.pucValidFrom} onChange={(value) => setForm({ ...form, pucValidFrom: value })} />
              </FieldBlock>
              <FieldBlock label="PUC Valid Upto">
                <Input type="date" value={form.pucValidUpto} onChange={(value) => setForm({ ...form, pucValidUpto: value })} />
              </FieldBlock>
            </div>
          </div>
        </div>
        <textarea
          className="mt-4 min-h-24 w-full rounded-md border border-black/15 px-3 py-2"
          placeholder="Fleet health notes, service observations, tyre/battery issues, next maintenance details"
          value={form.healthNotes}
          onChange={(event) => setForm({ ...form, healthNotes: toUpper(event.target.value) })}
        />
        <button className="mt-5 rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={createCar} type="button">Create Car Profile</button>
        {message ? <p className="mt-3 text-sm font-semibold text-brand-teal">{message}</p> : null}
        {form.registrationNo && !isRegistrationValid(form.registrationNo) ? (
          <p className="mt-2 text-sm font-semibold text-red-600">Registration must be `MH09DX6256` format with no spaces.</p>
        ) : null}
      </section>

      <section className="grid gap-5">
        {cars.map((car) => {
          const profile = profileForms[car.id] ?? carToForm(car);
          const expense = expenseForms[car.id] ?? blankExpenseForm();
          const reminders = reminderList(car);
          const totalExpense = car.expenses.reduce((sum, item) => sum + item.amount, 0);

          return (
            <article key={car.id} className="grid gap-5 rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-brand-ink">{car.name}</h2>
                  <p className="mt-1 text-sm text-black/60">{car.registrationNo} | {car.branch.name}</p>
                  <p className="mt-2 text-sm text-black/60">Fleet: {car.fleetDeviceId ?? "-"} | Camera: {car.cameraDeviceId ?? "-"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {reminders.length ? reminders.map((reminder) => (
                    <span key={`${car.id}-${reminder.key}`} className={`rounded-md px-3 py-2 text-xs font-semibold ${reminder.tone}`}>
                      {reminder.label}: {reminder.dueText}
                    </span>
                  )) : (
                    <span className="rounded-md bg-brand-mist px-3 py-2 text-xs font-semibold text-brand-teal">No reminder dates added yet</span>
                  )}
                </div>
              </div>

              <section className="grid gap-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <FieldBlock label="Car Name">
                    <Input value={profile.name} placeholder="Car name" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, name: toUpper(value) } })} />
                  </FieldBlock>
                  <FieldBlock label="Registration Number">
                    <Input value={profile.registrationNo} placeholder="MH09DX6256" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, registrationNo: normalizeRegistrationInput(value) } })} />
                  </FieldBlock>
                  <FieldBlock label="Branch">
                    <select className="rounded-md border border-black/15 px-3 py-2" value={profile.branchId} onChange={(event) => setProfileForms({ ...profileForms, [car.id]: { ...profile, branchId: event.target.value } })}>
                      <option value="">Select branch</option>
                      {branches.map((branch) => (
                        <option key={`${car.id}-${branch.id}`} value={branch.id}>{branch.name}</option>
                      ))}
                    </select>
                  </FieldBlock>
                  <FieldBlock label="Fuel Type">
                    <select className="rounded-md border border-black/15 px-3 py-2" value={profile.fuelType} onChange={(event) => setProfileForms({ ...profileForms, [car.id]: { ...profile, fuelType: event.target.value } })}>
                      {fuelOptions.map((option) => (
                        <option key={`${car.id}-${option}`} value={option}>{option}</option>
                      ))}
                    </select>
                  </FieldBlock>
                  <FieldBlock label="Health Status">
                    <select className="rounded-md border border-black/15 px-3 py-2" value={profile.healthStatus} onChange={(event) => setProfileForms({ ...profileForms, [car.id]: { ...profile, healthStatus: event.target.value } })}>
                      {healthOptions.map((option) => (
                        <option key={`${car.id}-${option}`} value={option}>{option}</option>
                      ))}
                    </select>
                  </FieldBlock>
                  <FieldBlock label="Fleet Device ID">
                    <Input value={profile.fleetDeviceId} placeholder="Fleet device ID" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, fleetDeviceId: toUpper(value) } })} />
                  </FieldBlock>
                  <FieldBlock label="Camera Device ID">
                    <Input value={profile.cameraDeviceId} placeholder="Camera device ID" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, cameraDeviceId: toUpper(value) } })} />
                  </FieldBlock>
                  <FieldBlock label="Odometer KM">
                    <Input type="number" upper={false} value={profile.odometerKm} placeholder="Odometer km" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, odometerKm: value } })} />
                  </FieldBlock>
                </div>

                <div className="grid gap-4 rounded-md border border-brand-teal/15 p-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-ink">Registration</h3>
                    <p className="mt-1 text-sm text-black/55">Registration dates for this car only.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FieldBlock label="Registration Number">
                      <Input value={profile.registrationNo} placeholder="MH09DX6256" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, registrationNo: normalizeRegistrationInput(value) } })} />
                    </FieldBlock>
                    <FieldBlock label="Registration Valid From">
                      <Input type="date" value={profile.registrationValidFrom} onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, registrationValidFrom: value } })} />
                    </FieldBlock>
                    <FieldBlock label="Registration Valid Upto">
                      <Input type="date" value={profile.registrationValidUpto} onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, registrationValidUpto: value } })} />
                    </FieldBlock>
                  </div>
                </div>

                <div className="grid gap-4 rounded-md border border-brand-teal/15 p-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-ink">Insurance</h3>
                    <p className="mt-1 text-sm text-black/55">Policy number and validity stay together. Admin alert starts 1 month before expiry.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <FieldBlock label="Insurance Company Name">
                      <Input value={profile.insuranceCompanyName} placeholder="Insurance company" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, insuranceCompanyName: toUpper(value) } })} />
                    </FieldBlock>
                    <FieldBlock label="Insurance Policy Number">
                      <Input value={profile.insurancePolicyNumber} placeholder="Insurance policy no" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, insurancePolicyNumber: toUpper(value) } })} />
                    </FieldBlock>
                    <FieldBlock label="Insurance Valid From">
                      <Input type="date" value={profile.insuranceValidFrom} onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, insuranceValidFrom: value } })} />
                    </FieldBlock>
                    <FieldBlock label="Insurance Valid Upto">
                      <Input type="date" value={profile.insuranceValidUpto} onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, insuranceValidUpto: value } })} />
                    </FieldBlock>
                  </div>
                </div>

                <div className="grid gap-4 rounded-md border border-brand-teal/15 p-4">
                  <div>
                    <h3 className="text-lg font-bold text-brand-ink">PUC</h3>
                    <p className="mt-1 text-sm text-black/55">PUC certificate number and its validity are saved together for this car. Admin alert starts 1 month before expiry.</p>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    <FieldBlock label="PUC Certificate Number">
                      <Input value={profile.pucCertificateNo} placeholder="PUC certificate no" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, pucCertificateNo: toUpper(value) } })} />
                    </FieldBlock>
                    <FieldBlock label="PUC Valid From">
                      <Input type="date" value={profile.pucValidFrom} onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, pucValidFrom: value } })} />
                    </FieldBlock>
                    <FieldBlock label="PUC Valid Upto">
                      <Input type="date" value={profile.pucValidUpto} onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, pucValidUpto: value } })} />
                    </FieldBlock>
                  </div>
                </div>
              </section>

              <textarea
                className="min-h-24 w-full rounded-md border border-black/15 px-3 py-2"
                placeholder="Health notes, tyre changes, service comments, damage notes"
                value={profile.healthNotes}
                onChange={(event) => setProfileForms({ ...profileForms, [car.id]: { ...profile, healthNotes: toUpper(event.target.value) } })}
              />
              {profile.registrationNo && !isRegistrationValid(profile.registrationNo) ? (
                <p className="text-sm font-semibold text-red-600">Registration must be `MH09DX6256` format with no spaces.</p>
              ) : null}

              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-md border border-brand-teal/15 bg-brand-mist p-4">
                  <p className="text-xs font-semibold uppercase text-black/45">Registration Upto</p>
                  <p className="mt-2 text-lg font-bold text-brand-ink">{formatDate(car.registrationValidUpto)}</p>
                </div>
                <div className="rounded-md border border-brand-teal/15 bg-brand-mist p-4">
                  <p className="text-xs font-semibold uppercase text-black/45">Insurance Upto</p>
                  <p className="mt-2 text-lg font-bold text-brand-ink">{formatDate(car.insuranceValidUpto)}</p>
                </div>
                <div className="rounded-md border border-brand-teal/15 bg-brand-mist p-4">
                  <p className="text-xs font-semibold uppercase text-black/45">PUC Upto</p>
                  <p className="mt-2 text-lg font-bold text-brand-ink">{formatDate(car.pucValidUpto)}</p>
                </div>
                <div className="rounded-md border border-brand-teal/15 bg-brand-mist p-4">
                  <p className="text-xs font-semibold uppercase text-black/45">Fuel Type</p>
                  <p className="mt-2 text-lg font-bold text-brand-ink">{car.fuelType ?? "-"}</p>
                </div>
                <div className="rounded-md border border-brand-teal/15 bg-brand-mist p-4">
                  <p className="text-xs font-semibold uppercase text-black/45">Expense Total</p>
                  <p className="mt-2 text-lg font-bold text-brand-ink">{formatCurrency(totalExpense)}</p>
                </div>
              </div>

              <section className="grid gap-4 rounded-md border border-brand-teal/15 bg-slate-50 p-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-ink">Fleet Device + Camera REST API Data</h3>
                  <p className="mt-1 text-sm text-black/60">After fleet device and camera integration, this car profile can receive real-time GPS, engine diagnostics, fuel monitoring, odometer, and driver behavior data.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                  <FieldBlock label="Live Latitude">
                    <Input value={profile.liveLatitude} placeholder="18.5204" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, liveLatitude: value } })} upper={false} />
                  </FieldBlock>
                  <FieldBlock label="Live Longitude">
                    <Input value={profile.liveLongitude} placeholder="73.8567" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, liveLongitude: value } })} upper={false} />
                  </FieldBlock>
                  <FieldBlock label="Live Location">
                    <Input value={profile.liveLocationText} placeholder="KOLHAPUR CITY" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, liveLocationText: toUpper(value) } })} />
                  </FieldBlock>
                  <FieldBlock label="Fuel Level %">
                    <Input type="number" upper={false} value={profile.fuelLevelPercent} placeholder="65" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, fuelLevelPercent: value } })} />
                  </FieldBlock>
                  <FieldBlock label="Live Odometer KM">
                    <Input type="number" upper={false} value={profile.liveOdometerKm} placeholder="45230" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, liveOdometerKm: value } })} />
                  </FieldBlock>
                  <FieldBlock label="DTC Codes">
                    <Input value={profile.dtcCodes} placeholder="P0131, C1234" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, dtcCodes: toUpper(value) } })} />
                  </FieldBlock>
                  <FieldBlock label="Harsh Braking Count">
                    <Input type="number" upper={false} value={profile.harshBrakingCount} placeholder="2" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, harshBrakingCount: value } })} />
                  </FieldBlock>
                  <FieldBlock label="Harsh Acceleration Count">
                    <Input type="number" upper={false} value={profile.harshAccelerationCount} placeholder="1" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, harshAccelerationCount: value } })} />
                  </FieldBlock>
                  <FieldBlock label="Idle Minutes">
                    <Input type="number" upper={false} value={profile.idleMinutes} placeholder="12" onChange={(value) => setProfileForms({ ...profileForms, [car.id]: { ...profile, idleMinutes: value } })} />
                  </FieldBlock>
                </div>
              </section>

              <div className="flex flex-wrap gap-3">
                <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={() => saveProfile(car.id)} type="button">
                  {savingProfileId === car.id ? "Saving..." : "Save Car Profile"}
                </button>
                <button className="rounded-md bg-brand-orange px-4 py-3 font-semibold text-white" onClick={() => deleteCar(car.id)} type="button">
                  Archive Car
                </button>
              </div>

              <section className="grid gap-4 rounded-md border border-brand-teal/15 bg-slate-50 p-4">
                <div>
                  <h3 className="text-lg font-bold text-brand-ink">Add Expense</h3>
                  <p className="mt-1 text-sm text-black/60">Save petrol, oil change, maintenance, insurance, PUC, or registration spending directly inside this car profile.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
                  <select className="rounded-md border border-black/15 px-3 py-2" value={expense.type} onChange={(event) => setExpenseForms({ ...expenseForms, [car.id]: { ...expense, type: event.target.value } })}>
                    {expenseOptions.map((option) => (
                      <option key={`${car.id}-expense-${option}`} value={option}>{option}</option>
                    ))}
                  </select>
                  <Input type="number" upper={false} value={expense.amount} placeholder="Amount" onChange={(value) => setExpenseForms({ ...expenseForms, [car.id]: { ...expense, amount: value } })} />
                  <Input type="date" upper={false} value={expense.expenseDate} onChange={(value) => setExpenseForms({ ...expenseForms, [car.id]: { ...expense, expenseDate: value } })} />
                  <Input type="number" upper={false} value={expense.odometerKm} placeholder="Odometer km" onChange={(value) => setExpenseForms({ ...expenseForms, [car.id]: { ...expense, odometerKm: value } })} />
                  <Input value={expense.vendorName} placeholder="Vendor / pump name" onChange={(value) => setExpenseForms({ ...expenseForms, [car.id]: { ...expense, vendorName: toUpper(value) } })} />
                  <Input value={expense.note} placeholder="Short note" onChange={(value) => setExpenseForms({ ...expenseForms, [car.id]: { ...expense, note: toUpper(value) } })} />
                </div>
                <div>
                  <button className="rounded-md bg-brand-ink px-4 py-3 font-semibold text-white" onClick={() => addExpense(car.id)} type="button">
                    {savingExpenseId === car.id ? "Saving..." : "Add Expense"}
                  </button>
                </div>
              </section>

              <section className="grid gap-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-bold text-brand-ink">Expense History</h3>
                  <span className="text-sm text-black/50">{car.expenses.length} entries</span>
                </div>
                {car.expenses.length ? (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[780px] border-collapse text-left text-sm">
                      <thead className="bg-brand-teal text-white">
                        <tr>
                          <th className="p-3">Date</th>
                          <th className="p-3">Type</th>
                          <th className="p-3">Amount</th>
                          <th className="p-3">Odometer</th>
                          <th className="p-3">Vendor</th>
                          <th className="p-3">Note</th>
                        </tr>
                      </thead>
                      <tbody>
                        {car.expenses.map((item) => (
                          <tr className="border-t border-brand-teal/10" key={item.id}>
                            <td className="p-3">{formatDate(item.expenseDate)}</td>
                            <td className="p-3">{item.type}</td>
                            <td className="p-3 font-semibold text-brand-ink">{formatCurrency(item.amount)}</td>
                            <td className="p-3">{item.odometerKm ?? "-"}</td>
                            <td className="p-3">{item.vendorName ?? "-"}</td>
                            <td className="p-3">{item.note ?? "-"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="rounded-md border border-dashed border-black/15 px-4 py-5 text-sm text-black/55">No expenses added yet for this car.</p>
                )}
              </section>
            </article>
          );
        })}
      </section>
    </div>
  );
}
