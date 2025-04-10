# Guide for Cursor.ai to Implement Wine Tasting Conversation Analysis in Next.js

This guide is specifically designed to help Cursor.ai implement this feature step by step.

## Overview
This implementation will:

Allow users to upload markdown files containing wine tasting conversations
Send the conversation to Claude AI for analysis against your wine sales rubric
Process Claude's response into the expected JSON format
Display the evaluation in your existing dashboard
Enable PDF export of the evaluation

## Step 1: Environment Setup
Create a `.env.local` file in your project root directory with the following content:

```env
# Claude API Configuration
CLAUDE_API_KEY=your_claude_api_key_here

# Optional: Environment Configuration
NODE_ENV=development
```

Important security notes:
1. Never commit the `.env.local` file to version control
2. Add `.env.local` to your `.gitignore` file
3. Keep your API key secure and rotate it if it's ever exposed
4. For production, set these environment variables in your hosting platform's configuration

To verify the environment setup:
1. Create the file: `touch .env.local`
2. Add the above content, replacing `your_claude_api_key_here` with your actual Claude API key
3. Restart your Next.js development server to load the new environment variables

### Creating a .gitignore File
Create a `.gitignore` file in your project root directory to prevent sensitive files from being committed to version control:

```bash
# Create the .gitignore file
touch .gitignore
```

Add the following content to your `.gitignore` file:

```
# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Dependencies
/node_modules
/.pnp
.pnp.js

# Next.js build output
/.next/
/out/

# Debug logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE and editor files
.idea/
.vscode/
*.swp
*.swo
.DS_Store

# Testing
/coverage

# Production build
/build

# Misc
.DS_Store
*.pem
```

This `.gitignore` file will ensure that:
1. Your environment variables with sensitive API keys are not committed
2. Node modules and build artifacts are excluded from version control
3. IDE-specific files and system files are ignored
4. Debug logs and test coverage reports are not tracked

## Step 2: Create the Markdown Importer Component

## Component Directory Structure
All new components should be created in the `/app/components/` directory to maintain consistency with the existing project structure. Since this project uses TypeScript, all components must include proper type definitions:

- `/app/components/MarkdownImporter.tsx` - For handling markdown file uploads
- `/app/components/LoadingIndicator.tsx` - For displaying loading states
- `/app/components/ErrorDisplay.tsx` - For showing error messages
- `/app/components/WineEvaluationDashboard.tsx` - Main dashboard component

### TypeScript Requirements
Each component file must strictly adhere to these TypeScript requirements:

1. Component Props:
   - Define a dedicated interface for component props (e.g., `MarkdownImporterProps`)
   - Make all props required unless explicitly optional (using `?`)
   - Include JSDoc comments for complex prop types
   - Example:
     ```typescript
     interface MarkdownImporterProps {
       onAnalysisComplete: (evaluationData: EvaluationData) => void;
       isAnalyzing: boolean;
       setIsAnalyzing: (value: boolean) => void;
     }
     ```

2. Component Declaration:
   - Use React.FC with explicit prop type
   - Include proper return type annotations
   - Example:
     ```typescript
     const MarkdownImporter: React.FC<MarkdownImporterProps> = ({ 
       onAnalysisComplete,
       isAnalyzing,
       setIsAnalyzing
     }) => {
       // Component implementation
     };
     ```

3. State Management:
   - Define explicit types for all useState hooks
   - Use proper type annotations for event handlers
   - Example:
     ```typescript
     const [markdown, setMarkdown] = useState<string | null>(null);
     const [fileName, setFileName] = useState<string>('');
     ```

4. Event Handlers:
   - Type all event parameters explicitly
   - Include proper return types for async functions
   - Example:
     ```typescript
     const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
       // Handler implementation
     };
     ```

5. Custom Types:
   - Define shared types in `/app/types/` directory
   - Import and use type definitions consistently
   - Example:
     ```typescript
     import { EvaluationData, CriterionScore } from '@/types/evaluation';
     ```

6. Error Handling:
   - Define custom error types where needed
   - Use proper type guards for error handling
   - Example:
     ```typescript
     interface ApiError extends Error {
       status: number;
       details?: string;
     }
     ```

Each component must follow these type definition requirements to ensure type safety and maintainability throughout the application.

## API Route Structure
The conversation analysis API route should be placed at `/app/api/analyze-conversation/route.ts` to follow Next.js App Router conventions. The API implementation must:

1. File Location:
   - Place the route handler at `/app/api/analyze-conversation/route.ts`
   - Follow Next.js 13+ App Router file-based routing conventions
   - Use the `route.ts` naming convention for API endpoints

2. Environment Variables:
   - Use the same environment variable structure as other APIs
   - Access environment variables through `process.env`
   - Example:
     ```typescript
     const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
     const CLAUDE_API_URL = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
     ```

3. API Route Handler:
   - Export POST handler using Next.js App Router conventions
   - Include proper type definitions for request/response
   - Example:
     ```typescript
     import { NextRequest, NextResponse } from 'next/server';
     
     export async function POST(request: NextRequest) {
       // API implementation
     }
     ```

4. Error Handling:
   - Use consistent error response format
   - Include proper HTTP status codes
   - Example:
     ```typescript
     return NextResponse.json({ 
       error: 'Internal server error',
       message: error instanceof Error ? error.message : 'Unknown error occurred' 
     }, { status: 500 });
     ```

## WineEvaluationDashboard Integration
The existing WineEvaluationDashboard component must be modified to integrate the new MarkdownImporter while maintaining consistency with the current JSON importer:

1. Component Layout:
   - Place both importers in a shared container with consistent spacing
   - Use the same button styling and hover states
   - Example:
     ```typescript
     <div className="flex flex-wrap justify-end items-center gap-4 mb-4">
       <MarkdownImporter 
         onAnalysisComplete={handleAnalysisComplete}
         isAnalyzing={isAnalyzing}
         setIsAnalyzing={setIsAnalyzing}
       />
       <JsonImporter 
         onImportComplete={handleImportComplete}
         isImporting={isImporting}
       />
     </div>
     ```

2. Shared State Management:
   - Use common state variables for loading states
   - Implement consistent error handling
   - Example:
     ```typescript
     const [isProcessing, setIsProcessing] = useState(false);
     const [error, setError] = useState<string | null>(null);
     
     const handleAnalysisComplete = (data: EvaluationData) => {
       setError(null);
       setEvaluationData(data);
     };
     ```

3. Common Styling:
   - Use shared Tailwind classes for buttons and containers
   - Maintain consistent spacing and layout
   - Example:
     ```typescript
     const buttonClasses = "px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-600 flex items-center";
     const containerClasses = "flex flex-col sm:flex-row items-start sm:items-center gap-4";
     ```

4. Error Display:
   - Use the same ErrorDisplay component for both importers
   - Maintain consistent error message formatting
   - Example:
     ```typescript
     {error && (
       <ErrorDisplay 
         title="Import Error" 
         message={error}
         onRetry={() => setError(null)} 
       />
     )}
     ```

5. Loading States:
   - Share the LoadingIndicator component
   - Use consistent loading message format
   - Example:
     ```typescript
     {isProcessing && (
       <LoadingIndicator 
         message={isAnalyzing ? "Analyzing conversation..." : "Importing JSON..."} 
       />
     )}
     ```

## PDF Export Integration
The existing PDF export functionality should be reused for both JSON and markdown-based evaluations:

1. Hook Usage:
   - Use the existing usePDF hook from react-to-pdf
   - Apply the same export configuration to both data sources
   - Example:
     ```typescript
     import { usePDF } from 'react-to-pdf';
     
     const { toPDF, targetRef } = usePDF({
       filename: `wine-evaluation-${evaluationData?.staffName || 'export'}.pdf`,
       page: { 
         margin: 20,
         format: 'a4',
         orientation: 'portrait'
       }
     });
     ```

2. Export Handler:
   - Create a unified export function for both data sources
   - Use consistent naming and formatting
   - Example:
     ```typescript
     const handleExportPDF = async () => {
       if (!evaluationData) {
         toast.error('No evaluation data to export');
         return;
       }
       
       try {
         await toPDF();
         toast.success('PDF exported successfully');
       } catch (error) {
         console.error('PDF export error:', error);
         toast.error('Failed to export PDF');
       }
     };
     ```

3. Template Structure:
   - Use the same PDF template for both data sources
   - Ensure consistent styling and layout
   - Example:
     ```typescript
     <div ref={targetRef} className="p-8 bg-white">
       <h1 className="text-2xl font-bold mb-4">
         Wine Sales Evaluation: {evaluationData.staffName}
       </h1>
       <div className="mb-4">
         <p className="text-gray-600">Date: {evaluationData.date}</p>
         <p className="text-gray-600">Overall Score: {evaluationData.overallScore}%</p>
         <p className="text-gray-600">Performance Level: {evaluationData.performanceLevel}</p>
       </div>
       {/* Rest of the evaluation template */}
     </div>
     ```

4. Button Integration:
   - Use the same export button for both data sources
   - Maintain consistent button styling and behavior
   - Example:
     ```typescript
     <button
       onClick={handleExportPDF}
       disabled={!evaluationData || isProcessing}
       className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 flex items-center"
     >
       <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
       </svg>
       Export PDF
     </button>
     ```

## Error Handling Alignment
The error handling approach must be aligned with the existing implementation to ensure consistency across all features:

1. Error Types:
   - Use the same error type definitions throughout the application
   - Maintain consistent error categorization
   - Example:
     ```typescript
     // app/types/errors.ts
     export enum ErrorCategory {
       VALIDATION = 'VALIDATION',
       API = 'API',
       FILE = 'FILE',
       EXPORT = 'EXPORT',
       UNKNOWN = 'UNKNOWN'
     }
     
     export interface AppError {
       category: ErrorCategory;
       message: string;
       details?: string;
       code?: string;
     }
     ```

2. Error State Management:
   - Use the same error state structure across components
   - Implement consistent error clearing patterns
   - Example:
     ```typescript
     const [error, setError] = useState<AppError | null>(null);
     
     const clearError = () => setError(null);
     
     const handleError = (error: unknown) => {
       if (error instanceof Error) {
         setError({
           category: ErrorCategory.UNKNOWN,
           message: error.message,
           details: error.stack
         });
       } else if (typeof error === 'string') {
         setError({
           category: ErrorCategory.UNKNOWN,
           message: error
         });
       } else {
         setError({
           category: ErrorCategory.UNKNOWN,
           message: 'An unknown error occurred'
         });
       }
     };
     ```

