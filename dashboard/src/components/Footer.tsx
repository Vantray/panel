import { useDashboard } from "@/stores/dashboard";
import { REPO_URL } from "@/constants";
import { Link } from "@heroui/react";

export const Footer = () => {
  const { version } = useDashboard();
  return (
    <div className="flex w-full items-center py-0">
      <p className="inline-block grow text-center text-xs text-muted">
        <Link href={REPO_URL} className="text-accent">
          Vantray
        </Link>
        {version ? ` (v${version}) ` : ""}
      </p>
    </div>
  );
};
