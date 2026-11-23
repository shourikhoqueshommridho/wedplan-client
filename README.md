# WedPlan Client

## 1. Project Name and Description

**WedPlan** is a wedding planning platform that connects couples with wedding service vendors. This repository contains the **Next.js frontend**, providing a public marketplace, authentication pages, and role-specific dashboards for customers, vendors, and administrators.

The client communicates with the separate Express.js backend API through same-origin Next.js proxy routes. Database operations and sensitive business logic are handled by the server.

## 2. Important Features

The following frontend features are implemented:

| Area | Features |
|---|---|
| Public Home Page | Hero section, featured services, category links, How It Works, Why Choose WedPlan, and footer. |
| Browse Services | API-powered service listing, text search, category and location filters, price range, sorting, pagination, loading skeletons, and error handling. |
| Service Details | Service gallery, vendor information, and customer booking request form. |
| Authentication | Email/password sign-in and registration, vendor registration, Google OAuth, role-based redirects, and JWT token refresh support. |
| Customer Dashboard | Booking statistics, recent booking requests, upcoming accepted events, and profile summary. |
| Vendor Dashboard | Service management, image uploads, booking management, profile settings, subscription status, and Premium checkout. |
| Admin Dashboard | Overview statistics, user management, service approval, transaction management, booking management, and account blocking/unblocking. |
| Image Handling | Next.js Image optimization, configured remote image hosts, and client-side image validation. |
| Notifications | Success and error notifications using Sonner toasts. |

**Note:** A `/forgot-password` help page is available, but transactional email and password-reset delivery are not configured in this build.

## 3. Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.4.6 (App Router) |
| UI Library | React 19.3.0, React DOM 19.3.0 |
| Styling | Tailwind CSS 4.3.3 |
| Components | shadcn/ui (Base Nova style), Base UI |
| Icons | Lucide React |
| Animations | Framer Motion |
| Notifications | Sonner |
| Authentication | Better Auth 1.7.25 |
| Language | TypeScript 5 |
| Code Quality | ESLint 9 |
| Bundler | Turbopack |

**Prerequisite:** Node.js >= 20.9.0 and npm.

## 4. Installation Instructions

Clone the client repository:

```bash
git clone https://github.com/shourikhoqueshommridho/wedplan-client.git
```

Navigate to the project directory:

```bash
cd wedplan-client
```

Install dependencies:

```bash
npm install
```

Create a local environment file by copying the example file:

**Windows PowerShell:**

```powershell
Copy-Item .env.example .env.local
```

**macOS / Linux:**

```bash
cp .env.example .env.local
```

### Environment Variables

Configure the following variables in `.env.local`:

| Variable | Required | Example | Description |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes, when using a separate backend | `http://localhost:5000` | Express backend API origin used by server-side requests and Next.js proxy routes. |
| `STRIPE_CHECKOUT_DIAGNOSTICS` | Optional | `1` | Enables optional checkout diagnostics. Leave unset in production unless required. |

**Important Security Notes:**

- Never commit `.env.local` or other environment files to GitHub.
- Never expose backend secrets through `NEXT_PUBLIC_` variables.
- MongoDB, Stripe secret keys, Stripe webhook secrets, ImgBB API keys, Better Auth secrets, Google OAuth credentials, and JWT/JWKS configuration must be set only in the backend environment.
- Stripe Checkout is handled by the backend. The client does not require a Stripe secret key.

## 5. How to Run the Project Locally

First, make sure the WedPlan backend is installed, configured, and running. Refer to the server repository's README for backend setup instructions.

Start the frontend development server:

```bash
npm run dev
```

Open the application in your browser:

```text
http://localhost:3000
```

The frontend communicates with the backend through the configured API origin. The default local backend URL is:

```text
http://localhost:5000
```

### Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts the Next.js development server. |
| `npm run build` | Creates an optimized production build. |
| `npm run start` | Starts the production server after building. |
| `npm run lint` | Runs ESLint to check code quality. |

### Production Build

To create and run a production build locally:

```bash
npm run lint
npm run build
npm run start
```

## 6. Live Website Link

**Live Application:**  
https://wedplan-client-zeta.vercel.app

## 7. Client and Server Repository Links

| Repository | URL |
|---|---|
| Client Repository | https://github.com/shourikhoqueshommridho/wedplan-client |
| Server Repository | https://github.com/shourikhoqueshommridho/wedplan-server |

---

**Deployment:** The frontend is compatible with Vercel deployment. Production environment variables, including the backend API origin, should be configured through the hosting provider's environment settings rather than committed to source control.