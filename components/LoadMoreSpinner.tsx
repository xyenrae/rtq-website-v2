"use client";
import React from "react";
import { motion } from "framer-motion";

const LoadMoreSpinner = () => {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      <motion.div
        className="relative h-4 w-4"
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 1.2,
          ease: "linear",
        }}
      >
        {/* Outer circle with subtle pulse */}
        <div className="absolute h-full w-full rounded-full border-2 border-gray-200/50" />
        {/* Animated spinner track */}
        <div className="absolute h-full w-full animate-spin rounded-full border-2 border-transparent border-t-gray-600 border-r-gray-600" />
      </motion.div>

      {/* Text with subtle fade animation */}
      <motion.span
        initial={{ opacity: 0.8 }}
        animate={{ opacity: 1 }}
        transition={{
          repeat: Infinity,
          duration: 1.5,
          repeatType: "reverse",
        }}
        className="text-sm font-medium text-gray-600"
      >
        Memuat data...
      </motion.span>
    </div>
  );
};

export default LoadMoreSpinner;
