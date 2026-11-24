import { cn } from "@/lib/utils";

type OnlineBadgeProps = {
  lastOnline?: string | null;
};

const convertDateFormat = (lastOnline?: string | null): number | null => {
  if (!lastOnline) return null;
  const date = new Date(`${lastOnline}Z`);
  return Math.floor(date.getTime() / 1000);
};

export const OnlineBadge = ({ lastOnline }: OnlineBadgeProps) => {
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);
  const unixTime = convertDateFormat(lastOnline);

  if (!lastOnline || unixTime === null) {
    return <span className="inline-block size-2.5 shrink-0 rounded-full border border-border" />;
  }

  const timeDifferenceInSeconds = currentTimeInSeconds - unixTime;

  if (timeDifferenceInSeconds <= 60) {
    return (
      <span className="relative flex size-2.5 shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
        <span className="relative inline-flex size-2.5 rounded-full bg-success" />
      </span>
    );
  }

  return (
    <span className={cn("inline-block size-2.5 shrink-0 rounded-full", "border border-border")} />
  );
};
