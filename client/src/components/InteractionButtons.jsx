import React, { useEffect, useState } from 'react';
import { AiOutlineLike, AiOutlineDislike, AiOutlineComment } from 'react-icons/ai';
import { BsBookmark, BsBookmarkFill } from 'react-icons/bs';
import { BiLike, BiDislike } from 'react-icons/bi';

// Like/Dislike Button Component
export const LikeDislikeButtons = ({ 
  id, // post_id or comment_id for real-time updates
  likesCount = 0, 
  dislikesCount = 0, 
  isLiked = false, 
  isDisliked = false, 
  onLike, 
  onDislike,
  size = 'sm',
  showCounts = true 
}) => {
  const [localLikes, setLocalLikes] = useState(likesCount);
  const [localDislikes, setLocalDislikes] = useState(dislikesCount);
  const [localIsLiked, setLocalIsLiked] = useState(isLiked);
  const [localIsDisliked, setLocalIsDisliked] = useState(isDisliked);

  // Update local state when props change
  useEffect(() => {
    setLocalLikes(likesCount);
    setLocalDislikes(dislikesCount);
    setLocalIsLiked(isLiked);
    setLocalIsDisliked(isDisliked);
  }, [likesCount, dislikesCount, isLiked, isDisliked]);

  // Listen for real-time vote updates
  useEffect(() => {
    if (!id) return;

    const handleVoteUpdate = (event) => {
      const { post_id, comment_id, vote_type, upvotes, downvotes } = event.detail;
      const updateId = post_id || comment_id;
      
      if (updateId === id) {
        setLocalLikes(upvotes);
        setLocalDislikes(downvotes);
        
        // Update like/dislike state based on vote type
        if (vote_type === 'upvote') {
          setLocalIsLiked(true);
          setLocalIsDisliked(false);
        } else if (vote_type === 'downvote') {
          setLocalIsLiked(false);
          setLocalIsDisliked(true);
        }
      }
    };

    window.addEventListener('voteUpdate', handleVoteUpdate);
    return () => window.removeEventListener('voteUpdate', handleVoteUpdate);
  }, [id]);

  const handleLike = () => {
    setLocalIsLiked(!localIsLiked);
    if (localIsDisliked) {
      setLocalIsDisliked(false);
      setLocalDislikes(prev => prev - 1);
    }
    if (!localIsLiked) {
      setLocalLikes(prev => prev + 1);
    } else {
      setLocalLikes(prev => prev - 1);
    }
    onLike();
  };

  const handleDislike = () => {
    setLocalIsDisliked(!localIsDisliked);
    if (localIsLiked) {
      setLocalIsLiked(false);
      setLocalLikes(prev => prev - 1);
    }
    if (!localIsDisliked) {
      setLocalDislikes(prev => prev + 1);
    } else {
      setLocalDislikes(prev => prev - 1);
    }
    onDislike();
  };

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSize = {
    sm: 'mr-1',
    md: 'mr-2',
    lg: 'mr-2'
  };

  return (
    <div className="flex items-center space-x-4">
      <button
        onClick={handleLike}
        className={`flex items-center transition-all duration-200 ${
          localIsLiked 
            ? "text-blue-600 dark:text-blue-400" 
            : "text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
        } ${sizeClasses[size]}`}
      >
        {localIsLiked ? <BiLike className={iconSize[size]} /> : <AiOutlineLike className={iconSize[size]} />}
        {showCounts && localLikes}
      </button>
      
      <button
        onClick={handleDislike}
        className={`flex items-center transition-all duration-200 ${
          localIsDisliked 
            ? "text-red-600 dark:text-red-400" 
            : "text-gray-500 hover:text-red-600 dark:hover:text-red-400"
        } ${sizeClasses[size]}`}
      >
        {localIsDisliked ? <BiDislike className={iconSize[size]} /> : <AiOutlineDislike className={iconSize[size]} />}
        {showCounts && localDislikes}
      </button>
    </div>
  );
};

// Save Button Component
export const SaveButton = ({ 
  isSaved = false, 
  onSave, 
  size = 'sm',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSize = {
    sm: 'mr-1',
    md: 'mr-2',
    lg: 'mr-2'
  };

  return (
    <button
      onClick={onSave}
      className={`flex items-center transition-all duration-200 ${
        isSaved 
          ? "text-yellow-600 dark:text-yellow-400" 
          : "text-gray-500 hover:text-yellow-600 dark:hover:text-yellow-400"
      } ${sizeClasses[size]}`}
    >
      {isSaved ? <BsBookmarkFill className={iconSize[size]} /> : <BsBookmark className={iconSize[size]} />}
      {showText && (isSaved ? "Saved" : "Save")}
    </button>
  );
};

// Comment Button Component
export const CommentButton = ({ 
  count = 0, 
  onClick, 
  size = 'sm',
  showCount = true 
}) => {
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  const iconSize = {
    sm: 'mr-1',
    md: 'mr-2',
    lg: 'mr-2'
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${sizeClasses[size]}`}
    >
      <AiOutlineComment className={iconSize[size]} />
      {showCount && count}
    </button>
  );
};

// Combined Interaction Bar Component
export const InteractionBar = ({ 
  likesCount = 0,
  dislikesCount = 0,
  commentsCount = 0,
  isLiked = false,
  isDisliked = false,
  isSaved = false,
  onLike,
  onDislike,
  onSave,
  onComment,
  size = 'md',
  showSave = true,
  showComments = true
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-6">
        <LikeDislikeButtons
          likesCount={likesCount}
          dislikesCount={dislikesCount}
          isLiked={isLiked}
          isDisliked={isDisliked}
          onLike={onLike}
          onDislike={onDislike}
          size={size}
        />
        
        {showComments && (
          <CommentButton
            count={commentsCount}
            onClick={onComment}
            size={size}
          />
        )}
      </div>
      
      {showSave && (
        <SaveButton
          isSaved={isSaved}
          onSave={onSave}
          size={size}
        />
      )}
    </div>
  );
}; 