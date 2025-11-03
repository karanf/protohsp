/**
 * Props for the HomePage component
 */
export interface HomePageProps {
  /** Logo image source */
  logoSrc: string;
  /** Logo alt text */
  logoAlt: string;
  /** Main heading text */
  heading: string;
  /** Subheading text */
  subheading: string;
  /** Features section heading */
  featuresHeading: string;
  /** Features section description */
  featuresDescription: string;
  /** Optional className for the main container */
  className?: string;
}

/**
 * Custom HomePage component that provides a consistent landing page layout
 * @component
 */
export const curHomePage = ({
  logoSrc,
  logoAlt,
  heading,
  subheading,
  featuresHeading,
  featuresDescription,
  className
}: HomePageProps) => {
  return (
    <main 
      className={className || "flex min-h-screen flex-col items-center justify-between p-24"}
      role="main"
    >
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-[200px] h-[200px]">
            <img
              src={logoSrc}
              alt={logoAlt}
              className="w-full h-full object-contain"
              aria-label={logoAlt}
              role="img"
            />
          </div>
          <h1 className="text-4xl font-bold">{heading}</h1>
          <p className="text-xl text-center max-w-2xl">{subheading}</p>
          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">{featuresHeading}</h2>
            <p className="text-gray-600">{featuresDescription}</p>
          </div>
        </div>
      </div>
    </main>
  );
}; 