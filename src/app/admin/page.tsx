"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  async function fetchStats() {
    const res = await fetch("/api/admin/stats");
    if (res.status === 403) {
      router.push("/");
      return;
    }
    const data = await res.json();
    setStats(data);
    setLoading(false);
  }

  useEffect(() => {
    void fetchStats();
  }, []);

  async function handleReferralAction(
    referralId: string,
    action: "approve" | "reject",
    referrerId: string
  ) {
    setActionLoading(referralId);
    await fetch("/api/admin/referral-action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ referral_id: referralId, action, referrer_id: referrerId }),
    });
    await fetchStats();
    setActionLoading(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-on-surface-variant">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Header */}
      <div className="bg-surface-container-lowest border-b border-outline-variant/40 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-on-background">Admin Dashboard</h1>
            <p className="text-sm text-on-surface-variant mt-0.5">LinkedIn AI Growth Assistant</p>
          </div>
          <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1 rounded-full font-medium">
            THE Π LAB — Owner Access
          </span>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* SECTION 1 — Users */}
        <section>
          <h2 className="text-base font-semibold text-on-background mb-4">Users Overview</h2>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Users", value: stats.users.total, color: "text-on-background" },
              { label: "Joined Today", value: stats.users.today, color: "text-blue-600" },
              {
                label: "Free Plan",
                value: stats.users.plans.free,
                color: "text-on-surface-variant",
              },
              {
                label: "Paid Users",
                value: stats.users.plans.starter + stats.users.plans.pro,
                color: "text-green-600",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4"
              >
                <p className="text-xs text-on-surface-variant mb-1">{item.label}</p>
                <p className={`text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {/* Plan distribution */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5">
            <p className="text-sm font-medium text-on-surface mb-4">Plan Distribution</p>
            <div className="space-y-3">
              {[
                {
                  label: "Free",
                  count: stats.users.plans.free,
                  color: "bg-on-surface-variant/50",
                  total: stats.users.total,
                },
                {
                  label: "Starter",
                  count: stats.users.plans.starter,
                  color: "bg-blue-500",
                  total: stats.users.total,
                },
                {
                  label: "Pro",
                  count: stats.users.plans.pro,
                  color: "bg-purple-500",
                  total: stats.users.total,
                },
              ].map((plan) => (
                <div key={plan.label} className="flex items-center gap-3">
                  <span className="text-sm text-on-surface-variant w-16">{plan.label}</span>
                  <div className="flex-1 bg-surface-container rounded-full h-2">
                    <div
                      className={`${plan.color} h-2 rounded-full`}
                      style={{
                        width: plan.total > 0 ? `${(plan.count / plan.total) * 100}%` : "0%",
                      }}
                    />
                  </div>
                  <span className="text-sm font-medium text-on-surface w-8 text-right">
                    {plan.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weekly signups */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 mt-4">
            <p className="text-sm font-medium text-on-surface mb-4">Signups — Last 7 Days</p>
            <div className="flex items-end gap-2 h-24">
              {stats.users.weekly.map((day: any) => {
                const maxCount = Math.max(...stats.users.weekly.map((d: any) => d.count), 1);
                const height = maxCount > 0 ? (day.count / maxCount) * 100 : 0;
                return (
                  <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-on-surface-variant">{day.count}</span>
                    <div
                      className="w-full bg-surface-container rounded-t relative"
                      style={{ height: "64px" }}
                    >
                      <div
                        className="absolute bottom-0 w-full bg-blue-500 rounded-t transition-all"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-on-surface-variant/70">{day.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* SECTION 2 — Referrals */}
        <section>
          <h2 className="text-base font-semibold text-on-background mb-4">Referrals</h2>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
              <p className="text-xs text-on-surface-variant mb-1">Total Referrals</p>
              <p className="text-2xl font-bold text-on-background">{stats.referrals.total}</p>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-4">
              <p className="text-xs text-on-surface-variant mb-1">Pending Approvals</p>
              <p className="text-2xl font-bold text-orange-500">
                {stats.referrals.pending_approvals.length}
              </p>
            </div>
          </div>

          {/* Pending approval list */}
          <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-outline-variant/30 bg-surface-container-low">
              <p className="text-sm font-medium text-on-surface">
                Pending Approvals — Users eligible for Starter upgrade
              </p>
            </div>

            {stats.referrals.pending_approvals.length === 0 ? (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-on-surface-variant/70">
                  No pending approvals right now.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {stats.referrals.pending_approvals.map((ref: any) => (
                  <div key={ref.id} className="px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-on-background">
                        {ref.referrer?.full_name || "Unknown User"}
                      </p>
                      <p className="text-xs text-on-surface-variant/70 mt-0.5">
                        {ref.referrer?.email} · {ref.referrer?.referral_points} points · Currently{" "}
                        {ref.referrer?.plan}
                      </p>
                      <p className="text-xs text-on-surface-variant/70 mt-0.5">
                        Referred on{" "}
                        {new Date(ref.created_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReferralAction(ref.id, "reject", ref.referrer_id)}
                        disabled={actionLoading === ref.id}
                        className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleReferralAction(ref.id, "approve", ref.referrer_id)}
                        disabled={actionLoading === ref.id}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === ref.id ? "Processing..." : "Approve Starter"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
