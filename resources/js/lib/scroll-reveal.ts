import { router } from '@inertiajs/react';

let observer: IntersectionObserver | null = null;

export function observeScrollReveals(): void {
    if (typeof window === 'undefined') return;

    // Fallback if IntersectionObserver is not supported
    if (!('IntersectionObserver' in window)) {
        document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale').forEach((el) => {
            el.classList.add('is-revealed');
        });
        return;
    }

    if (!observer) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        observer?.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -40px 0px',
                threshold: 0.08,
            }
        );
    }

    const elements = document.querySelectorAll(
        '.scroll-reveal:not(.is-revealed), .scroll-reveal-left:not(.is-revealed), .scroll-reveal-right:not(.is-revealed), .scroll-reveal-scale:not(.is-revealed)'
    );

    elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // If element is already within the visible viewport on load, reveal immediately
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            requestAnimationFrame(() => {
                el.classList.add('is-revealed');
            });
        } else {
            observer?.observe(el);
        }
    });
}

export function initScrollReveal(): void {
    if (typeof window === 'undefined') return;

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => observeScrollReveals());
    } else {
        observeScrollReveals();
    }

    // Re-observe when Inertia navigates
    try {
        router.on('navigate', () => {
            setTimeout(() => {
                observeScrollReveals();
            }, 50);
        });
    } catch {
        // router event fallback
    }

    // Re-observe on DOM changes (e.g. tab switches on Dashboard)
    let debounceTimer: ReturnType<typeof setTimeout> | null = null;
    const mutationObserver = new MutationObserver((mutations) => {
        let hasNewNodes = false;
        for (const mutation of mutations) {
            if (mutation.addedNodes.length > 0) {
                hasNewNodes = true;
                break;
            }
        }
        if (hasNewNodes) {
            if (debounceTimer) clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                observeScrollReveals();
            }, 60);
        }
    });

    if (document.body) {
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
}
