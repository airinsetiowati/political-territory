import React from 'react';
import { TerritoryCategory } from '../types/game';
import { getCategoryLogo, CATEGORY_NAMES } from '../utils/categoryAssets';

interface CategoryLogoProps {
  category: TerritoryCategory;
  className?: string;
  imgClassName?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showBorder?: boolean;
}

export const CategoryLogo: React.FC<CategoryLogoProps> = ({
  category,
  className = '',
  imgClassName = '',
  size = 'md',
  showBorder = false,
}) => {
  const logoSrc = getCategoryLogo(category);
  const name = CATEGORY_NAMES[category] || category;

  const sizeClasses = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
    full: 'w-full h-full',
  }[size];

  return (
    <div
      className={`inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none ${
        showBorder ? 'border-2 border-white shadow-soft-sm' : ''
      } ${sizeClasses} ${className}`}
      title={name}
    >
      <img
        src={logoSrc}
        alt={`${name} Logo`}
        className={`w-full h-full object-cover scale-[1.26] block pointer-events-none ${imgClassName}`}
        loading="lazy"
        draggable={false}
      />
    </div>
  );
};
