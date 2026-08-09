import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-paper-50 dark:bg-ink-950 text-ink-900 dark:text-ink-50">
      <div className="max-w-md text-center space-y-5">
        <span className="font-serif text-7xl font-bold text-coral-500 block">
          404
        </span>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
          Page Not Unfolded
        </h1>
        <p className="text-sm text-ink-500 dark:text-ink-400 leading-relaxed">
          The page you are looking for has been tucked away or never existed. Let’s guide you back to the main stream.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            onClick={() => navigate('/')}
            variant="primary"
            size="md"
            icon={Home}
          >
            Return to Feed
          </Button>
          <Button
            onClick={() => navigate('/explore')}
            variant="secondary"
            size="md"
            icon={Compass}
          >
            Explore
          </Button>
        </div>
      </div>
    </div>
  );
}
