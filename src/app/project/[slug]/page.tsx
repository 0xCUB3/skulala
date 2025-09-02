"use client";

import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import NoiseBackground from "@/components/NoiseBackground";

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Convert slug back to project name for display
  const projectName = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Organic noise background */}
      <NoiseBackground />

      {/* Back button */}
      <motion.button
        onClick={() => router.push("/")}
        className="fixed top-8 left-8 z-50 px-6 py-3 rounded-full"
        style={{
          background:
            "linear-gradient(135deg, rgba(248, 249, 250, 0.35) 0%, rgba(250, 251, 252, 0.42) 100%)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.5)",
        }}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-[#6b7280] font-medium">← Back</span>
      </motion.button>

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-8">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-4xl lg:text-5xl font-light text-[#272727] mb-4">
            {projectName}
          </h1>
          <p className="text-[#979797] text-lg max-w-md mx-auto">
            Content coming soon...
          </p>
        </motion.div>
      </div>
    </div>
  );
}
