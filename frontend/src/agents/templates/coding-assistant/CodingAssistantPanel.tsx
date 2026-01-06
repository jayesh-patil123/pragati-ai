import React, { useEffect, useState } from "react";

/* ----------------------------- Types ----------------------------- */

type SkillLevel = "Beginner" | "Intermediate" | "Advanced";
type LearningMode = "Explain" | "Mentor" | "Quiz Me" | "Solve Together";
type Language = "javascript" | "python" | "java";

type AiOutputItem = {
  id: number;
  title: string;
  prompt: string;
  text: string;
};

type Quiz = {
  title: string;
  questions: { question: string }[];
};

type ModuleSuggestion = {
  title: string;
  duration: string;
  level: string;
};

/* --------------------------- Component --------------------------- */

export default function CodingAssistantPanel(): React.ReactElement {
  const [skill, setSkill] = useState<SkillLevel>("Intermediate");
  const [mode, setMode] = useState<LearningMode>("Explain");
  const [language, setLanguage] = useState<Language>("javascript");
  const [progress, setProgress] = useState<number>(27);
  const [selectedTrack, setSelectedTrack] = useState<string>("Web Development");

  const [code, setCode] = useState<string>(sampleCode("javascript"));
  const [aiOutput, setAiOutput] = useState<AiOutputItem[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    setCode(sampleCode(language));
  }, [language]);

  /* ------------------------- Handlers / Actions ------------------------- */

  async function callAi(action: "explain" | "review" | "generateQuiz" | "run") {
    setLoading(true);
    const prompt = `${action} | mode:${mode} | skill:${skill} | lang:${language}`;

    // artificial latency for UX demo
    await new Promise((resolve) => setTimeout(resolve, 600));

    let resultText = "";
    if (action === "explain") {
      resultText = explainCodeSnippet(code, skill, language);
    } else if (action === "review") {
      resultText = reviewCodeSnippet(code, language);
    } else if (action === "generateQuiz") {
      const q = generateQuizFor(code, language, skill);
      setQuiz(q);
      resultText = `Generated ${q.questions.length} practice questions.`;
    } else if (action === "run") {
      resultText =
        "⚠️ This demo doesn't execute code. Use a sandbox or your local environment to run code. Simulated output:\n" +
        simulateRun(code, language);
    } else {
      resultText = `Unknown action: ${action}`;
    }

    const item: AiOutputItem = {
      id: Date.now(),
      title: action,
      prompt,
      text: resultText,
    };

    setAiOutput((prev) => [item, ...prev].slice(0, 15));
    setLoading(false);
  }

  function handleModeChange(m: LearningMode) {
    setMode(m);
  }

  function handleProgressAdd(delta: number) {
    setProgress((p) => Math.min(100, Math.max(0, p + delta)));
  }

  function handleReloadSample() {
    setCode(sampleCode(language));
    // small UX feedback in outputs
    setAiOutput((prev) => [
      {
        id: Date.now(),
        title: "reloadSample",
        prompt: `reload | lang:${language}`,
        text: `Reloaded sample for ${language.toUpperCase()}.`,
      },
      ...prev,
    ].slice(0, 15));
  }

  /* ----------------------------- Render ----------------------------- */

  return (
    <div className="max-w-4xl mx-auto p-4 bg-white rounded-2xl shadow-md border border-slate-200">
      {/* Minimal header: only the learning-track selector */}
      <header className="flex items-center justify-end gap-4">
        <div className="text-xs text-slate-500">Learning Track</div>
        <select
          value={selectedTrack}
          onChange={(e) => setSelectedTrack(e.target.value)}
          className="text-xs rounded-md border px-2 py-1"
        >
          <option>Web Development</option>
          <option>Data Science</option>
          <option>AI / ML</option>
          <option>Cybersecurity</option>
          <option>DevOps</option>
        </select>
      </header>

      <main className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left column: controls & progress */}
        <section className="md:col-span-1 space-y-3">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-xs text-slate-600">Skill Level</div>
            <div className="mt-2">
              <select
                value={skill}
                onChange={(e) => setSkill(e.target.value as SkillLevel)}
                className="w-full text-xs rounded-md border px-2 py-1"
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-xs text-slate-600">Learning Mode</div>
            <div className="mt-2 flex gap-2 flex-wrap">
              {(["Explain", "Mentor", "Quiz Me", "Solve Together"] as LearningMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={`text-xs px-3 py-1 rounded-full border ${
                    mode === m ? "bg-indigo-600 text-white" : "bg-white text-slate-700"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-xs text-slate-600">Primary Language</div>
            <div className="mt-2">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full text-xs rounded-md border px-2 py-1"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-600">Progress</div>
                <div className="text-sm font-semibold text-slate-800 mt-1">{progress}% complete</div>
              </div>

              <div className="w-16 h-16 flex items-center justify-center">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-slate-800"
                  style={{
                    background: `conic-gradient(#6366F1 ${progress}%, #E6E9EE ${progress}%)`,
                  }}
                >
                  {progress}%
                </div>
              </div>
            </div>

            <div className="mt-3 flex gap-2">
              <button onClick={() => handleProgressAdd(5)} className="text-xs px-2 py-1 rounded-md border">
                +5%
              </button>
              <button onClick={() => handleProgressAdd(-5)} className="text-xs px-2 py-1 rounded-md border">
                -5%
              </button>
              <button onClick={() => setProgress(100)} className="text-xs px-3 py-1 rounded-md border">
                Mark Done
              </button>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border text-xs">
            <div className="font-semibold text-slate-800">Recommended Next</div>
            <ol className="list-decimal pl-5 mt-2 space-y-1 text-slate-700">
              <li>Complete "Intro to {selectedTrack}" module</li>
              <li>Practice 3 coding quizzes</li>
              <li>Schedule a 1:1 mentor session</li>
            </ol>
          </div>
        </section>

        {/* Middle column: code editor */}
        <section className="md:col-span-1 bg-slate-50 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-600">Code Editor</div>
              <div className="text-xs text-slate-500">{language.toUpperCase()} — {skill}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleReloadSample} className="text-xs px-3 py-1 rounded-md border">
                Reload Sample
              </button>
            </div>
          </div>

          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            className="mt-3 w-full text-xs font-mono rounded-md border p-2 bg-white"
          />

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => callAi("explain")}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-md bg-blue-600 text-white"
            >
              Explain
            </button>
            <button
              onClick={() => callAi("review")}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-md border"
            >
              Review
            </button>
            <button
              onClick={() => callAi("generateQuiz")}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-md bg-green-600 text-white"
            >
              Generate Quiz
            </button>
            <button
              onClick={() => callAi("run")}
              disabled={loading}
              className="text-xs px-3 py-1 rounded-md border"
            >
              Run (Sim)
            </button>
          </div>
        </section>

        {/* Right column: outputs & suggested modules */}
        <section className="md:col-span-1 space-y-3">
          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="flex items-center justify-between">
              <div className="text-xs text-slate-600">AI Responses</div>
              <div className="text-xs text-slate-400">{loading ? "Processing..." : `${aiOutput.length} items`}</div>
            </div>

            <div className="mt-2 space-y-2 max-h-56 overflow-auto">
              {aiOutput.length === 0 && <div className="text-xs text-slate-500">No responses yet — try Explain or Review</div>}
              {aiOutput.map((r) => (
                <div key={r.id} className="p-2 bg-white rounded-md border text-xs">
                  <div className="font-semibold text-slate-800">{r.title}</div>
                  <div className="text-slate-500 text-[11px] mt-1 whitespace-pre-wrap">{r.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-xs text-slate-600">Suggested Modules</div>
            <div className="mt-2 space-y-2 text-xs">
              {suggestedModules(selectedTrack, language).map((m) => (
                <div key={m.title} className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full mt-2 bg-indigo-500" />
                  <div>
                    <div className="font-semibold text-slate-800">{m.title}</div>
                    <div className="text-slate-500 text-[12px]">{m.duration} • {m.level}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded-lg border">
            <div className="text-xs text-slate-600">Practice Quiz</div>
            <div className="mt-2 text-xs">
              {!quiz && <div className="text-slate-500">Generate a quiz from the editor content.</div>}
              {quiz && (
                <div>
                  <div className="font-semibold text-slate-800">{quiz.title}</div>
                  <ol className="pl-5 list-decimal mt-2 space-y-1">
                    {quiz.questions.slice(0, 3).map((q, i) => (
                      <li key={i} className="text-slate-700">{q.question}</li>
                    ))}
                  </ol>

                  <div className="mt-2 flex gap-2">
                    <button
                      onClick={() => {
                        try {
                          navigator.clipboard?.writeText(JSON.stringify(quiz, null, 2));
                        } catch {
                          // clipboard may fail in some contexts; fail silently
                        }
                      }}
                      className="text-xs px-3 py-1 rounded-md border"
                    >
                      Copy JSON
                    </button>
                    <button onClick={() => setQuiz(null)} className="text-xs px-3 py-1 rounded-md">Clear</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer className="mt-4 text-xs text-slate-500 flex items-center justify-between">
        <div /> {/* intentionally empty - no branding text */}
        <div className="flex gap-2">
          <button className="text-xs px-3 py-1 rounded-full border">Open Lesson</button>
          <button className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white">Start Guided Session</button>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------- Helper functions ------------------------- */

function sampleCode(lang: Language): string {
  if (lang === "python") {
    return `# sample\n\ndef greet(name):\n    return f"Hello, {name}!"\n\nprint(greet("Student"))\n`;
  }
  if (lang === "java") {
    return `// sample\npublic class Hello {\n  public static void main(String[] args) {\n    System.out.println("Hello Student");\n  }\n}\n`;
  }
  // default javascript
  return `// sample\nfunction greet(name) {\n  return \`Hello, \${name}!\`;\n}\nconsole.log(greet('Student'));\n`;
}

/**
 * explainCodeSnippet uses preview and nextConceptsFor.
 * keep signature explicit; both code and skill are used (skill passed into nextConceptsFor even if not used)
 */
function explainCodeSnippet(code: string, skill: SkillLevel, lang: Language): string {
  const preview = code.split("\n").slice(0, 6).join("\n");
  const concepts = nextConceptsFor(lang).join("\n- ");
  return `Explanation (level: ${skill}, lang: ${lang}):\n\n1) What this code does:\n${snippetSummary(preview)}\n\n2) Key concepts to learn next:\n- ${concepts}`;
}

/**
 * reviewCodeSnippet legitimately reads `code`.
 */
function reviewCodeSnippet(code: string, lang: Language): string {
  const notes: string[] = [];
  if (lang === "javascript" && code.includes("console.log")) {
    notes.push("- Uses console logging for output (good for debugging).");
  }
  if (code.trim().length < 30) {
    notes.push("- Code is very short — consider adding tests or edge-cases.");
  }
  notes.push("- Suggestion: Add comments and split large logic into functions.");
  return `Review notes:\n${notes.join("\n")}`;
}

/**
 * generateQuizFor: original signature accepted `code` but didn't use it.
 * rename to `_code` so linter knows it's intentionally unused.
 */
function generateQuizFor(_code: string, lang: Language, skill: SkillLevel): Quiz {
  const title = `Practice: ${lang.toUpperCase()} (${skill})`;
  const qs = [
    { question: `What is the output of the code? (Explain briefly)` },
    { question: `Identify one improvement to the code and why.` },
    { question: `List 2 edge cases this code doesn't handle.` },
  ];
  return { title, questions: qs };
}

/**
 * simulateRun: doesn't need the code parameter, only lang used for simulated output.
 * rename to `_code` to avoid unused-param warning.
 */
function simulateRun(_code: string, lang: Language): string {
  if (lang === "python") return "Hello, Student!";
  if (lang === "java") return "Hello Student";
  return "Hello, Student!";
}

/**
 * snippetSummary uses the `code` arg.
 */
function snippetSummary(code: string): string {
  const firstLine = code.split("\n")[0] || "";
  return `High-level: This snippet begins with: "${firstLine.trim()}"`;
}

/**
 * nextConceptsFor previously accepted a `skill` parameter that wasn't used.
 * rename to `_skill` to silence linter while keeping the API stable.
 */
function nextConceptsFor(lang: Language): string[] {
  if (lang === "javascript") {
    return ["Functions & scope", "Async (Promises/async-await)", "DOM basics (for web)"];
  }
  if (lang === "python") {
    return ["Functions & modules", "List comprehensions", "Virtual environments & packages"];
  }
  return ["Language fundamentals", "Best practices", "Testing & debugging"];
}

function suggestedModules(track: string, lang: Language): ModuleSuggestion[] {
  return [
    { title: `Intro to ${track}`, duration: "1h", level: "Beginner" },
    { title: `${lang.toUpperCase()} Fundamentals`, duration: "2h", level: "Beginner" },
    { title: `Applied ${track} Project`, duration: "4h", level: "Intermediate" },
  ];
}
