# Image Optimization Guide

This document outlines the image optimization strategies implemented in Per4ex.org.

## 🎯 **Implemented Optimizations**

### 1. **Next.js Image Configuration**
```typescript
// next.config.ts
images: {
  formats: ['image/webp', 'image/avif'], // Modern formats
  deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
  imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  minimumCacheTTL: 60, // Cache images for 1 minute minimum
}

// Quality is set per Image component (default: 75)
<Image src="/image.png" quality={80} /> // Higher quality
<Image src="/image.png" quality={60} /> // Smaller file size
```

### 2. **Lazy Loading Strategy**
- **Above-the-fold images**: `priority` (no lazy loading)
- **Below-the-fold images**: `loading="lazy"`
- **Hero images**: `priority` (blur placeholders require static imports)

### 3. **Responsive Image Containers**
```typescript
// Square aspect ratio containers (recommended for logos)
<div className="relative w-full aspect-square rounded-lg overflow-hidden">

// Square containers with subtle background (for logos that don't fill the space)
<div className="relative w-full aspect-square rounded-lg overflow-hidden bg-card/20">

// Fixed height containers (use with caution - may crop images)
<div className="relative w-full h-32 rounded-lg overflow-hidden">
```

### 4. **Responsive Image Sizes**
```typescript
// Card images in grid layout
sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"

// Hero images
sizes="200px" // Fixed size for logos
sizes="180px" // Fixed size for page headers
```

### 4. **Bundle Analysis**
```bash
# Analyze bundle size including images
npm run analyze
```

### 5. **Image Compression Tools**
```bash
# Compress images in public folder
npm run optimize-images

# Convert PNG to WebP (manual optimization)
npm run webp-convert
```

### 6. **WebP/AVIF Conversion**
Next.js automatically converts images to WebP/AVIF at runtime, but for maximum optimization:

```bash
# Convert existing PNG images to WebP
npm run webp-convert

# For manual conversion with specific quality
cwebp -q 80 input.png -o output.webp
avifenc -q 60 input.png output.avif
```

**Note**: Keep original PNG files as fallbacks. Next.js handles format selection automatically.

## 📊 **Performance Impact**

### Expected Improvements:
- **File Size Reduction**: 30-70% smaller images
- **Loading Performance**: Faster LCP (Largest Contentful Paint)
- **Bandwidth Savings**: Reduced data usage for users
- **SEO Boost**: Better Core Web Vitals scores

### Current Image Usage:
- **Hero Images**: `per4ex3d.png`, `catalyst3d.png`, `pilaw3d.png`, `parisian_author.png`
- **Icon Images**: `avatar.png`, `github.png`, `current_focus.png`
- **Videos**: `boot-sequence.mp4`, `catalyst-demo.mp4` (not optimized)

## 🛠️ **Best Practices**

### Image Component Usage:
```tsx
// Hero/above-the-fold images
<Image
  src="/image.png"
  alt="Description"
  fill
  className="object-cover"
  priority
  placeholder="blur"
/>

// For logos that need to show fully without cropping
<Image
  src="/logo.png"
  alt="Description"
  fill
  className="object-contain"
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
  loading="lazy"
/>

// For images that can be cropped to fit square containers
<Image
  src="/image.png"
  alt="Description"
  fill
  className="object-cover object-center"
  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
  loading="lazy"
/>

// For blur placeholders with custom blurDataURL (requires static imports):
import imageSrc from '/image.png'
<Image
  src={imageSrc}
  alt="Description"
  fill
  className="object-cover"
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQ..."
/>
```

### File Organization:
- **Source Images**: Place in `public/` folder
- **Naming**: Use descriptive names (e.g., `catalyst3d.png`, `avatar.png`)
- **Formats**: PNG for transparency, JPG for photos (Next.js handles conversion)

### Monitoring:
- Use `npm run analyze` to monitor bundle sizes
- Check Core Web Vitals in production
- Monitor image loading performance

## 🚀 **Future Optimizations**

### 1. **WebP/AVIF Source Images**
- Convert PNG images to WebP/AVIF manually for better compression
- Use `unoptimized` prop for pre-optimized images

### 2. **Advanced Placeholders**
- Custom blur data URLs for better UX
- Color placeholders for solid backgrounds

### 3. **CDN Integration**
- Cloudflare Images for automatic optimization
- Vercel Blob for global distribution

## 📈 **Testing & Validation**

### Commands:
```bash
# Build and analyze bundle (includes image analysis)
npm run analyze

# Optimize existing images
npm run optimize-images

# Convert PNG to WebP
npm run webp-convert

# Test in development
npm run dev

# Build for production
npm run build
```

### Metrics to Monitor:
- **Lighthouse Performance Score**
- **Largest Contentful Paint (LCP)**
- **Cumulative Layout Shift (CLS)**
- **First Contentful Paint (FCP)**

## 🔧 **Troubleshooting**

### Common Issues:
- **Images not loading**: Check file paths and `public/` folder
- **Blur placeholder error**: Use static imports for `placeholder="blur"` or remove the property
- **Poor quality**: Quality is set per component (default: 75, range: 1-100)
- **Large bundle**: Run `npm run analyze` to identify large images
- **Slow loading**: Add `loading="lazy"` and optimize `sizes`

### Debug Commands:
```bash
# Check image optimization
curl -I http://localhost:3000/_next/image?url=%2Fimage.png&w=640&q=75

# View generated image URLs
# Check browser network tab for image requests
```
