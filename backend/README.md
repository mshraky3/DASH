# DASH - Engineering & Contractor Platform

A platform connecting engineering firms, contractors, and freelancers with users.

## Tech Stack

- **Backend**: Node.js with Express.js
- **View Engine**: EJS
- **Database**: JSON Files (no external database needed!)
- **Image Processing**: Sharp

## Local Development

1. Clone the repository
2. Navigate to the backend folder:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000

## Demo Accounts

The app comes with sample data. You can login with:
- **Email**: `demo@example.com` | **Password**: `password123` (Company)
- **Email**: `contractor@example.com` | **Password**: `password123` (Contractor)  
- **Email**: `freelancer@example.com` | **Password**: `password123` (Freelancer)

## Data Storage

Data is stored in JSON files in the `/data` folder:
- `accounts.json` - User accounts
- `posts.json` - Posts/Projects
- `post_images.json` - Post images (base64 encoded)

**Note**: On Vercel, the filesystem is read-only after deployment. Data will reset on each deployment. For persistent storage, consider using a database service.

## Deploy to Vercel

### Method 1: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to backend folder:
   ```bash
   cd backend
   ```

3. Deploy:
   ```bash
   vercel
   ```

### Method 2: Using Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your repository
4. Set the **Root Directory** to `backend`
5. Deploy!

## Project Structure

```
backend/
├── index.js          # Main Express server
├── package.json      # Dependencies
├── vercel.json       # Vercel configuration
├── data/             # JSON database files
│   ├── accounts.json
│   ├── posts.json
│   └── post_images.json
├── views/            # EJS templates
│   ├── login.ejs
│   ├── register.ejs
│   ├── profile.ejs
│   ├── list.ejs
│   ├── post.ejs
│   └── ...
└── public/           # Static files
    ├── style/        # CSS files
    └── imges/        # Images
```

## License

ISC
