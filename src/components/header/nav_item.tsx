"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale } from "next-intl";

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
  const locale = useLocale();
  const isActive = pathname === `/${locale}${href}`;

  return (
    <motion.li 
      className="mx-6"
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.3 }}
    >
      <Link
        className={`block pt-5 text-xl transition-colors duration-300 ${
          isActive ? "text-primary" : "text-gray-500 hover:text-primary"
        }`}
        href={`/${locale}/${href}`}
        onClick={closeMenu}
      >
        {name}
      </Link>
      <motion.hr
        className="border border-primary"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isActive ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ transformOrigin: "left" }}
      />
    </motion.li>
  );
};

export default Navitem;
