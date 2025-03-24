"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const Navitem = ({
  name,
  href,
  closeMenu,
}: {
  name: string;
  href: string;
  closeMenu?: () => void; // دالة اختيارية
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li className="mx-0">
      <Link
        className={`block py-2 px-2 text-2xl ${
          isActive ? "text-success" : "text-gray-500"
        }`}
        href={href}
        onClick={closeMenu} // استدعاء الدالة عند النقر
      >
        {name}
      </Link>
    </li>
  );
};

export default Navitem;