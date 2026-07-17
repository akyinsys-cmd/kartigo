import React, { useEffect } from 'react';
import { SEOMetadata } from '../types';

interface SEOManagerProps {
  metadata?: SEOMetadata;
  defaultTitle?: string;
}

export default function SEOManager({ metadata, defaultTitle = 'Kartigo Draft | Expert-Grade Documents' }: SEOManagerProps) {
  useEffect(() => {
    if (!metadata) {
      document.title = defaultTitle;
      return;
    }

    // Update Title
    document.title = metadata.title || defaultTitle;

    // Update Meta Description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', metadata.description || '');

    // Update Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', (metadata.keywords || []).join(', '));

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    if (metadata.canonicalUrl) {
      canonical.setAttribute('href', metadata.canonicalUrl);
    } else {
      canonical.setAttribute('href', window.location.href);
    }

    // Update OG Tags
    const updateOGTag = (property: string, content: string) => {
      let tag = document.querySelector(`meta[property="${property}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute('property', property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    updateOGTag('og:title', metadata.title || defaultTitle);
    updateOGTag('og:description', metadata.description || '');
    updateOGTag('og:url', metadata.canonicalUrl || window.location.href);
    if (metadata.ogImage) {
      updateOGTag('og:image', metadata.ogImage);
    }

    // Update Schema Markup
    const existingSchema = document.getElementById('seo-schema-markup');
    if (existingSchema) {
      existingSchema.remove();
    }

    if (metadata.schemaMarkup) {
      const script = document.createElement('script');
      script.id = 'seo-schema-markup';
      script.type = 'application/ld+json';
      script.text = metadata.schemaMarkup;
      document.head.appendChild(script);
    }

  }, [metadata, defaultTitle]);

  return null;
}
