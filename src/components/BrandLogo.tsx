import React from 'react';
import { BRAND_LOGO, BRAND_LOGO_STABLE } from '../utils/brandAssets';

interface BrandLogoProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  src = BRAND_LOGO_STABLE,
  className = '',
  alt = 'Political Territory',
  onError,
  ...props
}) => {
  const handleError = (event: React.SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;

    // Retry once with the bundled/hashed asset if the stable GitHub Pages
    // asset is temporarily unavailable (for example during a deployment).
    if (image.dataset.logoFallback !== 'true') {
      image.dataset.logoFallback = 'true';
      image.src = BRAND_LOGO;
      return;
    }

    onError?.(event);
  };

  return (
    <img
      {...props}
      src={src}
      alt={alt}
      className={className}
      loading={props.loading ?? 'eager'}
      decoding={props.decoding ?? 'async'}
      onError={handleError}
    />
  );
};
