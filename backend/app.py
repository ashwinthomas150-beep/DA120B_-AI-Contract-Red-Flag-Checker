# Backend API & PDF Extraction — Rizul Thakur
from flask import Flask, request, jsonify
from flask_cors import CORS
import openai
import os
import json
import re
import PyPDF2
import io
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app, origins=os.getenv("ALLOWED_ORIGINS", "*"))

openai.api_key = os.getenv("OPENAI_API_KEY")

SYSTEM_PROMPT = """You are a senior legal risk analyst specializing in contract review for individuals (employees, freelancers, tenants). Your job is to identify clauses that are risky, one-sided, or unusual for the signer.

Return ONLY valid JSON — no markdown, no explanation outside the JSON. Use this exact schema:

{
  "overall_risk": "HIGH" | "MEDIUM" | "LOW" | "SAFE",
  "overall_summary": "2-3 sentence plain-English summary of the contract's risk profile",
  "contract_type": "Employment" | "NDA" | "Rental" | "Freelance" | "Service" | "Other",
  "flags": [
    {
      "id": 1,
      "risk_level": "HIGH" | "MEDIUM" | "LOW",
      "category": "Non-Compete" | "IP" | "Arbitration" | "Termination" | "Compensation" | "Confidentiality" | "Liability" | "Other",
      "title": "Short title of the issue",
      "clause_excerpt": "Relevant quote or paraphrase from the contract (max 80 words)",
      "explanation": "Plain-English explanation of why this is risky for the signer",
      "recommendation": "Specific action the signer should take or negotiate"
    }
  ]
}

Risk levels:
- HIGH: Significant legal, financial, or career risk. Requires attention before signing.
- MEDIUM: Unfavorable or restrictive. Worth negotiating if possible.
- LOW: Noteworthy but not immediately harmful.

Order flags by risk (HIGH first). Be thorough — a missed red flag is worse than a false positive."""


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
    pages = []
    for page in reader.pages[:20]:  # max 20 pages
        pages.append(page.extract_text() or "")
    return "\n\n".join(pages)


def analyze_contract(contract_text: str) -> dict:
    truncated = contract_text[:12000]  # ~3k tokens context

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": f"Analyze this contract:\n\n---\n{truncated}\n---"}
        ],
        temperature=0.2,
        max_tokens=2500,
        response_format={"type": "json_object"}
    )

    raw = response.choices[0].message.content
    # Strip any accidental markdown fences
    clean = re.sub(r"^```json\s*", "", raw.strip())
    clean = re.sub(r"```\s*$", "", clean)
    return json.loads(clean)


# ── ROUTES ──────────────────────────────────────────

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/analyze/text", methods=["POST"])
def analyze_text():
    data = request.get_json(silent=True)
    if not data or not data.get("text"):
        return jsonify({"error": "No contract text provided"}), 400

    text = data["text"].strip()
    if len(text) < 100:
        return jsonify({"error": "Contract text too short"}), 400

    try:
        result = analyze_contract(text)
        return jsonify(result)
    except json.JSONDecodeError:
        return jsonify({"error": "AI returned malformed response. Try again."}), 500
    except openai.OpenAIError as e:
        return jsonify({"error": f"OpenAI error: {str(e)}"}), 502
    except Exception as e:
        return jsonify({"error": f"Unexpected error: {str(e)}"}), 500


@app.route("/api/analyze/pdf", methods=["POST"])
def analyze_pdf():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if not file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are accepted"}), 400

    try:
        pdf_bytes = file.read()
        text = extract_text_from_pdf(pdf_bytes)
        if len(text.strip()) < 100:
            return jsonify({"error": "Could not extract enough text from PDF"}), 400

        result = analyze_contract(text)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": f"Failed to process PDF: {str(e)}"}), 500


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    debug = os.getenv("FLASK_ENV", "production") == "development"
    app.run(host="0.0.0.0", port=port, debug=debug)
