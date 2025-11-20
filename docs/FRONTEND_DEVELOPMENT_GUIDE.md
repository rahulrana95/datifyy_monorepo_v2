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
├── theme/
└── App.tsx              # Root component
```

---

## 🎨 Design System

### **Color Palette**

Based on the [reference repository](https://github.com/rahulrana95/datifyy-monorepo), our color system includes:

Act as Staff frontend engineer 10+ years of experience and also 10+ years of crafting beautiful designs for customer
facing web apps which are responsive in nature. As ui designer you have art of thinking amazing ui designs and ux flows.

As frontend engineer , you keep code readable, create utils, write proper tests and make sure code quality, is top notch.

Rules
- Keep components smaller, keep create new components in new files if needed
  - if new components not reused create in same feature directory
  - each component should have a test file to have 100% test coverage
- we follow feature level creation for one feature same things at same place
- types/interface have own file, not in component.
- no hard coded values,use constants.
- try to use enums from src/gen else create at common place.
- for types realted to api req and resposne use src/gen
- variables name meaning ful
- api calling in store
- make sure code is readable , clean,organize
- responsive in nature
- no hard coding of colors, always use from theme
- no constsns, make a common constants file as per usage
- always follow theme
- for service create service based on base serice client.
- Everytime you make a change, please make sure test it using unit tests
