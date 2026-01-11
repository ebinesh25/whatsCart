# WhatsCart Frontend

WhatsApp Business SaaS app for small sellers in Tamil Nadu.

## Features

- **Authentication**: Google Sign-In via Firebase Auth
- **Business Setup**: Multi-step wizard to set up business profile
- **Product Catalog**: Add, edit, and manage products
- **Buyer Store**: Public-facing store with WhatsApp cart integration
- **Bilingual**: Tamil and English language support
- **Mobile-First**: Responsive design optimized for mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Backend**: Firebase (Auth, Firestore, Storage, Functions)
- **i18n**: next-intl

## Getting Started

### Prerequisites

1. Firebase project configured with:
   - Authentication (Google Sign-In)
   - Firestore Database
   - Storage
   - Cloud Functions

2. Node.js 18+ installed

### Installation

1. Clone the repository and navigate to the frontend folder:
```bash
cd whatsCartFrontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your Firebase configuration values from Firebase Console.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── (auth)/              # Authentication pages
│   └── login/           # Login page with Google Sign-In
├── (app)/(main)/        # Main app pages (protected)
│   ├── layout.tsx       # Main app layout
│   ├── setup/           # Business setup wizard
│   └── products/        # Product catalog
├── (app)/(store)/       # Buyer-facing pages
│   └── [slug]/          # Dynamic store page
├── i18n/                # Translations (en, ta)
├── globals.css          # Global styles
├── layout.tsx           # Root layout
├── middleware.ts        # Auth + i18n middleware
└── page.tsx             # Home page (redirects)

lib/
├── firebase/            # Firebase configuration
│   ├── config.ts        # Firebase app initialization
│   ├── auth.ts          # Firebase Auth functions
│   ├── firestore.ts     # Firestore helper functions
│   └── storage.ts       # Firebase Storage functions
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication hook
│   ├── useCart.ts       # Shopping cart hook
│   └── useLanguage.ts   # Language hook
├── stores/              # Zustand stores
│   ├── authStore.ts     # Auth state management
│   ├── cartStore.ts     # Cart state management
│   └── businessStore.ts # Business state management
├── types/               # TypeScript types
│   └── user.ts          # User, Business, Product types
├── utils/               # Utility functions
│   ├── cn.ts            # Classnames utility
│   └── whatsapp.ts      # WhatsApp message formatter
└── constants.ts         # App constants
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Firebase Emulators

For local development, use Firebase emulators:

```bash
cd ../firebase-backend
npm run serve
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_APP_URL` | App URL (http://localhost:3000 for dev) |

## Pages

### Public Pages
- `/` - Home (redirects based on auth state)
- `/login` - Google Sign-In page
- `/store/[slug]` - Buyer-facing store page

### Protected Pages
- `/setup` - Business setup wizard
- `/products` - Product catalog management

## Features

### Authentication
- Google Sign-In via Firebase Auth
- Auto-creation of user profile in Firestore
- Language detection from browser locale

### Business Setup
- Business name and auto-generated slug
- Logo upload to Firebase Storage
- Theme color picker
- WhatsApp number configuration
- Business category selection

### Product Catalog
- Bilingual product names and descriptions
- Image upload (up to 5 images)
- Price and stock management
- Category-based filtering
- Low stock indicators

### Buyer Store
- Dynamic store by slug
- Product grid with images
- Add to cart functionality
- WhatsApp cart integration
- Mobile-responsive design

## Roadmap

### Phase 1 (Current)
- ✅ Authentication (Google Sign-In)
- ✅ Business Setup
- ✅ Product Catalog
- ✅ Buyer Store with WhatsApp integration
- ✅ Tamil/English i18n

### Phase 2 (Planned)
- Order Management Dashboard
- Analytics and Metrics
- Bulk Share to WhatsApp
- Settings Page
- PWA Configuration
- Google Sheets Sync
- Freemium Limits and Stripe Billing

## License

MIT
