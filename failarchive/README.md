# FailArchive

A community platform for sharing business failure stories and lessons learned. Real failures. Real lessons.

## Overview

FailArchive is a web application where entrepreneurs and business professionals share their biggest failures and what they learned from them. It's designed to help others learn from these experiences and build better organizations.

## Features

- **Share Your Story**: Submit detailed failure stories anonymously or with your name
- **Community Tips**: Read and share advice from experienced professionals
- **Reactions**: Upvote stories and mark ones you relate to with "Been There"
- **Bookmarks**: Save stories to read later (stored locally)
- **Search & Filter**: Find relevant stories by category or keywords
- **Admin Dashboard**: Manage content and view platform statistics
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Tech Stack

- **Backend**: Python Flask
- **Database**: SQLite
- **Frontend**: HTML, CSS, JavaScript (Vanilla)
- **Fonts**: Playfair Display (headlines), Inter (body text)
- **Deployment**: Vercel

## Project Structure

```
failarchive/
├── server.py                    # Flask application server
├── requirements.txt             # Python dependencies
├── vercel.json                  # Vercel deployment config
├── .env.example                 # Environment variables template
├── README.md                    # This file
├── public/
│   ├── index.html              # Homepage
│   ├── entry.html              # Entry detail page
│   ├── submit.html             # Submission form
│   ├── bookmarks.html          # Saved stories
│   ├── admin.html              # Admin dashboard
│   ├── css/
│   │   └── style.css           # Main stylesheet
│   └── js/
│       ├── utils.js            # Shared utilities
│       ├── main.js             # Homepage logic
│       ├── entry.js            # Entry detail logic
│       ├── submit.js           # Submission form logic
│       └── admin.js            # Admin panel logic
└── db/
    └── failarchive.db          # SQLite database (auto-created)
```

## Getting Started

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/failarchive.git
   cd failarchive
   ```

2. **Create a virtual environment** (optional but recommended)
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the server**
   ```bash
   python server.py
   ```

5. **Open in browser**
   Navigate to `http://localhost:5000`

### Environment Variables

Create a `.env` file based on `.env.example`:
```
ADMIN_TOKEN=your-secure-token
FLASK_ENV=development
```

## Usage

### User Features

- **Explore**: Browse failure stories, filter by category, search by keyword
- **Submit**: Share your own failure story (anonymous or with name)
- **Engage**: Upvote, mark "Been There", add tips, and bookmark stories
- **Bookmark**: Save stories locally to your browser for later

### Admin Features

- Access: Visit `/admin.html` and enter the admin token
- Dashboard: View statistics and manage content
- Monitor: Track submissions, tips, and engagement

**Default Admin Token**: `failarchive-admin-2024`

## Database Schema

### entries
- id, title, company, industry, category, tags
- story, what_went_wrong, what_learned, recovery
- impact_level (1-5), author
- upvotes, been_there, views
- featured, status, created_at
- company_stage, time_lost

### tips
- id, entry_id, content, author, experience_years, upvotes, created_at

### reactions
- id, type, target_type, target_id, fingerprint
- Tracks upvotes and "been there" reactions by user fingerprint

### reports
- id, entry_id, reason, created_at

### newsletter
- id, email, created_at

## API Endpoints

### Entries
- `GET /api/entries` - List entries with filters and search
- `GET /api/entries/<id>` - Get single entry with tips
- `POST /api/entries` - Create new entry
- `POST /api/entries/<id>/upvote` - Upvote entry
- `POST /api/entries/<id>/been-there` - Mark "been there"

### Tips
- `POST /api/entries/<id>/tips` - Add tip to entry
- `POST /api/tips/<id>/upvote` - Upvote tip

### Statistics
- `GET /api/stats` - Platform statistics
- `GET /rss.xml` - RSS feed

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Vercel automatically detects the Python Flask app
   - Set environment variables in Vercel dashboard
   - Deploy

3. **Access your app**
   Your app will be live at `https://failarchive-yourusername.vercel.app`

## Features Coming Soon

- Newsletter subscriptions
- Content moderation queue
- Advanced analytics
- User authentication
- Comment threads on tips
- Email notifications
- Social sharing integration

## Contributing

We welcome contributions! Please feel free to submit pull requests.

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or feedback, please open an issue on GitHub.

---

**FailArchive** - Learn from the failures of others to build better companies.
