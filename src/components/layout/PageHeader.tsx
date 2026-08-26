import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 pb-6">
      <div className="min-w-0">
        <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:py-8">{children}</div>;
}
