import Link from "next/link";
import { Box, Shield, FileText, Settings, Users, Coffee } from "lucide-react";

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

const menuItems: MenuItem[] = [
  { title: "Kalkulator B2B", icon: Box, href: "/kalkulator-b2b" },
  { title: "Kalkulator umowa o pracę", icon: Shield, href: "/kalkulator-wynagrodzen" },
  { title: "Kalkulator procentowy", icon: FileText, href: "/kalkulator-procentowy" },
  { title: "Kalkulator procenta składanego", icon: Settings, href: "/kalkulator-procent-skladany" },
  { title: "Kalkulator IKE", icon: Users, href: "/kalkulator-ike" },
  { title: "Kalkulator IKZE", icon: Coffee, href: "/kalkulator-ikze" },
];

export default function Navbar() {
  return (
    <nav>
      <ul>
        {menuItems.map(({ title, icon: Icon, href }) => (
          <li key={href}>
            <Link href={href}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Icon />
                {title}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
