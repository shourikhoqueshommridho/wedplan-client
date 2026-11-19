/**
 * Temporary remote imagery for the Home Page mock data.
 * These are plain Unsplash URLs so they can be swapped for API-provided
 * ImgBB URLs later without touching component code.
 */
export const weddingImages = {
  hero: {
    src: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1600&q=80",
    alt: "Bride and groom smiling together in warm autumn light",
  },
  photography: {
    src: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=900&q=80",
    alt: "Wedding photographer holding a camera against a bright sky",
  },
  venue: {
    src: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=900&q=80",
    alt: "Elegant ballroom prepared for a wedding reception",
  },
  floral: {
    src: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?auto=format&fit=crop&w=900&q=80",
    alt: "Romantic pastel wedding bouquet with roses and eucalyptus",
  },
  catering: {
    src: "https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&w=900&q=80",
    alt: "Wedding catering buffet with fresh dishes and floral styling",
  },
  makeup: {
    src: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=900&q=80",
    alt: "Makeup artist applying bridal makeup",
  },
  fashion: {
    src: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80",
    alt: "Lace wedding dress displayed in a bright bridal suite",
  },
  rings: {
    src: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=900&q=80",
    alt: "Two gold wedding rings resting on soft pink flowers",
  },
} as const
