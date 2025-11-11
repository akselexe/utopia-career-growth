import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TechnicalDocs = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">3amal Technical Documentation</h1>
          <p className="text-muted-foreground">
            Complete technical design, architecture, and AI methodology
          </p>
          <div className="flex gap-2 mt-4">
            <Badge variant="secondary">React + TypeScript</Badge>
            <Badge variant="secondary">Supabase + PostgreSQL</Badge>
            <Badge variant="secondary">Gemini 2.5 Flash</Badge>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="database">Database</TabsTrigger>
            <TabsTrigger value="ai">AI System</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Executive Summary</CardTitle>
                <CardDescription>
                  AI-powered job matching platform for Africa and MENA regions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">
                  <strong>3amal</strong> is an AI-powered job matching platform designed specifically 
                  for the African and MENA regions. The platform leverages advanced AI models to provide 
                  intelligent CV analysis, behavioral interviews, job matching, and career insights for 
                  job seekers, while offering companies powerful candidate matching and screening tools.
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-semibold">Technology Stack</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• Frontend: React 18.3, TypeScript, Vite</li>
                      <li>• Styling: TailwindCSS, shadcn/ui</li>
                      <li>• Backend: Supabase (PostgreSQL, Auth, Storage)</li>
                      <li>• AI: Lovable AI Gateway (Gemini 2.5 Flash)</li>
                      <li>• State: React Query (TanStack Query v5)</li>
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-semibold">Key Features</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                      <li>• AI-powered CV analysis and scoring</li>
                      <li>• Intelligent job-candidate matching</li>
                      <li>• Real-time AI video interviews</li>
                      <li>• Behavioral analysis during interviews</li>
                      <li>• Developer footprint scanning</li>
                      <li>• Personalized career insights</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Models Used</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-primary pl-4">
                    <h4 className="font-semibold text-sm mb-1">Primary Model: google/gemini-2.5-flash</h4>
                    <p className="text-xs text-muted-foreground">
                      Balanced cost/performance ratio. Used for CV analysis, job matching, 
                      candidate ranking, interviews, and career insights. 128K context window 
                      with strong multimodal capabilities.
                    </p>
                  </div>

                  <div className="border-l-4 border-secondary pl-4">
                    <h4 className="font-semibold text-sm mb-1">Advanced Tasks: google/gemini-2.5-pro</h4>
                    <p className="text-xs text-muted-foreground">
                      Used for complex behavioral analysis in video interviews requiring 
                      deeper reasoning and vision capabilities.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="architecture" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>System Architecture</CardTitle>
                <CardDescription>
                  Full-stack architecture with React frontend and Supabase backend
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-primary">Frontend Layer</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">React SPA</div>
                          <div className="text-xs text-muted-foreground">TypeScript + Vite</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">UI Components</div>
                          <div className="text-xs text-muted-foreground">TailwindCSS + shadcn/ui</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Routing</div>
                          <div className="text-xs text-muted-foreground">React Router v6</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-secondary">Backend Layer</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Database</div>
                          <div className="text-xs text-muted-foreground">PostgreSQL + RLS</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Storage</div>
                          <div className="text-xs text-muted-foreground">File buckets (CVs)</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Edge Functions</div>
                          <div className="text-xs text-muted-foreground">Deno serverless</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Authentication</div>
                          <div className="text-xs text-muted-foreground">Supabase Auth + JWT</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-semibold text-accent">AI & External</h4>
                      <div className="space-y-2 text-sm">
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Lovable AI Gateway</div>
                          <div className="text-xs text-muted-foreground">Gemini 2.5 Flash/Pro</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Job Search API</div>
                          <div className="text-xs text-muted-foreground">JSearch (RapidAPI)</div>
                        </div>
                        <div className="bg-background p-3 rounded border">
                          <div className="font-medium mb-1">Developer APIs</div>
                          <div className="text-xs text-muted-foreground">GitHub, StackOverflow</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-3">
                  <h4 className="font-semibold">Data Flow</h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm">
                    <div className="bg-primary/10 p-3 rounded text-center">
                      1. User Action
                    </div>
                    <div className="bg-primary/10 p-3 rounded text-center">
                      2. React Component
                    </div>
                    <div className="bg-primary/10 p-3 rounded text-center">
                      3. Edge Function
                    </div>
                    <div className="bg-primary/10 p-3 rounded text-center">
                      4. AI/Database
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="database" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Database Schema</CardTitle>
                <CardDescription>
                  PostgreSQL schema with Row-Level Security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      profiles
                    </h4>
                    <div className="text-xs space-y-1 text-muted-foreground pl-5">
                      <div>• id (uuid, PK)</div>
                      <div>• user_type (enum: seeker | company)</div>
                      <div>• full_name (text)</div>
                      <div>• email (text)</div>
                      <div>• created_at, updated_at</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-3 h-3 bg-secondary rounded-full" />
                      seeker_profiles
                    </h4>
                    <div className="text-xs space-y-1 text-muted-foreground pl-5">
                      <div>• id (uuid, PK)</div>
                      <div>• user_id (uuid, FK → profiles)</div>
                      <div>• skills (jsonb)</div>
                      <div>• bio, location (text)</div>
                      <div>• job_preferences (jsonb)</div>
                      <div>• education, certifications (jsonb)</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-3 h-3 bg-accent rounded-full" />
                      company_profiles
                    </h4>
                    <div className="text-xs space-y-1 text-muted-foreground pl-5">
                      <div>• id (uuid, PK)</div>
                      <div>• user_id (uuid, FK → profiles)</div>
                      <div>• company_name (text)</div>
                      <div>• description, industry (text)</div>
                      <div>• website (text)</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-3 h-3 bg-primary rounded-full" />
                      cvs
                    </h4>
                    <div className="text-xs space-y-1 text-muted-foreground pl-5">
                      <div>• id (uuid, PK)</div>
                      <div>• user_id (uuid, FK → profiles)</div>
                      <div>• file_path (text)</div>
                      <div>• analysis (jsonb) ← AI results</div>
                      <div>• created_at</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-3 h-3 bg-secondary rounded-full" />
                      jobs
                    </h4>
                    <div className="text-xs space-y-1 text-muted-foreground pl-5">
                      <div>• id (uuid, PK)</div>
                      <div>• company_id (uuid, FK → companies)</div>
                      <div>• title, description (text)</div>
                      <div>• requirements (jsonb)</div>
                      <div>• location, salary_range (text)</div>
                      <div>• job_type, is_active</div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4 space-y-2">
                    <h4 className="font-semibold text-sm flex items-center gap-2">
                      <div className="w-3 h-3 bg-accent rounded-full" />
                      applications
                    </h4>
                    <div className="text-xs space-y-1 text-muted-foreground pl-5">
                      <div>• id (uuid, PK)</div>
                      <div>• job_id (uuid, FK → jobs)</div>
                      <div>• seeker_id (uuid, FK → seekers)</div>
                      <div>• cv_id (uuid, FK → cvs)</div>
                      <div>• status (enum)</div>
                      <div>• match_score (int) ← AI computed</div>
                      <div>• ai_analysis (jsonb)</div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Security: Row-Level Security (RLS)</h4>
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Policy</Badge>
                      <div>
                        <div className="font-medium">Users can view own CVs</div>
                        <code className="text-xs text-muted-foreground">
                          ON cvs FOR SELECT USING (auth.uid() = user_id)
                        </code>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Policy</Badge>
                      <div>
                        <div className="font-medium">Companies view own job applicants</div>
                        <code className="text-xs text-muted-foreground">
                          ON applications FOR SELECT USING (job.company_id = auth.uid())
                        </code>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="mt-0.5">Policy</Badge>
                      <div>
                        <div className="font-medium">Seekers can view own applications</div>
                        <code className="text-xs text-muted-foreground">
                          ON applications FOR SELECT USING (seeker_id = auth.uid())
                        </code>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI Integration Architecture</CardTitle>
                <CardDescription>
                  How AI models are integrated via Lovable AI Gateway
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Request Flow: CV Analysis Example</h4>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-3 p-3 bg-muted rounded">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">User uploads CV</div>
                        <div className="text-xs text-muted-foreground">Frontend stores file in Supabase Storage</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Frontend calls Edge Function</div>
                        <div className="text-xs text-muted-foreground">POST /analyze-cv with file_path and user_id</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Edge Function fetches file</div>
                        <div className="text-xs text-muted-foreground">Retrieves CV content from Storage bucket</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-secondary/20 rounded border-2 border-secondary">
                      <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-sm font-bold">4</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">AI Analysis via Gateway</div>
                        <div className="text-xs text-muted-foreground">POST to Lovable AI Gateway → Gemini 2.5 Flash with tool calling</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">5</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Store structured results</div>
                        <div className="text-xs text-muted-foreground">INSERT analysis JSONB into cvs table</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-muted rounded">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">6</div>
                      <div className="flex-1">
                        <div className="font-medium text-sm">Return to user</div>
                        <div className="text-xs text-muted-foreground">Display scores, strengths, weaknesses, suggestions</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">AI Tool Calling for Structured Output</h4>
                  <p className="text-sm text-muted-foreground">
                    We use AI tool calling instead of asking for JSON responses. This ensures 
                    type-safe, validated structured data every time.
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs overflow-x-auto">
{`{
  "tools": [{
    "type": "function",
    "function": {
      "name": "analyze_cv",
      "description": "Analyze CV and return structured feedback",
      "parameters": {
        "type": "object",
        "properties": {
          "overall_score": { 
            "type": "number", 
            "minimum": 0, 
            "maximum": 100 
          },
          "strengths": { 
            "type": "array", 
            "items": { "type": "string" } 
          },
          "weaknesses": { 
            "type": "array", 
            "items": { "type": "string" } 
          },
          "improvement_suggestions": { 
            "type": "array", 
            "items": { "type": "string" } 
          }
        },
        "required": ["overall_score", "strengths", 
                     "weaknesses", "improvement_suggestions"]
      }
    }
  }],
  "tool_choice": { 
    "type": "function", 
    "function": { "name": "analyze_cv" } 
  }
}`}
                    </pre>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold">Bias Mitigation & Fairness</h4>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="border rounded p-3 space-y-2">
                      <Badge>Regional Context</Badge>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• Emphasizes skills over educational pedigree</li>
                        <li>• Recognizes non-traditional career paths</li>
                        <li>• Supports multilingual CVs (EN, AR, FR)</li>
                        <li>• Awareness of regional employment challenges</li>
                      </ul>
                    </div>
                    <div className="border rounded p-3 space-y-2">
                      <Badge>Fairness Measures</Badge>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        <li>• No discrimination by age/gender/nationality</li>
                        <li>• Focus on demonstrable skills</li>
                        <li>• Transparent scoring criteria</li>
                        <li>• Human-in-the-loop for final decisions</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>AI-Powered Features</CardTitle>
                <CardDescription>
                  Core functionality powered by AI models
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    name: "CV Analysis",
                    function: "analyze-cv",
                    model: "Gemini 2.5 Flash",
                    description: "Parses CVs, extracts text, and provides AI-powered scoring (0-100) with strengths, weaknesses, and improvement suggestions.",
                    features: ["Skills relevance scoring", "Experience depth analysis", "Presentation quality check", "Regional context awareness"]
                  },
                  {
                    name: "Job Matching (Seeker)",
                    function: "match-jobs",
                    model: "Gemini 2.5 Flash",
                    description: "Combines internal database jobs with JSearch API results, then AI-ranks them based on seeker profile and CV.",
                    features: ["Skills match (40% weight)", "Experience level (30%)", "Location proximity (20%)", "CV quality (10%)"]
                  },
                  {
                    name: "Candidate Matching (Company)",
                    function: "match-candidates",
                    model: "Gemini 2.5 Flash",
                    description: "AI-powered candidate ranking for company job postings using multi-factor scoring.",
                    features: ["Skills alignment", "Experience vs. seniority", "CV quality score", "Application relevance"]
                  },
                  {
                    name: "AI Interview System",
                    function: "interview-chat, analyze-behavior",
                    model: "Gemini 2.5 Flash + Pro",
                    description: "Real-time conversational interviewer with video behavioral analysis and comprehensive post-interview reports.",
                    features: ["WebRTC audio streaming", "30s video frame analysis", "SSE real-time responses", "Posture & engagement metrics"]
                  },
                  {
                    name: "Career Insights",
                    function: "career-insights",
                    model: "Gemini 2.5 Flash",
                    description: "Personalized career recommendations based on CV, applications, developer footprint, and market trends.",
                    features: ["Skill development suggestions", "Market trend analysis", "Application outcome analysis", "Regional job opportunities"]
                  },
                  {
                    name: "Developer Footprint Scanner",
                    function: "fetch-github-profile, analyze-footprint",
                    model: "Gemini 2.5 Flash",
                    description: "Aggregates GitHub and StackOverflow data to verify technical skills and quantify contributions.",
                    features: ["GitHub contributions", "Language expertise", "StackOverflow reputation", "Community engagement"]
                  },
                  {
                    name: "Resume Rewriting",
                    function: "rewrite-resume",
                    model: "Gemini 2.5 Flash",
                    description: "AI optimizes resume content for better presentation and ATS compatibility.",
                    features: ["ATS keyword optimization", "Structure improvement", "Content refinement", "Regional formatting"]
                  }
                ].map((feature, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{feature.name}</h4>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{feature.function}</Badge>
                          <Badge variant="secondary" className="text-xs">{feature.model}</Badge>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {feature.features.map((item, i) => (
                        <div key={i} className="text-xs flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Edge Functions</CardTitle>
                <CardDescription>Serverless backend functions (Deno runtime)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b">
                      <tr className="text-left">
                        <th className="pb-2 font-semibold">Function</th>
                        <th className="pb-2 font-semibold">Purpose</th>
                        <th className="pb-2 font-semibold">AI Model</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-xs">
                      {[
                        ["analyze-cv", "Parse and score CVs", "Gemini 2.5 Flash"],
                        ["match-jobs", "Find relevant jobs for seekers", "Gemini 2.5 Flash"],
                        ["match-candidates", "Rank candidates for companies", "Gemini 2.5 Flash"],
                        ["interview-chat", "Real-time AI interviewer", "Gemini 2.5 Flash"],
                        ["analyze-behavior", "Video behavioral analysis", "Gemini 2.5 Pro"],
                        ["generate-profile", "Post-interview summary", "Gemini 2.5 Flash"],
                        ["career-insights", "Personalized career advice", "Gemini 2.5 Flash"],
                        ["rewrite-resume", "AI resume optimization", "Gemini 2.5 Flash"],
                        ["parse-job-description", "Extract structured job data", "Gemini 2.5 Flash"],
                        ["fetch-github-profile", "Scrape GitHub metrics", "N/A"],
                        ["analyze-footprint", "Aggregate developer metrics", "Gemini 2.5 Flash"]
                      ].map(([fn, purpose, model], i) => (
                        <tr key={i}>
                          <td className="py-2 font-mono">{fn}</td>
                          <td className="py-2 text-muted-foreground">{purpose}</td>
                          <td className="py-2">
                            <Badge variant={model === "N/A" ? "outline" : "secondary"} className="text-xs">
                              {model}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TechnicalDocs;