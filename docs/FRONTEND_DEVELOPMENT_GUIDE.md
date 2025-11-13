# 📱 Frontend Development Guide - Datifyy

## Overview

This guide covers the frontend development workflow for the Datifyy dating platform. The frontend is built with **React 18**, **TypeScript**, **Chakra UI v3**, and follows the design system from the [reference repository](https://github.com/rahulrana95/datifyy-monorepo).

---

## 🏗️ Architecture

### **Tech Stack**

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.2.0 | UI framework |
| TypeScript | 4.9.5 | Type safety |
| Chakra UI | 3.29.0 | Component library |
| Emotion | 11.14.0 | CSS-in-JS styling |
| Framer Motion | 12.23.24 | Animations |
| React Router | 7.9.5 | Routing |
| Zustand | 5.0.8 | State management |
| TanStack Query | 5.90.8 | Server state |
| Zod | 4.1.12 | Schema validation |
| Protocol Buffers | 2.10.0 | Type-safe API |

### **Project Structure**

```
apps/frontend/src/
├── assets/               # Static assets (images, icons)
├── components/           # Shared components
├── features/             # Feature modules
│   └── auth/            # Authentication feature
│       ├── components/  # Auth-specific components
│       ├── services/    # Auth API services
│       └── store/       # Auth state management
├── gen/                 # Generated protobuf types
├── pages/               # Page components
├── providers/           # React providers (Chakra, etc.)
├── services/            # API services
├── shared/              # Shared utilities
│   └── components/      # Shared UI components
│       ├── Button/
│       ├── Input/
│       ├── Modal/
│       ├── Header/
│       └── RomanticUI/  # Romantic-themed components
├── theme/               # Design system
│   ├── colors.reference.ts      # Color palette
│   ├── datifyy.theme.ts         # Original theme
│   ├── romantic.animations.ts    # Animation library
│   └── ...
└── App.tsx              # Root component
```

---

## 🎨 Design System

### **Color Palette**

Based on the [reference repository](https://github.com/rahulrana95/datifyy-monorepo), our color system includes:

#### **Brand Colors**
```typescript
import { colors } from './theme/colors.reference';

// Primary brand pink
colors.brand[500]  // #e85d75 - Main brand pink
colors.brand[600]  // #d14361 - Darker pink
colors.brand[50]   // #fef7f7 - Lightest pink
```

#### **Action Colors**
```typescript
colors.like[500]       // #22c55e - Like/Match green
colors.nope[500]       // #ef4444 - Nope/Pass red
colors.superLike[500]  // #3b82f6 - Super Like blue
colors.boost[500]      // #f59e0b - Boost gold
colors.premium[500]    // #a855f7 - Premium purple
```

#### **Gradients**
```typescript
colors.gradient.brand       // Pink gradient
colors.gradient.like        // Green gradient
colors.gradient.premium     // Purple gradient
colors.gradient.hero        // Hero section gradient
```

### **Typography**

```typescript
// Font Family
fonts.body: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
fonts.heading: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'

// Font Sizes
xs: 12px, sm: 14px, md: 16px, lg: 18px, xl: 20px
2xl: 24px, 3xl: 30px, 4xl: 36px, 5xl: 48px
6xl: 60px, 7xl: 72px, 8xl: 96px, 9xl: 128px

// Font Weights
normal: 400, medium: 500, semibold: 600
bold: 700, extrabold: 800, black: 900
```

---

## 🧩 Component Development

### **Using Chakra Components**

All Chakra components are themed automatically:

```tsx
import { Button, Card, Input } from '@chakra-ui/react';

// Buttons - All variants themed
<Button variant="solid">Default</Button>
<Button variant="love">Love</Button>
<Button variant="swipeLike">Like</Button>
<Button variant="premium">Premium</Button>

// Cards - Multiple variants
<Card.Root variant="elevated">Standard</Card.Root>
<Card.Root variant="profile">Swipe Card</Card.Root>
<Card.Root variant="match">Match Card</Card.Root>
<Card.Root variant="glass">Glass Effect</Card.Root>

// Inputs - Themed variants
<Input variant="outline" />
<Input variant="filled" />
<Input variant="chat" />
<Input variant="premium" />
```

### **Creating New Components**

Follow this pattern:

```tsx
/**
 * MyComponent.tsx
 * Description of what this component does
 */

import React from 'react';
import { Box, Heading, Text } from '@chakra-ui/react';
import { colors } from '../../theme/colors.reference';

interface MyComponentProps {
  title: string;
  description?: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({
  title,
  description
}) => {
  return (
    <Box
      bg="white"
      borderRadius="xl"
      p={6}
      boxShadow="0 2px 8px rgba(0, 0, 0, 0.1)"
    >
      <Heading size="md" color={colors.brand[600]}>
        {title}
      </Heading>
      {description && (
        <Text mt={2} color={colors.text.secondary}>
          {description}
        </Text>
      )}
    </Box>
  );
};
```

---

## 🎬 Animations

### **Using Romantic Animations**

```tsx
import { fadeInUp, heartbeat, pulse } from '../theme/romantic.animations';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';

// Animated component
const AnimatedBox = styled.div`
  animation: ${fadeInUp} 0.7s ease-out;
`;

// Heartbeat effect
const HeartIcon = styled.span`
  animation: ${heartbeat} 1.5s ease-in-out infinite;
`;

// Custom animation
const myAnimation = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;
```

---

## 🔌 API Integration

### **Using Proto-generated Types**

```tsx
import { AuthServiceClient } from '../gen/auth/v1/auth_pb';
import { RegisterWithEmailRequest } from '../gen/auth/v1/messages_pb';

// Type-safe API calls
const register = async (email: string, password: string, name: string) => {
  const request = new RegisterWithEmailRequest({
    credentials: {
      email,
      password,
      name,
    },
  });

  const response = await authClient.registerWithEmail(request);
  return response;
};
```

### **State Management with Zustand**

```tsx
import { create } from 'zustand';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,

  login: async (email, password) => {
    // Login logic
    set({ user: userData, isAuthenticated: true });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
  },
}));
```

---

## 📝 Development Workflow

### **1. Start Development Server**

```bash
# Frontend only
cd apps/frontend
npm start

# Or start all services (recommended)
cd ../../
make up
```

Frontend: http://localhost:3000

### **2. Making Changes**

1. **Create a feature branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make your changes**
   - Follow TypeScript best practices
   - Use existing components when possible
   - Follow the color palette from `colors.reference.ts`
   - Add animations from `romantic.animations.ts`

3. **Test your changes**
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

### **3. Adding a New Page**

```tsx
// 1. Create page component
// src/pages/MyNewPage.tsx
export const MyNewPage: React.FC = () => {
  return <Box>...</Box>;
};

// 2. Add to App.tsx (when routing is added)
import { MyNewPage } from './pages/MyNewPage';
```

### **4. Adding a New Feature Module**

```bash
# Create feature structure
src/features/my-feature/
├── components/
│   └── MyFeatureComponent.tsx
├── services/
│   └── my-feature.api.ts
├── store/
│   └── my-feature.store.ts
└── index.ts
```

---

## 🧪 Testing

### **Component Testing**

```tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('renders title correctly', () => {
    render(<MyComponent title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });
});
```

### **Running Tests**

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in CI mode
npm run test:ci
```

---

## 🎯 Best Practices

### **1. Component Organization**

- ✅ One component per file
- ✅ Co-locate related files (component, test, styles)
- ✅ Use index.ts for clean imports
- ✅ Keep components small and focused

### **2. TypeScript**

- ✅ Always define prop interfaces
- ✅ Use strict mode
- ✅ Leverage generated proto types
- ✅ Avoid `any` type

### **3. Styling**

- ✅ Use Chakra components first
- ✅ Use colors from `colors.reference.ts`
- ✅ Use styled-components for complex styling
- ✅ Keep responsive design in mind

### **4. Performance**

- ✅ Use React.memo for expensive components
- ✅ Lazy load routes and heavy components
- ✅ Optimize images
- ✅ Use TanStack Query for caching

### **5. Accessibility**

- ✅ Use semantic HTML
- ✅ Add ARIA labels
- ✅ Ensure keyboard navigation
- ✅ Maintain color contrast ratios

---

## 🚀 Deployment

### **Production Build**

```bash
# Build optimized production bundle
npm run build

# Output in: build/
# - Static files
# - Minified JS/CSS
# - Optimized assets
```

### **Environment Variables**

```bash
# .env.example (copy to .env)
REACT_APP_API_URL=http://localhost:8080
REACT_APP_GRPC_URL=http://localhost:9090
```

---

## 📚 Key Resources

### **Documentation**
- [React Docs](https://react.dev)
- [Chakra UI v3](https://www.chakra-ui.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [TanStack Query](https://tanstack.com/query/latest)

### **Reference Repository**
- [Datifyy Monorepo](https://github.com/rahulrana95/datifyy-monorepo)
- Theme: `apps/frontend/src/theme/`
- Components: `apps/frontend/src/theme/components/`
- Colors: `apps/frontend/src/theme/foundations/colors.ts`

### **Internal Docs**
- [Backend Architecture](./BACKEND_ARCHITECTURE.md)
- [Development Setup](./01_setting_up.md)
- [Testing Guide](./TESTING.md)

---

## 🐛 Troubleshooting

### **Build Errors**

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear React Scripts cache
rm -rf node_modules/.cache
```

### **Type Errors**

```bash
# Regenerate proto types
cd ../../
make generate
```

### **Port Already in Use**

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 💡 Tips & Tricks

1. **Hot Reload**: Changes auto-reload in development
2. **DevTools**: Install React DevTools browser extension
3. **Chakra DevTools**: Use Chakra's built-in inspector
4. **Component Preview**: Use Storybook (if configured)
5. **Type Checking**: Run `tsc --noEmit` for type checks

---

## 📞 Support

- **Issues**: Create a GitHub issue
- **Questions**: Ask in team chat
- **Documentation**: Check `/docs` folder

---

**Version**: 2.0.0
**Last Updated**: 2024-11
**Maintained by**: Datifyy Frontend Team
