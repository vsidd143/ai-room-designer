"use client";

import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

type ProfileData = {
  name: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  country: string;
  createdAt: string;
};

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");

  const [designCount, setDesignCount] = useState(0);
  const [roomTypes, setRoomTypes] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      router.push("/login");
      return;
    }

    const metadata = user.user_metadata || {};

    const fullName =
      metadata.full_name ||
      metadata.name ||
      "";

    const phoneNumber =
      metadata.phone ||
      "";

    const userCity =
      metadata.city ||
      "";

    const userState =
      metadata.state ||
      "";

    const userCountry =
      metadata.country ||
      "";

    setProfile({
      name: fullName,
      email: user.email || "",
      phone: phoneNumber,
      city: userCity,
      state: userState,
      country: userCountry,
      createdAt: user.created_at,
    });

    setName(fullName);
    setPhone(phoneNumber);
    setCity(userCity);
    setState(userState);
    setCountry(userCountry);

    const { data: designs } = await supabase
      .from("designs")
      .select("id, room_analysis")
      .eq("user_id", user.id);

    if (designs) {
      setDesignCount(designs.length);

      const extractedRoomTypes: string[] = [];

      designs.forEach((design) => {
        const analysis = design.room_analysis;

        if (
          analysis &&
          typeof analysis === "object" &&
          "roomType" in analysis &&
          typeof analysis.roomType === "string"
        ) {
          extractedRoomTypes.push(analysis.roomType);
        }
      });

      setRoomTypes([...new Set(extractedRoomTypes)]);
    }

    setLoading(false);
  }

  async function handleSaveProfile(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    const trimmedName = name.trim();
    const trimmedPhone = phone.trim();
    const trimmedCity = city.trim();
    const trimmedState = state.trim();
    const trimmedCountry = country.trim();

    if (!trimmedName) {
      setError("Full name is required.");
      setSaving(false);
      return;
    }

    const { error: updateError } =
      await supabase.auth.updateUser({
        data: {
          full_name: trimmedName,
          phone: trimmedPhone,
          city: trimmedCity,
          state: trimmedState,
          country: trimmedCountry,
        },
      });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    setProfile((current) =>
      current
        ? {
            ...current,
            name: trimmedName,
            phone: trimmedPhone,
            city: trimmedCity,
            state: trimmedState,
            country: trimmedCountry,
          }
        : current
    );

    setMessage("Your profile has been updated successfully.");
    setSaving(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  function formatDate(dateString: string) {
    if (!dateString) return "—";

    return new Date(dateString).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#07070b] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-purple-400" />

          <p className="mt-4 text-sm text-white/40">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) {
    return null;
  }

  const initials =
    profile.name ||
    profile.email ||
    "U";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#07070b] text-white">
      {/* Ambient Background */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-purple-600/[0.10] blur-[150px]" />

        <div className="absolute left-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.07] blur-[140px]" />

        <div className="absolute right-[-180px] bottom-[-150px] h-[500px] w-[500px] rounded-full bg-fuchsia-600/[0.06] blur-[140px]" />

        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(7,7,11,0.55)_100%)]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/dashboard"
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/[0.08] transition group-hover:border-purple-400/40 group-hover:bg-purple-500/[0.12]">
              <span className="text-sm font-bold text-purple-300">
                R
              </span>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                Smart
                <span className="text-purple-300">
                  Room
                </span>
              </div>

              <div className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                Interior Intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/[0.15] hover:bg-white/[0.06] hover:text-white"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-400/15 bg-red-500/[0.05] px-4 py-2 text-xs font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-500/[0.10]"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 px-5 py-10 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-8">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-purple-400/15 bg-purple-500/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-purple-300/80">
              <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
              Account
            </div>

            <h1 className="text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Profile
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-white/35">
              Manage your account information and view
              your SmartRoom design activity.
            </p>
          </div>

          {/* Profile Header Card */}
          <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-7 shadow-2xl shadow-black/20 backdrop-blur-2xl">
            <div className="pointer-events-none absolute right-[-100px] top-[-140px] h-[300px] w-[300px] rounded-full bg-purple-500/[0.09] blur-[100px]" />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-500/20 to-indigo-500/10 text-3xl font-semibold text-purple-300 shadow-lg shadow-purple-900/10">
                  {initials
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold text-white">
                    {profile.name ||
                      "SmartRoom User"}
                  </h2>

                  <p className="mt-1 truncate text-sm text-white/35">
                    {profile.email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-green-400/10 bg-green-500/[0.06] px-3 py-1 text-[10px] font-medium text-green-300/80">
                      Active Account
                    </span>

                    <span className="rounded-full border border-purple-400/10 bg-purple-500/[0.06] px-3 py-1 text-[10px] font-medium text-purple-300/80">
                      SmartRoom Member
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.06] bg-black/10 px-5 py-4 sm:min-w-[190px]">
                <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                  Member Since
                </div>

                <div className="mt-2 text-sm font-medium text-white/70">
                  {formatDate(profile.createdAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
            {/* Left */}
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-7 backdrop-blur-2xl">
                <div className="mb-7">
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
                    Personal Information
                  </div>

                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Account Details
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/30">
                    Keep your basic contact information
                    up to date.
                  </p>
                </div>

                <form
                  onSubmit={handleSaveProfile}
                  className="space-y-5"
                >
                  {/* Name */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Full Name
                    </label>

                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      placeholder="Enter your full name"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-400/40 focus:bg-purple-500/[0.025] focus:ring-4 focus:ring-purple-500/[0.06]"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Email Address
                    </label>

                    <input
                      type="email"
                      value={profile.email}
                      disabled
                      className="h-12 w-full rounded-xl border border-white/[0.06] bg-black/10 px-4 text-sm text-white/35 outline-none"
                    />

                    <p className="mt-2 text-[10px] text-white/20">
                      Your login email cannot be changed
                      from this page.
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="mb-2 block text-xs font-medium text-white/55">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(event) =>
                        setPhone(event.target.value)
                      }
                      placeholder="Enter your phone number"
                      className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-400/40 focus:bg-purple-500/[0.025] focus:ring-4 focus:ring-purple-500/[0.06]"
                    />
                  </div>

                  {/* Location */}
                  <div className="pt-2">
                    <div className="mb-4">
                      <div className="text-xs font-medium text-white/55">
                        Location
                      </div>

                      <p className="mt-1 text-[10px] text-white/20">
                        General location only. No exact
                        address is required.
                      </p>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-white/25">
                          City
                        </label>

                        <input
                          type="text"
                          value={city}
                          onChange={(event) =>
                            setCity(
                              event.target.value
                            )
                          }
                          placeholder="City"
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/[0.06]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-white/25">
                          State
                        </label>

                        <input
                          type="text"
                          value={state}
                          onChange={(event) =>
                            setState(
                              event.target.value
                            )
                          }
                          placeholder="State"
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/[0.06]"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-white/25">
                          Country
                        </label>

                        <input
                          type="text"
                          value={country}
                          onChange={(event) =>
                            setCountry(
                              event.target.value
                            )
                          }
                          placeholder="Country"
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-purple-400/40 focus:ring-4 focus:ring-purple-500/[0.06]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Message */}
                  {message && (
                    <div className="rounded-xl border border-green-400/15 bg-green-500/[0.08] px-4 py-3 text-sm text-green-300">
                      {message}
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-red-400/15 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300">
                      {error}
                    </div>
                  )}

                  {/* Save */}
                  <div className="flex flex-col gap-3 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[10px] leading-4 text-white/20">
                      Profile information is stored securely
                      with your SmartRoom account.
                    </p>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 via-violet-500 to-indigo-500 px-6 text-xs font-semibold text-white shadow-lg shadow-purple-900/20 transition hover:-translate-y-0.5 hover:shadow-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {saving
                        ? "Saving..."
                        : "Save Changes"}
                    </button>
                  </div>
                </form>
              </div>

              {/* SmartRoom Activity */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-7 backdrop-blur-2xl">
                <div className="mb-6">
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
                    SmartRoom Activity
                  </div>

                  <h2 className="mt-2 text-xl font-semibold text-white">
                    Your Design Activity
                  </h2>

                  <p className="mt-1 text-xs text-white/30">
                    See how you have used SmartRoom to
                    design different spaces.
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-5">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                      Designs Created
                    </div>

                    <div className="mt-3 text-3xl font-semibold text-white">
                      {designCount}
                    </div>

                    <div className="mt-1 text-xs text-white/25">
                      Saved AI interior designs
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-5">
                    <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                      Room Types
                    </div>

                    <div className="mt-3 text-3xl font-semibold text-white">
                      {roomTypes.length}
                    </div>

                    <div className="mt-1 text-xs text-white/25">
                      Different spaces designed
                    </div>
                  </div>
                </div>

                {roomTypes.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/10 p-5">
                    <div className="mb-3 text-[9px] uppercase tracking-[0.18em] text-white/25">
                      Rooms You Have Designed
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {roomTypes.map((room) => (
                        <span
                          key={room}
                          className="rounded-full border border-purple-400/10 bg-purple-500/[0.06] px-3 py-1.5 text-xs text-purple-200/70"
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/my-designs"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3 text-xs font-medium text-white/60 transition hover:border-purple-400/20 hover:bg-purple-500/[0.05] hover:text-purple-200"
                >
                  View My Designs →
                </Link>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6">
              {/* Account Summary */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-2xl">
                <div className="mb-5">
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-300/70">
                    Account
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Account Summary
                  </h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                      Status
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-sm text-green-300">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      Active
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                      Email
                    </div>

                    <div className="mt-2 break-all text-sm text-white/55">
                      {profile.email}
                    </div>
                  </div>

                  <div>
                    <div className="text-[9px] uppercase tracking-[0.18em] text-white/25">
                      Member Since
                    </div>

                    <div className="mt-2 text-sm text-white/55">
                      {formatDate(profile.createdAt)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Design */}
              <div className="relative overflow-hidden rounded-3xl border border-purple-400/10 bg-purple-500/[0.04] p-6">
                <div className="pointer-events-none absolute right-[-50px] top-[-50px] h-[150px] w-[150px] rounded-full bg-purple-500/[0.10] blur-[60px]" />

                <div className="relative">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/10 bg-purple-500/[0.08] text-purple-300">
                    ✦
                  </div>

                  <h3 className="mt-5 text-base font-semibold text-white">
                    Ready to design?
                  </h3>

                  <p className="mt-2 text-xs leading-5 text-white/30">
                    Choose your room, budget and style to
                    create a new AI-powered interior design.
                  </p>

                  <Link
                    href="/planner"
                    className="mt-5 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 px-4 py-3 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Create New Design
                  </Link>
                </div>
              </div>

              {/* Account Actions */}
              <div className="rounded-3xl border border-red-400/[0.10] bg-red-500/[0.025] p-6">
                <div className="mb-5">
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-300/60">
                    Account
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Sign Out
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-white/30">
                    Sign out from your SmartRoom account on
                    this device.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-red-400/15 bg-red-500/[0.06] px-5 py-3 text-xs font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-500/[0.10]"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-5 pb-8 pt-2 text-center sm:px-8">
        <span className="text-[9px] uppercase tracking-[0.22em] text-white/15">
          SMARTROOM • AI INTERIOR INTELLIGENCE
        </span>
      </footer>
    </main>
  );
}