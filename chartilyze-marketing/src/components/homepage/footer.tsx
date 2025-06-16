// components/homepage/Footer.tsx
import { Brain } from 'lucide-react';

const footerLinks = [
  {
    title: "Product",
    links: ["Extension", "Features", "Pricing", "Demo"]
  },
  {
    title: "Resources",
    links: ["Blog", "Trading Psychology", "Tutorials", "Help Center"]
  },
  {
    title: "Community",
    links: ["Discord", "Reddit", "Twitter", "Feedback"]
  },
  {
    title: "Company",
    links: ["About", "Privacy", "Terms", "Contact"]
  }
];

export const Footer = () => {
  return (
    <footer className="border-t border-gray-800 bg-gradient-to-b from-transparent to-gray-950 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className="font-semibold mb-4 text-white">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-gray-800">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              Chartilyze
            </span>
          </div>
          <div className="text-gray-400 text-sm">
            © 2025 Chartilyze. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};
