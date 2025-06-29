import React, { createContext, useContext, useState, useEffect } from 'react';
import { postsAPI } from '../api/posts';
import { commentsAPI } from '../api/comments';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('new');

  // Fetch posts
  const fetchPosts = async (sort = sortBy) => {
    setLoading(true);
    setError(null);
    try {
      // Use the new filterPosts API instead of getPosts for better CORS compatibility
      const data = await postsAPI.filterPosts({ sort });
      setPosts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch comments for a post
  const fetchComments = async (postId) => {
    try {
      const data = await commentsAPI.getComments(postId);
      setComments(prev => ({ ...prev, [postId]: data }));
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // Create a new post
  const createPost = async (postData) => {
    if (!token) throw new Error('Authentication required');
    
    try {
      const newPost = await postsAPI.createPost(postData, token);
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Vote on a post
  const votePost = async (postId, voteType) => {
    if (!token) throw new Error('Authentication required');
    
    try {
      await postsAPI.votePost(postId, voteType, token);
      // Update the post in the list
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            upvotes: voteType === 'upvote' ? post.upvotes + 1 : post.upvotes,
            downvotes: voteType === 'downvote' ? post.downvotes + 1 : post.downvotes,
            score: voteType === 'upvote' ? post.score + 1 : post.score - 1,
          };
        }
        return post;
      }));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Create a comment
  const createComment = async (postId, commentData) => {
    if (!token) throw new Error('Authentication required');
    
    try {
      const newComment = await commentsAPI.createComment(postId, commentData, token);
      setComments(prev => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newComment]
      }));
      
      // Update post comment count
      setPosts(prev => prev.map(post => {
        if (post.id === postId) {
          return { ...post, comments: post.comments + 1 };
        }
        return post;
      }));
      
      return newComment;
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Vote on a comment
  const voteComment = async (postId, commentId, voteType) => {
    if (!token) throw new Error('Authentication required');
    
    try {
      await commentsAPI.voteComment(postId, commentId, voteType, token);
      setComments(prev => ({
        ...prev,
        [postId]: prev[postId]?.map(comment => {
          if (comment.id === commentId) {
            return {
              ...comment,
              upvotes: voteType === 'upvote' ? comment.upvotes + 1 : comment.upvotes,
              downvotes: voteType === 'downvote' ? comment.downvotes + 1 : comment.downvotes,
              score: voteType === 'upvote' ? comment.score + 1 : comment.score - 1,
            };
          }
          return comment;
        }) || []
      }));
    } catch (err) {
      throw new Error(err.message);
    }
  };

  // Load posts on mount and when sort changes
  useEffect(() => {
    fetchPosts();
  }, [sortBy]);

  const value = {
    posts,
    comments,
    loading,
    error,
    sortBy,
    setSortBy,
    fetchPosts,
    fetchComments,
    createPost,
    votePost,
    createComment,
    voteComment,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}; 