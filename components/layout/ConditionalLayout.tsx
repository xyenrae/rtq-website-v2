"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Banner from "@/components/layout/Banner";
import Navigation from "@/components/layout/Navigation";
import Footer from "@/components/layout/Footer";
import ScrollToTopButton from "@/components/ScrollToTopButton";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({
  children,
}: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/protected");

  const [showScrollToTop, setShowScrollToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {!isAdmin && <Banner />}
      {!isAdmin && <Navigation />}
      <main className="min-h-[calc(100vh-160px)]">{children}</main>
      {!isAdmin && <Footer />}
      {!isAdmin && showScrollToTop && <ScrollToTopButton />}
    </>
  );
}
