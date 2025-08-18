import Link from "next/link";

export default function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="text-white px-3 h-full flex items-center justify-center border-r-[0.5px] border-white hover:bg-hover-ipec-blue">
      {label}
    </Link>
  );
}