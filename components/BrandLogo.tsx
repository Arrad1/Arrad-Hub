import Image from "next/image";
import { arradLogoData } from "@/lib/brand";

export default function BrandLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative block overflow-hidden bg-white ${className}`}>
      <Image
        src={arradLogoData}
        alt="Arrad Foot Balconies"
        fill
        priority
        unoptimized
        className="object-cover"
        sizes="(max-width: 640px) 210px, 270px"
      />
    </span>
  );
}
