# Toyota Vehicle Finder

An AI-powered vehicle finder application that helps users discover their ideal Toyota vehicle through natural language search or detailed filtering.

## Features

- **Dual Search Methods**
  - AI Prompt: Describe your dream car in natural language
  - Detailed Form: Filter by specific criteria (price, year, fuel type, etc.)

- **Vehicle Comparison**: Select multiple vehicles to compare side-by-side
- **Affordability Calculator**: Calculate estimated monthly payments based on down payment, credit score, and loan terms
- **Real-time Filtering**: Instant results matching your preferences
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **State Management**: Zustand for client-side store
- **API Integration**: Next.js API Routes

## Project Structure

\`\`\`
app/
├── api/
│   ├── search/
│   │   ├── prompt/route.ts       # Gemini AI integration
│   │   └── cars/route.ts         # Car search endpoint
│   └── cars/[id]/route.ts        # Car detail endpoint
├── page.tsx                      # Start page (prompt or form)
├── prompt/page.tsx               # AI search page
├── form/page.tsx                 # Detailed filter form
├── results/page.tsx              # Search results grid
├── car/[id]/page.tsx             # Vehicle details page
├── comparison/page.tsx           # Vehicle comparison
├── affordability/page.tsx        # Loan calculator
├── layout.tsx                    # Root layout
└── globals.css                   # Theme & styles

components/
├── ui/                           # shadcn/ui components
├── header.tsx                    # Page header component
└── store.ts                      # Zustand store

types/
└── index.ts                      # TypeScript interfaces
\`\`\`

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file with the following (replace with your actual keys):

\`\`\`
# Optional: Gemini API for AI search
GEMINI_API_KEY=your_gemini_key_here

# Optional: Cars API for real-time data
CARS_API_KEY=your_cars_api_key_here

# Optional: Toyota API credentials
TOYOTA_API_KEY=your_toyota_key_here
\`\`\`

### 2. Install Dependencies

The project uses Next.js runtime, so dependencies are auto-detected from imports. No manual npm install needed in v0.

### 3. Integration Points (Placeholders)

The following require implementation:

#### `/api/search/prompt` - Gemini Integration
Replace the mock `generateMockFilters()` function with actual Gemini API calls:
\`\`\`typescript
// Example using Google's Generative AI
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
const response = await model.generateContent(prompt);
\`\`\`

#### `/api/search/cars` - Car Data Integration
Options for real car data:
1. **Cars.com API** - Requires API key and rate limiting
2. **Edmunds API** - Comprehensive vehicle database
3. **Dealership APIs** - Integration with local Toyota dealers
4. **Custom Database** - Build your own inventory system

#### `/api/cars/[id]` - Detailed Specs
Fetch full vehicle specifications and inventory details

## Key Features Explained

### Affordability Calculator
- Real-time monthly payment calculation
- Credit score impact on interest rates
- Lease vs. Finance comparison
- Adjustable down payment and loan terms

### Comparison System
- Select multiple vehicles
- Side-by-side comparison table
- Quick stats overview
- Easy navigation between comparisons

### Search Methods
- **Prompt Search**: "I need a reliable family SUV with good fuel efficiency"
- **Form Search**: Filter by make, model, price, year, condition, mileage, color, fuel type

## Deployment

Deploy to Vercel with a single click:
\`\`\`bash
vercel deploy
\`\`\`

Or connect your GitHub repository to Vercel for automatic deployments.

## Future Enhancements

- [ ] User authentication and saved searches
- [ ] Dealer location finder with inventory
- [ ] Vehicle reviews and ratings
- [ ] Trade-in valuation
- [ ] Insurance calculator integration
- [ ] Extended test drive booking
- [ ] Email alerts for new matching vehicles

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT
