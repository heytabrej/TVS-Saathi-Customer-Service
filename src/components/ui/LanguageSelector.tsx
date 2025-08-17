'use client';
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const languages = [
	{ code: 'en', name: 'English', flag: '🇺🇸' },
	{ code: 'hi', name: 'Hindi', flag: '🇮🇳' },
	{ code: 'ta', name: 'Tamil', flag: '🇮🇳' },
	{ code: 'te', name: 'Telugu', flag: '🇮🇳' },
];

export const LanguageSelector: React.FC = () => {
	const { language, setLanguage } = useLanguage();
	const [isOpen, setIsOpen] = useState(false);
	const active = languages.find((l) => l.code === language) || languages[0];

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen((o) => !o)}
				className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
			>
				<span>{active.flag}</span>
				<span className="font-medium text-sm">{active.name}</span>
				<ChevronDown
					size={16}
					className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
				/>
			</button>
			{isOpen && (
				<div className="absolute right-0 mt-2 w-44 bg-white border border-gray-200 rounded-md shadow-lg z-50">
					{languages.map((l) => (
						<button
							key={l.code}
							onClick={() => {
								setLanguage(l.code as any);
								setIsOpen(false);
							}}
							className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${
								l.code === language
									? 'bg-blue-50 text-blue-600'
									: 'text-gray-700'
							}`}
						>
							<span>{l.flag}</span>
							<span>{l.name}</span>
						</button>
					))}
				</div>
			)}
		</div>
	);
};