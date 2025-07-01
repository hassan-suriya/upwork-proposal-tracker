# Upwork Proposal Manager

A Next.js application for tracking and managing Upwork proposals.

## Getting Started

First, clone the repository and install dependencies:

```bash
git clone https://github.com/your-username/upwork-proposal-tracker.git
cd upwork-proposal-tracker
npm install
```

Then, create a `.env.local` file with the following variables:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

The following environment variables are required for the application to work properly:

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT authentication

### Production Deployment

When deploying to production (e.g., Vercel), make sure to set these environment variables in your hosting platform's dashboard.

**Important for Vercel Deployment:**
1. Go to your project settings in the Vercel dashboard
2. Navigate to the "Environment Variables" section
3. Add both `MONGODB_URI` and `JWT_SECRET` with their respective values
4. Ensure all API routes use the Node.js runtime (not Edge runtime) by including the following line in each route file:
   ```typescript
   export const runtime = 'nodejs';
   ```
5. Redeploy your application

**Note:** The application uses the `jsonwebtoken` library which requires the Node.js `crypto` module. Since the Edge Runtime in Vercel doesn't support this module, all API routes that use authentication must explicitly specify the Node.js runtime.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
