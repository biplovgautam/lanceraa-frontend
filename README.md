# Lanceraa - Nepal's Premier Freelancing Platform

## About Lanceraa
Lanceraa is a specialized freelancing platform built specifically for Nepal's growing digital workforce. It connects individual clients, companies, and freelancers in a seamless ecosystem where:

- Students can outsource their academic assignments
- Companies can hire freelancers for projects
- Freelancers can showcase their work and find opportunities

### Key Features
- Multi-user types (Individual, Company, Freelancer)
- Real-time messaging 
- Project/Task posting and bidding
- Portfolio showcase
- Mobile-first responsive design


## Tech Stack
- Frontend: Next.js 14+ with TypeScript
- Styling: TailwindCSS
- Backend: FastAPI
- Database: PostgreSQL
- Real-time: WebSocket
- State Management: Zustand

## Project Structure
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

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
