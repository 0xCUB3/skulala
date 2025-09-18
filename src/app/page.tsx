"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import NoiseBackground from "@/components/NoiseBackground";

interface ProjectData {
  name: string;
  year: string;
  githubUrl?: string;
  content: {
    description: string;
    images?: string[];
    details?: string[];
    table?: {
      title?: string;
      headers: string[];
      rows: (string | number)[][];
    };
  };
}

export default function Home() {
  const router = useRouter();
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [titlePosition, setTitlePosition] = useState<
    "center" | "right" | "top"
  >("center");
  const [titleOffset, setTitleOffset] = useState<number>(0);
  const [windowWidth, setWindowWidth] = useState<number>(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const hoverElementRef = useRef<HTMLElement | null>(null);

  // Convert project name to URL slug
  const createSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleProjectClick = (githubUrl?: string) => {
    if (githubUrl) {
      window.open(githubUrl, "_blank");
    }
  };

  // Mouse tracking for popup movement and dynamic site effects
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });
  const [windowDimensions, setWindowDimensions] = useState({
    width: 1920,
    height: 1080,
  });

  // Update window dimensions
  useEffect(() => {
    const updateDimensions = () => {
      setWindowDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    if (typeof window !== "undefined") {
      updateDimensions();
      window.addEventListener("resize", updateDimensions);
      return () => window.removeEventListener("resize", updateDimensions);
    }
  }, []);

  // Transform cursor position to influence entire site
  const backgroundShiftX = useTransform(
    mouseX,
    [0, windowDimensions.width],
    [-20, 20],
  );
  const backgroundShiftY = useTransform(
    mouseY,
    [0, windowDimensions.height],
    [-15, 15],
  );
  const glowIntensity = useTransform(
    mouseX,
    [0, windowDimensions.width],
    [0.02, 0.08],
  );
  const tintShift = useTransform(
    mouseY,
    [0, windowDimensions.height],
    [245, 252],
  );

  const popupX = useTransform(mouseX, (value: number) => {
    if (!hoverElementRef.current) return "-50%";
    const rect = hoverElementRef.current.getBoundingClientRect();
    const relativeX = value - rect.left - rect.width / 2;
    const moveAmount = (relativeX / rect.width) * 135; // 225% movement - max 135px horizontal (3x of 45px)
    return `calc(-50% + ${moveAmount}px)`;
  });

  const popupY = useTransform(mouseY, (value: number) => {
    if (!hoverElementRef.current) return "-50%";
    const rect = hoverElementRef.current.getBoundingClientRect();
    const relativeY = value - rect.top - rect.height / 2;
    const moveAmount = (relativeY / rect.height) * 45; // 75% movement - max 45px vertical (3x of 15px)
    return `calc(-50% + ${moveAmount}px)`;
  });

  // Track mouse movement for popup and cursor gradient
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
      setCursorPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Enhanced responsive title positioning with smooth transitions
  useEffect(() => {
    const updateTitlePosition = () => {
      const width = window.innerWidth;
      setWindowWidth(width);

      if (width < 768) {
        setTitlePosition("top");
        setTitleOffset(0);
      } else {
        // Calculate where the dates column ends (50vw + right-aligned date width + padding)
        const datesColumnEnd = width / 2 + 60 + 64; // 60px for date width, 64px for lg:px-16 padding
        const titleCenterPosition = width / 2;
        const titleWidth = 400; // Approximate title width
        const titleLeftEdge = titleCenterPosition - titleWidth / 2;
        const titleRightEdge = titleCenterPosition + titleWidth / 2;

        // Check if title collides with dates column or if popups would collide
        const popupSpaceNeeded = 320; // Space needed for popups to appear next to items
        const availablePopupSpace = width - (datesColumnEnd + 150); // Space available after dates

        if (titleLeftEdge < datesColumnEnd + 100) {
          // Title collision check
          // Calculate safe push amount that won't go off-screen
          const maxSafePush = Math.max(0, width - titleRightEdge - 80); // 80px from right edge
          const requiredPushAmount = Math.min(
            datesColumnEnd + 100 - titleLeftEdge,
            maxSafePush,
          );

          // If we can't push enough to avoid collision OR if there's not enough space for popups, go to top
          if (
            requiredPushAmount < datesColumnEnd + 100 - titleLeftEdge ||
            availablePopupSpace < popupSpaceNeeded
          ) {
            setTitlePosition("top");
            setTitleOffset(0);
          } else {
            // Safe to push right and popups have space
            setTitleOffset(requiredPushAmount * 0.6);
            setTitlePosition("right");
          }
        } else if (availablePopupSpace < popupSpaceNeeded) {
          // Even if title doesn't collide, check if popups would have enough space
          setTitlePosition("top");
          setTitleOffset(0);
        } else {
          setTitleOffset(0);
          setTitlePosition("center");
        }
      }
    };

    // Initialize window width on mount
    if (typeof window !== "undefined") {
      updateTitlePosition();
      window.addEventListener("resize", updateTitlePosition);
      return () => window.removeEventListener("resize", updateTitlePosition);
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

    window.addEventListener("resize", centerList);
    return () => window.removeEventListener("resize", centerList);
  }, []);

  const projects: ProjectData[] = [
    {
      name: "wBlock",
      year: "2025",
      githubUrl: "https://github.com/0xCUB3/wBlock",
      content: {
        description:
          "The first-ever fully SwiftUI-native, privacy-focused, power efficient, free, and open-source ad blocker built for Safari users, built to end the drought of fully-functional ad blockers on Apple's flagship browser.",
        images: ["/projects/wblock/screenshot-1.png"],
      },
    },
    {
      name: "Sir Tim the Timely",
      year: "2025",
      githubUrl: "https://github.com/0xCUB3/sir-tim-the-timely",
      content: {
        description:
          "A Hikari Discord bot for the MIT Class of 2029 Discord server.",
        images: ["/projects/sir-tim-the-timely/bot-demo.png"],
      },
    },
    {
      name: "Near-Perfect Number Tester",
      year: "2025",
      githubUrl: "https://github.com/0xCUB3/near-perfect-tester",
      content: {
        description:
          "A toolkit to efficiently find k-near perfect numbers extremely efficiently using a modified Sieve of Eratosthenes. Completed for a research paper that made significant contributions to the study of 2-near perfect numbers.",
        images: [],
        table: {
          title:
            "Near Perfect Numbers up to 10,000,000 of the form n = 2ᵏ × p²",
          headers: ["n", "σ(n)", "2n", "diff", "Valid (d₁, d₂) Combinations"],
          rows: [
            [18, 39, 36, 3, "+1 +2; +2 +1; +6 -3; +9 -6"],
            [36, 91, 72, 19, "+1 +18; +18 +1"],
            [50, 93, 100, -7, "-2 -5; -5 -2"],
            [196, 399, 392, 7, "+14 -7"],
            [200, 465, 400, 65, "+25 +40; +40 +25"],
            [2312, 4605, 4624, -19, "-17 -2; -2 -17"],
            [15376, 30783, 30752, 31, "+62 -31"],
            [1032256, 2064639, 2064512, 127, "+254 -127"],
            [8454272, 16908285, 16908544, -259, "-2 -257; -257 -2"],
          ],
        },
      },
    },
    {
      name: "HandMaestro",
      year: "2024",
      githubUrl: "https://github.com/0xCUB3/handmaestro",
      content: {
        description: "An on-device ASL gesture practice site using TensorFlow.",
        images: ["/projects/handmaestro/hi.gif"],
      },
    },
    {
      name: "Modified Dots and Boxes Engine",
      year: "2024",
      githubUrl: "https://github.com/0xCUB3/modified-dots-and-boxes",
      content: {
        description:
          "A Dots-and-Boxes game for Pygame, complete with winning algorithms for various graph families. Completed for a research paper.",
        images: ["/projects/modified-dots-and-boxes/dots-and-boxes.gif"],
      },
    },
    {
      name: "SciTool",
      year: "2024",
      githubUrl: "https://github.com/0xCUB3/scitool",
      content: {
        description:
          "A SwiftUI-based scientific calculator and simulator tools for macOS.",
        images: ["/projects/scitool/screenshot.png"],
      },
    },
    {
      name: "Archie",
      year: "2024",
      githubUrl: "https://github.com/0xCUB3/archie",
      content: {
        description:
          "A Python Discord bot for checking and reporting Arc forum invite status, built for the Arc Discord server prior to Arc Browser's public release.",
        images: ["/projects/archie/archie.png"],
      },
    },
    {
      name: "BetterCamp-macOS",
      year: "2023",
      githubUrl: "https://github.com/0xCUB3/bettercamp-macos",
      content: {
        description:
          "An alternative to the deprecated macOS BootCamp Assistant and patcher.",
        images: [],
      },
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
          y: backgroundShiftY,
        }}
      >
        <motion.div
          className="absolute top-20 left-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: useTransform(
              [glowIntensity, tintShift],
              ([intensity, tint]: number[]) =>
                `radial-gradient(circle, rgba(${tint}, ${tint}, 255, ${intensity}) 0%, transparent 60%)`,
            ),
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 rounded-full blur-3xl"
          style={{
            background: useTransform(
              [glowIntensity, tintShift],
              ([intensity, tint]: number[]) =>
                `radial-gradient(circle, rgba(${tint - 2}, ${tint - 1}, 255, ${intensity * 0.8}) 0%, transparent 60%)`,
            ),
          }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl"
          style={{
            background: useTransform(
              [glowIntensity, tintShift],
              ([intensity, tint]: number[]) =>
                `radial-gradient(circle, rgba(${tint - 1}, ${tint}, 250, ${intensity * 0.6}) 0%, transparent 70%)`,
            ),
          }}
        />
        <motion.div
          className="absolute top-1/3 right-1/3 w-80 h-80 rounded-full blur-2xl"
          style={{
            background: useTransform(
              [glowIntensity],
              ([intensity]: number[]) =>
                `radial-gradient(circle, rgba(248, 249, 252, ${intensity * 0.9}) 0%, transparent 50%)`,
            ),
          }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-72 h-72 rounded-full blur-2xl"
          style={{
            background: useTransform(
              [glowIntensity],
              ([intensity]: number[]) =>
                `radial-gradient(circle, rgba(250, 251, 253, ${intensity * 0.7}) 0%, transparent 50%)`,
            ),
          }}
        />
      </motion.div>
      {/* Left Column - Project List */}
      <div className="w-full lg:w-1/2 flex flex-col h-screen">
        {/* Title space when at top */}
        {titlePosition === "top" && <div className="h-64 flex-shrink-0" />}

        <div
          ref={scrollRef}
          className={`flex-1 px-8 lg:px-16 overflow-y-scroll scrollbar-hide spring-scroll ${
            titlePosition === "top" ? "pt-8" : "pt-12 lg:pt-24"
          }`}
        >
          {/* Top spacer - sized so last item (Archie) can reach top of viewport */}
          <div
            className="flex-shrink-0 top-spacer"
            style={{ height: "calc(50vh + 100px)" }}
          ></div>

          {/* Project list container */}
          <div className="flex-shrink-0">
            <div className="space-y-2 max-w-lg mx-auto lg:mx-0 project-list py-16">
              {projects.map((project, index) => (
                <button
                  key={project.name}
                  className="project-item group w-full text-left"
                  type="button"
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
                  onClick={() => handleProjectClick(project.githubUrl)}
                  style={{ cursor: project.githubUrl ? "pointer" : "default" }}
                >
                  <span className="project-name flex items-center gap-2">
                    {project.name}
                    {project.githubUrl && (
                      <svg
                        className="w-3.5 h-3.5 opacity-0 group-hover:opacity-40 transition-opacity duration-200"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </span>
                  <span className="project-year">{project.year}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom spacer - sized so first item (wBlock) can reach bottom of viewport */}
          <div
            className="flex-shrink-0 bottom-spacer"
            style={{ height: "calc(50vh + 100px)" }}
          ></div>
        </div>
      </div>

      {/* Right Column - Main Content */}
      <div className="w-full lg:w-1/2 relative">
        <motion.div
          className="fixed pointer-events-none z-10"
          animate={{
            top: titlePosition === "top" ? 32 : "50%",
            left: "50%",
            x:
              titlePosition === "top"
                ? "-50%"
                : titlePosition === "right"
                  ? `calc(-50% + ${Math.min(titleOffset, windowWidth / 4)}px)`
                  : "-50%",
            y: titlePosition === "top" ? 0 : "-50%",
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 35,
            mass: 0.8,
          }}
        >
          <motion.div
            className="text-left pointer-events-auto"
            animate={{
              textAlign: titlePosition === "top" ? "center" : "left",
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 40,
              mass: 0.5,
            }}
          >
            <motion.h1
              className="text-3xl lg:text-4xl font-bold text-[#272727] leading-tight mb-1 lg:mb-2"
              animate={{
                scale: titlePosition === "top" ? 0.9 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 38,
              }}
            >
              Alexander Skula,
            </motion.h1>
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-[#272727] leading-tight mb-6 lg:mb-8"
              animate={{
                scale: titlePosition === "top" ? 0.9 : 1,
              }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 38,
              }}
            >
              CS and math student at{" "}
              <span className="text-[#8A1538] font-bold">MIT</span>
            </motion.h2>

            <motion.nav
              className="flex flex-wrap gap-4 lg:gap-6 text-base mb-6"
              animate={{
                justifyContent:
                  titlePosition === "top" ? "center" : "flex-start",
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40,
              }}
            >
              <a
                href="mailto:skula@mit.edu"
                className="text-[#979797] hover:text-[#272727] transition-colors duration-300"
              >
                Email
              </a>
              <a
                href="https://github.com/0xCUB3"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#979797] hover:text-[#272727] transition-colors duration-300"
              >
                GitHub
              </a>
              <a
                href="https://linkedin.com/in/skula"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#979797] hover:text-[#272727] transition-colors duration-300"
              >
                LinkedIn
              </a>
              <a
                href="/resume"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#979797] hover:text-[#272727] transition-colors duration-300"
              >
                Resume
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
            y: popupY,
          }}
          transition={{
            type: "tween",
            duration: 0.12,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
        >
          <div
            className={`bubble-content rounded-3xl p-10 min-w-[380px] relative z-10 ${
              projects[hoveredProject].content.table ? "max-w-3xl" : "max-w-md"
            }`}
          >
            <h3 className="font-semibold text-[#1a1a1a] text-2xl mb-4 relative z-10">
              {projects[hoveredProject].name}
            </h3>

            <p className="text-[#666666] text-base mb-6 leading-relaxed relative z-10">
              {projects[hoveredProject].content.description}
            </p>

            {projects[hoveredProject].content.images && (
              <div className="mb-6 space-y-3">
                {projects[hoveredProject].content.images?.map((image) => (
                  <div
                    key={image}
                    className="relative overflow-hidden rounded-2xl"
                  >
                    <img
                      src={image}
                      alt={projects[hoveredProject].name}
                      className="w-full block"
                      style={{
                        borderRadius: "12px",
                        boxShadow:
                          "0 4px 12px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)",
                        border: "1px solid rgba(0, 0, 0, 0.04)",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {projects[hoveredProject].content.table && (
              <div className="mb-6">
                {projects[hoveredProject].content.table.title && (
                  <h4 className="text-sm font-semibold text-[#1a1a1a] mb-3">
                    {projects[hoveredProject].content.table.title}
                  </h4>
                )}
                <div className="overflow-x-auto rounded-lg border border-gray-100">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-50/50">
                      <tr>
                        {projects[hoveredProject].content.table.headers.map(
                          (header, idx) => (
                            <th
                              key={header}
                              className={`px-3 py-2 text-left font-medium text-[#666666] border-b border-gray-100 ${
                                idx ===
                                (projects[hoveredProject].content.table?.headers
                                  .length || 0) -
                                  1
                                  ? "min-w-[200px]"
                                  : ""
                              }`}
                            >
                              {header}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody className="bg-white/50 divide-y divide-gray-100">
                      {projects[hoveredProject].content.table.rows.map(
                        (row, rowIdx) => (
                          <tr
                            key={`row-${row[0]}-${rowIdx}`}
                            className="hover:bg-gray-50/50 transition-colors"
                          >
                            {row.map((cell, cellIdx) => (
                              <td
                                key={`cell-${String(cell)}-${cellIdx}`}
                                className={`px-3 py-2 text-[#666666] ${
                                  cellIdx === row.length - 1
                                    ? ""
                                    : "whitespace-nowrap"
                                }`}
                              >
                                {typeof cell === "number"
                                  ? cell.toLocaleString()
                                  : cell}
                              </td>
                            ))}
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {projects[hoveredProject].content.details && (
              <ul className="space-y-3">
                {projects[hoveredProject].content.details?.map(
                  (detail, idx) => (
                    <li
                      key={`detail-${idx}-${detail.slice(0, 20)}`}
                      className="text-sm text-[#979797] flex items-start"
                    >
                      <span className="text-[#6b7280] mr-2 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ),
                )}
              </ul>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
