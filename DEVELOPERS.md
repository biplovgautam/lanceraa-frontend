
# Lanceraa Frontend - Developer Guide

## Overview
Lanceraa is a freelancing platform designed specifically for Nepal, connecting clients (individuals and companies) with freelancers. The platform facilitates task posting, freelancer hiring, communication, and profile management. This document outlines how the frontend works, the tech stack we’re using, and the feature implementation status.

---

## Tech Stack
The Lanceraa frontend is built with the following technologies:

- **Next.js**: Framework for React with App Router for routing and server-side capabilities.
- **React**: Core library for building UI components.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **TypeScript**: Adds static typing to JavaScript for better code reliability.
- **FastAPI (Backend)**: Python-based backend for API endpoints (not covered here but integrated).
- **React Native (Mobile)**: Planned mobile app frontend, with a future transition to Flutter.

### Dependencies
- `next`: Core Next.js package.
- `tailwindcss`, `postcss`, `autoprefixer`: For styling setup.
- (Add more as dependencies are introduced, e.g., state management or API libraries.)

---

## Project Structure
The frontend is organized as follows:

```bash
lanceraa-frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout with theme providers
│   │   ├── page.tsx                 # Homepage
│   │   └── profile/
│   │       └── page.tsx             # Profile page
│   ├── components/
│   │   ├── layout/
│   │   │   ├── TopNavbar.tsx       # Navigation component
│   │   │   └── Footer.tsx          # Footer component
│   │   └── theme-provider.tsx       # Theme context and provider
│   └── styles/
│       └── globals.css             # Global styles and Tailwind imports
├── public/
│   └── favicon.ico                 # Favicon
├── .nvmrc                         # Node version config
├── .npmrc                         # NPM configuration
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── tsconfig.json                 # TypeScript configuration
├── package.json                  # Project dependencies and scripts
└── .gitignore                   # Git ignore rules

```

### How It Works
- **Routing**: Next.js App Router handles routes via the `app/` directory. Files like `page.tsx` define pages, and folders like `(auth)` group routes without affecting URLs.
- **Layout**: `app/layout.tsx` wraps all pages with `TopNavbar` and `BottomNavbar` for consistent UI.
- **Styling**: Tailwind CSS is integrated via `globals.css` and used directly in components with utility classes.
- **Components**: Reusable components in `components/shared/` (e.g., `Button.tsx`, `Card.tsx`) ensure consistency across the app.

---

## Features and Implementation Status

Below are the planned features for Lanceraa with their current status as of February 22, 2025 (assumed based on current progress).

### User Types
- **Normal Individual Users**: Can post tasks or assignments (e.g., college work).
- **Company Accounts**: Can post jobs to hire freelancers.
- **Freelancer Accounts**: Can apply to tasks, post about their work, and showcase completed projects.

### Core Features
| Feature                          | Description                                                                 | Status       |
|----------------------------------|-----------------------------------------------------------------------------|--------------|
| **User Authentication**          | Login and registration with role-specific signup (individual, company, freelancer). | ... in progess |
| **Task Management**              | Users can create, view, and manage tasks based on their role.               | ... In Progress |
| **Freelancer Directory**         | Searchable list of freelancers with profiles.                               | ... In Progress |
| **Posts Feed**                   | Feed for freelancers to share general posts, integrated into dashboard.     | ... In Progress |
| **Messaging**                    | Direct messaging between all users.                                         | ... In Progress |
| **User Profiles**                | Profiles for all users; freelancers can showcase completed projects.         | ... In Progress |

### UI Features
| Feature                          | Description                                                                 | Status       |
|----------------------------------|-----------------------------------------------------------------------------|--------------|
| **Top Navbar**                   | Logo, search bar, and dark/light mode toggle across all pages.              | ✅ Implemented |
| **Bottom Navbar (Mobile)**       | Navigation for dashboard pages (Home, Works, Freelancers, Messages, Profile). | ✅ Implemented |
| **Responsive Design**            | Adapts layout for mobile and desktop (e.g., BottomNavbar hidden on desktop). | ✅ Implemented |
| **Dark/Light Mode**              | Theme toggle functionality in TopNavbar.                                    | ... In Progress |

