'use client';

import React, { useState } from 'react';
import { Clock, Edit2, Trash2, Check, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { cn } from '@/lib/utils';

export interface Comment {
  id?: string;
  timestamp: number;
  comment: string;
  createdAt?: Date;
}

interface TimestampedCommentFormProps {
  currentTime: number;
  onSubmit: (comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
  initialData?: Comment;
  className?: string;
}

export function TimestampedCommentForm({
  currentTime,
  onSubmit,
  onCancel,
  initialData,
  className,
}: TimestampedCommentFormProps) {
  const [timestamp, setTimestamp] = useState(initialData?.timestamp ?? currentTime);
  const [comment, setComment] = useState(initialData?.comment ?? '');
  const maxLength = 500;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const parseTime = (timeString: string) => {
    const parts = timeString.split(':');
    if (parts.length !== 2) return timestamp;
    const mins = parseInt(parts[0], 10);
    const secs = parseInt(parts[1], 10);
    if (isNaN(mins) || isNaN(secs)) return timestamp;
    return mins * 60 + secs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onSubmit({ timestamp, comment: comment.trim() });
      setComment('');
      setTimestamp(currentTime);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={cn('space-y-4', className)}>
      <div>
        <label htmlFor="timestamp" className="block text-sm font-medium text-gray-700 mb-1">
          Timestamp
        </label>
        <input
          type="text"
          id="timestamp"
          value={formatTime(timestamp)}
          onChange={(e) => setTimestamp(parseTime(e.target.value))}
          className="input"
          placeholder="0:00"
        />
        <p className="text-xs text-gray-500 mt-1">
          Format: minutes:seconds (e.g., 1:30)
        </p>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
          Comment
        </label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="input min-h-[100px] resize-y"
          placeholder="Add your feedback at this timestamp..."
          maxLength={maxLength}
          required
        />
        <p className="text-xs text-gray-500 mt-1">
          {comment.length}/{maxLength} characters
        </p>
      </div>

      <div className="flex space-x-2">
        <Button type="submit" disabled={!comment.trim()}>
          {initialData ? 'Update' : 'Add'} Comment
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}

interface TimestampedCommentListProps {
  comments: Comment[];
  onCommentClick: (timestamp: number) => void;
  onEdit?: (comment: Comment) => void;
  onDelete?: (commentId: string) => void;
  canEdit?: boolean;
  className?: string;
}

export function TimestampedCommentList({
  comments,
  onCommentClick,
  onEdit,
  onDelete,
  canEdit = false,
  className,
}: TimestampedCommentListProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const sortedComments = [...comments].sort((a, b) => a.timestamp - b.timestamp);

  if (comments.length === 0) {
    return (
      <div className={cn('text-center py-8 text-gray-500', className)}>
        <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
        <p>No comments yet.</p>
        <p className="text-sm mt-1">
          Click &quot;Add Comment&quot; while watching the video to provide timestamped feedback.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {sortedComments.map((comment) => (
        <div
          key={comment.id || comment.timestamp}
          className="group bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer"
          onClick={() => onCommentClick(comment.timestamp)}
        >
          <div className="flex items-start justify-between mb-2">
            <Badge
              variant="primary"
              className="cursor-pointer hover:bg-primary-200 transition-colors"
            >
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(comment.timestamp)}
            </Badge>

            {canEdit && onEdit && onDelete && comment.id && (
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(comment);
                  }}
                  className="p-1 text-gray-500 hover:text-primary-600 transition-colors"
                  aria-label="Edit comment"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(comment.id!);
                  }}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  aria-label="Delete comment"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <p className="text-gray-700 whitespace-pre-wrap">{comment.comment}</p>
        </div>
      ))}
    </div>
  );
}

interface TimestampedCommentCardProps {
  comment: Comment;
  onJumpToTime: (timestamp: number) => void;
  className?: string;
}

export function TimestampedCommentCard({
  comment,
  onJumpToTime,
  className,
}: TimestampedCommentCardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg p-4 cursor-pointer hover:border-primary-500 transition-colors',
        className
      )}
      onClick={() => onJumpToTime(comment.timestamp)}
    >
      <div className="flex items-center space-x-2 mb-2">
        <Badge variant="primary">
          <Clock className="h-3 w-3 mr-1" />
          {formatTime(comment.timestamp)}
        </Badge>
      </div>
      <p className="text-gray-700">{comment.comment}</p>
    </div>
  );
}
