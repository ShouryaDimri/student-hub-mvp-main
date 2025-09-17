# Social Icons Feature Documentation

## Overview
This feature adds quick link social icons (GitHub & LinkedIn) to key locations in the Student Hub application. The icons are implemented as a reusable component and placed in strategic locations for maximum visibility and accessibility.

## Implementation Details

### 1. SVG Icons
Custom SVG icons for GitHub and LinkedIn have been created and placed in the `public` directory:
- `public/github-icon.svg`
- `public/linkedin-icon.svg`

These icons are simple, single-color designs that can be easily styled to match the application's theme.

### 2. SocialIcons Component
A reusable React component `SocialIcons.tsx` has been created in `src/components/`:

**Features:**
- Accepts `className` prop for custom styling
- Accepts `iconSize` prop for custom icon sizing (defaults to 24px)
- Uses environment variables for configurable URLs
- Opens links in new tabs for better user experience
- Includes hover effects for better UX
- Implements proper accessibility with `aria-label` attributes

### 3. Integration Points
The SocialIcons component has been integrated into the following locations:

1. **Main Dashboard** - Header section, visible on all screen sizes
2. **Placement Dashboard** - Header section, visible on all screen sizes
3. **Landing Page (Index)** - Top right corner and bottom center
4. **Authentication Page** - Below the main title
5. **Student Profile Modal** - At the bottom of public profiles
6. **Global Footer** - At the bottom of the entire application

### 4. Configuration
The social media URLs can be configured through environment variables in the `.env` file:

```env
VITE_GITHUB_URL="https://github.com/your-github-url"
VITE_LINKEDIN_URL="https://linkedin.com/your-linkedin-url"
```

## Styling
The icons have been styled to:
- Match the application's design theme
- Have appropriate sizing (24px by default)
- Include uniform spacing between icons
- Have hover effects (scale transformation and color change)
- Be responsive across different screen sizes

## Accessibility
The implementation includes:
- Proper `aria-label` attributes for screen readers
- Semantic HTML structure
- Appropriate contrast for visibility
- Responsive design for different devices

## Testing
The feature has been tested for:
- Correct rendering in all integration points
- Proper linking to social media profiles
- Responsive behavior on different screen sizes
- Hover effects and user interactions
- Accessibility features

## Future Enhancements
Potential improvements could include:
- Adding more social media platforms
- Implementing dark/light mode specific styling
- Adding animation effects
- Creating a configuration panel for administrators