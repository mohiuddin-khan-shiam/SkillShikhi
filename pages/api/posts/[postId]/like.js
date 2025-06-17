import { connectToDatabase } from '../../../../lib/mongodb';
import Post from '../../../../models/Post';
import { verifyToken } from '../../../../utils/auth';

// API route for handling post likes/unlikes
export default async function handler(req, res) {
  // Connect to the database
  try {
    await connectToDatabase();
  } catch (error) {
    console.error('Database connection error:', error);
    return res.status(500).json({ error: 'Failed to connect to database' });
  }

  // Only allow PUT requests
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    const { postId } = req.query;
    const userId = decoded.userId;

    // Find the post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Toggle like/unlike
    const userLiked = post.likes.includes(userId);
    
    if (userLiked) {
      // User already liked the post, remove the like
      await Post.findByIdAndUpdate(
        postId,
        { $pull: { likes: userId } }
      );
      return res.status(200).json({ message: 'Post unliked successfully' });
    } else {
      // User hasn't liked the post, add the like
      await Post.findByIdAndUpdate(
        postId,
        { $addToSet: { likes: userId } }
      );
      return res.status(200).json({ message: 'Post liked successfully' });
    }
  } catch (error) {
    console.error('Error updating post like:', error);
    return res.status(500).json({ error: 'Failed to update post like status' });
  }
}
