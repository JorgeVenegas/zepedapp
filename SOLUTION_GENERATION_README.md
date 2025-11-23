# AI Solution Generation Setup

This module provides AI-powered solution generation for incident patterns using Groq's API.

## Features

- Generate solutions based on incident patterns
- Cost estimation and feasibility scoring
- Implementation timeline calculation
- Solution filtering and ranking
- Interactive UI with expandable pattern cards

## Setup Instructions

### 1. Install Dependencies

```bash
npm install groq-sdk uuid @types/uuid
```

### 2. Environment Configuration

Add to your `.env.local`:

```env
# Groq API Configuration
GROQ_API_KEY=your_groq_api_key_here
```

### 3. Get Groq API Key

1. Sign up at [Groq Console](https://console.groq.com/)
2. Create a new API key
3. Add it to your environment variables

### 4. Usage

The solution generation is integrated into the Pattern Clustering Demo:

1. Navigate to the patterns page
2. Run clustering or load existing patterns
3. Click "Generate Solutions" on any pattern
4. View AI-generated solutions with:
   - Cost estimates
   - Feasibility scores (1-10)
   - Implementation timelines
   - Impact assessment
   - AI reasoning

## API Endpoints

### POST `/api/solutions/generate`

Generate solutions for a given pattern.

**Request Body:**
```json
{
  "pattern": {
    "id": "pattern-id",
    "title": "Pattern Title",
    "description": "Pattern description",
    "priority": 8,
    "frequency": 5,
    "time_range": {
      "start": "2024-01-01T00:00:00Z",
      "end": "2024-01-31T23:59:59Z"
    },
    "filters": {}
  },
  "options": {
    "maxSolutions": 5,
    "feasibilityThreshold": 3,
    "budgetLimit": 50000,
    "timeConstraint": 90,
    "prioritizeBy": "feasibility"
  }
}
```

**Response:**
```json
{
  "success": true,
  "solutions": [
    {
      "id": "uuid",
      "name": "Solution Name",
      "description": "Detailed description",
      "cost": {
        "min": 5000,
        "max": 15000,
        "currency": "USD"
      },
      "feasibility": 8,
      "implementationTime": {
        "start": "2024-12-01T00:00:00Z",
        "end": "2024-12-22T00:00:00Z",
        "estimatedDays": 21
      },
      "impact": "High",
      "tags": ["automation", "monitoring"],
      "reasoning": "AI reasoning for this solution"
    }
  ],
  "count": 1
}
```

## Solution Schema

### Pattern
- **Title**: String - Pattern identification
- **Description**: String - Detailed pattern description
- **Filters**: JSON - Pattern filtering criteria
- **Priority**: Integer (1-10) - Pattern priority score
- **Frequency**: Integer - Number of incidents in pattern

### Solution
- **Name**: String - Solution title
- **Description**: String - Detailed solution description
- **Cost**: Range<Integer> - Min/max cost estimates in USD
- **Feasibility**: Integer (1-10) - Implementation feasibility score
- **Time of Implementation**: Date Range - Start/end dates and estimated days
- **Impact**: String - Expected impact level (High/Medium/Low)
- **Tags**: Array<String> - Solution categorization tags
- **Reasoning**: String - AI explanation for the solution

## Customization

### Solution Generation Options

- `maxSolutions`: Maximum number of solutions to generate (default: 5)
- `feasibilityThreshold`: Minimum feasibility score (1-10)
- `budgetLimit`: Maximum budget constraint in USD
- `timeConstraint`: Maximum implementation time in days
- `prioritizeBy`: Ranking criteria ('cost', 'time', 'feasibility', 'impact')

### Model Configuration

The system uses Groq's `llama3-70b-8192` model. You can adjust:
- Temperature (creativity vs consistency)
- Max tokens (response length)
- Model selection (other Groq models)

## Error Handling

The system includes comprehensive error handling for:
- API connectivity issues
- Invalid responses
- Missing environment variables
- Malformed pattern data
- Rate limiting

## Security

- API keys are server-side only
- Input validation on all endpoints
- Sanitized error messages in production
- No sensitive data in client-side code
