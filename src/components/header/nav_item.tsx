"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const Navitem = ({
  name,
  href,
  closeMenu,
}: {
  name: string;
  href: string;
  closeMenu?: () => void;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <motion.li 
      className="mx-12"
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <Link
        className={`block py-2 text-2xl transition-colors duration-300 ${
          isActive ? "text-success" : "text-gray-500 hover:text-success"
        }`}
        href={href}
        onClick={closeMenu}
      >
        {name}
      </Link>
      <motion.hr
        className="border border-success  mt-4"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.li>
  );
};

export default Navitem;
