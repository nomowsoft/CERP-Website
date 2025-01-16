"use client"
import Navitem from "./nav_item";

const menuItems = [
    { name: "الرئسية", href: "/", isActive: true },
];
const Navlink = () => {
    return (
        <ul className="flex flex-col mt-4 text-lg lg:flex-row lg:mt-0">
            {menuItems.map((item) => (
                <Navitem
                    name={item.name}
                    key={item.name}
                    href={item.href}
                />
            ))}
        </ul>
    )
}

export default Navlink