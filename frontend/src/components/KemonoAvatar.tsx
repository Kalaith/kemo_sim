import { useState } from 'react';
import { getKemonoImage } from '../utils/imageMap';

interface KemonoAvatarProps {
  typeName: string;
  emoji?: string;
  alt: string;
  index?: number;
  className?: string;
  imageClassName?: string;
}

export const KemonoAvatar = ({
  typeName,
  emoji = '🐾',
  alt,
  index = 0,
  className = '',
  imageClassName = 'object-contain',
}: KemonoAvatarProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageSrc = getKemonoImage(typeName, index);

  if (imageFailed) {
    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gray-100 ${className}`}
        aria-label={alt}
      >
        <span>{emoji}</span>
      </div>
    );
  }

  return (
    <div className={className}>
      <img
        src={imageSrc}
        alt={alt}
        className={`h-full w-full ${imageClassName}`}
        loading="lazy"
        onError={() => setImageFailed(true)}
      />
    </div>
  );
};
