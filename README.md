# Zepedapp - Mobility Analytics Dashboard

Maia is an AI-powered mobility analytics platform that transforms how cities understand and resolve transportation challenges by turning scattered user feedback into actionable insights. By intelligently scraping incidents from social media and correlating them with internal incident reports, Maia dramatically increases incident collection beyond traditional reporting channels, capturing issues that would otherwise go unnoticed. The platform automatically identifies, categorizes, and enriches each data point with severity assessments, keyword extraction, and intelligent summaries, then uses advanced pattern recognition to uncover common problems and root causes affecting riders across the transportation system. Most importantly, Maia doesn't just identify issues—it proposes three tailored solutions at different budget levels for each pattern, complete with impact projections and feasibility assessments, empowering transportation authorities to make data-driven decisions that directly improve user satisfaction and system reliability by addressing the problems that matter most to riders.

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#getting-started"><strong>Getting Started</strong></a> ·
  <a href="#api-endpoints"><strong>API</strong></a> ·
  <a href="#deployment"><strong>Deployment</strong></a>
</p>
<br/>

## Features

- **Dashboard Analytics** - Real-time visualization of mobility data and patterns
- **Pattern Recognition** - AI-powered clustering and analysis of mobility incidents
- **Records Management** - Track and analyze mobility incidents and reports
- **Solutions Management** - Generate and manage solutions for identified patterns
- **Social Media Integration** - Twitter/X data scraping and analysis
- **API Integration** - RESTful APIs for data processing and management

## Tech Stack

- **Frontend**: Next.js 16, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase
- **Database**: PostgreSQL (via Supabase)
- **AI/ML**: Groq API for pattern analysis, local embeddings for clustering
- **Authentication**: Supabase Auth
- **Deployment**: Vercel-ready

## Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints (patterns, records, solutions, etc.)
│   ├── patterns/          # Pattern analysis pages
│   ├── records/           # Records management pages
│   ├── settings/          # Application settings
│   └── solutions/         # Solutions management pages
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/           # Layout components (sidebar, header)
│   ├── pages/            # Page-level components
│   ├── records/          # Records-related components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and shared logic
│   ├── clustering/       # AI clustering algorithms
│   ├── supabase/         # Database client and utilities
│   └── utils.ts          # General utilities
└── scripts/              # Build and utility scripts
```

## Clone and run locally

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Groq API key (optional, for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JorgeVenegas/zepedapp.git
   cd zepedapp
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure these variables in `.env.local`:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Optional: AI Features
   GROQ_API_KEY=your_groq_api_key
   TWITTER_API_KEY=your_twitter_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

The app uses Supabase for data storage. You'll need to set up tables for:
- `records` - Mobility incident records
- `patterns` - Identified patterns and clusters
- `solutions` - Generated solutions and recommendations

Refer to the migration files in `/supabase/migrations/` for the complete schema.

## API Endpoints

- `GET /api/records` - Fetch mobility records
- `GET /api/patterns` - Get identified patterns
- `POST /api/patterns/cluster` - Run clustering analysis
- `GET /api/solutions` - Retrieve solutions
- `POST /api/scrape/twitter` - Scrape Twitter data
- `GET /api/graphics` - Get visualization data

## Development

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

### Testing Clustering

```bash
npm run test:clustering
```

## Deployment

This app is optimized for deployment on Vercel:

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add your environment variables in Vercel's dashboard
4. Deploy!

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
