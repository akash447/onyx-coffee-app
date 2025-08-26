// Example API endpoint for user stories management
// This would be placed in your backend (Node.js/Express, Next.js API routes, etc.)

// For Next.js API routes, place this in: pages/api/stories.js or app/api/stories/route.js

// Example using MongoDB/Mongoose
const mongoose = require('mongoose');

// User Story Schema
const UserStorySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  userName: { type: String, required: true },
  userAvatar: { type: String },
  content: { type: String, required: true },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  timestamp: { type: Date, default: Date.now },
  type: { type: String, enum: ['story', 'review'], required: true },
  productId: { type: String },
  productName: { type: String },
  images: [{ type: String }],
  likes: { type: Number, default: 0 },
  likedBy: [{ type: String }],
  isLive: { type: Boolean, default: false },
  tags: [{ type: String }],
});

const UserStory = mongoose.models.UserStory || mongoose.model('UserStory', UserStorySchema);

// API Handler
export default async function handler(req, res) {
  try {
    // Connect to MongoDB
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGODB_URI);
    }

    if (req.method === 'GET') {
      // Get all stories with optional filters
      const { 
        userId, 
        productId, 
        type, 
        isLive, 
        sortBy = 'newest',
        limit = 50 
      } = req.query;

      let query = {};
      
      if (userId) query.userId = userId;
      if (productId) query.productId = productId;
      if (type && type !== 'all') query.type = type;
      if (isLive !== undefined) query.isLive = isLive === 'true';

      let sortOptions = {};
      switch (sortBy) {
        case 'oldest':
          sortOptions = { timestamp: 1 };
          break;
        case 'rating':
          sortOptions = { rating: -1, timestamp: -1 };
          break;
        case 'likes':
          sortOptions = { likes: -1, timestamp: -1 };
          break;
        case 'newest':
        default:
          sortOptions = { timestamp: -1 };
          break;
      }

      const stories = await UserStory.find(query)
        .sort(sortOptions)
        .limit(parseInt(limit))
        .exec();

      res.status(200).json({ 
        success: true, 
        data: stories,
        count: stories.length
      });

    } else if (req.method === 'POST') {
      const body = req.body;

      if (Array.isArray(body)) {
        // Bulk save/update stories (for sync from frontend)
        const bulkOperations = body.map(story => ({
          updateOne: {
            filter: { id: story.id },
            update: { $set: story },
            upsert: true
          }
        }));

        const result = await UserStory.bulkWrite(bulkOperations);

        res.status(200).json({ 
          success: true, 
          message: 'Stories synced successfully',
          modified: result.modifiedCount,
          upserted: result.upsertedCount
        });

      } else {
        // Create single story
        const storyData = body;

        // Validate required fields
        if (!storyData.content || !storyData.userId || !storyData.type) {
          return res.status(400).json({ 
            success: false, 
            error: 'Missing required fields: content, userId, type' 
          });
        }

        // Generate unique ID if not provided
        if (!storyData.id) {
          storyData.id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        }

        const newStory = new UserStory(storyData);
        await newStory.save();

        res.status(201).json({ 
          success: true, 
          data: newStory,
          message: 'Story created successfully'
        });
      }

    } else if (req.method === 'PUT') {
      // Update specific story
      const { id } = req.query;
      const updates = req.body;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Story ID is required' 
        });
      }

      const updatedStory = await UserStory.findOneAndUpdate(
        { id },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!updatedStory) {
        return res.status(404).json({ 
          success: false, 
          error: 'Story not found' 
        });
      }

      res.status(200).json({ 
        success: true, 
        data: updatedStory,
        message: 'Story updated successfully'
      });

    } else if (req.method === 'DELETE') {
      // Delete specific story
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ 
          success: false, 
          error: 'Story ID is required' 
        });
      }

      const deletedStory = await UserStory.findOneAndDelete({ id });

      if (!deletedStory) {
        return res.status(404).json({ 
          success: false, 
          error: 'Story not found' 
        });
      }

      res.status(200).json({ 
        success: true, 
        message: 'Story deleted successfully'
      });

    } else {
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
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
model UserStory {
  id           String   @id
  userId       String
  userName     String
  userAvatar   String?
  content      String
  rating       Int      @default(0)
  timestamp    DateTime @default(now())
  type         String   // 'story' or 'review'
  productId    String?
  productName  String?
  images       String[] // JSON array
  likes        Int      @default(0)
  likedBy      String[] // JSON array
  isLive       Boolean  @default(false)
  tags         String[] // JSON array
  
  @@map("user_stories")
}

// API handler using Prisma
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const stories = await prisma.userStory.findMany({
        orderBy: { timestamp: 'desc' }
      });
      res.status(200).json({ success: true, data: stories });
      
    } else if (req.method === 'POST') {
      if (Array.isArray(req.body)) {
        // Bulk upsert
        const operations = req.body.map(story => 
          prisma.userStory.upsert({
            where: { id: story.id },
            update: story,
            create: story
          })
        );
        
        await Promise.all(operations);
        res.status(200).json({ success: true, message: 'Stories synced' });
      } else {
        // Create single story
        const story = await prisma.userStory.create({
          data: req.body
        });
        res.status(201).json({ success: true, data: story });
      }
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
}
*/