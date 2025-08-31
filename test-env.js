#!/usr/bin/env node

/**
 * Simple test to verify environment variables are loaded correctly
 */

import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

console.log("🔧 Environment Variables Test\n");

console.log("1. GEMINI_API_KEY:", process.env.GEMINI_API_KEY ? "✅ Set" : "❌ Missing");
console.log("2. VITE_ADMIN_EMAIL:", process.env.VITE_ADMIN_EMAIL ? "✅ Set" : "❌ Missing");
console.log("3. VITE_ADMIN_PASSWORD:", process.env.VITE_ADMIN_PASSWORD ? "✅ Set" : "❌ Missing");

console.log("\nValues (for debugging):");
console.log("- GEMINI_API_KEY:", process.env.GEMINI_API_KEY?.substring(0, 10) + "...");
console.log("- VITE_ADMIN_EMAIL:", process.env.VITE_ADMIN_EMAIL);
console.log("- VITE_ADMIN_PASSWORD:", process.env.VITE_ADMIN_PASSWORD);
