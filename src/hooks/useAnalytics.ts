import { useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

// This is a simple analytics hook that can be connected to Google Analytics, PostHog, or a custom backend.
// To use with Google Analytics, ensure you have the gtag script in your index.html.

export function useAnalytics() {
    const location = useLocation();

    // Track page views automatically on route change
    useEffect(() => {
        const path = location.pathname + location.search;
        console.log(`[Analytics] Page View: ${path}`);
        
        // Example: Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'page_view', {
                page_path: path
            });
        }
        
        // Example: PostHog
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture('$pageview');
        }
    }, [location]);

    const trackEvent = useCallback((eventName: string, properties?: Record<string, any>) => {
        console.log(`[Analytics] Event: ${eventName}`, properties);
        
        // Example: Google Analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', eventName, properties);
        }
        
        // Example: PostHog
        if (typeof window !== 'undefined' && (window as any).posthog) {
            (window as any).posthog.capture(eventName, properties);
        }
    }, []);

    return { trackEvent };
}
