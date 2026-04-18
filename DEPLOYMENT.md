# FailArchive - Deployment Guide

## Quick Deployment to Vercel

Your FailArchive project is **production-ready** and complete! Here are the fastest ways to deploy:

### Option 1: Vercel Web Dashboard (Fastest - 2 minutes)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard

2. **Add New Project**
   - Click "Add New..." → "Project"
   - Select "Import Git Repository"

3. **Upload This Folder**
   - You can drag and drop this entire `failarchive` folder
   - Or connect your GitHub account and push the repository

4. **Configure Environment**
   - Framework: Python
   - Root Directory: ./
   - Build Command: `pip install -r requirements.txt`

5. **Deploy**
   - Click "Deploy"
   - Wait ~2 minutes for deployment to complete
   - Your site will be live!

### Option 2: Using Vercel CLI

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Navigate to project directory
cd failarchive

# 3. Deploy
vercel deploy

# 4. Follow the prompts to connect your Vercel account
```

### Option 3: GitHub Integration (Recommended for Continuous Deployment)

1. **Create GitHub Repository**
   ```bash
   git remote set-url origin https://github.com/YOUR-USERNAME/failarchive.git
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Visit https://vercel.com/new
   - Select "Import Git Repository"
   - Choose your failarchive repository
   - Click "Deploy"

3. **Auto-Deploy on Push**
   - Every time you push to GitHub, Vercel automatically deploys!

## What's Included

✅ **Backend**
- Flask Python server with SQLite database
- Complete REST API for all operations
- Admin authentication with token security

✅ **Frontend**
- Modern dark theme with orange accents
- Responsive mobile-first design
- Homepage with search and filtering
- Entry detail pages with community tips
- Submission form for new stories
- Bookmarks system (stored locally)
- Admin dashboard

✅ **Design**
- Playfair Display headlines (elegant serif)
- Inter font for body text (modern sans-serif)
- Smooth animations and transitions
- Professional color scheme

✅ **Features**
- Anonymous story submissions
- Upvote and "Been There" reactions
- Community tips on each story
- Search and category filters
- Admin panel for management
- RSS feed support
- Fingerprint-based reaction tracking

## Environment Variables

For production, set these in Vercel dashboard:

```
ADMIN_TOKEN=failarchive-admin-2024
FLASK_ENV=production
```

(These are optional - defaults are built-in)

## Database

- SQLite database auto-creates on first run
- Includes 5 seed failure stories
- Data stored in `db/failarchive.db`

## Admin Access

- **URL**: https://your-domain/admin.html
- **Token**: `failarchive-admin-2024`
- **Dashboard includes**: Statistics, entries list, newsletter subscribers

## Testing the Deployment

Once deployed, test these features:

1. **Homepage**: Browse failure stories
2. **Search**: Search by keyword
3. **Filter**: Filter by category
4. **Submit**: Add a new failure story
5. **Bookmarks**: Save stories locally
6. **Admin**: Login with token to view dashboard

## Support

- **Documentation**: See README.md
- **License**: MIT

---

**Next Step**: Choose one of the deployment options above and get your site live in minutes!

Questions? Check the README.md for more details.
