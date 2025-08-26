// Example API endpoint for content management
// This would be placed in your backend (Node.js/Express, Next.js API routes, etc.)

// For Next.js API routes, place this in: pages/api/content.js or app/api/content/route.js

// Example using MongoDB/Mongoose
const mongoose = require('mongoose');

// Content Schema
const ContentSchema = new mongoose.Schema({
  homepage: {
    brandName: { type: String, required: true },
    bannerImage: { type: String, required: true }
  },
  product: {
    sectionTitle: { type: String, required: true },
    exploreTitle: { type: String, required: true },
    personalizedTitle: { type: String, required: true },
    chatbotWelcome: { type: String, required: true },
    chatbotSubtitle: { type: String, required: true },
    personalizedGif: { type: String, required: true }
  },
  community: {
    sectionTitle: { type: String, required: true },
    welcomeText: { type: String, required: true },
    featuredTitle: { type: String, required: true },
    featuredContent: { type: String, required: true },
    featuredDescription: { type: String, required: true }
  },
  about: {
    sectionTitle: { type: String, required: true },
    sectionSubtitle: { type: String, required: true },
    heroTitle: { type: String, required: true },
    heroDescription: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactAddress: { type: String, required: true }
  },
  lastModified: { type: Date, default: Date.now }
});

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema);

// API Handler
export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    if (req.method === 'GET') {
      // Get current content
      let content = await Content.findOne().sort({ lastModified: -1 });
      
      if (!content) {
        // Return default content if none exists
        content = {
          homepage: {
            brandName: 'Onyx Coffee',
            bannerImage: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1200'
          },
          product: {
            sectionTitle: 'Coffee Products',
            exploreTitle: 'Explore other products',
            personalizedTitle: 'Product for you',
            chatbotWelcome: '☕ Coffee Taste Assistant',
            chatbotSubtitle: 'Let\'s find your perfect brew! Answer a few questions and discover coffee that matches your taste.',
            personalizedGif: 'https://media.giphy.com/media/3o6ZtpRoYe9wbyfcBi/giphy.gif'
          },
          community: {
            sectionTitle: 'Community',
            welcomeText: 'Connect with fellow coffee enthusiasts and share your brewing journey.',
            featuredTitle: 'Featured This Week',
            featuredContent: '"The Perfect Pour-Over Technique"',
            featuredDescription: 'Master barista Sarah Chen shares her secrets for brewing the perfect cup using our Ethiopian Yirgacheffe beans.'
          },
          about: {
            sectionTitle: 'About Onyx',
            sectionSubtitle: 'Crafting exceptional coffee experiences since day one.',
            heroTitle: 'Premium Coffee, Ethical Sourcing',
            heroDescription: 'At Onyx Coffee, we believe that great coffee starts with great relationships.',
            contactEmail: 'hello@onyx-coffee.com',
            contactPhone: '+91 98765 43210',
            contactAddress: 'Mumbai, Maharashtra, India'
          }
        };
      }

      res.status(200).json({ success: true, data: content });

    } else if (req.method === 'POST') {
      // Save/Update content
      const contentData = req.body;

      // Validate required fields
      if (!contentData.homepage?.brandName || !contentData.product?.sectionTitle) {
        return res.status(400).json({ 
          success: false, 
          error: 'Missing required fields' 
        });
      }

      // Update or create content
      const updatedContent = await Content.findOneAndUpdate(
        {}, // Find any existing content
        { 
          ...contentData,
          lastModified: new Date()
        },
        { 
          upsert: true, // Create if doesn't exist
          new: true,    // Return updated document
          runValidators: true
        }
      );

      res.status(200).json({ 
        success: true, 
        data: updatedContent,
        message: 'Content saved successfully'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ success: false, error: 'Method not allowed' });
    }

  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error',
      details: error.message
    });
  }
}

// Alternative: Using PostgreSQL with Prisma
/*
// prisma/schema.prisma
model Content {
  id               String   @id @default(cuid())
  homepage         Json
  product          Json  
  community        Json
  about            Json
  lastModified     DateTime @default(now()) @updatedAt
}

// API handler using Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const content = await prisma.content.findFirst({
        orderBy: { lastModified: 'desc' }
      });
      res.status(200).json({ success: true, data: content });
      
    } else if (req.method === 'POST') {
      const contentData = req.body;
      
      const updatedContent = await prisma.content.upsert({
        where: { id: 'main' }, // or use a specific ID
        update: contentData,
        create: { id: 'main', ...contentData }
      });
      
      res.status(200).json({ success: true, data: updatedContent });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
*/