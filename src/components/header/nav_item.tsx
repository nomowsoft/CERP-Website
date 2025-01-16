"use client"
import Link from "next/link"
import { usePathname } from "next/navigation";

const Navitem = ({ name, href }: { name: string; href: string }) => {
  const pathname = usePathname();
  const isActive = (pathname === href)
  return (
    <li className="mx-0">
      <Link className={`block py-2 px-2 text-2xl ${ isActive ? 'text-success' : 'text-gray-500'}`} href={href}>
        {name}
      </Link>
    </li>
  )
}

export default Navitem