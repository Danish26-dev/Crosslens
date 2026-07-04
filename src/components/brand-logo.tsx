import logoAsset from "@/assets/crosslens-logo.png.asset.json";

export function BrandMark({ className = "" }: { className?: string }) {
  return (
    <img
      src={logoAsset.url}
      alt="CrossLens"
      className={className}
      width={40}
      height={40}
      loading="eager"
    />
  );
}

export function BrandLogo({
  size = "md",
  showSubtitle = false,
}: {
  size?: "sm" | "md" | "lg";
  showSubtitle?: boolean;
}) {
  const dims =
    size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8";
  const text =
    size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-base";
  return (
    <div className="flex items-center gap-2.5">
      <BrandMark className={dims} />
      <div className="flex flex-col leading-tight">
        <span className={`font-display font-bold tracking-tight text-foreground ${text}`}>
          CrossLens
        </span>
        {showSubtitle ? (
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Courtroom Memory
          </span>
        ) : null}
      </div>
    </div>
  );
}
