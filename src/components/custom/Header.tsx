'use client';

import Image from "next/image";
import Link from "next/link";
import NavLink from "./NavLink";
import LanguageSwitcher from "./LanguageSwitcher";
import { useTranslations } from 'next-intl';
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";

export default function Header() {
	const t = useTranslations('navigation');
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const navLinks = [
		{ href: "/services", label: t('services') },
		{ href: "/advantages", label: t('advantages') },
		{ href: "/experience", label: t('experience') },
		{ href: "/about", label: t('about') },
		{ href: "/team", label: t('team') },
	];

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	// Блокировка скролла при открытом меню
	useEffect(() => {
		if (isMobileMenuOpen) {
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		// Очистка при размонтировании компонента
		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isMobileMenuOpen]);

  return (
    <header className="w-full h-14 bg-ipec-blue flex items-center justify-between relative">
      <div className="flex items-center h-full">
				<Link href="/" className="h-14 w-[256px] relative">
					<Image src="/image/logo.svg" alt="IPEC" fill />
				</Link>
				<div className="hidden lg:flex items-center h-full">
					{navLinks.map((link) => (
						<NavLink key={link.href} href={link.href} label={link.label} />
					))}
				</div>
      </div>
			<div className="flex items-center h-full">
				<div className="h-full hidden md:block">
					<NavLink href="/contacts" label={t('contacts')} />
				</div>
				<LanguageSwitcher />
				<div 
					className="h-full flex items-center lg:hidden border-l-[0.5px] border-l-white text-white px-3 cursor-pointer hover:bg-hover-ipec-blue"
					onClick={toggleMobileMenu}
				>
					<div className="relative w-6 h-6">
						<Menu 
							className={`w-6 h-6 absolute transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`} 
						/>
						<X 
							className={`w-6 h-6 absolute transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`} 
						/>
					</div>
				</div>
			</div>

			{/* Backdrop Overlay с блюром */}
			{isMobileMenuOpen && (
				<div 
					className="fixed top-14 left-0 right-0 bottom-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
					onClick={() => setIsMobileMenuOpen(false)}
				/>
			)}

			{/* Мобильное меню */}
			<div className={`absolute top-14 left-0 w-full bg-white transition-all duration-300 ease-in-out lg:hidden z-50 border-t-[0.5px] border-t-ipec-blue ${
				isMobileMenuOpen 
					? 'max-h-screen opacity-100 visible' 
					: 'max-h-0 opacity-0 invisible overflow-hidden'
			}`}>
				<div className="flex flex-col">
					{navLinks.map((link, index) => (
						<Link
							key={link.href}
							href={link.href}
							className={`text-ipec-blue hover:bg-hover-ipec-blue hover:text-white px-6 py-4 border-b-[0.5px] border-b-ipec-blue ${
								isMobileMenuOpen 
									? 'translate-x-0 opacity-100' 
									: 'translate-x-4 opacity-0'
							}`}
							style={{
								transitionDelay: isMobileMenuOpen ? `${index * 50}ms` : '0ms'
							}}
							onClick={() => setIsMobileMenuOpen(false)}
						>
							{link.label}
						</Link>
					))}
					<Link
						href="/contacts"
						className={`text-ipec-blue hover:bg-hover-ipec-blue hover:text-white px-6 py-4 ${
							isMobileMenuOpen 
								? 'translate-x-0 opacity-100' 
								: 'translate-x-4 opacity-0'
						}`}
						style={{
							transitionDelay: isMobileMenuOpen ? `${navLinks.length * 50}ms` : '0ms'
						}}
						onClick={() => setIsMobileMenuOpen(false)}
					>
						{t('contacts')}
					</Link>
				</div>
			</div>
    </header>
  );
}