3. Error Display Component:
   - Use the same ErrorDisplay component for all error states
   - Maintain consistent error message formatting
   - Example:
     ```typescript
     {error && (
       <ErrorDisplay 
         title={`${error.category} Error`}
         message={error.message}
         details={error.details}
         onRetry={clearError}
       />
     )}
     ```

4. API Error Handling:
   - Use consistent error response format from API routes
   - Implement proper error propagation
   - Example:
     ```typescript
     try {
       const response = await fetch('/api/analyze-conversation', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ markdown, fileName })
       });
       
       if (!response.ok) {
         const errorData = await response.json();
         throw new AppError(
           ErrorCategory.API,
           errorData.message || `Error: ${response.status}`,
           errorData.details
         );
       }
       
       // Process successful response
     } catch (error) {
       handleError(error);
     }
     ```

5. Toast Notifications:
   - Use the same toast notification pattern for errors
   - Maintain consistent error message styling
   - Example:
     ```typescript
     const showErrorToast = (error: AppError) => {
       toast.error(
         <div>
           <p className="font-medium">{error.category} Error</p>
           <p className="text-sm">{error.message}</p>
         </div>,
         { duration: 5000 }
       );
     };
     ```

6. Error Recovery:
   - Implement consistent error recovery patterns
   - Provide clear retry options where appropriate
   - Example:
     ```typescript
     const retryOperation = async () => {
       clearError();
       setIsProcessing(true);
       
       try {
         // Retry the failed operation
         await analyzeConversation();
       } catch (error) {
         handleError(error);
       } finally {
         setIsProcessing(false);
       }
     };
     ```

## Sample Data Creation
Before implementing the markdown importer, you need to create the necessary reference files:

1. Create the Rubric File:
   - Create a file at `public/data/wines_sales_rubric.md`
   - Include the complete evaluation rubric with all criteria and scoring guidelines
   - This file will be used by Claude to evaluate conversations
   - Example structure:
     ```markdown
     # Winery Sales Simulation Evaluation Rubric

     ## Overview
     This rubric is designed to evaluate the performance of winery tasting room staff members during guest interactions. Each criterion is scored on a scale of 1-5, with specific guidelines for each score level.

     ## Evaluation Criteria

     ### 1. Initial Greeting and Welcome (Weight: 8%)
     *How effectively does the staff member welcome guests and set a positive tone?*

     | Score | Description |
     |-------|-------------|
     | 1 | No greeting or unwelcoming approach |
     | 2 | Basic greeting but minimal warmth |
     | 3 | Friendly greeting but lacks personalization |
     | 4 | Warm, friendly greeting with good eye contact |
     | 5 | Exceptional welcome that makes guests feel valued and excited |

     ### 2. Building Rapport (Weight: 10%)
     *How well does the staff member connect personally with the guests?*

     | Score | Description |
     |-------|-------------|
     | 1 | No attempt to connect personally with guests |
     | 2 | Minimal small talk, mostly transactional |
     | 3 | Some rapport-building questions but limited follow-up |
     | 4 | Good personal connection through meaningful conversation |
     | 5 | Excellent rapport building, including origin questions, future plans, and genuine interest |

     ### 3. Winery History and Ethos (Weight: 10%)
     *How effectively does the staff member communicate Milea Estate's story and values?*

     | Score | Description |
     |-------|-------------|
     | 1 | No mention of winery history or values |
     | 2 | Brief, factual mention of winery background |
     | 3 | Adequate explanation of winery history and values |
     | 4 | Compelling storytelling about winery history, connecting to wines |
     | 5 | Passionate, engaging narrative that brings the winery ethos to life |

     ### 4. Storytelling and Analogies (Weight: 10%)
     *How well does the staff member use storytelling and analogies to describe wines?*

     | Score | Description |
     |-------|-------------|
     | 1 | Technical descriptions only, no storytelling or analogies |
     | 2 | Minimal storytelling, mostly factual information |
     | 3 | Some storytelling elements but lacking rich analogies |
     | 4 | Good use of stories and analogies that help guests understand wines |
     | 5 | Exceptional storytelling that creates memorable experiences and makes wine accessible |

     ### 5. Recognition of Buying Signals (Weight: 12%)
     *How well does the staff member notice and respond to buying signals?*

     | Score | Description |
     |-------|-------------|
     | 1 | Misses obvious buying signals completely |
     | 2 | Notices some signals but response is delayed or inappropriate |
     | 3 | Recognizes main buying signals with adequate response |
     | 4 | Quickly identifies buying signals and responds effectively |
     | 5 | Expertly recognizes subtle cues and capitalizes on buying moments |

     ### 6. Customer Data Capture (Weight: 8%)
     *How effectively does the staff member attempt to collect customer information?*

     | Score | Description |
     |-------|-------------|
     | 1 | No attempt to capture customer data |
     | 2 | Single basic attempt at data collection |
     | 3 | Multiple attempts but without explaining benefits |
     | 4 | Good data capture attempts with clear value proposition |
     | 5 | Natural, non-intrusive data collection that feels beneficial to guest |

     ### 7. Asking for the Sale (Weight: 12%)
     *How effectively does the staff member ask for wine purchases?*

     | Score | Description |
     |-------|-------------|
     | 1 | Never asks for sale or suggests purchase |
     | 2 | Vague suggestion about purchasing without direct ask |
     | 3 | Basic closing attempt but lacks confidence |
     | 4 | Clear, confident ask for purchase at appropriate time |
     | 5 | Multiple strategic closing attempts that feel natural and appropriate |

     ### 8. Personalized Wine Recommendations (Weight: 10%)
     *How well does the staff member customize wine recommendations based on guest preferences?*

     | Score | Description |
     |-------|-------------|
     | 1 | Generic recommendations unrelated to expressed interests |
     | 2 | Basic recommendations with minimal personalization |
     | 3 | Adequate recommendations based on general preferences |
     | 4 | Well-tailored recommendations based on specific guest feedback |
     | 5 | Expertly customized selections that perfectly match expressed interests |

     ### 9. Wine Club Presentation (Weight: 12%)
     *How effectively does the staff member present and invite guests to join the wine club?*

     | Score | Description |
     |-------|-------------|
     | 1 | No mention of wine club or inadequate response when asked |
     | 2 | Basic wine club information without personalization |
     | 3 | Adequate explanation of benefits but minimal customization |
     | 4 | Good presentation of wine club with benefits tailored to guest interests |
     | 5 | Compelling, personalized wine club presentation with clear invitation to join |

     ### 10. Closing Interaction (Weight: 8%)
     *How well does the staff member conclude the interaction and encourage future visits?*

     | Score | Description |
     |-------|-------------|
     | 1 | Abrupt ending with no thanks or future invitation |
     | 2 | Basic thank you but no encouragement to return |
     | 3 | Polite conclusion with general invitation to return |
     | 4 | Warm thank you with specific suggestion for future visit |
     | 5 | Memorable farewell that reinforces relationship and ensures future visits |

     ## Additional Evaluation Factors

     ### 11. Product Knowledge (No Weight - Observational Only)
     *How well does the staff member demonstrate knowledge about wines and products?*

     | Score | Description |
     |-------|-------------|
     | 1 | Significant gaps in product knowledge |
     | 2 | Basic knowledge but unable to answer deeper questions |
     | 3 | Solid understanding of core products |
     | 4 | Comprehensive knowledge with ability to answer most questions |
     | 5 | Expert knowledge with ability to discuss technical details |

     ### 12. Handling Objections (No Weight - Observational Only)
     *How effectively does the staff member respond to concerns or objections?*

     | Score | Description |
     |-------|-------------|
     | 1 | Avoids or dismisses objections |
     | 2 | Acknowledges objections but provides inadequate responses |
     | 3 | Addresses objections with standard responses |
     | 4 | Effectively addresses objections with personalized solutions |
     | 5 | Masterfully turns objections into opportunities |

     ## Scoring Guide

     ### Calculating the Final Score
     1. For each criterion, assign a score from 1-5
     2. Multiply each score by the criterion's weight
     3. Sum all weighted scores
     4. Divide by the total possible points (500) and multiply by 100 to get a percentage

     ### Performance Levels
     * **Exceptional**: 90-100%
     * **Strong**: 80-89%
     * **Proficient**: 70-79%
     * **Developing**: 60-69%
     * **Needs Improvement**: Below 60%

     ## Feedback Template

     ```
     # Performance Evaluation Summary

     ## Overall Score: [X]% - [Performance Level]

     ### Strengths:
     - [Specific positive observation 1]
     - [Specific positive observation 2]
     - [Specific positive observation 3]

     ### Areas for Improvement:
     - [Specific suggestion 1]
     - [Specific suggestion 2]
     - [Specific suggestion 3]

     ### Key Recommendations:
     1. [Action-oriented recommendation 1]
     2. [Action-oriented recommendation 2]
     3. [Action-oriented recommendation 3]
     ```
     ```

