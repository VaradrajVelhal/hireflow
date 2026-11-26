import { useMemo } from "react";
import { prepareJobDescription } from "../utils/jobDescription";

/**
 * Safely renders a job description in either compact card preview mode
 * or full formatted details mode.
 */
function JobDescription({ description, variant = "preview", className = "" }) {
  const prepared = useMemo(
    () => prepareJobDescription(description),
    [description]
  );

  if (prepared.mode === "empty") {
    return null;
  }

  const variantClass =
    variant === "full" ? "job-description-full" : "job-description-preview";

  if (prepared.mode === "text") {
    const textVariantClass =
      variant === "full"
        ? "whitespace-pre-line text-slate-300 text-sm leading-relaxed"
        : "text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 font-medium";

    return (
      <p className={`${textVariantClass} ${className}`.trim()}>
        {prepared.content}
      </p>
    );
  }

  return (
    <div
      className={`${variantClass} ${className}`.trim()}
      dangerouslySetInnerHTML={{ __html: prepared.content }}
    />
  );
}

export default JobDescription;
