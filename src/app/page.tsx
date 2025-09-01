'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import BScroll from '@better-scroll/core';
import NoiseBackground from '@/components/NoiseBackground';

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
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [titlePosition, setTitlePosition] = useState<'center' | 'right' | 'top'>('center');
  const [titleOffset, setTitleOffset] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bScrollRef = useRef<BScroll | null>(null);
  const hoverElementRef = useRef<HTMLDivElement | null>(null);
  
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

  // Disable BetterScroll - using native scrolling instead
  // useEffect(() => {
  //   if (scrollRef.current && !bScrollRef.current) {
  //     bScrollRef.current = new BScroll(scrollRef.current, {
  //       scrollY: true,
  //       scrollX: false,
  //       bounce: {
  //         top: true,
  //         bottom: true,
  //         left: false,
  //         right: false
  //       },
  //       bounceTime: 600,
  //       probeType: 1,
  //       click: true,
  //       tap: true
  //     });
  //   }

  //   return () => {
  //     if (bScrollRef.current) {
  //       bScrollRef.current.destroy();
  //       bScrollRef.current = null;
  //     }
  //   };
  // }, []);

  const projects: ProjectData[] = [
    {
      name: "DM Resharing",
      year: "2022",
      content: {
        description: "Instagram feature that allows users to reshare direct messages to their stories, creating more engagement and social sharing opportunities.",
        images: ["https://ext.same-assets.com/3898303924/4290964696.png"],
        details: ["Increased story engagement by 23%", "Simplified sharing workflow", "Enhanced privacy controls"]
      }
    },
    {
      name: "Media Viewer",
      year: "2022",
      content: {
        description: "Redesigned media viewing experience across Instagram and Messenger with improved navigation and interactive elements.",
        images: ["https://ext.same-assets.com/3898303924/1968184817.png"],
        details: ["Full-screen immersive experience", "Gesture-based navigation", "Enhanced zoom and pan controls"]
      }
    },
    {
      name: "Command System",
      year: "2022",
      content: {
        description: "Advanced command interface for Messenger that enables power users to quickly access features and perform actions.",
        details: ["Slash commands for quick actions", "Customizable shortcuts", "Developer-friendly API"]
      }
    },
    {
      name: "Send Interaction",
      year: "2022",
      content: {
        description: "Improved message sending experience with better feedback, animations, and interaction patterns.",
        details: ["Haptic feedback integration", "Send button micro-interactions", "Message state indicators"]
      }
    },
    {
      name: "@Everyone",
      year: "2022",
      content: {
        description: "Group messaging feature that allows users to mention all participants in a conversation efficiently.",
        details: ["Smart notification controls", "Permission-based access", "Reduced notification fatigue"]
      }
    },
    {
      name: "/Gif",
      year: "2022",
      content: {
        description: "Quick GIF search and sharing functionality integrated directly into the messaging interface.",
        details: ["Instant search results", "Trending GIF suggestions", "Keyboard shortcuts support"]
      }
    },
    {
      name: "/Silent",
      year: "2022",
      content: {
        description: "Silent message feature that sends messages without triggering notifications for recipients.",
        details: ["Context-aware suggestions", "Visual silent indicators", "Respect for do-not-disturb modes"]
      }
    },
    {
      name: "Gyro Pride Theme",
      year: "2021",
      content: {
        description: "Special Pride Month theme for Messenger featuring dynamic colors and celebratory animations.",
        images: ["https://ext.same-assets.com/3898303924/2395632951.png"],
        details: ["Motion-responsive color changes", "Inclusive design principles", "Community celebration focus"]
      }
    },
    {
      name: "Word Effects",
      year: "2021",
      content: {
        description: "Dynamic text effects that trigger animations when specific words are sent in messages.",
        details: ["Contextual animation triggers", "Customizable effect library", "Performance optimized rendering"]
      }
    },
    {
      name: "Reactions",
      year: "2021",
      content: {
        description: "Enhanced message reaction system with improved animations and expanded emoji options.",
        details: ["Long-press gesture recognition", "Animated reaction bubbles", "Social presence indicators"]
      }
    },
    {
      name: "Tweets in Thread",
      year: "2021",
      content: {
        description: "Instagram feature allowing users to share Twitter thread content seamlessly within the platform.",
        details: ["Thread auto-detection", "Cross-platform integration", "Preserved formatting and context"]
      }
    },
    {
      name: "Super React",
      year: "2020",
      content: {
        description: "Enhanced reaction system for Instagram with amplified visual feedback and social engagement.",
        details: ["Burst animation effects", "Social amplification mechanics", "Engagement analytics integration"]
      }
    },
    {
      name: "Shops Products",
      year: "2020",
      content: {
        description: "Instagram Shopping interface redesign focusing on product discovery and seamless purchasing experience.",
        images: ["https://ext.same-assets.com/3898303924/2510777545.png"],
        details: ["AR try-on integration", "One-tap purchasing flow", "Personalized recommendations"]
      }
    },
    {
      name: "Instagram Shops",
      year: "2020",
      content: {
        description: "Complete shopping destination within Instagram, enabling businesses to create immersive storefronts.",
        details: ["Merchant dashboard tools", "Collection curation features", "Social proof integration"]
      }
    },
    {
      name: "Origami System",
      year: "2020",
      content: {
        description: "Design system and prototyping framework used across Meta's family of apps for consistent user experiences.",
        details: ["Component library standardization", "Cross-platform design tokens", "Rapid prototyping workflows"]
      }
    },
    {
      name: "Messenger Shops",
      year: "2020",
      content: {
        description: "Shopping experience integrated into Messenger conversations, enabling seamless commerce within chat.",
        details: ["Conversational commerce flow", "Payment integration", "Business messaging tools"]
      }
    },
    {
      name: "Microsoft Project",
      year: "2019",
      content: {
        description: "Project management interface redesign focusing on team collaboration and timeline visualization.",
        details: ["Gantt chart improvements", "Real-time collaboration", "Resource allocation tools"]
      }
    },
    {
      name: "Microsoft Tasks",
      year: "2018",
      content: {
        description: "Task management application with intelligent organization and cross-platform synchronization.",
        details: ["Smart list organization", "Calendar integration", "AI-powered suggestions"]
      }
    },
    {
      name: "Mobile Tasks",
      year: "2017",
      content: {
        description: "Mobile-first task management experience with gesture-based interactions and offline capabilities.",
        details: ["Swipe gesture controls", "Offline synchronization", "Widget customization"]
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
        
        <div className={`flex-1 px-8 lg:px-16 pb-8 overflow-y-auto transition-all duration-500 ease-out ${
          titlePosition === 'top' ? 'pt-8' : 'pt-12 lg:pt-24'
        }`}>
          <div className="space-y-2 max-w-lg mx-auto lg:mx-0">
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
              >
                <span className="project-name">{project.name}</span>
                <span className="project-year">{project.year}</span>
              </div>
            ))}
          </div>

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
              className="text-3xl lg:text-4xl font-light text-[#272727] leading-tight mb-1 lg:mb-2"
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
              className="text-3xl lg:text-4xl font-light text-[#272727] leading-tight mb-6 lg:mb-8"
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
              <span className="text-[#8A1538] font-medium">MIT</span>
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
                    <span className="text-[#cc35aa] mr-2 mt-0.5">•</span>
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