2. Create a Sample Conversation:
   - Create a file at `public/data/sample_conversation.md`
   - Include a realistic wine tasting room conversation
   - Format the conversation with clear speaker identification
   - Example structure:
     ```markdown
     # Wine Tasting Room Conversation

     ## Scenario: Wine Tasting Room Visit 

     **Description:** A couple visiting the tasting room for the first time, interested in learning about your wines and potentially joining the wine club.

     **Date:** 4/7/2025

     ## Conversation

     ### Staff Member (1)

     hi my name is Russell and I'm going to be taking care of you today is this your first time at Milea estate

     ### Guest (2)

     *smiling* Hi Russell, it's great to meet you! Yes, this is our first time visiting Milea Estate. My name is Sarah and this is my husband Michael. We live nearby in Pleasant Valley and have been meaning to come check out the winery for a while now. We're excited to learn more about your wines and the story behind the winery.

     ### Staff Member (3)

     Nice to meet you Sarah and Michael. Very cool, Pleasant Valley has a lot of history. Let me tell you about our tasting options today. Since it's your first time here, I recommend trying our signature flight which includes 5 of our most popular wines. It's a great introduction to what we do here. You can see all the details on the menu there. Would you like to start with that?

     ### Guest (4)

     That sounds perfect! We'd love to try the signature flight. We're both particularly interested in reds, but we enjoy trying everything. Do you have any personal favorites in the lineup?

     ### Staff Member (5)

     If you like reds, you'll really enjoy our Vincenza, which is our estate cabernet franc. It won a silver medal last year. It's named after Barry Milea's mother, so it has a special place in our hearts. It has nice notes of cherries, graphite. Let me pour your first taste, which is our white blend.

     ### Guest (6)

     Thank you! *takes a sip* Wow, this is lovely - very crisp and refreshing. So what made the Milea family decide to start a winery in this region?

     ### Staff Member (7)

     You can read a bit about our history on the back of the menu, but basically the property has been in the family for a while and they decided to plant vineyards about 10 years ago. Let me pour you the next taste, this is our estate Chardonnay.

     ### Guest (8)

     *tastes the Chardonnay* This has a wonderful balance - not too oaky. I really like this one! *turns to partner* What do you think, Michael? This might be nice to have with that seafood pasta you make.

     ### Staff Member (9)

     Yeah, it would go great with seafood pasta. Now here's our rosé, which is made from cabernet franc grapes.

     ### Guest (10)

     *tastes the rosé* Oh, this is delightful! So refreshing with nice fruit notes. I can imagine enjoying this on our patio this summer. Do you sell many bottles of this one?

     ### Staff Member (11)

     Yeah, it's popular especially in summer. Now let me pour you the Vincenza I mentioned, our estate cabernet franc.

     ### Guest (12)

     *tastes cabernet franc* Oh wow, this is exceptional! I love the complexity and the finish. Michael, we definitely need to take a couple bottles of this home. If this wine regularly sells out, maybe we should consider joining your wine club?

     ### Staff Member (13)

     This is definitely one of our most popular wines. Let me pour you our last taste, which is our red blend called Proprietor's Reserve.

     ### Guest (14)

     *tastes the red blend* This is fantastic too! You really have some outstanding reds. Do you offer any food here? We'd love to stay a bit longer and perhaps have a small plate with another glass of that wonderful Cabernet Franc.

     ### Staff Member (15)

     Yes, we have a small food menu. I recommend the brussels sprouts or the arancini, they're both really popular.

     ### Guest (16)

     Perfect! We'll take an order of both and two glasses of the Cabernet Franc, please. By the way, how many acres of vineyards do you have here?

     ### Staff Member (17)

     We have about 98 acres total on the property, but not all of it is planted yet. Let me get those food items and glasses for you.

     ### Guest (18)

     *after enjoying the food and additional wine* This has been such a lovely experience, Russell. The wines are exceptional and the view is stunning. We'll definitely want to take home some bottles today.

     ### Staff Member (19)

     Great, when I come back I will have your check be ready to check out.

     ### Guest (20)

     Thank you! We'd like three bottles of the Cabernet Franc and two of the Chardonnay, please. Maybe we should join the wine club so we can secure an allocation of that Cab Franc in the future!
     ```

3. Create a Sample Evaluation:
   - Create a file at `public/data/evaluation_new.json`
   - Include a sample evaluation in the expected JSON format
   - This will serve as a reference for the expected output structure
   - Example structure:
     ```json
     {
       "staffName": "Russell",
       "date": "2025-04-07",
       "overallScore": 82,
       "performanceLevel": "Strong",
       "criteriaScores": [
         {
           "criterion": "Initial Greeting and Welcome",
           "weight": 8,
           "score": 4,
           "weightedScore": 32,
           "notes": "Russell provided a warm greeting and introduced himself properly. He asked if this was their first visit, showing interest in their experience level."
         },
         {
           "criterion": "Building Rapport",
           "weight": 10,
           "score": 4,
           "weightedScore": 40,
           "notes": "Russell connected well with Sarah and Michael, remembering their names and showing interest in their background. He could have asked more about their wine preferences earlier in the conversation."
         },
         {
           "criterion": "Winery History and Ethos",
           "weight": 10,
           "score": 3,
           "weightedScore": 30,
           "notes": "Russell provided basic information about the winery's history when asked, but could have been more proactive in sharing the Milea Estate story and connecting it to the wines being tasted."
         },
         {
           "criterion": "Storytelling and Analogies",
           "weight": 10,
           "score": 3,
           "weightedScore": 30,
           "notes": "Russell mentioned that the Vincenza is named after Barry Milea's mother, which is a nice touch, but could have used more storytelling elements and analogies to describe the wines."
         },
         {
           "criterion": "Recognition of Buying Signals",
           "weight": 12,
           "score": 5,
           "weightedScore": 60,
           "notes": "Russell excelled at recognizing buying signals, particularly when Sarah expressed interest in the Cabernet Franc and mentioned taking bottles home. He also noticed their interest in food and accommodated their request."
         },
         {
           "criterion": "Customer Data Capture",
           "weight": 8,
           "score": 3,
           "weightedScore": 24,
           "notes": "Russell learned their names and that they live in Pleasant Valley, but didn't attempt to collect contact information or explain the benefits of joining the mailing list."
         },
         {
           "criterion": "Asking for the Sale",
           "weight": 12,
           "score": 4,
           "weightedScore": 48,
           "notes": "Russell didn't explicitly ask for the sale, but he did prepare their check and was ready to process their purchase when they indicated they wanted to take bottles home."
         },
         {
           "criterion": "Personalized Wine Recommendations",
           "weight": 10,
           "score": 4,
           "weightedScore": 40,
           "notes": "Russell recommended the signature flight as a good introduction and highlighted the Vincenza Cabernet Franc when they mentioned interest in reds. He could have made more personalized recommendations based on their reactions to each wine."
         },
         {
           "criterion": "Wine Club Presentation",
           "weight": 12,
           "score": 3,
           "weightedScore": 36,
           "notes": "Russell didn't proactively present the wine club, but he didn't miss the opportunity when Sarah mentioned it. He could have better capitalized on their interest by explaining the benefits more thoroughly."
         },
         {
           "criterion": "Closing Interaction",
           "weight": 8,
           "score": 4,
           "weightedScore": 32,
           "notes": "Russell thanked them and prepared their check, but could have been more specific about inviting them to return, perhaps mentioning upcoming events or seasonal releases."
         }
       ],
       "strengths": [
         "Excellent recognition of buying signals, particularly when guests expressed interest in specific wines",
         "Good rapport building, remembering names and showing interest in guests' background",
         "Effective handling of the food request, enhancing the overall experience"
       ],
       "areasForImprovement": [
         "Could be more proactive in sharing the winery's story and connecting it to the wines",
         "Missed opportunity to collect customer contact information",
         "Could have better capitalized on interest in the wine club with a more thorough presentation"
       ],
       "keyRecommendations": [
         "Develop a more compelling narrative about the winery's history and connect it to the wines being tasted",
         "Implement a natural way to collect customer information, explaining the benefits of staying connected",
         "Create a more structured approach to presenting the wine club when guests show interest"
       ]
     }
     ```

## Type Definitions
To ensure type safety and consistency across the application, define the following TypeScript interfaces in a dedicated types file:

1. Create a Types File:
   - Create a file at `app/types/evaluation.ts`
   - Include all necessary type definitions for the evaluation data
   - Example:
     ```typescript
     // app/types/evaluation.ts
     
     /**
      * Represents a single criterion score with its weight and notes
      */
     export interface CriterionScore {
       criterion: string;
       weight: number;
       score: number;
       weightedScore: number;
       notes: string;
     }
     
     /**
      * Represents the complete evaluation data structure
      */
     export interface EvaluationData {
       staffName: string;
       date: string;
       overallScore: number;
       performanceLevel: string;
       criteriaScores: CriterionScore[];
       strengths: string[];
       areasForImprovement: string[];
       keyRecommendations: string[];
     }
     
     /**
      * Valid performance level values
      */
     export type PerformanceLevel = 'Exceptional' | 'Strong' | 'Proficient' | 'Developing' | 'Needs Improvement';
     
     /**
      * Helper function to calculate performance level from score
      */
     export function getPerformanceLevel(score: number): PerformanceLevel {
       if (score >= 90) return 'Exceptional';
       if (score >= 80) return 'Strong';
       if (score >= 70) return 'Proficient';
       if (score >= 60) return 'Developing';
       return 'Needs Improvement';
     }
     
     /**
      * Helper function to calculate total score from criteria scores
      */
     export function calculateTotalScore(criteriaScores: CriterionScore[]): number {
       return criteriaScores.reduce((total, criterion) => total + criterion.weightedScore, 0);
     }
     ```

2. Import and Use Types:
   - Import these types in all components that handle evaluation data
   - Use them for state variables, props, and function parameters
   - Example:
     ```typescript
     import { EvaluationData, CriterionScore } from '@/types/evaluation';
     
     // In component state
     const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
     
     // In function parameters
     const handleAnalysisComplete = (data: EvaluationData) => {
       setEvaluationData(data);
     };
     
     // In props interface
     interface EvaluationDisplayProps {
       data: EvaluationData;
       onExport: () => void;
     }
     ```

3. Type Validation:
   - Implement runtime validation for API responses
   - Ensure the data structure matches the expected types
   - Example:
     ```typescript
     function validateEvaluationData(data: unknown): data is EvaluationData {
       if (!data || typeof data !== 'object') return false;
       
       const evaluation = data as Record<string, unknown>;
       
       // Check required fields
       if (typeof evaluation.staffName !== 'string') return false;
       if (typeof evaluation.date !== 'string') return false;
       if (typeof evaluation.overallScore !== 'number') return false;
       if (typeof evaluation.performanceLevel !== 'string') return false;
       
       // Check arrays
       if (!Array.isArray(evaluation.strengths)) return false;
       if (!Array.isArray(evaluation.areasForImprovement)) return false;
       if (!Array.isArray(evaluation.keyRecommendations)) return false;
       
       // Check criteriaScores
       if (!Array.isArray(evaluation.criteriaScores)) return false;
       for (const score of evaluation.criteriaScores) {
         if (!validateCriterionScore(score)) return false;
       }
       
       return true;
     }
     
     function validateCriterionScore(score: unknown): score is CriterionScore {
       if (!score || typeof score !== 'object') return false;
       
       const criterion = score as Record<string, unknown>;
       
       return (
         typeof criterion.criterion === 'string' &&
         typeof criterion.weight === 'number' &&
         typeof criterion.score === 'number' &&
         typeof criterion.weightedScore === 'number' &&
         typeof criterion.notes === 'string'
       );
     }
     ```

