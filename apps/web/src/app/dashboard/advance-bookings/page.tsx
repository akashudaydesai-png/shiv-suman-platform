"use client";

import { useEffect, useState } from "react";
import { AdvanceBookingForm } from "@/app/advance-booking/advance-booking-form";
import { apiBaseUrl } from "@/lib/api";

type Branch = { id: string; name: string };
type Booking = {
  id: string;
  bookingCode?: string;
  fullName: string;
  phone: string;
  email: string | null;
  branchId: string;
  slotId: string;
  amount: number;
  status: string;
  createdAt: string;
};

export default function AdvanceBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [showForm, setShowForm] = useState(false);

  async function loadBookings() {
    const token = localStorage.getItem("shiv_suman_token");
    const response = await fetch(`${apiBaseUrl}/advance-bookings`, { headers: { Authorization: `Bearer ${token}` } });
    if (response.ok) setBookings(await response.json());
  }

  useEffect(() => {
    loadBookings();
    fetch(`${apiBaseUrl}/public/branches`)
      .then((response) => response.ok ? response.json() : [])
      .then(setBranches)
      .catch(() => setBranches([]));
  }, []);

  return (
    <div className="grid gap-6">
      <section>
        <h1 className="text-3xl font-bold text-brand-ink">Advance Bookings</h1>
        <p className="mt-2 text-black/65">Website and reception advance bookings appear here. Booking amount is Rs 500.</p>
      </section>
      <section>
        <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={() => setShowForm((value) => !value)} type="button">
          {showForm ? "Close Form" : "Add Advance Booking"}
        </button>
      </section>
      {showForm ? (
        <AdvanceBookingForm
          branches={branches}
          onSubmitted={() => {
            loadBookings();
            setShowForm(false);
          }}
        />
      ) : null}
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-brand-teal text-white">
            <tr>
              <th className="p-3">Booking ID</th>
              <th className="p-3">Name</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Slot</th>
              <th className="p-3">Amount</th>
              <th className="p-3">Plan / Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} className="border-t border-brand-teal/10">
                <td className="p-3 font-semibold text-brand-teal">{booking.bookingCode ?? booking.id.slice(0, 7).toUpperCase()}</td>
                <td className="p-3 font-semibold text-brand-ink">{booking.fullName}</td>
                <td className="p-3">{booking.phone}</td>
                <td className="p-3">{booking.slotId}</td>
                <td className="p-3">Rs {booking.amount}</td>
                <td className="p-3">{booking.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
