# Upwork Proposal Tracker

A comprehensive web application built with Next.js for tracking and managing Upwork proposals. This application helps freelancers monitor their proposal activity, analyze success rates, and maintain transparent reporting with clients or team members.

![Next.js](https://img.shields.io/badge/Next.js-13-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green?style=flat-square&logo=mongodb)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.0-38B2AC?style=flat-square&logo=tailwind-css)

## 🚀 Features

### 📊 Dashboard & Analytics
- **Weekly Progress Tracking**: Monitor proposal submissions against weekly targets
- **Success Rate Analytics**: Track view rates, interview rates, and hire rates
- **Status Distribution**: Visual breakdown of proposal statuses (Applied, Viewed, Interviewed, Hired, Rejected)
- **Historical Trends**: 4-week proposal history with visual charts
- **Daily Activity Charts**: See daily proposal submission patterns
- **Recent Activity Feed**: Quick overview of the latest proposal updates

### 📝 Proposal Management
- **Complete CRUD Operations**: Add, edit, view, and delete proposals
- **Comprehensive Tracking**: 
  - Date of submission
  - Job link reference
  - Proposal status
  - Bid amount
  - Custom notes
- **Advanced Search & Filtering**: Find proposals quickly with search functionality
- **Pagination Support**: Handle large datasets efficiently
- **Export Capabilities**: Download proposal data as CSV

### 👥 Multi-User Support
- **Freelancer Role**: Full access to create, edit, and manage proposals
- **Viewer Role**: Read-only access for clients or team members to monitor progress
- **Secure Authentication**: JWT-based authentication system
- **User Settings**: Customizable weekly targets, display preferences, and currency settings

### 📈 Reporting & Insights
- **Monthly Reports**: Detailed monthly breakdown by status
- **Status Distribution Analysis**: Comprehensive proposal status analytics
- **Response Rate Tracking**: Monitor client engagement with proposals
- **Performance Metrics**: Calculate average proposal values and success rates

### 🎨 User Experience
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark/Light Mode**: Theme toggle for comfortable viewing in any environment
- **Modern UI**: Built with shadcn/ui components for a clean, professional interface
- **Loading States**: Smooth user experience with proper loading indicators
- **Toast Notifications**: Real-time feedback for user actions

## 🛠️ Technology Stack

### Frontend
- **Next.js 13+**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Lucide React**: Beautiful icon library
- **Chart.js**: Data visualization for analytics

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **MongoDB Atlas**: Cloud-hosted NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT Authentication**: Secure token-based authentication
- **bcrypt**: Password hashing and security

### Development & Deployment
- **Vercel**: Deployment platform optimized for Next.js
- **ESLint**: Code linting and quality assurance
- **PostCSS**: CSS processing and optimization

## 📁 Project Structure

```
upwork-proposal-tracker/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── proposals/           # Proposal CRUD operations
│   │   ├── reports/             # Analytics and reporting
│   │   └── user/                # User management
│   ├── auth/                    # Authentication pages
│   ├── dashboard/               # Main application dashboard
│   │   ├── proposals/           # Proposal management interface
│   │   ├── reports/             # Analytics and reports
│   │   ├── settings/            # User settings
│   │   └── export/              # Data export functionality
│   ├── globals.css              # Global styles
│   ├── layout.tsx               # Root layout component
│   └── page.tsx                 # Landing page
├── components/                  # Reusable React components
│   ├── ui/                      # shadcn/ui components
│   ├── auth-provider.tsx        # Authentication context
│   ├── navbar.tsx               # Navigation component
│   ├── proposal-form.tsx        # Proposal creation/editing
│   ├── proposal-list.tsx        # Proposal display component
│   └── sidebar.tsx              # Dashboard sidebar
├── lib/                         # Utility libraries
│   ├── auth.ts                  # Authentication helpers
│   ├── client-auth.ts           # Client-side auth utilities
│   ├── dbConnect.ts             # Database connection
│   └── utils.ts                 # General utilities
├── models/                      # Database schemas
│   ├── Proposal.ts              # Proposal data model
│   └── User.ts                  # User data model
├── hooks/                       # Custom React hooks
│   └── useAuth.ts               # Authentication hook
└── public/                      # Static assets
```

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB Atlas account (or local MongoDB installation)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/hassan-suriya/upwork-proposal-tracker.git
cd upwork-proposal-tracker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env.local` file in the root directory:

```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
JWT_SECRET=your_strong_random_jwt_secret_key

# Optional: Next.js specific
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret
```

### 4. Database Setup
The application will automatically create the necessary collections when you start using it. Ensure your MongoDB instance is running and accessible.

### 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 6. Build for Production
```bash
npm run build
npm start
```

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push to main branch

### Other Platforms
The application can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📖 Usage Guide

### Getting Started
1. **Registration**: Create a new account with email and password
2. **User Role**: Choose between "Freelancer" (full access) or "Viewer" (read-only)
3. **Setup**: Configure your weekly proposal target in settings
4. **Add Proposals**: Start tracking your Upwork proposal submissions

### For Freelancers
- Add new proposals with job details, bid amount, and notes
- Update proposal status as clients respond
- Monitor your weekly progress against targets
- Analyze your success rates and performance trends
- Export data for external analysis

### For Viewers (Clients/Team Members)
- View all proposal activity and statistics
- Monitor freelancer performance and weekly targets
- Access reports and analytics dashboard
- Export proposal data for review

### Key Workflows

#### Adding a Proposal
1. Navigate to the Proposals page
2. Click "Add Proposal"
3. Fill in the job details:
   - Submission date
   - Upwork job link
   - Bid amount
   - Initial status (usually "Applied")
   - Optional notes
4. Save the proposal

#### Updating Proposal Status
1. Find the proposal in the proposals list
2. Click the edit button
3. Update the status based on client response:
   - **Applied**: Initial submission
   - **Viewed**: Client has viewed your proposal
   - **Interviewed**: You've been contacted for an interview
   - **Hired**: You won the project
   - **Rejected**: Proposal was unsuccessful
4. Add any relevant notes
5. Save changes

#### Viewing Analytics
1. Go to the Dashboard for overview metrics
2. Visit Reports page for detailed analytics
3. Use the export feature to download data
4. Adjust date ranges for specific time periods

## 🔧 Configuration

### User Settings
- **Weekly Target**: Set your goal for proposals per week
- **Default View**: Choose between list, grid, or calendar view
- **Currency**: Set your preferred currency for bid amounts
- **Display Preferences**: Customize the interface to your needs

### Authentication Settings
- **Password Changes**: Update your password securely
- **Profile Information**: Manage your account details
- **Session Management**: Automatic token refresh and secure logout

## 🤝 Contributing

We welcome contributions to improve the Upwork Proposal Tracker! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

### Contribution Guidelines
- Follow TypeScript best practices
- Maintain consistent code formatting
- Add tests for new features
- Update documentation as needed
- Ensure all existing tests pass

## 🐛 Troubleshooting

### Common Issues

#### Authentication Problems
- **"No auth token found"**: Clear browser cookies and localStorage, then log in again
- **Token expiration**: The app will automatically refresh tokens, but you may need to log in again
- **Production authentication issues**: Ensure JWT_SECRET is properly set in production environment

#### Database Connection Issues
- **MongoDB connection failed**: Verify your MONGODB_URI is correct
- **Atlas access**: Ensure your IP address is whitelisted in MongoDB Atlas
- **Network issues**: Check your internet connection and firewall settings

#### Performance Issues
- **Slow loading**: Check your internet connection and database response times
- **Memory issues**: Ensure you have sufficient RAM allocated for the Node.js process

### Getting Help
1. Check the [Issues](https://github.com/hassan-suriya/upwork-proposal-tracker/issues) page for known problems
2. Search for existing solutions in discussions
3. Create a new issue with detailed information about your problem

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👏 Acknowledgments

- **Next.js team** for the amazing React framework
- **Vercel** for the deployment platform
- **shadcn** for the beautiful UI components
- **MongoDB** for the robust database solution
- **Tailwind CSS** for the utility-first CSS framework

## 📞 Support

If you encounter any issues or have questions:

1. **Documentation**: Check this README and inline code comments
2. **Issues**: Report bugs or request features via GitHub Issues
3. **Discussions**: Join community discussions for general questions
4. **Email**: Contact the maintainer directly for urgent matters

---

**Built with ❤️ for freelancers who want to take control of their Upwork proposal tracking and success analysis.**