### Additional Features (Future Scope)
- **Notifications**: Alerts for task updates, messages, etc.
- **Payment Integration**: Local gateways like eSewa or Khalti.
- **Ratings and Reviews**: Feedback system for completed tasks.
- **Advanced Search**: Filters for tasks and freelancers.

---

## How the Frontend Works

### Routing
- **Public Routes**: `/` (landing page), `/login`, `/register`, `/register/[type]`.
- **Protected Routes**: `/dashboard` and its subpages (`/works`, `/freelancers`, etc.) are for authenticated users.
- **Dynamic Routes**: `/register/[type]` uses the `type` parameter to customize registration.

### Layout and Navigation
- **`layout.tsx`**: Wraps all pages with `TopNavbar` and `BottomNavbar`. Uses Tailwind (`flex flex-col min-h-screen`) to ensure proper spacing.
- **`TopNavbar.tsx`**: Displays logo, search input, and theme toggle. Styled with Tailwind (e.g., `bg-gray-800 text-white`).
- **`BottomNavbar.tsx`**: Mobile-only navigation with links to dashboard pages. Hidden on desktop via `md:hidden`.

### Styling with Tailwind CSS
- Utility classes are applied inline (e.g., `p-4 bg-white rounded shadow` for cards).
- Global styles are minimal, relying on Tailwind’s base setup in `globals.css`.
- Example: `Button.tsx` uses `bg-blue-600 hover:bg-blue-700` for consistent button styling.

### Current Implementation
- **Authentication Pages**: Basic UI for login and registration is complete, with dynamic registration by user type.
- **Dashboard**: Placeholder pages exist, awaiting content specific to user roles.
- **Components**: `Button.tsx` and `Card.tsx` are reusable and styled with Tailwind.

---

## Development Workflow

### Getting Started
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lanceraa-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

### Adding Features
- **New Pages**: Add a `page.tsx` file in the appropriate `app/` subdirectory (e.g., `app/dashboard/new-feature/page.tsx`).
- **Components**: Create new components in `components/shared/` or `components/layout/` as needed.
- **Styling**: Use Tailwind classes directly in JSX/TSX files. Extend `tailwind.config.js` for custom themes or utilities.

### Current Priorities
- Implement user role logic (e.g., via React Context) to tailor dashboard content.
- Build out `works`, `freelancers`, `messages`, and `profile` pages with mock data.
- Add theme toggle functionality with Tailwind’s `dark:` prefix.

---

## Notes for Developers
- **TypeScript**: Use interfaces/types for props and data (e.g., `interface Task { id: string; title: string; }`).
- **Backend Prep**: Pages will eventually fetch data from FastAPI endpoints (e.g., `/api/tasks`).
- **Testing**: Test responsiveness across devices; adjust Tailwind breakpoints as needed (e.g., `sm:`, `md:`).
- **Collaboration**: Update this file with feature status as you progress (✅ or ...).

This is a living document—keep it updated as we build Lanceraa together!
```

---

### Explanation of the `DEVELOPERS.md`

1. **Overview**: Introduces Lanceraa and its purpose.
2. **Tech Stack**: Lists all technologies in use, with room to expand as needed.
3. **Project Structure**: Mirrors your current setup and explains its purpose.
4. **Features and Status**: 
   - Breaks features into core, UI, and future categories.
   - Uses `✅` for implemented features (e.g., authentication UI, navbars) and `...` for in-progress ones (e.g., task management, messaging).
5. **How It Works**: Details routing, layout, and styling specifics.
6. **Development Workflow**: Provides setup instructions and guidance for adding features.

### Assumptions
- I marked authentication UI as implemented since the login/register pages have basic code.
- Dashboard feature pages (`works`, `freelancers`, etc.) are in progress since they’re placeholders.
- Theme toggle is in progress since it lacks logic yet.

### Next Steps
Let me know if you want to:
- Refine feature statuses based on your actual progress.
- Add backend integration details (e.g., FastAPI endpoints).
- Expand specific sections (e.g., coding guidelines).
- Move on to coding a specific feature like task management.

What would you like to tackle next for Lanceraa?