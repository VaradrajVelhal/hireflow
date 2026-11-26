import os
import fitz


class ResumeExtractionError(Exception):
    """Raised when a resume PDF cannot be opened or contains no readable text."""


def extract_resume_text(pdf_path):
    if not pdf_path or not os.path.exists(pdf_path):
        raise ResumeExtractionError(
            "Uploaded resume file could not be found on the server. Please re-upload your PDF."
        )

    try:
        with fitz.open(pdf_path) as doc:
            if doc.needs_pass:
                raise ResumeExtractionError(
                    "The uploaded PDF is password-protected. Please upload an unlocked PDF."
                )

            pages_text = [page.get_text() for page in doc]
    except ResumeExtractionError:
        raise
    except (fitz.FileDataError, RuntimeError, ValueError, OSError) as exc:
        raise ResumeExtractionError(
            "Unable to read the uploaded PDF. The file may be corrupted or not a valid PDF."
        ) from exc

    text = "\n".join(pages_text).strip()
    if not text:
        raise ResumeExtractionError(
            "Could not extract text from the uploaded resume. Scanned or image-only PDFs are not supported."
        )

    return text
