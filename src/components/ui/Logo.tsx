import React from "react";
import Image from "next/image";

interface LogoProps {
  size?: number;
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = 32, className = "" }) => {
  return (
    <div
      className={`relative shrink-0 flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <Image
        src="/brand/lunvo-logo.png"
        alt="LUNVO Logo"
        width={size}
        height={size}
        className="w-full h-full object-contain drop-shadow-sm select-none"
        priority
      />
    </div>
  );
};

export default Logo;
