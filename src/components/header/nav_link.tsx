"use client";
import Navitem from "./nav_item";
import { useTranslations } from "next-intl";

const Navlink = ({ closeMenu }: { closeMenu?: () => void }) => {
  const t = useTranslations();
  const links = [
    { name: t('header.home'), href: "/" },
  ];

  return (
    <ul className="flex justify-center items-center lg:flex-row">
      {links.map((link) => (
        <Navitem
          key={link.href}
          name={link.name}
          href={link.href}
          closeMenu={closeMenu}
        />
      ))}
    </ul>
  );
};

export default Navlink; 