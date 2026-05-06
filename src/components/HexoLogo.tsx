import { motion } from 'motion/react';
import { useState } from 'react';

interface HexoLogoProps {
  className?: string;
  isDark?: boolean;
}

export const HexoLogo = ({ className, isDark }: HexoLogoProps) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`flex items-center cursor-pointer ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg 
        id="Layer_1" 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 790.46 268.36"
        className="w-auto h-12 overflow-visible"
      >
        <defs>
          <linearGradient id="purple-pink-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        <motion.g
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={isDark ? "fill-white stroke-white" : "fill-[#231f20] stroke-[#231f20]"}
        >
          {/* Text: h, e, x */}
          <g>
            <path d="M362.9,145.52c-1.06-15.12-8.31-23.58-23.22-23.63-16.67-.05-26.15,12.17-26.19,28.59v50.03s-24.91.05-24.91.05V62.07s24.91-13.88,24.91-13.88l.02,65.55c16.01-16.09,42.06-17.69,59.61-4.2,11.2,9.37,14.15,22.41,14.66,36.87v54.11s-24.86.02-24.86.02l-.02-55.02Z" stroke="none" />
            <path d="M446.4,180c13.14,3.69,28.61.2,37.08-11.4l20.63,9.05c-5.89,9.4-14.04,16.53-24.47,20.47-20.65,7.81-46.65,4.77-62.55-10.87-14.79-14.55-19.41-36.31-12.27-55.71,11.19-30.43,48.18-41.06,75.33-28.14,20.95,9.97,31.16,31.83,27.9,54.51h-81.91c2.05,10.86,9.73,19.13,20.26,22.08ZM483.88,139.24c-1.44-5.21-3.22-8.02-5.41-11.54-2.88-2.66-5.89-4.95-9.39-6.87-17.56-6.44-37.64-.12-42.48,18.46l57.28-.04Z" stroke="none" />
            <polygon points="618.79 200.4 589.89 200.54 563.17 165.79 536.35 200.55 507.51 200.5 548.96 149.43 509.05 99.76 537.39 99.63 563.37 132.67 589.71 99.69 618.07 99.71 577.72 149.31 618.79 200.4" stroke="none" />
          </g>
          
          {/* Icon part */}
          <g>
            <polygon points="152.38 134.81 152.38 236.06 62.79 184.26 62.77 84.02 152.39 32.31 241.99 84.04 152.38 134.81" stroke="none" />
            <polygon points="241.94 184.37 182.54 218.5 241.82 119.44 241.94 184.37" fill="url(#purple-pink-grad)" stroke="none" />
          </g>


          {/* Text: o (hexagon) */}
          <motion.polygon 
            points="695.54 112.43 651.58 112.43 629.61 150.5 651.58 188.57 695.54 188.57 717.52 150.5 695.54 112.43"
            fill="none"
            strokeWidth="24.5"
            strokeMiterlimit="10"
            animate={isHovered ? { strokeWidth: 30 } : { strokeWidth: 24.5 }}
          />
        </motion.g>
      </svg>
    </div>
  );
};
