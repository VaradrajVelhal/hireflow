import { useState } from "react";

/**
 * Accordion component displaying interview topics that can be expanded.
 * @param {Object} props
 * @param {string[]} props.interviewTopics - Array of topics suggested by the AI
 */
export function InterviewTopics({ interviewTopics = [] }) {
  const [openIndex, setOpenIndex] = useState(null);

  if (interviewTopics.length === 0) return null;

  const toggleIndex = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Helper to parse topic strings that may contain "Title: Description"
  const parseTopic = (topicStr) => {
    const colonIndex = topicStr.indexOf(":");
    if (colonIndex !== -1) {
      const title = topicStr.slice(0, colonIndex).trim();
      const description = topicStr.slice(colonIndex + 1).trim();
      return { title, description };
    }
    return {
      title: topicStr,
      description: "Review your portfolio projects and experience related to this topic. Be prepared to discuss key architecture decisions, challenges encountered, and how you overcame them.",
    };
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      <h4 className="text-sm font-black uppercase tracking-wider text-slate-450">
        Recommended Interview Preparation Topics
      </h4>
      <div className="border border-slate-800 rounded-3xl overflow-hidden bg-slate-900/60 divide-y divide-slate-850/80 shadow-lg">
        {interviewTopics.map((topic, index) => {
          const { title, description } = parseTopic(topic);
          const isOpen = openIndex === index;

          return (
            <div key={index} className="transition-all duration-350">
              {/* Accordion Header */}
              <button
                onClick={() => toggleIndex(index)}
                className={`w-full flex items-center justify-between p-5 text-left font-semibold text-slate-200 transition-all duration-300 cursor-pointer ${
                  isOpen ? "bg-indigo-500/5 text-indigo-400" : "hover:bg-slate-800/20"
                }`}
              >
                <span className="text-sm md:text-base pr-4 flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center font-mono border transition-all duration-300 ${
                    isOpen 
                      ? "bg-indigo-500 text-slate-950 border-indigo-400" 
                      : "bg-slate-950 border-slate-800 text-indigo-400"
                  }`}>
                    {index + 1}
                  </span>
                  {title}
                </span>
                
                {/* Arrow Icon */}
                <svg
                  className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? "transform rotate-180 text-indigo-400" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Accordion Content */}
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <div className="p-5 text-slate-355 bg-slate-950/20 text-sm leading-relaxed border-t border-slate-800/40 font-medium">
                  {description}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default InterviewTopics;
