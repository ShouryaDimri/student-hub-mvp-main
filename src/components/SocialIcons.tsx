import { useState, useEffect } from 'react';

interface SocialLink {
  name: string;
  url: string;
  iconPath: string;
}

interface SocialIconsProps {
  className?: string;
  iconSize?: number;
}

export const SocialIcons = ({ className = '', iconSize = 24 }: SocialIconsProps) => {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([
    {
      name: 'GitHub',
      url: import.meta.env.VITE_GITHUB_URL || 'https://github.com',
      iconPath: '/github-icon.svg'
    },
    {
      name: 'LinkedIn',
      url: import.meta.env.VITE_LINKEDIN_URL || 'https://linkedin.com',
      iconPath: '/linkedin-icon.svg'
    }
  ]);

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {socialLinks.map((link) => (
        <a
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${link.name} Profile`}
          className="text-foreground/80 hover:text-foreground transition-colors duration-200 hover:scale-110 transform"
        >
          <img 
            src={link.iconPath} 
            alt={`${link.name} Icon`} 
            width={iconSize} 
            height={iconSize}
            className="inline-block"
          />
        </a>
      ))}
    </div>
  );
};