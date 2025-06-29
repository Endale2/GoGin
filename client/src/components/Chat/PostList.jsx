import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiClock } from 'react-icons/fi';
import { InteractionBar } from '../InteractionButtons';
import { postsAPI } from '../../api/posts';

const PostList = ({ posts }) => {
  const [localPosts, setLocalPosts] = useState(posts);

  // Update local posts when props change
  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  // Listen for real-time vote updates
  useEffect(() => {
    const handleVoteUpdate = (event) => {
      const { post_id, upvotes, downvotes, score } = event.detail;
      
      setLocalPosts(prev => prev.map(post => {
        if (post.id === post_id) {
          return {
            ...post,
            upvotes,
            downvotes,
            score
          };
        }
        return post;
      }));
    };

    window.addEventListener('voteUpdate', handleVoteUpdate);
    return () => window.removeEventListener('voteUpdate', handleVoteUpdate);
  }, []);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return date.toLocaleDateString();
  };

  const handleVote = async (postId, voteType) => {
    try {
      await postsAPI.votePost(postId, voteType);
    } catch (error) {
      console.error('Error voting on post:', error);
    }
  };

  const handleSave = async (postId) => {
    try {
      await postsAPI.savePost(postId);
    } catch (error) {
      console.error('Error saving post:', error);
    }
  };

  const handleComment = (postId) => {
    // Navigate to post detail page
    window.location.href = `/post/${postId}`;
  };

  return (
    <div className="space-y-4">
      {localPosts.map((post) => (
        <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start space-x-4">
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">Posted by</span>
                <span className="text-sm font-medium text-blue-600">{post.author?.email || 'Anonymous'}</span>
                <span className="text-gray-400">•</span>
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <FiClock className="w-3 h-3" />
                  <span>{formatTime(post.created_at)}</span>
                </div>
              </div>
              
              <Link to={`/post/${post.id}`} className="block">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-700 mb-4 line-clamp-3">
                  {post.content}
                </p>
              </Link>
              
              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Real-time Interaction Bar */}
              <InteractionBar
                id={post.id}
                likesCount={post.upvotes || 0}
                dislikesCount={post.downvotes || 0}
                commentsCount={post.comments || 0}
                onLike={() => handleVote(post.id, 'upvote')}
                onDislike={() => handleVote(post.id, 'downvote')}
                onSave={() => handleSave(post.id)}
                onComment={() => handleComment(post.id)}
                size="md"
                showSave={true}
                showComments={true}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostList; 