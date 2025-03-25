"use client";
import Navitem from "./nav_item";

const Navlink = ({ closeMenu }: { closeMenu?: () => void }) => {
  const links = [
    { name: "الرئيسية", href: "/" },
    { name: "تواصل معنا", href: "/contact_us" },
  ];

  return (
    <ul className="flex flex-col lg:flex-row lg:space-x-4">
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