## Step 2: Create the Markdown Importer Component 

## Step 8: Testing and Debugging the Implementation
To ensure the markdown importer works correctly, implement a comprehensive testing and debugging strategy:

1. Create a Testing Utility:
   - Add a file at `app/lib/debug-utils.ts` for debugging helpers
   - Include functions to log and validate data at each step
   - Example:
     ```typescript
     // app/lib/debug-utils.ts
     
     import { EvaluationData, CriterionScore } from '@/types/evaluation';
     
     /**
      * Logs the markdown content with formatting for better readability
      */
     export function logMarkdownContent(markdown: string, fileName: string): void {
       console.group(`📄 Markdown File: ${fileName}`);
       console.log('Content length:', markdown.length, 'characters');
       console.log('First 200 characters:', markdown.substring(0, 200) + '...');
       console.groupEnd();
     }
     
     /**
      * Logs the API request details
      */
     export function logApiRequest(markdown: string, fileName: string): void {
       console.group('🚀 API Request');
       console.log('Endpoint:', '/api/analyze-conversation');
       console.log('File name:', fileName);
       console.log('Content length:', markdown.length, 'characters');
       console.groupEnd();
     }
     
     /**
      * Logs the Claude API response
      */
     export function logClaudeResponse(response: any): void {
       console.group('🤖 Claude API Response');
       console.log('Status:', response.status);
       console.log('Response time:', response.responseTime, 'ms');
       
       if (response.content && response.content[0] && response.content[0].text) {
         const text = response.content[0].text;
         console.log('Response length:', text.length, 'characters');
         console.log('First 200 characters:', text.substring(0, 200) + '...');
         
         // Check if response contains JSON
         const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
         if (jsonMatch && jsonMatch[1]) {
           console.log('JSON found in markdown code block');
         } else if (text.trim().startsWith('{')) {
           console.log('JSON found at start of response');
         } else {
           console.log('No JSON detected in response');
         }
       } else {
         console.log('Invalid response format');
       }
       
       console.groupEnd();
     }
     
     /**
      * Logs the parsed evaluation data
      */
     export function logEvaluationData(data: EvaluationData): void {
       console.group('📊 Evaluation Data');
       console.log('Staff Name:', data.staffName);
       console.log('Date:', data.date);
       console.log('Overall Score:', data.overallScore);
       console.log('Performance Level:', data.performanceLevel);
       console.log('Criteria Scores:', data.criteriaScores.length);
       console.log('Strengths:', data.strengths.length);
       console.log('Areas for Improvement:', data.areasForImprovement.length);
       console.log('Key Recommendations:', data.keyRecommendations.length);
       console.groupEnd();
     }
     
     /**
      * Logs validation errors for evaluation data
      */
     export function logValidationErrors(data: unknown, errors: string[]): void {
       console.group('❌ Validation Errors');
       console.log('Data type:', typeof data);
       if (typeof data === 'object' && data !== null) {
         console.log('Keys:', Object.keys(data as object));
       }
       console.log('Errors:', errors);
       console.groupEnd();
     }
     ```

2. Implement Debug Mode:
   - Add a debug flag to the MarkdownImporter component
   - Use it to conditionally enable detailed logging
   - Example:
     ```typescript
     // In MarkdownImporter.tsx
     
     interface MarkdownImporterProps {
       onAnalysisComplete: (evaluationData: EvaluationData) => void;
       isAnalyzing: boolean;
       setIsAnalyzing: (value: boolean) => void;
       debug?: boolean; // Add debug prop
     }
     
     const MarkdownImporter: React.FC<MarkdownImporterProps> = ({ 
       onAnalysisComplete,
       isAnalyzing,
       setIsAnalyzing,
       debug = false // Default to false
     }) => {
       // ... existing code ...
       
       const analyzeConversation = async () => {
         if (!markdown) {
           toast.error('Please select a markdown file first');
           return;
         }
         
         setIsAnalyzing(true);
         
         try {
           // Log debug information if enabled
           if (debug) {
             logMarkdownContent(markdown, fileName);
             logApiRequest(markdown, fileName);
           }
           
           // Call the API to analyze the conversation
           const response = await fetch('/api/analyze-conversation', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({ 
               markdown,
               fileName,
               debug // Pass debug flag to API
             }),
           });
           
           if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || `Error: ${response.status}`);
           }
           
           const evaluationData = await response.json();
           
           // Log debug information if enabled
           if (debug) {
             logEvaluationData(evaluationData);
           }
           
           // Validate that the response has the expected structure
           if (!evaluationData.staffName || !evaluationData.criteriaScores) {
             throw new Error('The evaluation data returned does not have the expected format');
           }
           
           onAnalysisComplete(evaluationData);
           toast.success('Conversation analyzed successfully!');
           
           // Reset the form
           if (fileInputRef.current) {
             fileInputRef.current.value = '';
           }
           setMarkdown(null);
           setFileName('');
           
         } catch (error) {
           console.error('Error analyzing conversation:', error);
           toast.error(error instanceof Error ? error.message : 'Error analyzing conversation. Please try again.');
         } finally {
           setIsAnalyzing(false);
         }
       };
       
       // ... rest of component ...
     };
     ```

3. Add Debug Logging to API Route:
   - Modify the API route to include debug logging
   - Track the Claude API request and response
   - Example:
     ```typescript
     // In app/api/analyze-conversation/route.ts
     
     import { logClaudeResponse, logValidationErrors } from '@/lib/debug-utils';
     
     export async function POST(request: NextRequest) {
       const startTime = Date.now();
       const debug = (await request.json()).debug || false;
       
       try {
         const { markdown, fileName } = await request.json();
         
         if (!markdown) {
           return NextResponse.json({ error: 'No markdown content provided' }, { status: 400 });
         }
         
         if (!CLAUDE_API_KEY) {
           return NextResponse.json({ error: 'Claude API key not configured' }, { status: 500 });
         }
         
         // ... existing code ...
         
         // Call Claude API
         const response = await fetch(CLAUDE_API_URL, {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'x-api-key': CLAUDE_API_KEY,
             'anthropic-version': '2023-06-01'
           },
           body: JSON.stringify({
             model: "claude-3-opus-20240229",
             max_tokens: 4000,
             system: systemPrompt,
             messages: [
               {
                 role: "user",
                 content: userPrompt
               }
             ]
           })
         });
         
         // Log Claude response if debug is enabled
         if (debug) {
           logClaudeResponse({
             status: response.status,
             responseTime: Date.now() - startTime,
             content: await response.clone().json()
           });
         }
         
         if (!response.ok) {
           const errorText = await response.text();
           console.error('Claude API error response:', errorText);
           return NextResponse.json({ 
             error: 'Error communicating with Claude API', 
             message: `Status: ${response.status}, Details: ${errorText.substring(0, 200)}...` 
           }, { status: 500 });
         }
         
         const claudeResponse = await response.json();
         
         // Log the Claude response structure
         console.log('📦 Claude response structure:', {
           hasContent: !!claudeResponse.content,
           contentLength: claudeResponse.content?.length,
           firstContentType: claudeResponse.content?.[0]?.type,
           firstContentTextLength: claudeResponse.content?.[0]?.text?.length,
           firstContentTextPreview: claudeResponse.content?.[0]?.text?.substring(0, 100) + '...'
         });
         
         if (!claudeResponse.content || !claudeResponse.content[0] || !claudeResponse.content[0].text) {
           console.error('❌ Invalid Claude response format');
           return NextResponse.json({ error: 'Invalid response from Claude API' }, { status: 500 });
         }
         
         // Extract JSON from Claude's response
         let evaluationData;
         const validationErrors: string[] = [];
         
         try {
           // First try to extract JSON if it's wrapped in markdown code blocks
           const jsonMatch = claudeResponse.content[0].text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
           if (jsonMatch && jsonMatch[1]) {
             console.log('🔍 JSON found in markdown code block');
             evaluationData = JSON.parse(jsonMatch[1].trim());
           } else {
             // Otherwise try to parse the entire response as JSON
             console.log('🔍 Attempting to parse entire response as JSON');
             evaluationData = JSON.parse(claudeResponse.content[0].text.trim());
           }
           
           // Validate the structure of the received JSON
           if (!validateEvaluationData(evaluationData, validationErrors)) {
             if (debug) {
               logValidationErrors(evaluationData, validationErrors);
             }
             throw new Error(`Invalid evaluation data: ${validationErrors.join(', ')}`);
           }
           
         } catch (error) {
           console.error('❌ Error parsing or validating JSON from Claude response:', error);
           console.error('Claude response text:', claudeResponse.content[0].text);
           return NextResponse.json({ 
             error: 'Failed to parse evaluation data', 
             message: error instanceof Error ? error.message : 'Unknown parsing error'
           }, { status: 500 });
         }
         
         return NextResponse.json(evaluationData);
         
       } catch (error) {
         console.error('❌ API route error:', error);
         return NextResponse.json({ 
           error: 'Internal server error',
           message: error instanceof Error ? error.message : 'Unknown error occurred' 
         }, { status: 500 });
       }
     }
     
     // Enhanced validation function that collects errors
     function validateEvaluationData(data: unknown, errors: string[]): data is EvaluationData {
       if (!data || typeof data !== 'object') {
         errors.push('Data is not an object');
         return false;
       }
       
       const evaluation = data as Record<string, unknown>;
       
       // Check required fields
       if (typeof evaluation.staffName !== 'string') errors.push('staffName is not a string');
       if (typeof evaluation.date !== 'string') errors.push('date is not a string');
       if (typeof evaluation.overallScore !== 'number') errors.push('overallScore is not a number');
       if (typeof evaluation.performanceLevel !== 'string') errors.push('performanceLevel is not a string');
       
       // Check arrays
       if (!Array.isArray(evaluation.strengths)) errors.push('strengths is not an array');
       if (!Array.isArray(evaluation.areasForImprovement)) errors.push('areasForImprovement is not an array');
       if (!Array.isArray(evaluation.keyRecommendations)) errors.push('keyRecommendations is not an array');
       
       // Check criteriaScores
       if (!Array.isArray(evaluation.criteriaScores)) {
         errors.push('criteriaScores is not an array');
       } else {
         evaluation.criteriaScores.forEach((score, index) => {
           if (!validateCriterionScore(score)) {
             errors.push(`criteriaScores[${index}] is invalid`);
           }
         });
       }
       
       return errors.length === 0;
     }
     ```

