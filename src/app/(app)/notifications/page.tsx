"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { PageHeader, Spinner } from "@/components/page-header";
import { api } from "@/lib/client";
import type { Notification } from "@/lib/notifications";
import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

const ICONS = {
  warning: { Icon: AlertTriangle, cls: "text-orange-500 bg-orange-500/10" },
  success: { Icon: CheckCircle2, cls: "text-primary bg-primary/10" },
  info: { Icon: Info, cls: "text-sky-500 bg-sky-500/10" },
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[] | null>(null);
  useEffect(() => {
    api.get<Notification[]>("/notifications").then(setItems);
  }, []);
  if (!items) return <Spinner />;

  return (
    <div>
      <PageHeader title="Notifications" subtitle="Alerts based on your activity & goals" />
      {items.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">🎉 You&apos;re all caught up.</Card>
      ) : (
        <div className="space-y-3" aria-live="polite">
          {items.map((n) => {
            const { Icon, cls } = ICONS[n.type];
            return (
              <Card key={n.id} className="flex items-start gap-4 p-4">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${cls}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
