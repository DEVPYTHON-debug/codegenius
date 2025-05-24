# Si-Link Student Service Platform

A comprehensive platform connecting students and service providers within university ecosystems.

## Features

- **Multi-Role Authentication** (Student, Provider, Admin, Super Admin)
- **Real-time Chat** with WebSocket messaging
- **Service Marketplace** for shops and job listings
- **Payment Integration** with Flutterwave
- **Beautiful Neon-themed UI** with responsive design
- **Supabase Database** for persistent storage

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database (Supabase recommended)

### Installation

1. Clone the repository
```bash
git clone <your-repo-url>
cd silink-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file:
```env
DATABASE_URL=your_supabase_connection_string
SESSION_SECRET=your_session_secret
REPL_ID=your_app_id
REPLIT_DOMAINS=your_domain.com
ISSUER_URL=https://replit.com/oidc
```

4. Push database schema
```bash
npm run db:push
```

5. Start the application
```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Application pages
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
├── server/                # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database operations
│   ├── replitAuth.ts      # Authentication setup
│   └── db.ts             # Database connection
├── shared/                # Shared types and schemas
│   └── schema.ts         # Database schema
└── package.json
```

## Authentication

The platform uses Replit Auth (OpenID Connect) for authentication:
- Navigate to `/api/login` to start login flow
- Navigate to `/api/logout` to logout
- Super admin access: `Jacobsilas007@gmail.com`

## Database

Using Supabase PostgreSQL with the following tables:
- `users` - User accounts and profiles
- `shops` - Service provider shops
- `jobs` - Job listings
- `chat_messages` - Real-time messaging
- `payments` - Payment transactions
- `ratings` - User ratings and reviews
- `virtual_accounts` - User account management
- `sessions` - Session storage

## API Endpoints

### Authentication
- `GET /api/auth/user` - Get current user
- `GET /api/login` - Start login flow
- `GET /api/logout` - Logout user

### Users
- `GET /api/users` - Get all users (admin only)
- `PATCH /api/users/:id` - Update user profile

### Shops
- `GET /api/shops` - Get all shops
- `POST /api/shops` - Create new shop
- `GET /api/shops/:id` - Get shop details
- `PATCH /api/shops/:id` - Update shop
- `DELETE /api/shops/:id` - Delete shop

### Jobs
- `GET /api/jobs` - Get all jobs
- `POST /api/jobs` - Create new job
- `GET /api/jobs/:id` - Get job details
- `PATCH /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job

### Chat
- `GET /api/chats` - Get recent chats
- `GET /api/chats/:userId/messages` - Get messages with user
- `POST /api/chats/:receiverId/messages` - Send message

### Payments
- `GET /api/payments` - Get user payments
- `POST /api/payments` - Create payment

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Supabase)
- **Authentication**: OpenID Connect (Replit Auth)
- **Real-time**: WebSockets
- **Payments**: Flutterwave
- **Build Tool**: Vite

## Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Ensure all environment variables are set in your production environment:
- `DATABASE_URL`
- `SESSION_SECRET`
- `REPL_ID`
- `REPLIT_DOMAINS`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support and questions, contact the development team.