4. Create a Test Component:
   - Add a debug toggle to the WineEvaluationDashboard
   - Include a test button for quick testing
   - Example:
     ```typescript
     // In WineEvaluationDashboard.tsx
     
     const WineEvaluationDashboard = () => {
       // ... existing state ...
       const [debugMode, setDebugMode] = useState(false);
       
       // Test function that uses the sample conversation
       const testWithSampleConversation = async () => {
         try {
           setIsAnalyzing(true);
           setError(null);
           
           // Fetch the sample conversation
           const response = await fetch('/data/sample_conversation.md');
           if (!response.ok) {
             throw new Error('Failed to load sample conversation');
           }
           
           const markdown = await response.text();
           
           // Call the API with the sample conversation
           const apiResponse = await fetch('/api/analyze-conversation', {
             method: 'POST',
             headers: {
               'Content-Type': 'application/json',
             },
             body: JSON.stringify({ 
               markdown,
               fileName: 'sample_conversation.md',
               debug: debugMode
             }),
           });
           
           if (!apiResponse.ok) {
             const errorData = await apiResponse.json();
             throw new Error(errorData.message || `Error: ${apiResponse.status}`);
           }
           
           const evaluationData = await apiResponse.json();
           setEvaluationData(evaluationData);
           toast.success('Sample conversation analyzed successfully!');
           
         } catch (error) {
           console.error('Error testing with sample conversation:', error);
           setError(error instanceof Error ? error.message : 'Error testing with sample conversation');
           toast.error('Failed to analyze sample conversation');
         } finally {
           setIsAnalyzing(false);
         }
       };
       
       // Add to your JSX
       return (
         <div className="container mx-auto px-4 py-8">
           <div className="flex justify-between items-center mb-6">
             <h1 className="text-2xl font-bold">Wine Sales Evaluation Dashboard</h1>
             
             <div className="flex items-center gap-2">
               <label className="flex items-center gap-2 text-sm">
                 <input
                   type="checkbox"
                   checked={debugMode}
                   onChange={(e) => setDebugMode(e.target.checked)}
                   className="form-checkbox h-4 w-4 text-purple-600"
                 />
                 Debug Mode
               </label>
               
               <button
                 onClick={testWithSampleConversation}
                 disabled={isAnalyzing}
                 className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-500"
               >
                 Test with Sample
               </button>
             </div>
           </div>
           
           {/* Rest of your dashboard */}
           <div className="flex flex-wrap justify-end items-center gap-4 mb-4">
             <MarkdownImporter 
               onAnalysisComplete={handleAnalysisComplete}
               isAnalyzing={isAnalyzing}
               setIsAnalyzing={setIsAnalyzing}
               debug={debugMode}
             />
             
             {/* ... other buttons ... */}
           </div>
           
           {/* ... rest of component ... */}
         </div>
       );
     };
     ```

5. Common Issues and Troubleshooting:
   - Document common issues and their solutions
   - Include console logs for specific error scenarios
   - Example:
     ```typescript
     // Common issues and solutions
     
     // Issue 1: Claude API returns non-JSON response
     // Solution: Check the response format and extract JSON properly
     console.log('Claude response format:', {
       hasContent: !!claudeResponse.content,
       contentLength: claudeResponse.content?.length,
       firstContentType: claudeResponse.content?.[0]?.type,
       firstContentText: claudeResponse.content?.[0]?.text?.substring(0, 100)
     });
     
     // Issue 2: JSON parsing fails
     // Solution: Log the raw response and try different parsing approaches
     console.log('Raw Claude response:', claudeResponse.content[0].text);
     
     // Try parsing with different approaches
     try {
       // Approach 1: Direct parsing
       const directParse = JSON.parse(claudeResponse.content[0].text);
       console.log('Direct parse successful');
     } catch (e) {
       console.log('Direct parse failed:', e);
       
       try {
         // Approach 2: Extract from markdown code block
         const jsonMatch = claudeResponse.content[0].text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
         if (jsonMatch && jsonMatch[1]) {
           const extractedJson = JSON.parse(jsonMatch[1].trim());
           console.log('Extracted from code block successful');
         }
       } catch (e) {
         console.log('Code block extraction failed:', e);
       }
     }
     
     // Issue 3: Missing required fields in evaluation data
     // Solution: Log the structure and validate each field
     console.log('Evaluation data structure:', {
       hasStaffName: !!evaluationData.staffName,
       hasDate: !!evaluationData.date,
       hasOverallScore: !!evaluationData.overallScore,
       hasPerformanceLevel: !!evaluationData.performanceLevel,
       criteriaScoresLength: evaluationData.criteriaScores?.length,
       strengthsLength: evaluationData.strengths?.length,
       areasForImprovementLength: evaluationData.areasForImprovement?.length,
       keyRecommendationsLength: evaluationData.keyRecommendations?.length
     });
     ```

6. Testing the Claude API Integration:
   - Create comprehensive test cases for the Claude API integration
   - Document expected responses and error handling
   - Example:
     ```typescript
     // Test cases for Claude API integration
     
     // Test Case 1: Successful API call with valid markdown
     const testSuccessfulApiCall = async () => {
       try {
         // Sample markdown content
         const markdown = `# Wine Tasting Conversation
         
         ## Staff Member
         Hello, welcome to our tasting room. My name is Sarah.
         
         ## Guest
         Hi Sarah, thanks for having us. This is our first time here.
         
         ## Staff Member
         Wonderful! Let me tell you about our wines today...`;
         
         // Call the API
         const response = await fetch('/api/analyze-conversation', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ 
             markdown,
             fileName: 'test_conversation.md',
             debug: true
           }),
         });
         
         // Log the response
         console.log('Response status:', response.status);
         const data = await response.json();
         console.log('Response data:', data);
         
         // Verify the response structure
         if (data.staffName && data.criteriaScores && data.strengths) {
           console.log('✅ API test passed: Response has expected structure');
         } else {
           console.log('❌ API test failed: Response missing required fields');
         }
         
       } catch (error) {
         console.error('API test error:', error);
       }
     };
     
     // Test Case 2: API call with invalid markdown
     const testInvalidMarkdown = async () => {
       try {
         // Empty markdown
         const markdown = '';
         
         // Call the API
         const response = await fetch('/api/analyze-conversation', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ 
             markdown,
             fileName: 'empty_conversation.md',
             debug: true
           }),
         });
         
         // Log the response
         console.log('Response status:', response.status);
         const data = await response.json();
         console.log('Response data:', data);
         
         // Verify the error response
         if (response.status === 400 && data.error === 'No markdown content provided') {
           console.log('✅ API test passed: Correctly handled empty markdown');
         } else {
           console.log('❌ API test failed: Unexpected response for empty markdown');
         }
         
       } catch (error) {
         console.error('API test error:', error);
       }
     };
     
     // Test Case 3: API call with missing API key
     const testMissingApiKey = async () => {
       // This test requires temporarily removing the API key
       // It should be run in a development environment only
       try {
         // Store the original API key
         const originalApiKey = process.env.CLAUDE_API_KEY;
         
         // Temporarily remove the API key
         process.env.CLAUDE_API_KEY = '';
         
         // Sample markdown content
         const markdown = `# Wine Tasting Conversation
         
         ## Staff Member
         Hello, welcome to our tasting room.`;
         
         // Call the API
         const response = await fetch('/api/analyze-conversation', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify({ 
             markdown,
             fileName: 'test_conversation.md',
             debug: true
           }),
         });
         
         // Log the response
         console.log('Response status:', response.status);
         const data = await response.json();
         console.log('Response data:', data);
         
         // Verify the error response
         if (response.status === 500 && data.error === 'Claude API key not configured') {
           console.log('✅ API test passed: Correctly handled missing API key');
         } else {
           console.log('❌ API test failed: Unexpected response for missing API key');
         }
         
         // Restore the original API key
         process.env.CLAUDE_API_KEY = originalApiKey;
         
       } catch (error) {
         console.error('API test error:', error);
       }
     };
     ```

7. Testing with cURL:
   - Use cURL to test the API endpoint directly
   - Example:
     ```bash
     # Test with valid markdown
     curl -X POST http://localhost:3000/api/analyze-conversation \
       -H "Content-Type: application/json" \
       -d '{
         "markdown": "# Wine Tasting Conversation\n\n## Staff Member\nHello, welcome to our tasting room. My name is Sarah.\n\n## Guest\nHi Sarah, thanks for having us.",
         "fileName": "test_conversation.md",
         "debug": true
       }'
     
     # Test with empty markdown
     curl -X POST http://localhost:3000/api/analyze-conversation \
       -H "Content-Type: application/json" \
       -d '{
         "markdown": "",
         "fileName": "empty_conversation.md",
         "debug": true
       }'
     ```

8. Testing with Postman:
   - Create a Postman collection for testing the API
   - Example:
     ```
     # Postman Collection: Wine Sales Evaluator API
     
     ## Request: Analyze Conversation
     - Method: POST
     - URL: http://localhost:3000/api/analyze-conversation
     - Headers: Content-Type: application/json
     - Body (raw JSON):
       {
         "markdown": "# Wine Tasting Conversation\n\n## Staff Member\nHello, welcome to our tasting room. My name is Sarah.\n\n## Guest\nHi Sarah, thanks for having us.",
         "fileName": "test_conversation.md",
         "debug": true
       }
     ```

