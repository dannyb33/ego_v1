import React from 'react';
import { AnyPost, PostType, TextPost} from '@/types';

interface PostRendererProps {
  post: AnyPost;
}

// Individual component renderers
const TextPostRenderer: React.FC<{ post: TextPost }> = ({ post }) => {
  return (
    <div className="bg-[var(--color-eggplant)] rounded-lg shadow-md p-6 mb-4">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span className="font-medium">{post.displayName || post.username}</span>
        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
      </div>
        <p className="text-white whitespace-pre-wrap">{post.text}</p>
    </div>
  );
};

// Main post renderer that delegates to specific renderers
export const PostRenderer: React.FC<PostRendererProps> = ({ post }) => {
  switch (post.postType) {
    case PostType.TEXT:
      return <TextPostRenderer post={post as TextPost} />;

    default:
      return (
        <div className="bg-gray-100 rounded-lg p-4 mb-4">
          <p className="text-gray-500">
            Unknown post type: {(post as AnyPost).postType ?? 'undefined'}
          </p>
        </div>
      );
  }
};