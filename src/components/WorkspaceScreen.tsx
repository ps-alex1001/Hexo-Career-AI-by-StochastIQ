/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import {
  ArrowRight,
  FileTerminal,
  Target,
  Upload,
  Github,
  FileText,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cn, optimizeTextLimit, optimizeScrapedWebText } from "../lib/utils";
import * as pdfjsLib from "pdfjs-dist";
import Tesseract from "tesseract.js";

// Configure worker for pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface WorkspaceScreenProps {
  onAnalyze: (
    resume: string,
    targetType: string,
    targetContent: string,
    githubData?: string,
  ) => void;
  isLoading: boolean;
  progress?: number;
  statusText?: string;
}

type ResumeTab = "pdf" | "github" | "raw";

export function WorkspaceScreen({
  onAnalyze,
  isLoading,
  progress,
  statusText,
}: WorkspaceScreenProps) {
  const [activeTab, setActiveTab] = useState<ResumeTab>("pdf");
  const [isDragging, setIsDragging] = useState(false);
  const [pdfName, setPdfName] = useState<string>("");
  const [pdfText, setPdfText] = useState<string>("");
  const [pdfError, setPdfError] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isFetchingGithub, setIsFetchingGithub] = useState(false);
  const [isScrapingTarget, setIsScrapingTarget] = useState(false);
  const [github, setGithub] = useState("");
  const [rawText, setRawText] = useState("");
  const [warnings, setWarnings] = useState<string[]>([]);

  const [targetType, setTargetType] = useState<"url" | "role">("role");
  const [targetContent, setTargetContent] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validation Patterns
  const githubRegex = /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/i;

  const isGithubValid = github.trim() === "" || githubRegex.test(github.trim());

  const isAnyInputFilled =
    pdfName !== "" || github.trim() !== "" || rawText.trim() !== "";

  const isFormValid =
    isAnyInputFilled && targetContent.trim() !== "" && isGithubValid;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const processFile = async (file: File) => {
    setPdfError(null);
    if (file.name.toLowerCase().endsWith(".pdf")) {
      setPdfName(file.name);
      setIsExtracting(true);
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();

          const items = textContent.items as any[];
          const blocks: {
            minX: number;
            maxX: number;
            minY: number;
            maxY: number;
            items: any[];
          }[] = [];

          for (const item of items) {
            const x = item.transform[4];
            const y = item.transform[5];
            const width = item.width || 0;
            const height = item.height || 10;

            let foundBlock = false;
            for (const block of blocks) {
              const isVerticalClose =
                Math.abs(y - block.minY) < 30 ||
                Math.abs(y - block.maxY) < 30 ||
                (y >= block.minY && y <= block.maxY);
              const isHorizontalClose =
                Math.abs(x - block.minX) < 40 ||
                Math.abs(x + width - block.maxX) < 40 ||
                (x >= block.minX && x <= block.maxX);

              if (isVerticalClose && isHorizontalClose) {
                block.items.push(item);
                block.minX = Math.min(block.minX, x);
                block.maxX = Math.max(block.maxX, x + width);
                block.minY = Math.min(block.minY, y);
                block.maxY = Math.max(block.maxY, y + height);
                foundBlock = true;
                break;
              }
            }

            if (!foundBlock) {
              blocks.push({
                minX: x,
                maxX: x + width,
                minY: y,
                maxY: y + height,
                items: [item],
              });
            }
          }

          // Merge overlapping blocks
          let changed = true;
          while (changed) {
            changed = false;
            for (let m = 0; m < blocks.length; m++) {
              for (let n = m + 1; n < blocks.length; n++) {
                const b1 = blocks[m];
                const b2 = blocks[n];
                const xOverlap = Math.max(
                  0,
                  Math.min(b1.maxX, b2.maxX) - Math.max(b1.minX, b2.minX),
                );
                const yOverlap = Math.max(
                  0,
                  Math.min(b1.maxY, b2.maxY) - Math.max(b1.minY, b2.minY),
                );

                if (xOverlap > -20 && yOverlap > -10) {
                  b1.items.push(...b2.items);
                  b1.minX = Math.min(b1.minX, b2.minX);
                  b1.maxX = Math.max(b1.maxX, b2.maxX);
                  b1.minY = Math.min(b1.minY, b2.minY);
                  b1.maxY = Math.max(b1.maxY, b2.maxY);
                  blocks.splice(n, 1);
                  changed = true;
                  break;
                }
              }
              if (changed) break;
            }
          }

          blocks.sort((a, b) => {
            const verticalOverlap = Math.max(
              0,
              Math.min(a.maxY, b.maxY) - Math.max(a.minY, b.minY),
            );
            if (verticalOverlap > 10) {
              return a.minX - b.minX;
            }
            return b.maxY - a.maxY;
          });

          let pageText = "";
          for (const block of blocks) {
            block.items.sort((a, b) => {
              const yA = a.transform[5];
              const yB = b.transform[5];
              if (Math.abs(yA - yB) > 5) return yB - yA;
              return a.transform[4] - b.transform[4];
            });
            for (let j = 0; j < block.items.length; j++) {
              const item = block.items[j];
              pageText += item.str;

              if (item.hasEOL) {
                pageText += "\n";
              } else if (j < block.items.length - 1) {
                const nextItem = block.items[j + 1];
                const gap =
                  nextItem.transform[4] -
                  (item.transform[4] + (item.width || 0));
                const approxItemWidth = item.width
                  ? item.width / Math.max(1, item.str.length)
                  : 5;
                if (
                  Math.abs(item.transform[5] - nextItem.transform[5]) > 5 ||
                  gap > approxItemWidth
                ) {
                  pageText += " ";
                }
              }
            }
            pageText += "\n\n";
          }

          if (pageText.trim() === "") {
            setPdfError(
              "No text found, running OCR on image-based PDF. This might take a moment...",
            );
            try {
              const viewport = page.getViewport({ scale: 1.5 });
              const canvas = document.createElement("canvas");
              const context = canvas.getContext("2d");
              if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                // @ts-ignore
                await page.render({ canvasContext: context, viewport }).promise;
                const { data } = await Tesseract.recognize(canvas, "eng");
                pageText = data.text;
                setPdfError(null);
              }
            } catch (ocrError) {
              console.error("OCR Error:", ocrError);
            }
          }
          fullText += pageText + "\n";
        }
        if (fullText.trim() === "") {
          setPdfName("");
          setPdfError(
            "Unable to extract text — this PDF has no text layer. Please use the Raw Text tab to paste your resume.",
          );
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } else {
          setPdfText(fullText);
        }
      } catch (error) {
        console.error("Error extracting PDF text:", error);
        setPdfName("");
      } finally {
        setIsExtracting(false);
      }
    } else {
      setPdfError("Only PDF files are allowed.");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const handleSubmit = async () => {
    if (
      !isFormValid ||
      isLoading ||
      isExtracting ||
      isFetchingGithub ||
      isScrapingTarget
    )
      return;

    setWarnings([]);
    let processedTargetContent = targetContent;

    if (targetType === "url") {
      setIsScrapingTarget(true);
      try {
        let urlToScrape = targetContent.trim();
        // Auto format URL if missing scheme
        if (!/^https?:\/\//i.test(urlToScrape)) {
          urlToScrape = "https://" + urlToScrape;
        }

        const encodedUrl = encodeURIComponent(urlToScrape);
        const token = "cd04a6b3aded4feeac8351717d5ce11c112978d95fb";
        const scrapeApiUrl = `https://api.scrape.do/?url=${encodedUrl}&token=${token}`;

        const res = await fetch(scrapeApiUrl);
        if (!res.ok) throw new Error("Scraping failed");

        // Parse the HTML to extract text
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        // Simple extraction: combine title and text content
        const title = doc.title || "";
        const bodyText = doc.body?.innerText || "";
        if (bodyText) {
          const optimizedBody = optimizeScrapedWebText(bodyText, 10000);
          processedTargetContent = `Job URL Context (${urlToScrape}):\nPage Title: ${title}\n\nExtracted Content:\n${optimizedBody}`;
        } else {
          processedTargetContent = `Job URL: ${urlToScrape}`;
        }
      } catch (error) {
        console.error("Error scraping target URL:", error);
        setWarnings(prev => [...prev, "Job listing URL scraping failed. Falling back to URL only."]);
        // Fallback to originally formatted URL
        processedTargetContent = `Job URL: ${targetContent}`;
      } finally {
        setIsScrapingTarget(false);
      }
    }

    // Consolidate input for analysis
    let resumeContent = optimizeTextLimit(pdfText || "", 15000);
    let githubContent = "";

    if (github && isGithubValid) {
      const usernameMatch = github.match(/github\.com\/([a-zA-Z0-9_-]+)/i);
      const username = usernameMatch ? usernameMatch[1] : "";
      if (username) {
        setIsFetchingGithub(true);
        try {
          const headers = { Accept: "application/vnd.github.v3+json" };
          const userRes = await fetch(
            `https://api.github.com/users/${username}`,
            { headers },
          );

          if (userRes.status === 403 || userRes.status === 429) {
            throw new Error("Rate limit exceeded");
          }
          if (!userRes.ok) throw new Error("User fetch failed");
          const userData = await userRes.json();

          const reposRes = await fetch(
            `https://api.github.com/users/${username}/repos?sort=pushed&per_page=100`,
            { headers },
          );
          if (!reposRes.ok) throw new Error("Repos fetch failed");
          const reposData = await reposRes.json();

          let githubText = `GitHub Profile (@${username}):\n`;
          if (userData.name) githubText += `Name: ${userData.name}\n`;
          if (userData.bio) githubText += `Bio: ${userData.bio}\n`;

          const details = [];
          if (userData.location) details.push(`Location: ${userData.location}`);
          if (userData.company) details.push(`Company: ${userData.company}`);
          if (details.length > 0) githubText += `${details.join(" | ")}\n`;

          githubText += `Public Repos: ${userData.public_repos ?? 0} | Followers: ${userData.followers ?? 0}\n\n`;

          const nonForkRepos = reposData.filter((r: any) => r.fork === false);

          // Language statistics
          const langCounts: Record<string, number> = {};
          nonForkRepos.forEach((r: any) => {
            if (r.language) {
              langCounts[r.language] = (langCounts[r.language] || 0) + 1;
            }
          });
          const topLanguages = Object.entries(langCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map((entry) => entry[0]);

          if (topLanguages.length > 0) {
            githubText += `Top Languages: ${topLanguages.join(", ")}\n\n`;
          }

          // Sort repos by stars for top repositories
          const topRepos = [...nonForkRepos]
            .sort((a: any, b: any) => b.stargazers_count - a.stargazers_count)
            .slice(0, 5);

          githubText += `Top Repositories:\n`;
          if (topRepos.length > 0) {
            for (const repo of topRepos) {
              const cleanDesc = repo.description
                ? repo.description.length > 100
                  ? repo.description.substring(0, 100) + "..."
                  : repo.description
                : "No description";
              githubText += `- ${repo.name} [${repo.language || "N/A"}] ★${repo.stargazers_count}: ${cleanDesc}\n`;
              if (repo.topics && repo.topics.length > 0) {
                githubText += `  Topics: ${repo.topics.slice(0, 5).join(", ")}\n`;
              }
            }
          } else {
            githubText += `- No public repositories found.\n`;
          }

          // Recent activity/contributions (most recently pushed)
          const recentRepos = [...nonForkRepos]
            .sort(
              (a: any, b: any) =>
                new Date(b.pushed_at).getTime() -
                new Date(a.pushed_at).getTime(),
            )
            .slice(0, 3);
          if (recentRepos.length > 0) {
            githubText += `\nRecently Active Repositories:\n`;
            for (const repo of recentRepos) {
              githubText += `- ${repo.name} (last pushed: ${new Date(repo.pushed_at).toLocaleDateString()})\n`;
            }
          }

          githubContent = githubText;
        } catch (error: any) {
          if (error.message === "Rate limit exceeded") {
            setWarnings(prev => [...prev, "GitHub rate limit exceeded. Falling back to basic profile URL analysis."]);
            githubContent = `GitHub Profile: ${github}\n(Note: Detailed GitHub data could not be fetched due to API rate limits.)\n`;
          } else {
            setWarnings(prev => [...prev, "Failed to analyze GitHub profile. Ensure it is a valid public user."]);
            githubContent = `GitHub Profile: ${github}\n`;
          }
        } finally {
          setIsFetchingGithub(false);
        }
      } else {
        githubContent = `GitHub Profile: ${github}\n`;
      }
    }

    if (rawText)
      resumeContent += `\nAdditional Context/Text:\n${optimizeTextLimit(rawText, 5000)}\n`;

    onAnalyze(resumeContent, targetType, processedTargetContent, githubContent);
  };

  const tabs = [
    { id: "pdf" as const, label: "Resume Upload", icon: Upload },
    { id: "github" as const, label: "GitHub Profile", icon: Github },
    { id: "raw" as const, label: "Raw Text", icon: FileText },
  ];

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-transparent relative z-10 w-full pt-10">
      <div className="w-full max-w-[900px] flex flex-col gap-6">
        <div className="mb-4">
          <h2 className="text-3xl font-bold tracking-tight dark:text-white text-slate-900 mb-2 font-sans">
            Analysis Workspace
          </h2>
          <p className="dark:text-white/50 text-slate-600 font-sans">
            Input your professional data and target job to identify your gaps
            and build your bridge.
          </p>
        </div>

        {/* Resume Input Section with Tabs */}
        <div className="glass-panel border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl flex flex-col pointer-events-auto">
          {/* Tab Headers */}
          <div className="dark:bg-black bg-slate-50/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-2 flex items-center overflow-x-auto no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-4 text-[10px] font-mono uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                    isActive
                      ? "text-purple-600 dark:text-purple-400 border-purple-600 dark:border-purple-500 bg-white dark:bg-white/5"
                      : "dark:text-white/40 text-slate-500 border-transparent hover:text-slate-900 dark:hover:text-white dark:hover:bg-white/5 hover:bg-slate-100/50",
                  )}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="flex relative dark:bg-black/20 bg-white/40 backdrop-blur-md min-h-[300px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex"
              >
                {activeTab === "pdf" && (
                  <div className="flex-1 p-8 flex flex-col items-center justify-center">
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                    />
                    <div
                      onClick={() =>
                        !isExtracting && fileInputRef.current?.click()
                      }
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      className={cn(
                        "w-full max-w-md border-2 border-dashed rounded-xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                        pdfName
                          ? "border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-purple-500/10 text-slate-900 dark:text-white backdrop-blur-sm shadow-sm"
                          : isDragging
                            ? "border-purple-600 dark:border-purple-500 bg-purple-50 dark:bg-white/5 text-purple-600 dark:text-white scale-[1.02]"
                            : "dark:border-white/10 border-slate-200 dark:hover:border-white/20 hover:border-slate-300 dark:bg-white/5 bg-white/40 backdrop-blur-md hover:bg-white/60 dark:hover:bg-white/10",
                        isExtracting && "opacity-50 cursor-wait",
                      )}
                    >
                      {isExtracting ? (
                        <>
                          <Loader2
                            size={28}
                            className="animate-spin text-purple-600 dark:text-purple-400"
                          />
                          <p className="text-sm font-medium dark:text-white/50 text-slate-600">
                            Extracting Text...
                          </p>
                        </>
                      ) : pdfName ? (
                        <>
                          <div className="w-14 h-14 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center shadow-lg border border-purple-400/20">
                            <CheckCircle2 size={28} />
                          </div>
                          <div className="text-center">
                            <p className="dark:text-white text-slate-900 font-semibold text-base mb-1">
                              {pdfName}
                            </p>
                            <p className="dark:text-purple-400 text-purple-600 text-xs font-mono uppercase tracking-widest font-bold">
                              Successfully Vectorized
                            </p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-12 h-12 rounded-full dark:bg-white/5 bg-slate-100 flex items-center justify-center dark:text-white/40 text-slate-400 shadow-inner">
                            <Upload size={24} />
                          </div>
                          <div className="text-center">
                            <p className="dark:text-white/70 text-slate-800 font-medium text-sm mb-1 font-sans">
                              Upload your resume (PDF)
                            </p>
                            <p className="dark:text-white/40 text-slate-400 text-xs font-sans">
                              Drag and drop or click to browse
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    {pdfError && (
                      <p className="mt-3 text-red-600 dark:text-red-400 text-[10px] font-mono uppercase tracking-wider animate-in fade-in slide-in-from-top-1 max-w-md text-center font-bold">
                        {pdfError}
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "github" && (
                  <div className="flex-1 p-8 flex flex-col justify-center max-w-2xl mx-auto w-full">
                    <label className="text-xs font-mono dark:text-white/40 text-slate-400 uppercase tracking-widest mb-3 block">
                      GitHub Profile Link
                    </label>
                    <div className="relative group">
                      <div
                        className={cn(
                          "absolute left-4 top-1/2 -translate-y-1/2 transition-colors",
                          !isGithubValid
                            ? "text-red-500"
                            : "text-slate-400 group-focus-within:text-purple-600 dark:group-focus-within:text-purple-400",
                        )}
                      >
                        {isGithubValid ? (
                          <Github size={20} />
                        ) : (
                          <AlertCircle size={20} />
                        )}
                      </div>
                      <input
                        type="text"
                        className={cn(
                          "w-full dark:bg-white/5 bg-white/60 backdrop-blur-md border rounded-lg py-4 pl-12 pr-4 dark:text-white text-slate-900 font-mono text-sm focus:outline-none focus:ring-1 transition-all",
                          !isGithubValid
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                            : "dark:border-white/10 border-slate-200 focus:border-purple-600 dark:focus:border-purple-400 focus:ring-purple-600/20 dark:focus:ring-purple-400/20",
                        )}
                        placeholder="https://github.com/yourusername"
                        value={github}
                        onChange={(e) => setGithub(e.target.value)}
                      />
                    </div>
                    {!isGithubValid && (
                      <p className="mt-2 text-red-500 text-[10px] font-mono uppercase tracking-wider animate-in fade-in slide-in-from-top-1">
                        Invalid GitHub URL format
                      </p>
                    )}
                  </div>
                )}

                {activeTab === "raw" && (
                  <div className="flex-1 flex relative w-full overflow-hidden h-[400px]">
                    <div
                      className="w-12 border-r dark:border-white/10 border-slate-200 flex flex-col items-end pt-[3.5rem] pr-3 text-slate-400/60 dark:text-white/20 font-mono text-[11px] select-none dark:bg-black/20 bg-slate-50 backdrop-blur-sm overflow-hidden"
                      id="line-numbers-container"
                    >
                      {Array.from({ length: 500 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-6 flex items-center justify-end"
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 flex flex-col dark:bg-transparent bg-white overflow-hidden relative">
                      <div className="absolute top-4 left-4 z-10 pointer-events-none">
                        <label className="text-[10px] font-mono dark:text-white/40 text-slate-400 uppercase tracking-widest block">
                          Paste Resume Text
                        </label>
                      </div>
                      <textarea
                        onScroll={(e) => {
                          const lineNumbers = document.getElementById(
                            "line-numbers-container",
                          );
                          if (lineNumbers) {
                            lineNumbers.scrollTop = (
                              e.target as HTMLTextAreaElement
                            ).scrollTop;
                          }
                        }}
                        className="flex-1 bg-transparent dark:text-white/80 text-slate-700 font-mono text-sm focus:outline-none resize-none px-4 pt-[3.5rem] pb-4 leading-6 overflow-y-auto whitespace-pre custom-scrollbar"
                        placeholder="Paste your resume summary here...
(Use Enter for new lines)"
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        spellCheck={false}
                      />
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Target Vector Section */}
        <div className="glass-panel border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="dark:bg-black bg-slate-50/80 backdrop-blur-md border-b border-slate-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Target size={18} className="dark:text-white/40 text-slate-400" />
              <span className="text-xs font-mono dark:text-white/40 text-slate-500 uppercase tracking-wider">
                Target.Vector
              </span>
            </div>

            <div className="dark:bg-black bg-white rounded p-0.5 flex border border-slate-200 dark:border-white/10">
              <button
                onClick={() => setTargetType("role")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                  targetType === "role"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "dark:text-white/40 text-slate-400 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                Role Discovery
              </button>
              <button
                onClick={() => setTargetType("url")}
                className={cn(
                  "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                  targetType === "url"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "dark:text-white/40 text-slate-400 hover:text-slate-900 dark:hover:text-white",
                )}
              >
                Job URL
              </button>
            </div>
          </div>
          <div className="p-4 dark:bg-black/30 bg-white/50">
            <input
              className="w-full bg-transparent border-b border-slate-200 dark:border-white/10 dark:text-white text-slate-900 font-mono text-sm pb-2 focus:outline-none focus:border-purple-600 dark:focus:border-purple-400 transition-colors"
              placeholder={
                targetType === "role"
                  ? "e.g. Senior Frontend Engineer, Google"
                  : "https://careers.company.com/job/123"
              }
              value={targetContent}
              onChange={(e) => setTargetContent(e.target.value)}
            />
          </div>
        </div>

        {/* Progress Bar */}
        <AnimatePresence>
          {(isLoading || isFetchingGithub || isScrapingTarget) && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              exit={{ opacity: 0, height: 0, y: -10 }}
              className="w-full mt-2 overflow-hidden"
            >
              <div className="flex justify-between mb-2">
                <span className="text-[11px] font-mono dark:text-white/40 text-slate-500 uppercase tracking-widest">
                  {isLoading
                    ? statusText || "Processing..."
                    : isScrapingTarget
                      ? "Scraping Job URL..."
                      : isFetchingGithub
                        ? "Fetching GitHub..."
                        : "Preparing..."}
                </span>
                <span className="text-[11px] font-mono dark:text-white text-slate-800 font-bold tracking-widest">
                  {isLoading
                    ? progress || 0
                    : isScrapingTarget
                      ? 15
                      : isFetchingGithub
                        ? 30
                        : 5}
                  %
                </span>
              </div>
              <div className="w-full dark:bg-white/5 bg-slate-100 rounded-full h-1.5 overflow-hidden border dark:border-white/5 border-slate-200 shadow-inner">
                <motion.div
                  className="bg-purple-600 dark:bg-purple-500 h-full rounded-full relative"
                  initial={{ width: "0%" }}
                  animate={{
                    width: `${isLoading ? progress || 0 : isScrapingTarget ? 15 : isFetchingGithub ? 30 : 5}%`,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <div
                    className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_1s_infinite] -translate-x-full"
                    style={{
                      backgroundImage:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                    }}
                  ></div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {warnings.length > 0 && (
          <div className="w-full mt-4 flex flex-col gap-2">
            {warnings.map((warning, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg text-yellow-800 dark:text-yellow-200 text-xs"
              >
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <p>{warning}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="flex w-full items-end justify-end mt-4">
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <button
              onClick={handleSubmit}
              disabled={
                !isFormValid ||
                isLoading ||
                isFetchingGithub ||
                isScrapingTarget
              }
              className={cn(
                "group relative overflow-hidden text-white px-8 py-3.5 rounded text-sm font-medium transition-all flex items-center gap-2",
                isLoading || isFetchingGithub || isScrapingTarget
                  ? "dark:bg-white/5 bg-slate-100 dark:text-white/40 text-slate-400 cursor-not-allowed border dark:border-white/10 border-slate-200"
                  : "bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-400 text-white shadow-lg shadow-purple-500/20",
              )}
            >
              {!isLoading && !isFetchingGithub && !isScrapingTarget && (
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              )}

              {isLoading || isFetchingGithub || isScrapingTarget ? (
                <>
                  <Loader2
                    size={16}
                    className="animate-spin text-purple-600 dark:text-purple-400"
                  />
                  <span className="animate-pulse">Processing...</span>
                </>
              ) : (
                <>
                  Initialize Analysis
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {!isAnyInputFilled && !isLoading && (
              <motion.p
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-slate-500 dark:text-white/30 text-[10px] font-mono uppercase tracking-[0.2em] font-bold"
              >
                Provide at least one input to begin analysis.
              </motion.p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
