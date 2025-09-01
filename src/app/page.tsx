'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import BScroll from '@better-scroll/core';
import NoiseBackground from '@/components/NoiseBackground';
import { useRouter } from 'next/navigation';

interface ProjectData {
  name: string;
  year: string;
  content: {
    description: string;
    images?: string[];
    details?: string[];
  };
}

export default function Home() {
  const router = useRouter();
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [titlePosition, setTitlePosition] = useState<'center' | 'right' | 'top'>('center');
  const [titleOffset, setTitleOffset] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bScrollRef = useRef<BScroll | null>(null);
  const hoverElementRef = useRef<HTMLDivElement | null>(null);
  
  // Convert project name to URL slug
  const createSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  };
  
  const handleProjectClick = (projectName: string) => {
    const slug = createSlug(projectName);
    router.push(`/project/${slug}`);
  };
  
  // Mouse tracking for popup movement and dynamic site effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [windowDimensions, setWindowDimensions] = useState({ width: 1920, height: 1080 });
  
  // Update window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({ 
        width: window.innerWidth, 
        height: window.innerHeight 
      });
    };
    
    if (typeof window !== 'undefined') {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      return () => window.removeEventListener('resize', updateDimensions);
    }
  }, []);
  
  // Transform cursor position to influence entire site
  const backgroundShiftX = useTransform(mouseX, [0, windowDimensions.width], [-20, 20]);
  const backgroundShiftY = useTransform(mouseY, [0, windowDimensions.height], [-15, 15]);
  const glowIntensity = useTransform(mouseX, [0, windowDimensions.width], [0.02, 0.08]);
  const tintShift = useTransform(mouseY, [0, windowDimensions.height], [245, 252]);
  
  const popupX = useTransform(
    mouseX, 
    value => {
      if (!hoverElementRef.current) return '-50%';
      const rect = hoverElementRef.current.getBoundingClientRect();
      const relativeX = value - rect.left - rect.width / 2;
      const moveAmount = (relativeX / rect.width) * 135; // 225% movement - max 135px horizontal (3x of 45px)
      return `calc(-50% + ${moveAmount}px)`;
    },
    {
      ease: [0.25, 0.46, 0.45, 0.94] // Custom bezier curve for smooth movement
    }
  );

  const popupY = useTransform(
    mouseY, 
    value => {
      if (!hoverElementRef.current) return '-50%';
      const rect = hoverElementRef.current.getBoundingClientRect();
      const relativeY = value - rect.top - rect.height / 2;
      const moveAmount = (relativeY / rect.height) * 45; // 75% movement - max 45px vertical (3x of 15px)
      return `calc(-50% + ${moveAmount}px)`;
    },
    {
      ease: [0.25, 0.46, 0.45, 0.94] // Custom bezier curve for smooth movement
    }
  );

  // Track mouse movement for popup and cursor gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Enhanced responsive title positioning with smooth transitions
  useEffect(() => {
    const updateTitlePosition = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      
      if (width < 768) {
        setTitlePosition('top');
        setTitleOffset(0);
      } else {
        // Calculate where the dates column ends (50vw + right-aligned date width + padding)
        const datesColumnEnd = (width / 2) + 60 + 64; // 60px for date width, 64px for lg:px-16 padding
        const titleCenterPosition = width / 2;
        const titleWidth = 400; // Approximate title width
        const titleLeftEdge = titleCenterPosition - (titleWidth / 2);
        const titleRightEdge = titleCenterPosition + (titleWidth / 2);
        
        // Check if title collides with dates column or if popups would collide
        const popupSpaceNeeded = 320; // Space needed for popups to appear next to items
        const availablePopupSpace = width - (datesColumnEnd + 150); // Space available after dates
        
        if (titleLeftEdge < datesColumnEnd + 100) {  // Title collision check
          // Calculate safe push amount that won't go off-screen
          const maxSafePush = Math.max(0, width - titleRightEdge - 80); // 80px from right edge
          const requiredPushAmount = Math.min(
            (datesColumnEnd + 100) - titleLeftEdge,
            maxSafePush
          );
          
          // If we can't push enough to avoid collision OR if there's not enough space for popups, go to top
          if (requiredPushAmount < (datesColumnEnd + 100) - titleLeftEdge || availablePopupSpace < popupSpaceNeeded) {
            setTitlePosition('top');
            setTitleOffset(0);
          } else {
            // Safe to push right and popups have space
            setTitleOffset(requiredPushAmount * 0.6);
            setTitlePosition('right');
          }
        } else if (availablePopupSpace < popupSpaceNeeded) {
          // Even if title doesn't collide, check if popups would have enough space
          setTitlePosition('top');
          setTitleOffset(0);
        } else {
          setTitleOffset(0);
          setTitlePosition('center');
        }
      }
    };

    // Initialize window width on mount
    if (typeof window !== 'undefined') {
      updateTitlePosition();
      window.addEventListener('resize', updateTitlePosition);
      return () => window.removeEventListener('resize', updateTitlePosition);
    }
  }, []);

  // Center the list on page load
  useEffect(() => {
    const centerList = () => {
      if (scrollRef.current) {
        // Use requestAnimationFrame to ensure DOM is ready
        requestAnimationFrame(() => {
          if (!scrollRef.current) return;
          
          const container = scrollRef.current;
          // Simple center calculation: scroll to middle of total content
          const totalScrollHeight = container.scrollHeight;
          const containerHeight = container.clientHeight;
          const centerPosition = (totalScrollHeight - containerHeight) / 2;
          
          container.scrollTop = centerPosition;
        });
      }
    };

    // Center on load and when window resizes
    setTimeout(centerList, 100); // Small delay to ensure content is rendered
    
    window.addEventListener('resize', centerList);
    return () => window.removeEventListener('resize', centerList);
  }, []);

  const projects: ProjectData[] = [
    {
      name: "wBlock",
      year: "2025",
      content: {
        description: "Advanced, privacy-focused, free, and open-source ad blocker built for Safari users."
      }
    },
    {
      name: "Sir-Tim-the-Timely",
      year: "2025",
      content: {
        description: "A Hikari Discord bot for the MIT Class of 2029 Discord server."
      }
    },
    {
      name: "Near-Perfect-Tester",
      year: "2025",
      content: {
        description: "Toolkit to efficiently find k-near perfect numbers. Completed for a research paper that made significant contributions to the study of 2-near perfect numbers."
      }
    },
    {
      name: "HandMaestro",
      year: "2024",
      content: {
        description: "On-device ASL gesture practice site using TensorFlow."
      }
    },
    {
      name: "Modified-Dots-and-Boxes",
      year: "2024",
      content: {
        description: "Wheel Graph Dots-and-Boxes game for Pygame, complete with winning algorithms for various graph families. Completed for a research paper."
      }
    },
    {
      name: "SciTool",
      year: "2024",
      content: {
        description: "SwiftUI-based scientific calculator and simulator tools for macOS."
      }
    },
    {
      name: "BetterCamp-macOS",
      year: "2024",
      content: {
        description: "Alternative macOS BootCamp Assistant and patcher."
      }
    },
    {
      name: "Archie",
      year: "2024",
      content: {
        description: "Python Discord bot for checking and reporting Arc forum invite status, built for the Arc Discord server prior to Arc Browser's public release."
      }
    },
  ];




  return (
    <div className="min-h-screen flex flex-col lg:flex-row relative overflow-hidden">      
      {/* Organic noise background */}
      <NoiseBackground />
      <motion.div 
        className="fixed inset-0 -z-10"
        style={{ 
          x: backgroundShiftX, 
          y: backgroundShiftY 
        }}
      >
        <motion.div 
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: useTransform([glowIntensity, tintShift], 
              ([intensity, tint]: number[]) => 
                `radial-gradient(circle, rgba(${tint}, ${tint}, 255, ${intensity}) 0%, transparent 60%)`
            )
          }}
        />
        <motion.div 
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: useTransform([glowIntensity, tintShift], 
              ([intensity, tint]: number[]) => 
                `radial-gradient(circle, rgba(${tint-2}, ${tint-1}, 255, ${intensity * 0.8}) 0%, transparent 60%)`
            )
          }}
        />
        <motion.div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: useTransform([glowIntensity, tintShift], 
              ([intensity, tint]: number[]) => 
                `radial-gradient(circle, rgba(${tint-1}, ${tint}, 250, ${intensity * 0.6}) 0%, transparent 70%)`
            )
          }}
        />
        <motion.div 
          className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full blur-2xl"
          style={{
            background: useTransform([glowIntensity], 
              ([intensity]: number[]) => 
                `radial-gradient(circle, rgba(248, 249, 252, ${intensity * 0.9}) 0%, transparent 50%)`
            )
          }}
        />
        <motion.div 
          className="absolute bottom-1/3 left-1/3 w-72 h-72 rounded-full blur-2xl"
          style={{
            background: useTransform([glowIntensity], 
              ([intensity]: number[]) => 
                `radial-gradient(circle, rgba(250, 251, 253, ${intensity * 0.7}) 0%, transparent 50%)`
            )
          }}
        />
      </motion.div>
      {/* Left Column - Project List */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen">
        {/* Title space when at top */}
        {titlePosition === 'top' && (
          <div className="h-64 flex-shrink-0" />
        )}
        
        <div 
          ref={scrollRef}
          className={`flex-1 px-8 lg:px-16 overflow-y-auto scrollbar-hide transition-all duration-500 ease-out ${
            titlePosition === 'top' ? 'pt-8' : 'pt-12 lg:pt-24'
          }`}
        >
          {/* Top spacer - sized so last item (Archie) can reach top of viewport */}
          <div className="flex-shrink-0 top-spacer" style={{ height: 'calc(50vh - 150px)' }}></div>
          
          {/* Project list container */}
          <div className="flex-shrink-0">
            <div className="space-y-2 max-w-lg mx-auto lg:mx-0 project-list py-16">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="project-item"
                  ref={(el) => {
                    if (hoveredProject === index) {
                      hoverElementRef.current = el;
                    }
                  }}
                  onMouseEnter={() => setHoveredProject(index)}
                  onMouseLeave={() => {
                    setHoveredProject(null);
                    hoverElementRef.current = null;
                  }}
                  onClick={() => handleProjectClick(project.name)}
                >
                  <span className="project-name">{project.name}</span>
                  <span className="project-year">{project.year}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom spacer - sized so first item (wBlock) can reach bottom of viewport */}
          <div className="flex-shrink-0 bottom-spacer" style={{ height: 'calc(50vh - 150px)' }}></div>
        </div>
      </div>

      {/* Right Column - Main Content */}
      <div className="w-full lg:w-1/2 relative">
        <motion.div 
          className="fixed pointer-events-none z-10"
          animate={{
            top: titlePosition === 'top' ? 32 : '50%',
            left: '50%',
            x: titlePosition === 'top' 
              ? '-50%' 
              : titlePosition === 'right' 
                ? `calc(-50% + ${Math.min(titleOffset, windowWidth/4)}px)`
                : '-50%',
            y: titlePosition === 'top' ? 0 : '-50%'
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 35,
            mass: 0.8
          }}
        >
          <motion.div 
            className="text-left pointer-events-auto"
            animate={{
              textAlign: titlePosition === 'top' ? 'center' : 'left'
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
              mass: 0.5
            }}
          >
            <motion.h1 
              className="text-3xl lg:text-4xl font-bold text-[#272727] leading-tight mb-1 lg:mb-2"
              animate={{
                scale: titlePosition === 'top' ? 0.9 : 1
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 38
              }}
            >
              Alexander Skula,
            </motion.h1>
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold text-[#272727] leading-tight mb-6 lg:mb-8"
              animate={{
                scale: titlePosition === 'top' ? 0.9 : 1
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 38
              }}
            >
              CS and math student at{" "}
              <span className="text-[#8A1538] font-bold">MIT</span>
            </motion.h2>

            <motion.nav 
              className="flex flex-wrap gap-4 lg:gap-6 text-base mb-6"
              animate={{
                justifyContent: titlePosition === 'top' ? 'center' : 'flex-start'
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40
              }}
            >
              <a
                href="mailto:skula@mit.edu"
                className="text-[#979797] hover:text-[#272727] transition-colors duration-300"
              >
                Email
              </a>
              <a
                href="https://linkedin.com/in/skula"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#979797] hover:text-[#272727] transition-colors duration-300"
              >
                LinkedIn
              </a>
            </motion.nav>
          </motion.div>
        </motion.div>
      </div>

      {/* Centered Popup */}
      {hoveredProject !== null && (
        <motion.div
          className="fixed z-50 pointer-events-none left-1/2 top-1/2"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={{
            x: popupX,
            y: popupY
          }}
          transition={{
            type: "tween",
            duration: 0.12,
            ease: [0.25, 0.46, 0.45, 0.94]
          }}
        >
          <div className="bubble-content rounded-3xl p-10 max-w-md min-w-[380px] relative z-10">
            <h3 className="font-semibold text-[#1a1a1a] text-2xl mb-4 relative z-10">
              {projects[hoveredProject].name}
            </h3>

            <p className="text-[#666666] text-base mb-6 leading-relaxed relative z-10">
              {projects[hoveredProject].content.description}
            </p>

            {projects[hoveredProject].content.images && (
              <div className="mb-4">
                {projects[hoveredProject].content.images?.map((image, idx) => (
                  <img
                    key={idx}
                    src={image}
                    alt={projects[hoveredProject].name}
                    className="w-full rounded-lg border border-gray-100 shadow-sm"
                  />
                ))}
              </div>
            )}

            {projects[hoveredProject].content.details && (
              <ul className="space-y-3">
                {projects[hoveredProject].content.details?.map((detail, idx) => (
                  <li key={idx} className="text-sm text-[#979797] flex items-start">
                    <span className="text-[#6b7280] mr-2 mt-0.5">•</span>
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}