9. Expected API Responses:
   - Document the expected response formats
   - Example:
     ```json
     // Successful response
     {
       "staffName": "Sarah",
       "date": "2023-05-15",
       "overallScore": 78,
       "performanceLevel": "Proficient",
       "criteriaScores": [
         {
           "criterion": "Initial Greeting and Welcome",
           "weight": 8,
           "score": 4,
           "weightedScore": 32,
           "notes": "Sarah provided a warm greeting and introduced herself properly."
         },
         // ... other criteria scores
       ],
       "strengths": [
         "Warm, friendly greeting with good eye contact",
         "Clear introduction with name provided",
         "Welcoming tone that makes guests feel comfortable"
       ],
       "areasForImprovement": [
         "Could ask more about guest preferences",
         "Could mention tasting options more specifically",
         "Could better connect with returning guests"
       ],
       "keyRecommendations": [
         "Ask about guest wine preferences early in the conversation",
         "Be more specific about tasting options and pricing",
         "Develop a system to recognize returning guests"
       ]
     }
     
     // Error response - No markdown content
     {
       "error": "No markdown content provided"
     }
     
     // Error response - API key not configured
     {
       "error": "Claude API key not configured"
     }
     
     // Error response - Invalid Claude response
     {
       "error": "Failed to parse evaluation data",
       "message": "Invalid evaluation data: staffName is not a string, criteriaScores is not an array"
     }
     ```

10. Common Error Codes and Troubleshooting:
    - Document common error codes and their solutions
    - Example:
      ```
      | Error Code | Description | Troubleshooting Steps |
      |------------|-------------|----------------------|
      | 400 | No markdown content provided | Ensure the markdown field is not empty in the request |
      | 500 | Claude API key not configured | Check that CLAUDE_API_KEY is set in your environment variables |
      | 500 | Error communicating with Claude API | Verify your API key is valid and has sufficient credits |
      | 500 | Invalid response from Claude API | Check the Claude API response format and ensure it's being parsed correctly |
      | 500 | Failed to parse evaluation data | Verify that Claude's response contains valid JSON in the expected format |
      | 500 | Internal server error | Check server logs for detailed error information |
      ```

11. Validating Claude's JSON Response:
    - Implement robust validation for Claude's JSON responses
    - Handle edge cases and incorrect data types
    - Example:
      ```typescript
      // app/lib/validation.ts
      
      import { EvaluationData, CriterionScore } from '@/types/evaluation';
      
      /**
       * Validates the structure of Claude's JSON response
       * @param data The data to validate
       * @param errors Array to collect validation errors
       * @returns True if valid, false otherwise
       */
      export function validateEvaluationData(data: unknown, errors: string[] = []): data is EvaluationData {
        // Check if data is an object
        if (!data || typeof data !== 'object') {
          errors.push('Response is not a valid object');
          return false;
        }
        
        const evaluation = data as Record<string, unknown>;
        
        // Check required fields
        if (typeof evaluation.staffName !== 'string') {
          errors.push('staffName is missing or not a string');
        }
        
        if (typeof evaluation.date !== 'string') {
          errors.push('date is missing or not a string');
        } else {
          // Validate date format (YYYY-MM-DD)
          const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
          if (!dateRegex.test(evaluation.date)) {
            errors.push('date is not in YYYY-MM-DD format');
          }
        }
        
        if (typeof evaluation.overallScore !== 'number') {
          errors.push('overallScore is missing or not a number');
        } else {
          // Validate score range (0-100)
          if (evaluation.overallScore < 0 || evaluation.overallScore > 100) {
            errors.push('overallScore is outside the valid range (0-100)');
          }
        }
        
        if (typeof evaluation.performanceLevel !== 'string') {
          errors.push('performanceLevel is missing or not a string');
        } else {
          // Validate performance level is one of the expected values
          const validLevels = ['Exceptional', 'Strong', 'Proficient', 'Developing', 'Needs Improvement'];
          if (!validLevels.includes(evaluation.performanceLevel)) {
            errors.push(`performanceLevel "${evaluation.performanceLevel}" is not a valid value`);
          }
        }
        
        // Check arrays
        if (!Array.isArray(evaluation.strengths)) {
          errors.push('strengths is missing or not an array');
        } else if (evaluation.strengths.length < 1) {
          errors.push('strengths array is empty');
        } else {
          // Validate each strength is a string
          evaluation.strengths.forEach((strength, index) => {
            if (typeof strength !== 'string') {
              errors.push(`strengths[${index}] is not a string`);
            }
          });
        }
        
        if (!Array.isArray(evaluation.areasForImprovement)) {
          errors.push('areasForImprovement is missing or not an array');
        } else if (evaluation.areasForImprovement.length < 1) {
          errors.push('areasForImprovement array is empty');
        } else {
          // Validate each area is a string
          evaluation.areasForImprovement.forEach((area, index) => {
            if (typeof area !== 'string') {
              errors.push(`areasForImprovement[${index}] is not a string`);
            }
          });
        }
        
        if (!Array.isArray(evaluation.keyRecommendations)) {
          errors.push('keyRecommendations is missing or not an array');
        } else if (evaluation.keyRecommendations.length < 1) {
          errors.push('keyRecommendations array is empty');
        } else {
          // Validate each recommendation is a string
          evaluation.keyRecommendations.forEach((recommendation, index) => {
            if (typeof recommendation !== 'string') {
              errors.push(`keyRecommendations[${index}] is not a string`);
            }
          });
        }
        
        // Check criteriaScores
        if (!Array.isArray(evaluation.criteriaScores)) {
          errors.push('criteriaScores is missing or not an array');
        } else if (evaluation.criteriaScores.length !== 10) {
          errors.push(`criteriaScores array has ${evaluation.criteriaScores.length} items, expected 10`);
        } else {
          // Validate each criterion score
          evaluation.criteriaScores.forEach((score, index) => {
            if (!validateCriterionScore(score)) {
              errors.push(`criteriaScores[${index}] is invalid`);
            }
          });
        }
        
        return errors.length === 0;
      }
      
      /**
       * Validates a single criterion score
       * @param score The criterion score to validate
       * @param errors Array to collect validation errors
       * @returns True if valid, false otherwise
       */
      export function validateCriterionScore(score: unknown, errors: string[] = []): score is CriterionScore {
        // Check if score is an object
        if (!score || typeof score !== 'object') {
          errors.push('Criterion score is not a valid object');
          return false;
        }
        
        const criterion = score as Record<string, unknown>;
        
        // Check required fields
        if (typeof criterion.criterion !== 'string') {
          errors.push('criterion is missing or not a string');
        }
        
        if (typeof criterion.weight !== 'number') {
          errors.push('weight is missing or not a number');
        } else {
          // Validate weight is a positive number
          if (criterion.weight <= 0) {
            errors.push('weight must be a positive number');
          }
        }
        
        if (typeof criterion.score !== 'number') {
          errors.push('score is missing or not a number');
        } else {
          // Validate score is in range 1-5
          if (criterion.score < 1 || criterion.score > 5) {
            errors.push('score must be between 1 and 5');
          }
        }
        
        if (typeof criterion.weightedScore !== 'number') {
          errors.push('weightedScore is missing or not a number');
        } else {
          // Validate weightedScore is weight * score
          const expectedWeightedScore = (criterion.weight as number) * (criterion.score as number);
          if (Math.abs(criterion.weightedScore - expectedWeightedScore) > 0.01) {
            errors.push(`weightedScore (${criterion.weightedScore}) does not match weight * score (${expectedWeightedScore})`);
          }
        }
        
        if (typeof criterion.notes !== 'string') {
          errors.push('notes is missing or not a string');
        }
        
        return errors.length === 0;
      }
      
      /**
       * Attempts to fix common issues in Claude's JSON response
       * @param data The data to fix
       * @returns Fixed data or null if unfixable
       */
      export function fixEvaluationData(data: unknown): EvaluationData | null {
        if (!data || typeof data !== 'object') {
          return null;
        }
        
        const evaluation = data as Record<string, unknown>;
        const fixed: Record<string, unknown> = {};
        
        // Fix staffName
        if (typeof evaluation.staffName !== 'string') {
          if (evaluation.staffName === null || evaluation.staffName === undefined) {
            fixed.staffName = 'Unknown Staff Member';
            console.log('🔧 Fixed staffName: set to "Unknown Staff Member"');
          } else {
            fixed.staffName = String(evaluation.staffName);
            console.log(`🔧 Fixed staffName: converted to string "${fixed.staffName}"`);
          }
        } else {
          fixed.staffName = evaluation.staffName;
        }
        
        // Fix date
        if (typeof evaluation.date !== 'string') {
          if (evaluation.date === null || evaluation.date === undefined) {
            fixed.date = new Date().toISOString().split('T')[0]; // Today's date in YYYY-MM-DD
            console.log(`🔧 Fixed date: set to today's date "${fixed.date}"`);
          } else {
            try {
              const date = new Date(String(evaluation.date));
              fixed.date = date.toISOString().split('T')[0];
              console.log(`🔧 Fixed date: converted to YYYY-MM-DD format "${fixed.date}"`);
            } catch (e) {
              fixed.date = new Date().toISOString().split('T')[0];
              console.log(`🔧 Fixed date: parsing failed, set to today's date "${fixed.date}"`);
            }
          }
        } else {
          fixed.date = evaluation.date;
        }
        
        // Fix overallScore
        if (typeof evaluation.overallScore !== 'number') {
          if (evaluation.overallScore === null || evaluation.overallScore === undefined) {
            fixed.overallScore = 0;
            console.log('�� Fixed overallScore: set to 0');
          } else {
            const score = Number(evaluation.overallScore);
            fixed.overallScore = isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
            console.log(`🔧 Fixed overallScore: converted to number ${fixed.overallScore}`);
          }
        } else {
          fixed.overallScore = evaluation.overallScore;
        }
        
        // Fix performanceLevel
        if (typeof evaluation.performanceLevel !== 'string') {
          const score = fixed.overallScore as number;
          if (score >= 90) fixed.performanceLevel = 'Exceptional';
          else if (score >= 80) fixed.performanceLevel = 'Strong';
          else if (score >= 70) fixed.performanceLevel = 'Proficient';
          else if (score >= 60) fixed.performanceLevel = 'Developing';
          else fixed.performanceLevel = 'Needs Improvement';
          console.log(`🔧 Fixed performanceLevel: calculated from score "${fixed.performanceLevel}"`);
        } else {
          fixed.performanceLevel = evaluation.performanceLevel;
        }
        
        // Fix arrays
        fixed.strengths = Array.isArray(evaluation.strengths) 
          ? evaluation.strengths.map(s => typeof s === 'string' ? s : String(s))
          : ['No strengths identified'];
        console.log(`🔧 Fixed strengths: ${Array.isArray(evaluation.strengths) ? 'converted non-string items' : 'created default array'}`);
          
        fixed.areasForImprovement = Array.isArray(evaluation.areasForImprovement)
          ? evaluation.areasForImprovement.map(a => typeof a === 'string' ? a : String(a))
          : ['No areas for improvement identified'];
        console.log(`🔧 Fixed areasForImprovement: ${Array.isArray(evaluation.areasForImprovement) ? 'converted non-string items' : 'created default array'}`);
          
        fixed.keyRecommendations = Array.isArray(evaluation.keyRecommendations)
          ? evaluation.keyRecommendations.map(r => typeof r === 'string' ? r : String(r))
          : ['No recommendations provided'];
        console.log(`🔧 Fixed keyRecommendations: ${Array.isArray(evaluation.keyRecommendations) ? 'converted non-string items' : 'created default array'}`);
          
        // Fix criteriaScores
        if (Array.isArray(evaluation.criteriaScores)) {
          fixed.criteriaScores = evaluation.criteriaScores.map((score, index) => {
            if (!score || typeof score !== 'object') {
              console.log(`🔧 Fixed criteriaScores[${index}]: created default object`);
              return {
                criterion: `Criterion ${index + 1}`,
                weight: 10,
                score: 3,
                weightedScore: 30,
                notes: 'No evaluation provided'
              };
            }
            
            const criterion = score as Record<string, unknown>;
            const fixedScore: CriterionScore = {
              criterion: typeof criterion.criterion === 'string' ? criterion.criterion : `Criterion ${index + 1}`,
              weight: typeof criterion.weight === 'number' ? criterion.weight : 10,
              score: typeof criterion.score === 'number' ? Math.max(1, Math.min(5, criterion.score)) : 3,
              weightedScore: 0, // Will be calculated below
              notes: typeof criterion.notes === 'string' ? criterion.notes : 'No notes provided'
            };
            
            // Calculate weighted score
            fixedScore.weightedScore = fixedScore.weight * fixedScore.score;
            console.log(`🔧 Fixed criteriaScores[${index}]: calculated weightedScore ${fixedScore.weightedScore}`);
            
            return fixedScore;
          });
          
          // Ensure we have exactly 10 criteria scores
          while (fixed.criteriaScores.length < 10) {
            console.log(`🔧 Added missing criteriaScores[${fixed.criteriaScores.length}]`);
            fixed.criteriaScores.push({
              criterion: `Criterion ${fixed.criteriaScores.length + 1}`,
              weight: 10,
              score: 3,
              weightedScore: 30,
              notes: 'No evaluation provided'
            });
          }
          
          if (fixed.criteriaScores.length > 10) {
            console.log(`🔧 Truncated criteriaScores from ${fixed.criteriaScores.length} to 10 items`);
            fixed.criteriaScores = fixed.criteriaScores.slice(0, 10);
          }
        } else {
          // Create default criteria scores
          console.log('🔧 Created default criteriaScores array');
          fixed.criteriaScores = Array(10).fill(null).map((_, index) => ({
            criterion: `Criterion ${index + 1}`,
            weight: 10,
            score: 3,
            weightedScore: 30,
            notes: 'No evaluation provided'
          }));
        }
        
        return fixed as EvaluationData;
      }
      
      /**
       * Extracts JSON from Claude's response text
       * @param text Claude's response text
       * @returns Extracted JSON or null if extraction fails
       */
      export function extractJsonFromClaudeResponse(text: string): unknown | null {
        // Log the extraction attempt
        console.log('🔍 Extracting JSON from Claude response:', {
          textLength: text.length,
          hasCodeBlock: text.includes('```'),
          startsWithBrace: text.trim().startsWith('{')
        });
        
        try {
          // First try to extract JSON if it's wrapped in markdown code blocks
          const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch && jsonMatch[1]) {
            console.log('✅ Extracted JSON from markdown code block');
            return JSON.parse(jsonMatch[1].trim());
          }
          
          // Otherwise try to parse the entire response as JSON
          console.log('✅ Parsed entire response as JSON');
          return JSON.parse(text.trim());
        } catch (error) {
          console.error('❌ Failed to extract JSON from Claude response:', error);
          return null;
        }
      }
      ```

## Comprehensive Error Handling
Implementing robust error handling is critical for a production-ready application. This section provides detailed examples of how to enhance error handling throughout the application.

### 1. API Route Error Handling

```typescript
// app/api/analyze-conversation/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { extractJsonFromClaudeResponse, fixEvaluationData, validateEvaluationData } from '@/lib/validation';

