import Image from "next/image";
import React from "react";

type Variant = "header" | "hero" | "compact";

const sizes: Record<Variant, { w: number; h: number }> = {
  header: { w: 180, h: 54 },
  hero: { w: 320, h: 96 },
  compact: { w: 140, h: 42 }
};

interface LogoProps {
  variant?: Variant;
  className?: string;
  priority?: boolean;
  format?: "png" | "svg"; // choose asset
}

export const Logo: React.FC<LogoProps> = ({
  variant = "header",
  className = "",
  priority = false,
  format = "png"
}) => {
  const { w, h } = sizes[variant];
  const src = format === "svg" ? "/icons/tvs-logo.svg" : "/icons/TVS-Credit.png";
  return (
    <div className={`inline-flex items-center ${className}`}>
      <Image
        src={src}
        alt="TVS Credit"
        width={w}
        height={h}
        priority={priority}
        sizes="(max-width:640px) 60vw, 320px"
        className="object-contain select-none"
      />
    </div>
  );
};

export default Logo;