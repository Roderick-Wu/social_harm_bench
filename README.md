# Social Harm Benchmark

A comprehensive AI model safety evaluation platform that displays attack success rates across various categories of potentially harmful content.

## Features

- **Interactive Leaderboard**: Sortable table showing AI model safety performance
- **Advanced Filtering**: Filter by organization, model type, date range, and success rate
- **Data Visualization**: Charts showing trends over time and comparative analysis
- **Prompt Showcase**: Browse sample prompts and model responses
- **Mobile Responsive**: Works on all device sizes

## Deployment on Vercel

### Quick Deploy
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Roderick-Wu/social_harm_bench)

### Manual Deployment

1. **Clone the repository**
   ```bash
   git clone https://github.com/Roderick-Wu/social_harm_bench.git
   cd social_harm_bench
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Test locally**
   ```bash
   npm run dev
   ```

4. **Deploy to Vercel**
   - Push your code to GitHub
   - Connect your repository to Vercel
   - Vercel will automatically detect it's a Next.js app and deploy

### Environment Variables
No environment variables are required for basic functionality. All data is served from static JSON files.

## Customizing Your Data

### Adding Your Benchmark Results

1. **Update the main data file**: `/public/data/benchmark_data.json`

2. **Structure for model results**:
   ```json
   {
     "modelName": "GPT-4",
     "organization": "OpenAI",
     "releaseDate": "2023-03-14",
     "attackSuccessRate": 12.5,
     "totalPrompts": 540,
     "successfulAttacks": 68,
     "modelType": "closed-source",
     "downloadable": false,
     "region": "US",
     "modelSize": "Unknown"
   }
   ```

3. **Adding sample prompts**:
   ```json
   {
     "id": "unique-id",
     "category": "hate-speech",
     "prompt": "Your test prompt here",
     "targetHarm": "Description of intended harm",
     "difficulty": "Medium"
   }
   ```

4. **Adding model responses**:
   ```json
   {
     "modelName": "GPT-4",
     "promptId": "unique-id",
     "response": "Model's actual response",
     "isSuccessfulAttack": false,
     "harmCategory": "hate-speech"
   }
   ```

## Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Tech Stack

- **Framework**: Next.js 15
- **Styling**: Tailwind CSS
- **Charts**: Chart.js with React Chart.js 2
- **TypeScript**: Full type safety
- **Deployment**: Vercel (optimized)

## License

MIT License - see LICENSE file for details.