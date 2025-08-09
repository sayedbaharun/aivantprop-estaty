'use client';

interface AreaImageProps {
  src: string;
  alt: string;
  className?: string;
}

export function AreaImage({ src, alt, className }: AreaImageProps) {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.src = `https://images.unsplash.com/photo-1518684079-3c830dcef090?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`;
  };

  return (
    <img 
      src={src} 
      alt={alt} 
      className={className}
      onError={handleImageError}
    />
  );
}