// Define error types for better error handling
class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code?: string,
    public details?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Error handling middleware
const handleApiError = (error: unknown) => {
  console.error('API Error:', error);
  
  if (error instanceof ApiError) {
    return NextResponse.json({
      error: error.message,
      code: error.code,
      details: error.details
    }, { status: error.status });
  }
  
  if (error instanceof Error) {
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
      details: error.stack
    }, { status: 500 });
  }
  
  return NextResponse.json({
    error: 'Unknown error occurred',
    details: String(error)
  }, { status: 500 });
};

export async function POST(request: NextRequest) {
  try {
    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (error) {
      throw new ApiError('Invalid JSON in request body', 400, 'INVALID_JSON');
    }
    
    const { markdown, fileName, debug = false } = body;
    
    // Validate required fields
    if (!markdown) {
      throw new ApiError('No markdown content provided', 400, 'MISSING_MARKDOWN');
    }
    
    if (!fileName) {
      throw new ApiError('No file name provided', 400, 'MISSING_FILENAME');
    }
    
    // Check API key
    const CLAUDE_API_KEY = process.env.CLAUDE_API_KEY;
    if (!CLAUDE_API_KEY) {
      throw new ApiError('Claude API key not configured', 500, 'MISSING_API_KEY');
    }
    
    // Load reference files with error handling
    let WINES_SALES_RUBRIC: string;
    let EVALUATION_EXAMPLE: string;
    
    try {
      const rubricPath = path.join(process.cwd(), 'public', 'data', 'wines_sales_rubric.md');
      const evaluationExamplePath = path.join(process.cwd(), 'public', 'data', 'evaluation_new.json');
      
      WINES_SALES_RUBRIC = fs.readFileSync(rubricPath, 'utf8');
      EVALUATION_EXAMPLE = fs.readFileSync(evaluationExamplePath, 'utf8');
    } catch (error) {
      console.error('Error loading reference files:', error);
      throw new ApiError(
        'Failed to load reference files',
        500,
        'FILE_LOAD_ERROR',
        error instanceof Error ? error.message : 'Unknown file error'
      );
    }
    
    // Prepare the system prompt for Claude
    const systemPrompt = `You are a wine sales performance evaluator. You will analyze a wine tasting conversation and score it according to a rubric. You'll provide objective, fair assessments based solely on the evidence in the conversation.`;

    // Prepare the user prompt with detailed instructions
    const userPrompt = `I need you to evaluate the wine tasting conversation below against the criteria in the wine sales rubric. Format your evaluation in the same JSON structure as shown in the evaluation example.

Here is the rubric to use for evaluation:

${WINES_SALES_RUBRIC}

Here is an example of the expected JSON output format:

${EVALUATION_EXAMPLE}

Please follow these instructions:

1. Carefully analyze the conversation for evidence of each of the 10 weighted criteria in the rubric
2. Score each criterion on a scale of 1-5 based on the detailed descriptions in the rubric
3. Calculate the weighted score for each criterion (criterion score × weight)
4. Calculate the overall score as a whole number (sum of weighted scores ÷ 5)
5. Determine the performance level based on the score ranges in the rubric:
   - Exceptional: 90-100%
   - Strong: 80-89% 
   - Proficient: 70-79%
   - Developing: 60-69%
   - Needs Improvement: Below 60%
6. Include 3 specific strengths demonstrated in the conversation
7. Include 3 specific areas for improvement 
8. Provide 3 actionable recommendations
9. Write detailed notes for each criterion explaining the score

Output your evaluation in exactly the same JSON format as in the example, with the same field names and structure, including:
* staffName (extracted from the conversation)
* date (from the conversation, in YYYY-MM-DD format)
* overallScore (as a number)
* performanceLevel (as a string)
* criteriaScores (array with criterion, weight, score, weightedScore, and notes for each criterion)
* strengths (array of 3 strings)
* areasForImprovement (array of 3 strings) 
* keyRecommendations (array of 3 strings)

Here is the conversation to evaluate:

${markdown}

Return ONLY THE JSON with no additional text or explanation.`;

    // Call Claude API with timeout and retry logic
    const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
    const MAX_RETRIES = 2;
    const TIMEOUT_MS = 30000; // 30 seconds
    
    let response;
    let retryCount = 0;
    let lastError: Error | null = null;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        // Create an AbortController for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
        
        // Make the API call
        response = await fetch(CLAUDE_API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': CLAUDE_API_KEY,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: "claude-3-opus-20240229",
            max_tokens: 4000,
            system: systemPrompt,
            messages: [
              {
                role: "user",
                content: userPrompt
              }
            ]
          }),
          signal: controller.signal
        });
        
        // Clear the timeout
        clearTimeout(timeoutId);
        
        // If successful, break out of the retry loop
        if (response.ok) {
          break;
        }
        
        // If we get a 429 (rate limit) or 5xx error, retry
        if (response.status === 429 || (response.status >= 500 && response.status < 600)) {
          const errorText = await response.text();
          lastError = new Error(`Claude API error: ${response.status} - ${errorText}`);
          
          // If we've reached max retries, throw the error
          if (retryCount === MAX_RETRIES) {
            throw new ApiError(
              'Error communicating with Claude API after multiple retries',
              500,
              'CLAUDE_API_ERROR',
              lastError.message
            );
          }
          
          // Otherwise, wait and retry
          const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Retrying Claude API call in ${backoffMs}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));
          retryCount++;
          continue;
        }
        
        // For other errors, don't retry
        const errorText = await response.text();
        throw new ApiError(
          'Error communicating with Claude API',
          response.status,
          'CLAUDE_API_ERROR',
          errorText.substring(0, 200) + '...'
        );
      } catch (error) {
        // Handle timeout errors
        if (error instanceof DOMException && error.name === 'AbortError') {
          throw new ApiError(
            'Claude API request timed out',
            504,
            'CLAUDE_API_TIMEOUT',
            'The request to Claude API took too long to complete'
          );
        }
        
        // If we've reached max retries, throw the error
        if (retryCount === MAX_RETRIES) {
          throw new ApiError(
            'Error communicating with Claude API after multiple retries',
            500,
            'CLAUDE_API_ERROR',
            error instanceof Error ? error.message : 'Unknown error'
          );
        }
        
        // Otherwise, wait and retry
        lastError = error instanceof Error ? error : new Error(String(error));
        const backoffMs = Math.pow(2, retryCount) * 1000; // Exponential backoff
        console.log(`Retrying Claude API call in ${backoffMs}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        await new Promise(resolve => setTimeout(resolve, backoffMs));
        retryCount++;
      }
    }
    
    // If we don't have a response at this point, throw an error
    if (!response) {
      throw new ApiError(
        'Failed to get response from Claude API',
        500,
        'CLAUDE_API_ERROR',
        lastError?.message || 'Unknown error'
      );
    }
    
    // Parse Claude's response
    let claudeResponse;
    try {
      claudeResponse = await response.json();
    } catch (error) {
      throw new ApiError(
        'Failed to parse Claude API response',
        500,
        'CLAUDE_RESPONSE_PARSE_ERROR',
        error instanceof Error ? error.message : 'Unknown parsing error'
      );
    }
    
    // Validate Claude's response structure
    if (!claudeResponse.content || !claudeResponse.content[0] || !claudeResponse.content[0].text) {
      throw new ApiError(
        'Invalid response from Claude API',
        500,
        'INVALID_CLAUDE_RESPONSE',
        'Response missing required content or text fields'
      );
    }
    
    // Extract JSON from Claude's response
    const extractedJson = extractJsonFromClaudeResponse(claudeResponse.content[0].text);
    if (!extractedJson) {
      throw new ApiError(
        'Failed to extract JSON from Claude response',
        500,
        'JSON_EXTRACTION_ERROR',
        'Could not find valid JSON in Claude response'
      );
    }
    
    // Validate the extracted JSON
    const validationErrors: string[] = [];
    if (!validateEvaluationData(extractedJson, validationErrors)) {
      // Try to fix common issues
      const fixedData = fixEvaluationData(extractedJson);
      
      if (fixedData) {
        console.log('Fixed evaluation data with common issues');
        return NextResponse.json(fixedData);
      }
      
      throw new ApiError(
        'Invalid evaluation data from Claude',
        500,
        'INVALID_EVALUATION_DATA',
        validationErrors.join(', ')
      );
    }
    
    // Return the validated evaluation data
    return NextResponse.json(extractedJson);
    
  } catch (error) {
    return handleApiError(error);
  }
}
```

### 2. Component Error Handling

```typescript
// app/components/MarkdownImporter.tsx

import React, { useState, useRef, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { EvaluationData } from '@/types/evaluation';
import { ErrorDisplay } from './ErrorDisplay';
import { LoadingIndicator } from './LoadingIndicator';

interface MarkdownImporterProps {
  onAnalysisComplete: (evaluationData: EvaluationData) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
  debug?: boolean;
}

// Define error types for better error handling
interface AppError {
  message: string;
  code?: string;
  details?: string;
  recoverable?: boolean;
}

const MarkdownImporter: React.FC<MarkdownImporterProps> = ({ 
  onAnalysisComplete,
  isAnalyzing,
  setIsAnalyzing,
  debug = false
}) => {
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<AppError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Clear error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  // Handle file selection with error handling
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      clearError();
      
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Validate file type
      if (!file.name.endsWith('.md') && !file.name.endsWith('.txt')) {
        throw new Error('Please select a markdown or text file');
      }
      
      // Validate file size (max 1MB)
      if (file.size > 1024 * 1024) {
        throw new Error('File size exceeds 1MB limit');
      }
      
      setFileName(file.name);
      
      const reader = new FileReader();
      
      reader.onerror = () => {
        throw new Error('Error reading file');
      };
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            throw new Error('Empty file content');
          }
          setMarkdown(content);
        } catch (error) {
          setError({
            message: error instanceof Error ? error.message : 'Error processing file content',
            recoverable: true
          });
          toast.error('Error processing file content');
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      setError({
        message: error instanceof Error ? error.message : 'Error selecting file',
        recoverable: true
      });
      toast.error(error instanceof Error ? error.message : 'Error selecting file');
    }
  }, [clearError]);
  
  // Analyze conversation with comprehensive error handling
  const analyzeConversation = useCallback(async () => {
    if (!markdown) {
      setError({
        message: 'Please select a markdown file first',
        recoverable: true
      });
      toast.error('Please select a markdown file first');
      return;
    }
    
    setIsAnalyzing(true);
    clearError();
    
    try {
      // Log debug information if enabled
      if (debug) {
        console.group('🚀 Analyzing Conversation');
        console.log('File:', fileName);
        console.log('Content length:', markdown.length, 'characters');
        console.log('First 200 characters:', markdown.substring(0, 200) + '...');
        console.groupEnd();
      }
      
      // Call the API to analyze the conversation
      const response = await fetch('/api/analyze-conversation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          markdown,
          fileName,
          debug
        }),
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle API errors
      if (!response.ok) {
        throw new Error(data.message || `Error: ${response.status}`);
      }
      
      // Validate the response structure
      if (!data.staffName || !data.criteriaScores) {
        throw new Error('The evaluation data returned does not have the expected format');
      }
      
      // Log success
      if (debug) {
        console.group('✅ Analysis Complete');
        console.log('Staff Name:', data.staffName);
        console.log('Overall Score:', data.overallScore);
        console.log('Performance Level:', data.performanceLevel);
        console.groupEnd();
      }
      
      // Call the completion handler
      onAnalysisComplete(data);
      toast.success('Conversation analyzed successfully!');
      
      // Reset the form
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setMarkdown(null);
      setFileName('');
      
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      
      // Set error state
      setError({
        message: error instanceof Error ? error.message : 'Error analyzing conversation',
        code: error instanceof Error && 'code' in error ? String((error as any).code) : undefined,
        details: error instanceof Error && 'details' in error ? String((error as any).details) : undefined,
        recoverable: true
      });
      
      // Show error toast
      toast.error(error instanceof Error ? error.message : 'Error analyzing conversation');
    } finally {
      setIsAnalyzing(false);
    }
  }, [markdown, fileName, debug, onAnalysisComplete, setIsAnalyzing, clearError]);
  
  // Retry the analysis
  const retryAnalysis = useCallback(() => {
    if (markdown) {
      analyzeConversation();
    } else {
      setError({
        message: 'No conversation data available to retry',
        recoverable: false
      });
      toast.error('No conversation data available to retry');
    }
  }, [markdown, analyzeConversation]);
  
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".md,.txt"
        className="hidden"
        disabled={isAnalyzing}
      />
      
      <button
        onClick={() => fileInputRef.current?.click()}
        className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-600 flex items-center"
        disabled={isAnalyzing}
      >
        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
        </svg>
        Import Conversation
      </button>
      
      {fileName && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="text-sm text-gray-600 truncate max-w-xs">{fileName}</span>
          <button
            onClick={analyzeConversation}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500 flex items-center"
          >
            {isAnalyzing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing...
              </>
            ) : (
              <>Analyze with Claude</>
            )}
          </button>
        </div>
      )}
      
      {isAnalyzing && (
        <LoadingIndicator message="Claude is analyzing the conversation..." />
      )}
      
      {error && (
        <ErrorDisplay 
          title="Analysis Error" 
          message={error.message}
          details={error.details}
          onRetry={error.recoverable ? retryAnalysis : undefined}
        />
      )}
    </div>
  );
};

export default MarkdownImporter;
```

### 3. Error Recovery Strategies

Implementing effective error recovery strategies is essential for a robust application. Here are some key strategies to consider:

1. **Graceful Degradation**:
   - When a feature fails, provide a fallback experience
   - Example: If PDF export fails, offer a text-based alternative

2. **Retry Logic with Exponential Backoff**:
   - For transient errors (like network issues), implement retry logic
   - Use exponential backoff to avoid overwhelming the server
   - Example: Retry API calls with increasing delays between attempts

3. **Data Persistence**:
   - Save user input to localStorage or sessionStorage
   - Allow users to recover from browser crashes or accidental navigation
   - Example: Save the markdown content before analysis

4. **Partial Success Handling**:
   - When some parts of an operation succeed and others fail, preserve the successful parts
   - Example: If some criteria scores are valid but others are invalid, use the valid ones

5. **User Feedback and Guidance**:
   - Provide clear error messages that explain what went wrong
   - Offer specific suggestions for how to fix the issue
   - Example: "The file is too large. Please select a file under 1MB."

6. **Error Logging and Monitoring**:
   - Log errors to a monitoring service for analysis
   - Track error rates and patterns to identify systemic issues
   - Example: Send error details to a logging service

7. **Circuit Breaker Pattern**:
   - For external services that might be down, implement a circuit breaker
   - After a certain number of failures, stop trying for a cooling-off period
   - Example: If Claude API is down, show a maintenance message

8. **Input Validation**:
   - Validate user input before sending to the server
   - Provide immediate feedback for invalid input
   - Example: Check file type and size before upload

9. **Timeout Handling**:
   - Set reasonable timeouts for all operations
   - Provide feedback when operations take too long
   - Example: Show a timeout message if analysis takes more than 30 seconds

10. **State Recovery**:
    - Maintain application state in a way that can be recovered
    - Allow users to resume from where they left off
    - Example: Save the current evaluation state to localStorage

By implementing these error handling and recovery strategies, you'll create a more robust application that provides a better user experience even when things go wrong.

## Step 10: Create Example Markdown Format