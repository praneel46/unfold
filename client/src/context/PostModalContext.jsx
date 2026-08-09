import React, { createContext, useContext, useState } from 'react';

const PostModalContext = createContext(null);

export function PostModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [defaultCategory, setDefaultCategory] = useState('Thought');
  const [onPostCreatedCallback, setOnPostCreatedCallback] = useState(null);

  const openComposer = (category = 'Thought', onCreated = null) => {
    setDefaultCategory(category);
    setOnPostCreatedCallback(() => onCreated);
    setIsOpen(true);
  };

  const closeComposer = () => {
    setIsOpen(false);
    setOnPostCreatedCallback(null);
  };

  const handlePostSuccess = (newPost) => {
    if (onPostCreatedCallback && typeof onPostCreatedCallback === 'function') {
      onPostCreatedCallback(newPost);
    }
    closeComposer();
  };

  return (
    <PostModalContext.Provider
      value={{
        isOpen,
        defaultCategory,
        openComposer,
        closeComposer,
        handlePostSuccess,
      }}
    >
      {children}
    </PostModalContext.Provider>
  );
}

export function usePostModal() {
  const context = useContext(PostModalContext);
  if (!context) {
    throw new Error('usePostModal must be used within a PostModalProvider');
  }
  return context;
}
