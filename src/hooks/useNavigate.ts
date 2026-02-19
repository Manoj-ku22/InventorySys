import { useState, useEffect } from 'react';

export function useNavigate() {
  const [, setLocation] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setLocation(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };
}

export function useLocation() {
  const [location, setLocation] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setLocation(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  return location;
}
