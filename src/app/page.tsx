import Link from 'next/link';
import { Box, Shield, FileText, Settings, Users, Coffee } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  link: string;
}

export const metadata = {
  title: 'Strona główna – Kalkulatory online',
  description: 'Szybkie i łatwe kalkulatory online do obliczeń finansowych i matematycznych.',
}

export default function Home() {
  const features: Feature[] = [
    { title: "Kalkulator B2B", description: "Oblicz swoje zarobki na własnej działalności gospodarczej.", icon: Box, color: "bg-blue-50 text-blue-600", link: "/kalkulator-b2b" },
    { title: "Kalkulator Umowa o pracę", description: "Oblicz swoje zarobki na umowie o pracę lub umowie o dzieło.", icon: Shield, color: "bg-green-50 text-green-600", link: "/kalkulator-wynagrodzen" },
    { title: "Kalkulator procentowy", description: "Oblicz jakim procentem danej liczby jest inna liczba itp.", icon: FileText, color: "bg-purple-50 text-purple-600", link: "/kalkulator-procentowy" },
    { title: "Kalkulator procentu składanego", description: "Oblicz swój zwrot z inwestycji, lub odsedki jakie narosną.", icon: Settings, color: "bg-orange-50 text-orange-600", link: "/kalkulator-procent-skladany" },
    { title: "Kalkulator IKE", description: "Zobacz ile zarobisz na Inwestycyjnym Koncie Emerytalnym.", icon: Users, color: "bg-pink-50 text-pink-600", link: "/kalkulator-ike" },
    { title: "Kalkulator IKZE", description: "Zobacz ile zarobisz na Inwestycyjnym Koncie Zabezpieczenia Emerytalnego.", icon: Coffee, color: "bg-teal-50 text-teal-600", link: "/kalkulator-ikze" }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <section className="pt-24 pb-16 text-center max-w-3xl mx-auto">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Oblicz szybko co tylko potrzebujesz
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 leading-relaxed">
          Na tej stronie znajdziesz przydatne kalkulatory w codziennym życiu.
        </p>
      </section>

      <section className="py-16 bg-white container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map(({ title, description, icon: Icon, color, link }) => (
          <Link 
            key={title} 
            href={link}
            className="p-6 rounded-lg border border-gray-200 hover:border-gray-300 transition-all hover:shadow-lg group cursor-pointer flex flex-col items-start space-y-4"
          >
            <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">{title}</h3>
              <p className="text-gray-600 text-base leading-relaxed">{description}</p>
            </div>
          </Link>
        ))}
      </section>

      <section className="py-16 text-center">
        <div className="bg-gray-200 p-8 rounded-lg">
          <div className="mt-6 h-40 bg-gray-300 rounded-lg flex items-center justify-center">
            <span className="text-gray-600">Baner reklamowy</span>
          </div>
        </div>
      </section>
    </div>
  );
}