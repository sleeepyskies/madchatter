"use client";

import * as React from "react";
import {AppSidebar} from "@/components/app-sidebar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {Separator} from "@/components/ui/separator";
import {SidebarInset, SidebarProvider, SidebarTrigger,} from "@/components/ui/sidebar";
import {TooltipProvider} from "@/components/ui/tooltip";
import {Button} from "@/components/ui/button";
import {applyTheme} from "@/components/theme-provider";
// import {Language, Preferences, preferencesApi} from "@madchatter/api/src/preferences";

const themeOptions: { value: Preferences["theme"]; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "System" },
];
const languageOptions: { value: Language; label: string }[] = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
];

export default function Page() {
  const [preferences, setPreferences] = React.useState<Preferences | null>(null);
  const [isSaving, setIsSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const response = await preferencesApi.getPreferences();
        if (!isMounted) return;
        setPreferences(response);
        applyTheme(response.theme);
      } catch (err) {
        if (!isMounted) return;
        setError("Unable to load preferences.");
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleChange = (field: keyof Preferences, value: string | boolean) => {
    setPreferences((current) =>
      current ? { ...current, [field]: value } : null
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!preferences) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const updated = await preferencesApi.updatePreferences({
        theme: preferences.theme,
        language: preferences.language,
        notificationsEnabled: preferences.notificationsEnabled,
      });
      setPreferences(updated);
        applyTheme(updated.theme);
      setSuccess("Settings saved.");
    } catch (err) {
      setError("Failed to save preferences.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-vertical:h-4 data-vertical:self-auto"
              />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Mad Chatter</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Settings</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-8 pt-0">
            <div className="mx-auto w-full max-w-4xl rounded-xl bg-muted/50 p-6">
              <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold">Settings</h1>
                  <p className="text-sm text-muted-foreground">
                    Change your application preferences and save them to the backend.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {success ? (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm text-emerald-800">
                      {success}
                    </span>
                  ) : null}
                  {error ? (
                    <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm text-destructive">
                      {error}
                    </span>
                  ) : null}
                </div>
              </div>
              {preferences ? (
                <form className="grid gap-4" onSubmit={handleSubmit}>
                <div className="space-y-2 rounded-xl border border-border bg-background/70 p-4">
                  <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                    Theme
                    <select
                      className="h-10 w-full rounded-none border border-input bg-transparent px-3 text-base outline-none transition-colors focus:border-primary"
                        value={preferences.theme}
                      onChange={(event) => handleChange("theme", event.target.value as Preferences["theme"])}
                        disabled={false}
                    >
                      {themeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-medium text-foreground">
                    Language
                    <select
                      className="h-10 w-full rounded-none border border-input bg-transparent px-3 text-base outline-none transition-colors focus:border-primary"
                      value={preferences.language}
                      onChange={(event) => handleChange("language", event.target.value as Language)}
                    >
                      {languageOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="inline-flex items-center gap-3 text-sm font-medium text-foreground">
                    <input
                      type="checkbox"
                      className="h-5 w-5 rounded border border-input bg-background text-primary focus-visible:ring-ring"
                        checked={preferences.notificationsEnabled}
                      onChange={(event) => handleChange("notificationsEnabled", event.target.checked)}
                        disabled={false}
                    />
                    Notifications enabled
                  </label>
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-2">
                  <Button type="submit" disabled={!preferences || isSaving}>
                    {isSaving ? "Saving..." : "Save preferences"}
                  </Button>
                </div>
              </form>
              ) : (
                <div className="rounded-xl border border-border bg-background/70 p-6 text-sm text-muted-foreground">
                  Loading current preferences...
                </div>
              )}
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
