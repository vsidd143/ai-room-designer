
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

    const fullName = metadata.full_name || metadata.name || "";
    const phoneNumber = metadata.phone || "";
    const userCity = metadata.city || "";
    const userState = metadata.state || "";
    const userCountry = metadata.country || "";

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

  async function handleSaveProfile(event: FormEvent<HTMLFormElement>) {
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

    const { error: updateError } = await supabase.auth.updateUser({
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

    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#08080c] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-cyan-400" />
          <p className="mt-4 text-sm text-white/40">
            Loading your profile...
          </p>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const initials = profile.name || profile.email || "U";

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#08080c] text-white">
      {/* Existing dashboard color theme */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-300px] h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-cyan-500/[0.10] blur-[150px]" />
        <div className="absolute left-[-200px] top-[35%] h-[500px] w-[500px] rounded-full bg-blue-600/[0.08] blur-[140px]" />
        <div className="absolute right-[-180px] bottom-[-150px] h-[500px] w-[500px] rounded-full bg-violet-600/[0.07] blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(8,8,12,0.55)_100%)]" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-8">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/[0.08] transition group-hover:border-cyan-400/40 group-hover:bg-cyan-500/[0.12]">
              <span className="text-sm font-bold text-cyan-300">R</span>
            </div>

            <div>
              <div className="text-sm font-semibold tracking-wide text-white">
                Smart<span className="text-cyan-300">Room</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.25em] text-white/25">
                Interior Intelligence
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-xs font-medium text-white/60 transition hover:border-cyan-400/20 hover:bg-cyan-500/[0.05] hover:text-white sm:px-4"
            >
              Dashboard
            </Link>

            <button
              onClick={handleLogout}
              className="rounded-xl border border-red-400/15 bg-red-500/[0.05] px-3 py-2 text-xs font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-500/[0.10] sm:px-4"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <section className="relative z-10 px-4 py-8 sm:px-8 sm:py-12">
        <div className="mx-auto max-w-6xl">
          {/* Page heading */}
          <div className="mb-8 flex flex-col justify-between gap-5 sm:mb-10 sm:flex-row sm:items-end">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/[0.06] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-300/80">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                Account
              </div>

              <h1 className="bg-gradient-to-r from-white via-cyan-100 to-blue-200 bg-clip-text text-4xl font-semibold tracking-[-0.04em] text-transparent sm:text-5xl">
                My Profile
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/40">
                Your personal space to manage your account and explore your
                AI-powered interior design journey.
              </p>
            </div>

            <Link
              href="/planner"
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-cyan-400/15 bg-cyan-500/[0.05] px-4 py-3 text-xs font-medium text-cyan-200 transition hover:border-cyan-400/30 hover:bg-cyan-500/[0.10]"
            >
              <span className="text-base">✦</span>
              Create New Design
              <span>→</span>
            </Link>
          </div>

          {/* Profile Hero */}
          <div className="relative mb-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 shadow-2xl shadow-black/20 backdrop-blur-2xl sm:p-8">
            <div className="pointer-events-none absolute right-[-100px] top-[-140px] h-[300px] w-[300px] rounded-full bg-cyan-500/[0.09] blur-[100px]" />
            <div className="pointer-events-none absolute bottom-[-120px] left-[30%] h-[200px] w-[300px] rounded-full bg-blue-600/[0.05] blur-[90px]" />

            <div className="relative flex flex-col gap-7 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex min-w-0 items-center gap-4 sm:gap-6">
                <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/10 text-3xl font-semibold text-cyan-200 shadow-lg shadow-cyan-900/10 sm:h-24 sm:w-24 sm:rounded-3xl sm:text-4xl">
                  {initials.charAt(0).toUpperCase()}
                </div>

                <div className="min-w-0">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/30">
                    Welcome to your workspace
                  </p>

                  <h2 className="break-words text-xl font-semibold text-white sm:text-3xl">
                    {profile.name || "SmartRoom User"}
                  </h2>

                  <p className="mt-2 break-all text-xs text-white/40 sm:text-sm">
                    {profile.email}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-green-400/10 bg-green-500/[0.06] px-3 py-1.5 text-[10px] font-medium text-green-300/80">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
                      Active Account
                    </span>

                    <span className="rounded-full border border-cyan-400/10 bg-cyan-500/[0.06] px-3 py-1.5 text-[10px] font-medium text-cyan-200/80">
                      ✦ SmartRoom Member
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 xl:min-w-[340px]">
                <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4 sm:p-5">
                  <div className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                    Member Since
                  </div>
                  <div className="mt-3 text-sm font-medium leading-5 text-white/80">
                    {formatDate(profile.createdAt)}
                  </div>
                </div>

                <div className="rounded-2xl border border-white/[0.06] bg-black/10 p-4 sm:p-5">
                  <div className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                    Designs Saved
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-white">
                    {designCount}
                  </div>
                  <div className="mt-1 text-[10px] text-white/30">
                    Your creative projects
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Grid */}
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_310px]">
            {/* Left column */}
            <div className="min-w-0 space-y-6">
              {/* Personal Information */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-7">
                <div className="mb-7 flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-500/[0.06] text-lg text-cyan-300">
                    ◈
                  </div>

                  <div>
                    <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                      Personal Information
                    </div>
                    <h2 className="mt-1.5 text-xl font-semibold text-white">
                      Account Details
                    </h2>
                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Update your contact details and personal information.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-medium text-white/60">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="Enter your full name"
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:bg-cyan-500/[0.025] focus:ring-4 focus:ring-cyan-500/[0.06]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-medium text-white/60">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={profile.email}
                        disabled
                        className="h-12 w-full rounded-xl border border-white/[0.06] bg-black/10 px-4 text-sm text-white/35 outline-none"
                      />
                      <p className="mt-2 text-[10px] text-white/25">
                        Your login email cannot be changed from this page.
                      </p>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-medium text-white/60">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="Enter your phone number"
                        className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:bg-cyan-500/[0.025] focus:ring-4 focus:ring-cyan-500/[0.06]"
                      />
                    </div>
                  </div>

                  {/* Location */}
                  <div className="border-t border-white/[0.06] pt-6">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-black/10 text-sm text-white/60">
                        ⌖
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white/75">
                          Location
                        </div>
                        <p className="mt-1 text-[10px] text-white/30">
                          General location only. No exact address is required.
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-white/35">
                          City
                        </label>
                        <input
                          type="text"
                          value={city}
                          onChange={(event) => setCity(event.target.value)}
                          placeholder="City"
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-500/[0.06] sm:px-4"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-white/35">
                          State
                        </label>
                        <input
                          type="text"
                          value={state}
                          onChange={(event) => setState(event.target.value)}
                          placeholder="State"
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-500/[0.06] sm:px-4"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-[10px] uppercase tracking-[0.14em] text-white/35">
                          Country
                        </label>
                        <input
                          type="text"
                          value={country}
                          onChange={(event) => setCountry(event.target.value)}
                          placeholder="Country"
                          className="h-12 w-full rounded-xl border border-white/[0.08] bg-black/20 px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-cyan-400/40 focus:ring-4 focus:ring-cyan-500/[0.06] sm:px-4"
                        />
                      </div>
                    </div>
                  </div>

                  {message && (
                    <div
                      role="status"
                      className="rounded-xl border border-green-400/15 bg-green-500/[0.08] px-4 py-3 text-sm text-green-300"
                    >
                      {message}
                    </div>
                  )}

                  {error && (
                    <div
                      role="alert"
                      className="rounded-xl border border-red-400/15 bg-red-500/[0.08] px-4 py-3 text-sm text-red-300"
                    >
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-4 border-t border-white/[0.06] pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="max-w-xs text-[10px] leading-5 text-white/30">
                      Your profile details are associated with your SmartRoom
                      account.
                    </p>

                    <button
                      type="submit"
                      disabled={saving}
                      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-6 text-xs font-semibold text-white shadow-lg shadow-cyan-900/20 transition hover:-translate-y-0.5 hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                      {!saving && <span>→</span>}
                    </button>
                  </div>
                </form>
              </div>

              {/* SmartRoom Activity */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-5 backdrop-blur-2xl sm:p-7">
                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-500/[0.06] text-lg text-cyan-300">
                      ✦
                    </div>
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                        SmartRoom Activity
                      </div>
                      <h2 className="mt-1.5 text-xl font-semibold text-white">
                        Your Design Activity
                      </h2>
                      <p className="mt-1 text-xs leading-5 text-white/35">
                        A quick overview of your interior design projects.
                      </p>
                    </div>
                  </div>

                  <Link
                    href="/my-designs"
                    className="inline-flex items-center gap-2 text-xs font-medium text-cyan-200/80 transition hover:text-cyan-200"
                  >
                    View All Designs <span>→</span>
                  </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="group rounded-2xl border border-white/[0.06] bg-black/10 p-5 transition hover:border-cyan-400/20 hover:bg-cyan-500/[0.025]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                        Designs Created
                      </div>
                      <span className="text-lg text-cyan-300">✦</span>
                    </div>
                    <div className="mt-4 text-4xl font-semibold tracking-tight text-white">
                      {designCount}
                    </div>
                    <div className="mt-2 text-xs text-white/35">
                      Saved AI interior designs
                    </div>
                    <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 opacity-60" />
                    </div>
                  </div>

                  <div className="group rounded-2xl border border-white/[0.06] bg-black/10 p-5 transition hover:border-cyan-400/20 hover:bg-cyan-500/[0.025]">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-white/35">
                        Room Types
                      </div>
                      <span className="text-lg text-cyan-300">⌂</span>
                    </div>
                    <div className="mt-4 text-4xl font-semibold tracking-tight text-white">
                      {roomTypes.length}
                    </div>
                    <div className="mt-2 text-xs text-white/35">
                      Different spaces designed
                    </div>
                    <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <div className="h-full w-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 opacity-60" />
                    </div>
                  </div>
                </div>

                {roomTypes.length > 0 && (
                  <div className="mt-5 rounded-2xl border border-white/[0.06] bg-black/10 p-5">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-medium text-white/75">
                          Rooms You Have Designed
                        </div>
                        <p className="mt-1 text-[10px] text-white/30">
                          Your explored room categories
                        </p>
                      </div>
                      <span className="rounded-lg border border-cyan-400/10 bg-cyan-500/[0.06] px-2.5 py-1 text-xs text-cyan-200/80">
                        {roomTypes.length}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {roomTypes.map((room) => (
                        <span
                          key={room}
                          className="rounded-full border border-cyan-400/10 bg-cyan-500/[0.06] px-3 py-2 text-xs text-cyan-200/80 transition hover:border-cyan-400/25 hover:bg-cyan-500/[0.10]"
                        >
                          {room}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Link
                  href="/my-designs"
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-3.5 text-xs font-medium text-white/65 transition hover:border-cyan-400/20 hover:bg-cyan-500/[0.05] hover:text-cyan-200"
                >
                  Explore My Designs <span>→</span>
                </Link>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="min-w-0 space-y-6">
              {/* Account Summary */}
              <div className="rounded-3xl border border-white/[0.08] bg-white/[0.035] p-6 backdrop-blur-2xl">
                <div className="mb-6">
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-cyan-300/70">
                    Account Overview
                  </div>
                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Account Summary
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-white/35">
                    Your SmartRoom account at a glance.
                  </p>
                </div>

                <div className="space-y-0">
                  <div className="flex items-center justify-between gap-4 border-b border-white/[0.06] py-4 first:pt-0">
                    <div className="text-xs text-white/40">Status</div>
                    <div className="flex items-center gap-2 text-xs text-green-300">
                      <span className="h-2 w-2 rounded-full bg-green-400" />
                      Active
                    </div>
                  </div>

                  <div className="border-b border-white/[0.06] py-4">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                      Email Address
                    </div>
                    <div className="mt-2 break-all text-xs leading-5 text-white/65">
                      {profile.email}
                    </div>
                  </div>

                  <div className="border-b border-white/[0.06] py-4">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                      Member Since
                    </div>
                    <div className="mt-2 text-sm text-white/65">
                      {formatDate(profile.createdAt)}
                    </div>
                  </div>

                  <div className="py-4 pb-0">
                    <div className="text-[9px] uppercase tracking-[0.16em] text-white/30">
                      Location
                    </div>
                    <div className="mt-2 text-sm leading-6 text-white/65">
                      {[city, state, country].filter(Boolean).join(", ") || "Not added yet"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Create Design */}
              <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-cyan-500/[0.04] p-6">
                <div className="pointer-events-none absolute right-[-50px] top-[-50px] h-[150px] w-[150px] rounded-full bg-blue-500/[0.10] blur-[60px]" />

                <div className="relative">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/10 bg-cyan-500/[0.08] text-xl text-cyan-300">
                    ✦
                  </div>

                  <p className="mt-5 text-[9px] font-medium uppercase tracking-[0.2em] text-cyan-200/60">
                    Your next project
                  </p>

                  <h3 className="mt-2 text-lg font-semibold text-white">
                    Ready to transform a room?
                  </h3>

                  <p className="mt-3 text-xs leading-6 text-white/40">
                    Choose your room, set a budget and explore a fresh
                    AI-powered interior design.
                  </p>

                  <Link
                    href="/planner"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-violet-500 px-4 py-3.5 text-xs font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Create New Design <span>→</span>
                  </Link>
                </div>
              </div>

              {/* Account Actions */}
              <div className="rounded-3xl border border-red-400/[0.10] bg-red-500/[0.025] p-6">
                <div className="mb-5">
                  <div className="text-[10px] font-medium uppercase tracking-[0.2em] text-red-300/60">
                    Account Actions
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-white">
                    Sign Out
                  </h2>

                  <p className="mt-2 text-xs leading-5 text-white/35">
                    Finish your session on this device. You can sign in again
                    whenever you return.
                  </p>
                </div>

                <button
                  onClick={handleLogout}
                  className="w-full rounded-xl border border-red-400/15 bg-red-500/[0.06] px-5 py-3 text-xs font-medium text-red-300 transition hover:border-red-400/30 hover:bg-red-500/[0.10]"
                >
                  Sign Out
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] px-5 pb-8 pt-6 text-center sm:px-8">
        <span className="text-[9px] uppercase tracking-[0.22em] text-white/20">
          SMARTROOM • AI INTERIOR INTELLIGENCE
        </span>
      </footer>
    </main>
  );
}
