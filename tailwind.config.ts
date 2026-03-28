import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0E1116",
                foreground: "#f3f4f6", // gray-100
                card: {
                    DEFAULT: "#151A21",
                    foreground: "#f3f4f6",
                },
                border: "rgba(255, 255, 255, 0.06)",
                primary: {
                    DEFAULT: "#00E599", // Neon green
                    foreground: "#0E1116",
                },
                success: {
                    DEFAULT: "#00E599",
                    text: "#00E599",
                },
                danger: {
                    DEFAULT: "#FF4D4D",
                    text: "#FF4D4D",
                }
            },
        },
    },
    plugins: [],
};
export default config;
