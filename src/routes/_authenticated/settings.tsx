import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LogOut, Save } from "lucide-react";
import { toast } from "sonner";

import { Page, PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useProfile, useUpdateProfile } from "@/hooks/use-data";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings · ExamSense" },
      { name: "description", content: "Update your student profile, college details and study preferences." },
      { property: "og:title", content: "Settings · ExamSense" },
      { property: "og:description", content: "Manage your ExamSense profile and preferences." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { data: profile } = useProfile();
  const update = useUpdateProfile();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    college: "",
    course: "",
    year: "",
    semester: "",
    preferred_study_duration: "60",
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      full_name: profile.full_name ?? "",
      college: profile.college ?? "",
      course: profile.course ?? "",
      year: profile.year?.toString() ?? "",
      semester: profile.semester?.toString() ?? "",
      preferred_study_duration: profile.preferred_study_duration?.toString() ?? "60",
    });
  }, [profile]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    try {
      await update.mutateAsync({
        full_name: form.full_name || null,
        college: form.college || null,
        course: form.course || null,
        year: form.year ? Number(form.year) : null,
        semester: form.semester ? Number(form.semester) : null,
        preferred_study_duration: Number(form.preferred_study_duration) || 60,
      });
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    }
  }

  return (
    <Page>
      <PageHeader title="Settings" description="Your profile powers personalised plans and recommendations." />

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-base">Student profile</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="grid gap-3 sm:grid-cols-2" onSubmit={save}>
            <div className="sm:col-span-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="college">College</Label>
              <Input
                id="college"
                value={form.college}
                onChange={(e) => setForm({ ...form, college: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="course">Course</Label>
              <Input
                id="course"
                value={form.course}
                onChange={(e) => setForm({ ...form, course: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min={1}
                max={6}
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Input
                id="semester"
                type="number"
                min={1}
                max={12}
                value={form.semester}
                onChange={(e) => setForm({ ...form, semester: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="duration">Preferred study session (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min={15}
                max={240}
                value={form.preferred_study_duration}
                onChange={(e) => setForm({ ...form, preferred_study_duration: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" disabled={update.isPending}>
                <Save className="size-4" /> Save changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-4 rounded-2xl">
        <CardHeader>
          <CardTitle className="font-display text-base">Account</CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
          >
            <LogOut className="size-4" /> Sign out
          </Button>
        </CardContent>
      </Card>
    </Page>
  );
}
