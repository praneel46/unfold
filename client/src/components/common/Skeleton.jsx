import React from 'react';

export function PostSkeleton() {
  return (
    <div className="py-6 px-4 sm:px-6 border-b border-paper-200 dark:border-ink-800 animate-pulse">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-paper-300/70 dark:bg-ink-700" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3.5 bg-paper-300/70 dark:bg-ink-700 rounded w-1/4" />
          <div className="h-2.5 bg-paper-300/50 dark:bg-ink-800 rounded w-1/6" />
        </div>
        <div className="h-5 w-16 bg-paper-300/50 dark:bg-ink-800 rounded" />
      </div>
      <div className="space-y-2 mb-4 pl-13">
        <div className="h-4 bg-paper-300/70 dark:bg-ink-700 rounded w-11/12" />
        <div className="h-4 bg-paper-300/70 dark:bg-ink-700 rounded w-3/4" />
        <div className="h-4 bg-paper-300/50 dark:bg-ink-800 rounded w-5/6" />
      </div>
      <div className="flex items-center gap-6 pt-2 pl-13">
        <div className="h-4 w-12 bg-paper-300/50 dark:bg-ink-800 rounded" />
        <div className="h-4 w-12 bg-paper-300/50 dark:bg-ink-800 rounded" />
        <div className="h-4 w-8 bg-paper-300/50 dark:bg-ink-800 rounded ml-auto" />
      </div>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-44 sm:h-56 bg-paper-300/60 dark:bg-ink-800 w-full" />
      <div className="px-6 pb-6 relative -mt-16">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-paper-300 dark:bg-ink-700 border-4 border-paper-50 dark:border-ink-900 mb-4" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-paper-300/80 dark:bg-ink-700 rounded" />
          <div className="h-3.5 w-32 bg-paper-300/50 dark:bg-ink-800 rounded" />
          <div className="h-4 w-full max-w-md bg-paper-300/60 dark:bg-ink-800 rounded pt-2" />
        </div>
      </div>
    </div>
  );
}

export function UserListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3.5 rounded-xl border border-paper-200 dark:border-ink-800 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-paper-300/70 dark:bg-ink-700" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 bg-paper-300/80 dark:bg-ink-700 rounded" />
          <div className="h-2.5 w-20 bg-paper-300/50 dark:bg-ink-800 rounded" />
        </div>
      </div>
      <div className="h-8 w-20 bg-paper-300/60 dark:bg-ink-700 rounded-full" />
    </div>
  );
}
