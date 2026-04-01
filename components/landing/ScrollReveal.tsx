'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface ScrollRevealProps {
    children: React.ReactNode;
    width?: "fit-content" | "100%";
    height?: "fit-content" | "100%";
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
    children, 
    width = "100%",
    height = "fit-content",
    delay = 0,
    direction = "up",
    className = ""
}) => {
    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { x: 40, y: 0 },
        right: { x: -40, y: 0 }
    };

    return (
        <div 
            className={className} 
            style={{ position: "relative", width, height, overflow: "visible" }}
        >
            <motion.div
                className={height === "100%" ? "h-full" : ""}
                variants={{
                    hidden: { 
                        opacity: 0, 
                        ...directions[direction]
                    },
                    visible: { 
                        opacity: 1, 
                        x: 0, 
                        y: 0 
                    }
                }}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                    duration: 0.8, 
                    delay, 
                    ease: [0.21, 0.47, 0.32, 0.98] 
                }}
            >
                {children}
            </motion.div>
        </div>
    );
};
