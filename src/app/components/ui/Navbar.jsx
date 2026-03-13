import Link from "next/link";
import {
  Search,
  Music,
  Video,
  BookOpen,
  Newspaper,
  Info,
  Home,
  FileHeadphone,
  HomeIcon,
  BellDot,
  SquarePlay,
  FolderOpenDot,
} from "lucide-react";
import Image from "next/image";

export function Navbar() {
  const menuItems = [
    {
      name: "Audio Transcripts",
      href: "/media/audios",
      icon: <FileHeadphone size={18} />,
    },
    // { name: "Videos", href: "/media/videos", icon: <SquarePlay size={18} /> },
    // {
    //   name: "Compilations",
    //   href: "/compilations",
    //   icon: <FolderOpenDot size={18} />,
    // },
    { name: "News", href: "/news", icon: <BellDot size={18} /> },
  ];

  return (
    <nav className="bg-[#8c2044] text-stone-200 py-4 shadow-md border-b border-[#8b1511] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-center gap-8">
        {/* Home Anchor */}
        <Link href="/" className="hover:text-amber-400 transition-colors">
          <HomeIcon size={18} />
        </Link>

        {/* Separator after Home */}
        <div className="w-[0.5px] h-6 rounded bg-[#b9488e]"></div>

        {/* Main Menu */}
        <div className="flex items-center gap-8">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              title={item.name}
              className="hover:text-amber-400 transition-colors opacity-90 hover:opacity-100"
            >
              {item.icon}
            </Link>
          ))}
        </div>

        {/* Separator before Search */}
        <div className="w-[0.5px] h-6 rounded bg-[#b9488e]"></div>

        {/* Utilities (Search & About) */}
        <div className="flex items-center gap-6 border-[#c15752]">
          {/* <button className="hover:text-amber-400 transition-colors">
            <Search size={18} />
          </button> */}
          <Link
            href="/About"
            name="About"
            className="hover:text-amber-400 transition-colors"
          >
            <Info size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
