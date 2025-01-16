import Image from "next/image"
import Link from "next/link";


const SocialMediaLink = ({ icon, href }: { icon: string; href: string; }) => {
  return (
    <div>
        <Link href={href} target="new">
            <Image src={icon} alt="..." width={40} height={20} />
        </Link>
    </div>
  )
}

export default SocialMediaLink