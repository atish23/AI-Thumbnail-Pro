#!/usr/bin/env node

/**
 * Test script to verify Gemini API key and model functionality
 * Run with: node test-api.js
 */

import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";

// Manually read .env.local file
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, value] = trimmed.split('=');
        if (key && value) {
          process.env[key.trim()] = value.trim();
        }
      }
    }
  } catch (error) {
    console.error("❌ Could not read .env.local file:", error.message);
    process.exit(1);
  }
}

// Load environment variables
loadEnvFile();

const API_KEY = process.env.GEMINI_API_KEY;

console.log("🧪 Testing Gemini API Configuration...\n");

// Test 1: Check if API key is set
console.log("1️⃣ Checking API Key...");
if (!API_KEY) {
  console.error("❌ GEMINI_API_KEY not found in environment variables");
  console.log("Please check your .env.local file");
  process.exit(1);
}

if (API_KEY === "PLACEHOLDER_API_KEY") {
  console.error("❌ API key is still set to placeholder");
  console.log("Please replace PLACEHOLDER_API_KEY with your actual Gemini API key");
  process.exit(1);
}

console.log("✅ API key found and not placeholder");

// Test 2: Initialize Gemini AI
console.log("\n2️⃣ Initializing Gemini AI...");
let ai;
try {
  ai = new GoogleGenAI({ apiKey: API_KEY });
  console.log("✅ Gemini AI initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Gemini AI:", error.message);
  process.exit(1);
}

// Test 3: Test text generation (simpler test first)
console.log("\n3️⃣ Testing text generation...");
try {
  const textResponse = await ai.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: {
      parts: [
        {
          text: "Say 'Hello from Gemini!' - this is a test."
        }
      ]
    }
  });
  
  const textResult = textResponse.candidates[0].content.parts[0].text;
  console.log("✅ Text generation successful");
  console.log("📝 Response:", textResult);
} catch (error) {
  console.error("❌ Text generation failed:", error.message);
  console.log("This might indicate an API key issue or network problem");
}

// Test 4: Test image editing model availability
console.log("\n4️⃣ Testing image editing model...");
try {
  // Create a simple test image (1x1 pixel red PNG in base64)
  const testImageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==";
  
  // Use exact same configuration as geminiService.ts
  const imageParts = [{
    inlineData: {
      data: testImageBase64,
      mimeType: "image/png",
    },
  }];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [
        ...imageParts,
        {
          text: "Create a more vibrant and colorful version of this image for a YouTube thumbnail"
        }
      ]
    },
    config: {
      // Must include both IMAGE and TEXT modalities for this model
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  // Check for image response (same as geminiService.ts)
  let foundImage = false;
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      console.log("✅ Image editing model accessible - returned image data");
      foundImage = true;
      break;
    }
  }
  
  if (!foundImage) {
    // Check for text response
    const textResult = response.candidates[0].content.parts[0].text;
    console.log("⚠️  Image editing model accessible but returned text only");
    console.log("📝 Model response:", textResult);
  }
  
} catch (error) {
  console.error("❌ Image editing model test failed:", error.message);
  
  if (error.message.includes("not found") || error.message.includes("404")) {
    console.log("💡 The gemini-2.5-flash-image-preview model might not be available");
    console.log("   Try using 'gemini-pro-vision' or check Google AI Studio for available models");
  } else if (error.message.includes("permission") || error.message.includes("403")) {
    console.log("💡 Your API key might not have access to this model");
    console.log("   Check your Google AI Studio quota and permissions");
  } else if (error.message.includes("API key not valid")) {
    console.log("💡 API key validation failed - this is the same error your app is getting");
  }
}

// Test 5: List available models (if possible)
console.log("\n5️⃣ Checking available models...");
try {
  // Note: This might not work with all SDK versions
  const models = await ai.models.list();
  console.log("✅ Available models:");
  models.forEach(model => {
    console.log(`   📋 ${model.name}`);
  });
} catch (error) {
  console.log("ℹ️  Cannot list models (this is normal with some SDK versions)");
}

console.log("\n🎉 API test completed!");
console.log("\nIf all tests passed, your setup is ready for the AI Thumbnail Pro app!");
console.log("Run 'npm run dev' to start the application.");
