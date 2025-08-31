'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useSpring, useTransform, useMotionValue } from 'framer-motion';
import BScroll from '@better-scroll/core';

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
  const scrollRef = useRef<HTMLDivElement>(null);
  const bScrollRef = useRef<BScroll | null>(null);
  
  // Framer Motion values for cursor-following animation
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const baseX = useMotionValue(0); // Base X position from row
  const baseY = useMotionValue(0); // Base Y position from row
  
  // Spring animation for smooth following at 30% distance with offset
  const springConfig = { damping: 15, stiffness: 150 };
  const offsetMouseX = useTransform([mouseX, baseX], ([mouse, base]) => base + (mouse - base) * 0.3 + 60);
  const popupX = useSpring(offsetMouseX, springConfig);
  const popupY = useSpring(baseY, springConfig);
  
  // Add horizontal wiggle effect only based on cursor movement
  const rotateZ = useTransform(mouseX, [0, 1600], [-8, 8]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    if (hoveredProject !== null) {
      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [hoveredProject, mouseX, mouseY]);

  // Handle responsive title positioning with hardcoded date collision
  useEffect(() => {
    const updateTitlePosition = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setTitlePosition('top');
        setTitleOffset(0);
      } else {
        // Calculate where the dates column ends (50vw + right-aligned date width + padding)
        const datesColumnEnd = (width / 2) + 60 + 64; // 60px for date width, 64px for lg:px-16 padding
        const titleCenterPosition = width / 2;
        const titleWidth = 400; // Approximate title width
        const titleLeftEdge = titleCenterPosition - (titleWidth / 2);
        
        if (titleLeftEdge < datesColumnEnd + 150) {
          // Title is too close, push it right by the collision amount
          const pushAmount = (datesColumnEnd + 150) - titleLeftEdge;
          setTitleOffset(pushAmount);
          setTitlePosition('right');
        } else {
          setTitleOffset(0);
          setTitlePosition('center');
        }
      }
    };

    updateTitlePosition();
    window.addEventListener('resize', updateTitlePosition);
    return () => window.removeEventListener('resize', updateTitlePosition);
  }, []);

  // Initialize BetterScroll for iOS-like bounce scrolling
  useEffect(() => {
    if (scrollRef.current && !bScrollRef.current) {
      bScrollRef.current = new BScroll(scrollRef.current, {
        scrollY: true,
        scrollX: false,
        bounce: {
          top: true,
          bottom: true,
          left: false,
          right: false
        },
        bounceTime: 600,
        probeType: 1,
        click: true,
        tap: true
      });
    }

    return () => {
      if (bScrollRef.current) {
        bScrollRef.current.destroy();
        bScrollRef.current = null;
      }
    };
  }, []);

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


  const handleMouseEnter = (index: number, event: React.MouseEvent) => {
    setHoveredProject(index);
    const rect = event.currentTarget.getBoundingClientRect();
    baseX.set(rect.right); // Set base X position to end of row
    baseY.set(rect.top + rect.height / 2 + 20); // Small offset downward to center the popup
    mouseX.set(event.clientX); // Set current mouse position
    mouseY.set(event.clientY);
  };

  const handleMouseLeave = () => {
    setHoveredProject(null);
  };


  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col lg:flex-row relative">
      {/* Left Column - Project List */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen">
        <div ref={scrollRef} className={`flex-1 px-8 lg:px-16 pb-8 overflow-hidden transition-all duration-500 ease-out ${
          titlePosition === 'top' ? 'pt-64' : 'pt-12 lg:pt-24'
        }`}>
          <div className="space-y-8 lg:space-y-10 max-w-lg mx-auto lg:mx-0">
            {projects.map((project, index) => (
              <div
                key={index}
                className="project-item"
                onMouseEnter={(e) => handleMouseEnter(index, e)}
                onMouseLeave={handleMouseLeave}
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
        <div 
          className={`fixed transition-all duration-500 ease-out pointer-events-none ${
            titlePosition === 'top' 
              ? 'top-8 left-1/2 transform -translate-x-1/2 z-10' 
              : 'inset-0 flex items-center justify-center'
          }`}
          style={{
            transform: titlePosition !== 'top' ? `translateX(${titleOffset}px)` : undefined
          }}
        >
          <div className={`text-left pointer-events-auto ${titlePosition === 'top' ? 'text-center' : ''}`}>
          <h1 className="text-3xl lg:text-4xl font-light text-[#272727] leading-tight mb-1 lg:mb-2">
            Alexander Skula,
          </h1>
          <h2 className="text-3xl lg:text-4xl font-light text-[#272727] leading-tight mb-6 lg:mb-8">
            CS and math student at{" "}
            <span className="text-[#cc35aa] font-medium">MIT</span>
          </h2>

          <nav className={`flex flex-wrap gap-4 lg:gap-6 text-base mb-6 ${titlePosition === 'top' ? 'justify-center' : ''}`}>
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
          </nav>
          </div>
        </div>
      </div>

      {/* Hover Bubble */}
      {hoveredProject !== null && (
        <motion.div
          className="fixed z-50 pointer-events-none"
          style={{
            left: popupX,
            top: popupY,
            x: '0%',
            y: '0%',
            rotateZ,
          }}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 20
          }}
        >
          <div className="bubble-content rounded-xl p-6 max-w-sm min-w-[280px]">
            <h3 className="font-semibold text-[#272727] text-lg mb-3">
              {projects[hoveredProject].name}
            </h3>

            <p className="text-[#979797] text-sm mb-4 leading-relaxed">
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
              <ul className="space-y-2">
                {projects[hoveredProject].content.details?.map((detail, idx) => (
                  <li key={idx} className="text-xs text-[#979797] flex items-start">
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