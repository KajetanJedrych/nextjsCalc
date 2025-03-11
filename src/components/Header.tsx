"use client";

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Box, Shield, FileText, Settings, Users, Coffee } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface MenuItem {
  title: string;
  icon: React.ElementType;
  href: string;
}

const Header = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const pathname = usePathname();

  const menuItems: MenuItem[] = [
    { title: 'Kalkulator B2B', icon: Box, href: '/kalkulator-b2b' },
    { title: 'Kalkulator umowa o pracę', icon: Shield, href: '/kalkulator-wynagrodzen' },
    { title: 'Kalkulator procentowy', icon: FileText, href: '/kalkulator-procentowy' },
    { title: 'Kalkulator procenta składanego', icon: Settings, href: '/kalkulator-procent-skladany' },
    { title: 'Kalkulator IKE', icon: Users, href: '/kalkulator-ike' },
    { title: 'Kalkulator IKZE', icon: Coffee, href: '/kalkulator-ikze' }
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
      <nav className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold">
            Oblicz co chcesz
          </Link>
          
          <button 
            className="flex items-center space-x-1 px-4 py-2 rounded-md hover:bg-gray-100"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span>Rozwiń po więcej</span>
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>

        {isExpanded && (
          <div className="py-6 grid grid-cols-2 md:grid-cols-3 gap-4 animate-fadeIn">
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center space-x-3">
                    <IconComponent className="text-blue-600" size={24} />
                    <span className="font-medium">{item.title}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;