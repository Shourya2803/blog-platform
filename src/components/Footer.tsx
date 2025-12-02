"use client";

import { motion } from "framer-motion";
import { Github, Linkedin, Mail } from "lucide-react";

// Use direct whileHover props to avoid Variants typing issues
const linkHoverTransition = { type: "spring", stiffness: 300 } as const;
const iconHoverTransition = { type: "spring", stiffness: 300 } as const;

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 text-zinc-700 dark:text-zinc-300 py-12 border-t border-zinc-200 dark:border-zinc-700">
      <div className="max-w-6xl mx-auto px-6 relative overflow-hidden">
        {/* Decorative purple glow orbs (subtle, behind content) */}
  <div aria-hidden className="pointer-events-none z-0">
          <div
            className="absolute left-4 top-6 w-36 h-36 md:w-52 md:h-52 rounded-full blur-3xl opacity-20 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(167,139,250,0.85), rgba(168,85,247,0.08))', mixBlendMode: 'screen' }}
          />
          <div
            className="absolute left-1/2 top-1/4 transform -translate-x-1/2 w-48 h-48 md:w-72 md:h-72 rounded-full blur-3xl opacity-10 transition-opacity duration-700"
            style={{ background: 'radial-gradient(circle at 50% 50%, rgba(167,139,250,0.6), rgba(168,85,247,0.04))', mixBlendMode: 'screen' }}
          />
          <div
            className="absolute right-4 bottom-8 w-36 h-36 md:w-52 md:h-52 rounded-full blur-3xl opacity-16 transition-opacity duration-500"
            style={{ background: 'radial-gradient(circle at 70% 70%, rgba(167,139,250,0.75), rgba(168,85,247,0.06))', mixBlendMode: 'screen' }}
          />
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          {/* Logo / Brand */}
          <div className="relative group">
            <motion.a
              href="/"
              whileHover={{ scale: 1.05, textShadow: '0 0 12px rgba(167,139,250,0.9)', transition: linkHoverTransition }}
              className="text-2xl font-bold text-purple-600 cursor-pointer inline-block"
              aria-label="Homepage"
            >
              Blogify
            </motion.a>
            {/* subtle local glow */}
            <span
              aria-hidden
              className="absolute -inset-2 z-0 rounded-full opacity-0 group-hover:opacity-95 transition-opacity duration-300 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.28), rgba(168,85,247,0.04))', filter: 'blur(14px)', mixBlendMode: 'screen' }}
            />
          </div>

          
         

          {/* Social Icons */}
          <div className="flex gap-4 items-center">
            {[
              // { icon: <Github className="w-5 h-5" />, href: "https://github.com/Shourya2803/" },
              { icon: <Linkedin className="w-5 h-5" />, href: "https://www.linkedin.com/in/prachi-tiwari-0166582a9/" },
              // { icon: <Mail className="w-5 h-5" />, href: "mittalshourya2803@gmail.com" },
            ].map(({ icon, href }, idx) => (
              <div key={idx} className="relative group">
                <motion.a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.15, filter: 'drop-shadow(0 0 8px rgba(167,139,250,0.9))', transition: iconHoverTransition }}
                  className="relative z-10 p-1 rounded-sm"
                  aria-label={`Open ${href}`}
                >
                  {icon}
                </motion.a>

                {/* icon glow */}
                <span
                  aria-hidden
                  className="absolute inset-0 z-0 rounded-full opacity-0 group-hover:opacity-90 transition-opacity duration-300 pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.22), rgba(168,85,247,0.02))', filter: 'blur(12px)', mixBlendMode: 'screen' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 text-center text-sm text-zinc-500 dark:text-zinc-400 relative z-10">
          © {new Date().getFullYear()} MyBlog. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
