# Module 4: Prompt Engineering & Structured Output

**Exam Weight:** 20% | **Task Statements:** 6 | **Estimated Study Time:** 4-5 hours

---

## Overview

This module covers the critical techniques for designing precise, reliable prompts and implementing structured output patterns that scale. You'll learn how to move from vague instructions to explicit criteria, leverage few-shot examples, enforce output schemas, implement validation loops, and architect systems for batch processing and multi-instance review.

**Key Principle:** Precision in prompting is not about longer prompts—it's about *specific*, *categorical* criteria paired with concrete examples.

---

## Task 4.1: Design Prompts with Explicit Criteria

### Learning Objectives
- Understand why explicit criteria outperform general instructions
- Design prompts that reduce false positives through specificity
- Define clear report-vs-skip decision boundaries
- Measure and improve precision in classification tasks

### Core Concepts

#### The Vague vs. Explicit Criteria Problem

**Ineffective (Vague):**
```
Review this code comment for accuracy. Be conservative and check that
comments are accurate. Flag any that seem wrong.
```

Problems:
- "Be conservative" means different things to different inference runs
- No clear threshold for what constitutes "wrong"
- Model must infer the decision boundary from context alone
- High false positive rate (flags legitimate variations)

**Effective (Explicit):**
```
Review this code comment. Flag ONLY when:
1. Comment claims a specific behavior (e.g., "returns lowercase string")
2. The actual code contradicts this claim
3. The contradiction is due to the function logic, not variable inputs

SKIP if:
- Comment is descriptive but not prescriptive ("this section handles auth")
- Comment describes intended behavior that code attempts but may not achieve
- Discrepancy is a known issue tracked elsewhere
- Comment is outdated but logically consistent with an earlier version
```

Benefits:
- Clear, categorical decision rules
- Reduced ambiguity in edge cases
- Consistent behavior across runs
- Lower false positive rate, higher developer trust

#### Impact of False Positives on System Design

**Cost Analysis:**
- 1 false positive = developer dismisses valid feedback
- 3+ false positives = developer stops reading output (productivity loss)
- 10+ false positives = developer disables tool entirely (system failure)

**Precision Target:** For code review assistance, aim for >85% precision (false positive rate <15%).

### Practical Skills: Designing Review Criteria

#### Skill 1: Write Categorical Criteria with Examples

```markdown
## Comment-Code Mismatch Detection

**REPORT when:**
- Claim: "Returns the user's full name"
  Code: Returns `user.firstName` only
  Action: REPORT (name precision mismatch)

- Claim: "Sorts items by timestamp"
  Code: Sorts by `createdAt`, not `updatedAt`
  Action: REPORT (field mismatch when comment is specific)

**SKIP when:**
- Claim: "Processes user authentication"
  Code: Calls `auth.verify(token)`
  Action: SKIP (descriptive, not prescriptive)

- Claim: "Returns lowercase string"
  Code: Returns `value.toLowerCase()` in most cases, but could fail on null
  Action: SKIP (comment correct for normal path; edge case is separate)
```

#### Skill 2: Temporarily Disable High False-Positive Categories

When analyzing which review categories are causing false positives:

```python
# Iterative precision improvement
review_categories = {
    "comment_code_mismatch": True,      # Precise, keep enabled
    "outdated_comments": True,           # Precise, keep enabled
    "unclear_variable_names": False,     # High FP rate, disabled
    "missing_docstrings": False,         # Too subjective, disabled
    "style_consistency": False,          # Domain-specific, disabled
}

# Only review enabled categories
active_review = {k: v for k, v in review_categories.items() if v}
```

This prevents false positives from drowning out valid findings.

#### Skill 3: Define Explicit Severity Criteria with Code Examples

```markdown
## Severity Classification

**CRITICAL:** Security or data loss risk
- Example: Comment says "password is hashed" but code stores plaintext
- Example: Comment claims "validated against schema" but validation is missing

**HIGH:** Incorrect behavior in main code path
- Example: Comment says "returns array sorted ascending" but code sorts descending
- Example: Comment says "input is required" but no validation exists

**MEDIUM:** Incorrect behavior in edge cases
- Example: Comment says "never null" but null check is missing
- Example: Comment says "works for any string" but fails on empty strings

**LOW:** Misleading but not dangerous
- Example: Comment says "optimized" but no optimization present
- Example: Comment is slightly outdated but conceptually correct
```

### Exam-Style Question

**Scenario:** Your code review system flags 200 comments per 1000-comment sample, but developers report 160 false positives. What should you do?

**Answer Approach:**
1. Calculate precision: 40 true positives / 200 flags = 20% (unacceptable)
2. Audit false positives to identify problematic categories
3. Implement explicit categorical criteria for top 3 FP sources
4. Test on sample set: target >85% precision before deploying
5. Consider disabling lowest-precision categories temporarily

---

## Task 4.2: Apply Few-Shot Prompting

### Learning Objectives
- Understand why few-shot examples are more effective than instructions
- Design few-shot examples that cover ambiguous cases
- Reduce hallucination in extraction tasks
- Demonstrate generalization to novel patterns

### Core Concepts

#### Few-Shot as Output Consistency Technique

Few-shot examples are the *most effective* technique for consistent output because they:

1. **Show, don't tell:** Examples demonstrate behavior more reliably than instructions
2. **Handle ambiguity:** Shows how to handle edge cases without explicit rules
3. **Enable generalization:** Model learns to apply pattern to novel inputs
4. **Reduce hallucination:** Concrete examples ground the model's reasoning

#### When Few-Shot Outperforms Instructions

**Scenario 1: Tool Selection in Multi-Tool Environment**

Zero-shot (fails):
```
You have tools for email, calendar, and file management.
Choose the right tool for each task.
```
Model hallucinates tools or misuses them.

Few-shot (succeeds):
```
Example 1:
Task: Schedule a meeting
Tool: calendar.create_event
Reasoning: Task requires scheduling, which is a calendar function.

Example 2:
Task: Send a document update via email
Tool: email.send
Reasoning: Task requires email delivery.

Example 3:
Task: Create and share a file
Tool: file_management.create_document
Reasoning: Must create first before sharing.
```

**Scenario 2: Coverage Gap Detection**

Zero-shot (misses gaps):
```
Extract test coverage information from this report.
```
Model might miss uncovered sections.

Few-shot (precise):
```
Example 1:
Input: "Unit tests cover 85% of LoginService class"
Output: covered: 85%, uncovered_estimate: 15%, category: "Unit"
Gap: No integration test coverage mentioned

Example 2:
Input: "AuthService has no tests"
Output: covered: 0%, uncovered_estimate: 100%, category: "None"
Gap: Entire AuthService lacks coverage

Example 3:
Input: "Coverage reported for utils.js only"
Output: covered: 90%, uncovered_estimate: 10%, category: "Partial"
Gap: Multiple files have no coverage data
```

### Practical Skills: Designing Few-Shot Examples

#### Skill 1: Create 2-4 Targeted Examples with Reasoning

```markdown
## Extraction Task: Document Classification

**Example 1 - Clear Case**
Input: "RFC-2024-001: Proposal to add real-time notifications"
Output:
  type: "RFC"
  title: "Proposal to add real-time notifications"
  id: "2024-001"
Reasoning: Clearly marked RFC with standard format

**Example 2 - Ambiguous Case**
Input: "Meeting notes: Discussion on improving API latency"
Output:
  type: "DISCUSSION"
  title: "Discussion on improving API latency"
  id: null
Reasoning: No ID pattern; categorized as discussion notes, not formal proposal

**Example 3 - Edge Case with Mixed Signals**
Input: "API-123: Response time analysis (discussion draft)"
Output:
  type: "ANALYSIS"
  title: "Response time analysis"
  id: "123"
Reasoning: Despite ID pattern, draft status indicates analysis not proposal
```

#### Skill 2: Format Demonstrations with Varied Inputs

```json
{
  "task": "Extract severity classification from bug reports",
  "examples": [
    {
      "input": "Login page crashes on null password input",
      "output": {
        "severity": "CRITICAL",
        "reason": "System-level failure (crash) blocking core functionality",
        "affected_users": "All authentication attempts"
      }
    },
    {
      "input": "Dashboard loads 2 seconds slower than expected",
      "output": {
        "severity": "LOW",
        "reason": "Performance degradation without functionality loss",
        "affected_users": "All dashboard users"
      }
    },
    {
      "input": "Notification not sent for premium tier on certain timezones",
      "output": {
        "severity": "MEDIUM",
        "reason": "Feature failure affecting subset of users",
        "affected_users": "Premium users in specific timezones"
      }
    }
  ]
}
```

#### Skill 3: Distinguish Acceptable Patterns from Genuine Issues

```markdown
## Document Structure Variation Handling

**Example 1 - Acceptable Format Variation**
Variation: "Project: WebApp | Status: In Progress"
Vs Standard: "Project Name: WebApp, Project Status: In Progress"
Output:
  status: "ACCEPTABLE"
  normalized: { "name": "WebApp", "status": "In Progress" }
Reasoning: Different punctuation/delimiter but information is complete

**Example 2 - Genuine Issue**
Variation: "Project: | Status: Complete"
(Empty project name)
Output:
  status: "ERROR"
  issue: "Missing project name"
  action: "Request clarification"
Reasoning: Information loss, not just format variation

**Example 3 - Ambiguous Case Resolved by Context**
Variation: "Project#123 Status=Active"
Context: "#" is standard project ID prefix in org
Output:
  status: "ACCEPTABLE"
  normalized: { "id": "123", "status": "Active" }
Reasoning: Non-standard format but consistent with org patterns
```

#### Skill 4: Demonstrate Varied Document Structure Handling

```python
# Few-shot example for handling different document formats

examples = [
    {
        "document": """
        INVOICE #2024-001
        Date: 2024-03-19
        Total: $1,500.00
        """,
        "output": {
            "invoice_id": "2024-001",
            "date": "2024-03-19",
            "total": 1500.00,
            "format": "structured_simple"
        }
    },
    {
        "document": """
        From: John Smith <john@example.com>
        Subject: Invoice for consulting services
        Body: Invoice #2024-002 for March services totaling $2,500
        """,
        "output": {
            "invoice_id": "2024-002",
            "date": None,  # Infer from message date
            "total": 2500.00,
            "format": "email_body",
            "note": "Date extracted from email, not document text"
        }
    },
    {
        "document": """
        Customer Statement
        Period: Mar 1-31, 2024
        Balance Due: Two thousand five hundred dollars
        Invoice Ref: INV-2024-003
        """,
        "output": {
            "invoice_id": "2024-003",
            "date": "2024-03-31",
            "total": 2500.00,
            "format": "statement_form",
            "note": "Amount converted from words; date inferred from period end"
        }
    }
]
```

### Exam-Style Question

**Scenario:** Your extraction model is missing coverage gaps 40% of the time. Current prompt uses instructions: "Identify any test coverage gaps in the report." What's your approach?

**Answer Approach:**
1. Create 3-4 few-shot examples showing different gap types
2. Include example where no gaps are mentioned
3. Include edge case: "partial coverage reported" (is this a gap?)
4. Add reasoning for each example showing decision logic
5. Test on representative sample set
6. Expect coverage gap detection to improve to >90%

---

## Task 4.3: Enforce Structured Output Using Tool Use and JSON Schemas

### Learning Objectives
- Design extraction tools with JSON schemas
- Understand tool_choice behavior and when to force tools
- Create schema patterns for optional/nullable fields
- Handle ambiguous cases with enum + detail string

### Core Concepts

#### Tool Use as Reliable Structured Output

Tool use with JSON schemas is the **most reliable approach** for guaranteed schema-compliant output because:

1. **Syntax guarantees:** Model cannot return invalid JSON
2. **Schema enforcement:** Required/optional fields validated by system
3. **Type safety:** Output types are guaranteed (string, number, array, etc.)
4. **No hallucination:** Model cannot invent undeclared fields

#### Tool Choice Modes

```python
# tool_choice: "auto" (default)
# - Model decides whether to use tools
# - May respond with plain text instead of tool call
# Risk: Unstructured output when model declines tool use

# tool_choice: "any"
# - Model MUST use a tool
# - If multiple tools available, can choose any
# - Good for: Flexible extraction with fallback tool

# tool_choice: {"type": "tool", "name": "specific_tool"}
# - Model MUST use this specific tool
# - Only choice: this tool or invalid response
# Best for: Guaranteed structured output with single tool

# Recommendation: Use forced tool selection for reliable extraction
```

#### Schema Design Patterns

**Pattern 1: Required vs Optional Fields**

```json
{
  "type": "object",
  "properties": {
    "id": {
      "type": "string",
      "description": "Unique identifier (required)"
    },
    "title": {
      "type": "string",
      "description": "Item title (required)"
    },
    "description": {
      "type": "string",
      "description": "Optional detailed description"
    },
    "tags": {
      "type": "array",
      "items": {"type": "string"},
      "description": "Optional categorization tags"
    }
  },
  "required": ["id", "title"]
}
```

**Pattern 2: Enum with "Other" + Detail String**

For ambiguous or open-ended categories:

```json
{
  "type": "object",
  "properties": {
    "issue_type": {
      "type": "string",
      "enum": ["SECURITY", "PERFORMANCE", "CORRECTNESS", "OTHER"],
      "description": "Category of code issue"
    },
    "issue_detail": {
      "type": "string",
      "description": "Specific issue type if 'OTHER' selected"
    }
  },
  "required": ["issue_type"]
}
```

Usage:
- If `issue_type` = "SECURITY" → issue_detail not needed
- If `issue_type` = "OTHER" → issue_detail must specify what type

**Pattern 3: Nullable vs Missing Fields**

```json
{
  "type": "object",
  "properties": {
    "extracted_date": {
      "type": ["string", "null"],
      "description": "Date found in document, or null if absent"
    },
    "confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Confidence score for extraction (0-1)"
    }
  },
  "required": ["extracted_date", "confidence"]
}
```

Difference:
- `extracted_date` can be null (field present, value absent)
- If a field is missing entirely from required, it's an error
- Use nullable for "we looked but found nothing" vs "we didn't look"

### Practical Skills: Tool Definition and Schema Design

#### Skill 1: Define Extraction Tool with JSON Schema

```python
# Example: Code review finding extraction tool

extraction_tool = {
    "name": "extract_code_issues",
    "description": "Extract code quality issues from a code review",
    "input_schema": {
        "type": "object",
        "properties": {
            "issues": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "severity": {
                            "type": "string",
                            "enum": ["CRITICAL", "HIGH", "MEDIUM", "LOW"],
                            "description": "Issue severity level"
                        },
                        "category": {
                            "type": "string",
                            "enum": ["SECURITY", "PERFORMANCE", "MAINTAINABILITY", "STYLE", "OTHER"],
                            "description": "Issue category"
                        },
                        "category_detail": {
                            "type": "string",
                            "description": "Specific category if 'OTHER' selected"
                        },
                        "line_number": {
                            "type": ["integer", "null"],
                            "description": "Line number if identifiable"
                        },
                        "description": {
                            "type": "string",
                            "description": "Detailed issue description"
                        },
                        "suggested_fix": {
                            "type": "string",
                            "description": "Optional suggested fix"
                        }
                    },
                    "required": ["severity", "category", "description"]
                },
                "description": "List of identified code issues"
            },
            "summary": {
                "type": "string",
                "description": "Overall summary of code review findings"
            }
        },
        "required": ["issues", "summary"]
    }
}

# Usage: Set tool_choice to force this tool
tool_choice = {"type": "tool", "name": "extract_code_issues"}
```

#### Skill 2: Set tool_choice: "any" for Flexible Extraction

```python
# When multiple tools might apply (fallback pattern)

tools = [
    {
        "name": "extract_from_structured_document",
        "description": "Extract data from clearly formatted document"
    },
    {
        "name": "extract_from_unstructured_text",
        "description": "Extract data from free-form text"
    },
    {
        "name": "report_insufficient_information",
        "description": "Report when data cannot be extracted"
    }
]

response = client.messages.create(
    model="claude-opus-4-1-20250805",
    max_tokens=1024,
    tools=tools,
    tool_choice="any",  # Model chooses best tool
    messages=[
        {
            "role": "user",
            "content": "Extract customer ID from this document: [document]"
        }
    ]
)

# Model will choose most appropriate tool based on document format
```

#### Skill 3: Force Specific Tool for Guaranteed Extraction

```python
# When you need guaranteed structured output, force the tool

response = client.messages.create(
    model="claude-opus-4-1-20250805",
    max_tokens=1024,
    tools=[extraction_tool],
    tool_choice={
        "type": "tool",
        "name": "extract_code_issues"
    },
    messages=[
        {
            "role": "user",
            "content": "Review this code and identify any issues: [code]"
        }
    ]
)

# Guaranteed: Response always contains tool call with valid schema
# No risk of unstructured text response
```

#### Skill 4: Design Optional/Nullable Schema Fields

```json
{
  "type": "object",
  "properties": {
    "required_field": {
      "type": "string",
      "description": "Always present"
    },
    "optional_field": {
      "type": ["string", "null"],
      "description": "Present but may be null if not found"
    }
  },
  "required": ["required_field", "optional_field"]
}
```

Key difference:
- `required`: Field must be in output (but can be null)
- Missing from `required`: Field not in output at all

**Pattern for uncertain data:**

```json
{
  "type": "object",
  "properties": {
    "extracted_value": {
      "type": "string",
      "description": "Value extracted from source"
    },
    "extraction_confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Confidence in extraction (0=guessed, 1=certain)"
    },
    "alternative_values": {
      "type": ["array", "null"],
      "items": {"type": "string"},
      "description": "If ambiguous, alternative interpretations"
    }
  },
  "required": ["extracted_value", "extraction_confidence"]
}
```

#### Skill 5: Add Enum Values for Ambiguous Cases

```json
{
  "type": "object",
  "properties": {
    "document_type": {
      "type": "string",
      "enum": [
        "INVOICE",
        "RECEIPT",
        "STATEMENT",
        "QUOTE",
        "PURCHASE_ORDER",
        "OTHER"
      ],
      "description": "Type of financial document"
    },
    "document_type_detail": {
      "type": "string",
      "description": "Specific type if 'OTHER' selected or classification uncertain"
    },
    "classification_confidence": {
      "type": "number",
      "minimum": 0,
      "maximum": 1,
      "description": "Confidence in document type (0-1)"
    }
  },
  "required": ["document_type", "classification_confidence"]
}
```

Pattern:
- Always include standard categories in enum
- Add "OTHER" for edge cases
- Include detail field for "OTHER" clarification
- Include confidence field for uncertain cases

#### Skill 6: Format Normalization Rules in Schema

```json
{
  "type": "object",
  "properties": {
    "phone_number": {
      "type": "string",
      "pattern": "^\\+?[0-9]{10,15}$",
      "description": "Phone number normalized to international format (digits + optional +)"
    },
    "email": {
      "type": "string",
      "format": "email",
      "description": "Email address normalized to lowercase"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Date in ISO 8601 format (YYYY-MM-DD)"
    },
    "currency_amount": {
      "type": "number",
      "description": "Monetary amount as number (e.g., 1500.00 not $1,500)"
    }
  }
}
```

### Exam-Style Question

**Scenario:** Your extraction tool sometimes returns valid JSON but with missing required information (customer_id is empty string instead of error). How do you fix this?

**Answer Approach:**
1. Don't rely on JSON schema to catch semantic errors
2. Add post-extraction validation step
3. Use detailed field descriptions in schema
4. Include examples in few-shot prompts showing acceptable values
5. Add confidence field for validation feedback
6. Consider returning null/validation_error instead of empty string
7. Use feedback loop (Task 4.4) to retry on validation failures

---

## Task 4.4: Implement Validation, Retry, and Feedback Loops

### Learning Objectives
- Implement retry-with-error-feedback patterns
- Understand when retries are effective vs ineffective
- Design semantic validation (not just schema validation)
- Create self-correction validation flows

### Core Concepts

#### Semantic vs Schema Validation Errors

**Schema Validation Error** (tool use prevents these)
```
Input: "Invalid JSON"
Error: Syntax error - caught by tool schema
Retry: Ineffective (schema already enforced)
```

**Semantic Validation Error** (tool use cannot prevent)
```
Input: {
  "customer_id": "",           // Valid JSON, invalid semantic
  "amount": -100,              // Valid JSON, invalid semantic
  "date": "2025-03-19"         // Valid JSON, impossible future date
}
Error: Data constraint violation
Retry: Effective - provide error feedback on retry
```

#### When Retries Are Effective

Retries with error feedback work when:
- Information IS available in source document
- Model understood prompt but generated invalid semantic output
- Error is recoverable with corrective feedback

Retries are INEFFECTIVE when:
- Information is absent from source (model cannot hallucinate)
- Source is ambiguous and model made different choice
- Model misunderstood prompt (problem is instruction clarity)

#### Retry-with-Error-Feedback Pattern

```python
def extract_with_retry(document, max_retries=2):
    """
    Extract data from document with semantic validation and retry loop.
    """

    for attempt in range(max_retries + 1):
        # Call extraction tool
        response = client.messages.create(
            model="claude-opus-4-1-20250805",
            max_tokens=1024,
            tools=[extraction_tool],
            tool_choice={"type": "tool", "name": "extract_data"},
            messages=[
                {
                    "role": "user",
                    "content": build_extraction_prompt(
                        document=document,
                        validation_errors=validation_errors if attempt > 0 else None
                    )
                }
            ]
        )

        # Extract tool response
        extraction = response.content[0].input

        # Validate semantics
        validation_errors = validate_extraction(extraction, document)

        if not validation_errors:
            return extraction, "success"

        if attempt < max_retries:
            # Build error feedback for next attempt
            feedback = format_validation_errors(validation_errors)
            # Continue loop with error feedback
            continue
        else:
            # Max retries exhausted
            return extraction, "validation_failed"

def build_extraction_prompt(document, validation_errors=None):
    """Build extraction prompt with optional error feedback."""

    base_prompt = f"""
    Extract data from this document:

    {document}

    Use the extract_data tool to return structured output.
    """

    if validation_errors:
        base_prompt += f"""

    PREVIOUS ATTEMPT HAD VALIDATION ERRORS:
    {validation_errors}

    Please review and correct these issues in your extraction.
    """

    return base_prompt

def validate_extraction(extraction, document):
    """
    Validate semantic constraints of extraction.
    Returns list of validation errors, or empty if valid.
    """
    errors = []

    # Check: customer_id not empty
    if not extraction.get("customer_id", "").strip():
        errors.append("customer_id: Must be non-empty. Found in document at line X.")

    # Check: amount is positive
    if extraction.get("amount", 0) < 0:
        errors.append("amount: Must be positive. Document shows positive value.")

    # Check: date is not in future
    if extraction.get("date"):
        doc_date = parse_date(extraction["date"])
        if doc_date > datetime.now():
            errors.append("date: Cannot be future date. Verify extraction from source.")

    # Check: extracted values exist in document
    for key, value in extraction.items():
        if not value_in_document(document, value):
            errors.append(f"{key}: Value '{value}' not found in document.")

    return errors
```

#### Feedback Loop with detected_pattern Field

For extraction tasks where ambiguity is common, track detected patterns for analysis:

```python
# Schema with detected_pattern tracking

extraction_schema = {
    "type": "object",
    "properties": {
        "extracted_date": {
            "type": "string",
            "format": "date",
            "description": "Extracted date in ISO format"
        },
        "detected_pattern": {
            "type": "string",
            "enum": [
                "ISO_FORMAT",           # 2024-03-19
                "US_FORMAT",            # 03/19/2024
                "EU_FORMAT",            # 19.03.2024
                "SPELLED_OUT",          # March 19, 2024
                "RELATIVE",             # "Today", "Next Tuesday"
                "AMBIGUOUS",            # Could be multiple formats
                "NOT_FOUND"             # No date in document
            ],
            "description": "Pattern used to extract date"
        },
        "confidence": {
            "type": "number",
            "minimum": 0,
            "maximum": 1,
            "description": "Confidence in extraction (0-1)"
        }
    },
    "required": ["extracted_date", "detected_pattern", "confidence"]
}

# Usage: Track patterns for improvement
patterns_detected = {}

for extraction in extractions:
    pattern = extraction.get("detected_pattern")
    patterns_detected[pattern] = patterns_detected.get(pattern, 0) + 1

    # If "AMBIGUOUS" or low confidence, flag for review
    if pattern == "AMBIGUOUS" or extraction["confidence"] < 0.7:
        review_queue.append(extraction)

# Analysis: Which patterns are causing issues?
print(f"Ambiguous patterns: {patterns_detected.get('AMBIGUOUS', 0)}")
# Action: Improve few-shot examples for common ambiguous cases
```

### Practical Skills: Validation and Retry Implementation

#### Skill 1: Implement Follow-up with Validation Errors

```python
def multi_turn_extraction(document, extraction_tool):
    """
    Multi-turn conversation with validation feedback.
    """

    messages = [
        {
            "role": "user",
            "content": f"Extract structured data from:\n\n{document}"
        }
    ]

    validation_errors = None

    for turn in range(3):  # Max 3 turns
        response = client.messages.create(
            model="claude-opus-4-1-20250805",
            max_tokens=1024,
            tools=[extraction_tool],
            tool_choice={"type": "tool", "name": "extract_data"},
            messages=messages
        )

        # Add assistant response to conversation history
        messages.append({"role": "assistant", "content": response.content})

        # Extract tool use
        extraction = response.content[0].input

        # Validate
        validation_errors = validate_extraction(extraction, document)

        if not validation_errors:
            return extraction, "success", turn

        # Append validation error feedback
        error_message = f"""
        Your extraction had validation issues:

        {format_errors(validation_errors)}

        Please review the document and correct these issues.
        Provide extraction again using the extract_data tool.
        """

        messages.append({
            "role": "user",
            "content": error_message
        })

    # Max turns exceeded
    return extraction, "failed_validation", 3

def format_errors(errors):
    """Format validation errors for feedback."""
    return "\n".join([f"- {error}" for error in errors])
```

#### Skill 2: Identify When Retries Will Be Ineffective

```python
def should_retry(document, extraction, validation_error):
    """
    Determine if retry is likely to help.
    Returns (should_retry: bool, reason: str)
    """

    # Check 1: Is the required information in the document?
    field_in_document = check_field_existence(document, validation_error)
    if not field_in_document:
        return False, "Required information not in document - retry ineffective"

    # Check 2: Is this a common semantic error that improves with feedback?
    error_type = classify_error(validation_error)
    common_errors = ["date_format", "amount_sign", "empty_field"]
    if error_type not in common_errors:
        return False, f"Error type '{error_type}' doesn't improve with retry"

    # Check 3: Has retry already been attempted?
    if extraction.get("retry_count", 0) >= 2:
        return False, "Already retried twice - diminishing returns"

    # Check 4: Is the extraction confidence too low?
    if extraction.get("confidence", 0) < 0.3:
        return False, "Low confidence indicates ambiguous source - retry ineffective"

    return True, "Retry likely to improve extraction"

def check_field_existence(document, error):
    """Check if required field actually exists in document."""
    # Implementation: search for required values in document text
    pass

def classify_error(error):
    """Classify the type of validation error."""
    # Implementation: categorize error for retry effectiveness
    pass
```

#### Skill 3: Design Self-Correction Validation

```python
# Self-correction flow: Have model validate its own output

self_correction_prompt = """
You extracted the following data:
{extraction}

Now validate it against the original document:
1. Is each field present in the document?
2. Are extracted values accurate?
3. Are there any format issues?

If you find problems, correct them and explain the fix.
"""

# Tool for validation feedback
validation_tool = {
    "name": "validate_extraction",
    "description": "Validate and correct extracted data",
    "input_schema": {
        "type": "object",
        "properties": {
            "validation_results": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {
                        "field": {"type": "string"},
                        "status": {
                            "type": "string",
                            "enum": ["CORRECT", "NEEDS_CORRECTION", "MISSING"]
                        },
                        "original_value": {"type": "string"},
                        "corrected_value": {"type": ["string", "null"]},
                        "explanation": {"type": "string"}
                    }
                }
            },
            "final_extraction": {
                "type": "object",
                "description": "Corrected extraction with fixes applied"
            }
        },
        "required": ["validation_results", "final_extraction"]
    }
}
```

### Exam-Style Question

**Scenario:** Your extraction tool has a 2-turn validation loop. Turn 1 extracts 100 documents. 15 fail validation. Turn 2 on those 15, 10 pass, 5 still fail. What should you do?

**Answer Approach:**
1. Analyze the 5 failures: are they missing data (retry ineffective) or semantic errors (fixable)?
2. Check if those failures are in source document
3. If missing from source: accept as limitation, return best effort + confidence score
4. If present in source: improve prompt, add few-shot examples, or increase turns
5. Consider: Is semantic validation too strict? Adjust validation rules.
6. Calculate ROI: Cost of extra turn vs value of corrected 10 extractions
7. Track: Which fields have highest validation failure rate for prompt improvement

---

## Task 4.5: Design Efficient Batch Processing Strategies

### Learning Objectives
- Understand Batch API costs and latency tradeoffs
- Match API selection to latency requirements
- Calculate batch submission frequency from SLA
- Handle batch failures and resubmission

### Core Concepts

#### Message Batches API Overview

**Characteristics:**
- **Cost:** 50% savings vs regular API calls
- **Processing window:** 24 hours (not real-time)
- **Latency SLA:** None (no guaranteed completion time)
- **Tool support:** Multi-turn tool calling NOT supported (single-turn only)
- **Best for:** Non-blocking, latency-tolerant workloads

**When to use Batch API:**
```
Latency requirement: >1 minute acceptable  → Batch API
Latency requirement: <1 minute required   → Regular API
```

**Cost comparison:**
```
Regular API: $3 per million tokens
Batch API:  $1.50 per million tokens (50% savings)

Example:
100,000 API calls × 500 tokens avg = 50M tokens
Regular: 50M × $3/M = $150
Batch:   50M × $1.5/M = $75
Savings: $75 (50%)
```

#### Batch API Request Format

```json
{
  "custom_id": "request-1",
  "params": {
    "model": "claude-opus-4-1-20250805",
    "max_tokens": 1024,
    "messages": [
      {
        "role": "user",
        "content": "Analyze this code: [code]"
      }
    ]
  }
}
```

Key: `custom_id` field for correlating request/response pairs.

#### Batch API Limitations

**Cannot use for:**
- Multi-turn conversations (request-response-request)
- Tool use with follow-up based on tool results
- Streaming responses
- Real-time feedback requirements

**Workaround:** Use single-turn tool calling with all tool results pre-computed.

### Practical Skills: Batch Processing Strategy

#### Skill 1: Match API to Latency Requirements

```python
def select_api(latency_requirement_seconds, volume):
    """
    Select appropriate API based on latency SLA.

    Args:
        latency_requirement_seconds: Max acceptable latency
        volume: Number of requests

    Returns:
        api_choice: "batch" or "regular"
        reason: Explanation
    """

    if latency_requirement_seconds < 60:
        return "regular", "Sub-minute latency requires regular API"
    elif latency_requirement_seconds < 3600:
        return "regular", "Sub-hour latency needs regular API"
    elif volume < 10000:
        return "regular", "Small volume; batch overhead not worth it"
    else:
        return "batch", "Large volume + >1 hour latency acceptable"

# Examples
select_api(30, 100000)    # → "regular" (sub-minute required)
select_api(3600, 100000)  # → "batch" (1 hour acceptable, volume high)
select_api(3600, 50)      # → "regular" (volume too small for batch setup)
```

#### Skill 2: Calculate Batch Submission Frequency from SLA

```python
def batch_submission_strategy(total_requests, max_latency_hours, items_per_batch=10000):
    """
    Calculate batch submission frequency to meet SLA.

    Args:
        total_requests: Total requests to process
        max_latency_hours: SLA requirement in hours
        items_per_batch: Requests per batch (Batch API limit)

    Returns:
        strategy: Submission plan
    """

    # Batch API processing time: typically 2-6 hours
    # Conservative estimate: 8 hours for worst-case
    batch_processing_time_hours = 8

    # Available submission time before SLA deadline
    available_time = max_latency_hours - batch_processing_time_hours

    if available_time <= 0:
        return {
            "api": "regular",
            "reason": "Batch processing time exceeds SLA",
            "recommendation": "Use regular API instead"
        }

    # Calculate required batches
    total_batches = (total_requests + items_per_batch - 1) // items_per_batch

    # Calculate submission frequency
    submission_interval_hours = available_time / total_batches

    return {
        "api": "batch",
        "total_batches": total_batches,
        "submission_interval": f"Every {submission_interval_hours:.1f} hours",
        "first_batch_deadline": f"{batch_processing_time_hours} hours before SLA",
        "last_submission_deadline": f"{max_latency_hours - 1} hours from now"
    }

# Example: Process 100,000 items, need results in 24 hours
strategy = batch_submission_strategy(100000, 24)
# Returns: Submit ~10 batches, one every 1.6 hours, starting immediately
```

#### Skill 3: Build Batch Request Payload

```python
def build_batch_request(documents, tool_schema, batch_id="batch-001"):
    """
    Build batch request with custom_id for response correlation.
    """

    requests = []

    for idx, document in enumerate(documents):
        request = {
            "custom_id": f"{batch_id}-request-{idx:05d}",
            "params": {
                "model": "claude-opus-4-1-20250805",
                "max_tokens": 1024,
                "tools": [tool_schema],
                "tool_choice": {"type": "tool", "name": tool_schema["name"]},
                "messages": [
                    {
                        "role": "user",
                        "content": f"Extract data from this document:\n\n{document}"
                    }
                ]
            }
        }
        requests.append(request)

    return requests

def submit_batch(requests, input_filename="batch_input.jsonl"):
    """
    Submit batch to API.
    """

    # Write requests to JSONL file
    with open(input_filename, 'w') as f:
        for request in requests:
            f.write(json.dumps(request) + '\n')

    # Submit batch
    batch = client.beta.messages.batches.create(
        model="claude-opus-4-1-20250805",
        input_file=open(input_filename, 'rb')
    )

    return batch.id

def poll_batch_status(batch_id, poll_interval_seconds=60):
    """
    Poll batch status until completion.
    """

    while True:
        batch = client.beta.messages.batches.retrieve(batch_id)

        print(f"Batch {batch_id}: {batch.processing_status}")
        print(f"  Succeeded: {batch.request_counts.succeeded}")
        print(f"  Errored:   {batch.request_counts.errored}")
        print(f"  Expired:   {batch.request_counts.expired}")

        if batch.processing_status == "ended":
            return batch

        time.sleep(poll_interval_seconds)

def retrieve_batch_results(batch_id, output_filename="batch_output.jsonl"):
    """
    Retrieve completed batch results.
    """

    batch = client.beta.messages.batches.retrieve(batch_id)

    if batch.processing_status != "ended":
        raise ValueError(f"Batch not complete: {batch.processing_status}")

    # Download results
    results = client.beta.messages.batches.results(batch_id)

    # Process results with custom_id mapping
    result_map = {}
    for result in results:
        custom_id = result.custom_id
        result_map[custom_id] = result

    return result_map
```

#### Skill 4: Handle Batch Failures and Resubmission

```python
def handle_batch_failures(batch_id, original_requests):
    """
    Process failed requests and resubmit.
    """

    # Get batch results
    batch = client.beta.messages.batches.retrieve(batch_id)
    results = client.beta.messages.batches.results(batch_id)

    # Identify failures
    failed_custom_ids = set()
    for result in results:
        if result.result.type == "errored":
            failed_custom_ids.add(result.custom_id)
            print(f"Failed: {result.custom_id}")
            print(f"  Error: {result.result.error}")

    # Extract original requests for failed items
    failed_requests = [
        req for req in original_requests
        if req["custom_id"] in failed_custom_ids
    ]

    # Resubmit failures
    if failed_requests:
        print(f"Resubmitting {len(failed_requests)} failed requests...")
        retry_batch_id = submit_batch(failed_requests, "batch_retry.jsonl")
        return retry_batch_id
    else:
        return None

def aggregate_batch_results(batch_ids):
    """
    Combine results from multiple batches.
    """

    all_results = {}

    for batch_id in batch_ids:
        batch = client.beta.messages.batches.retrieve(batch_id)

        if batch.processing_status != "ended":
            print(f"Warning: Batch {batch_id} not complete")
            continue

        results = client.beta.messages.batches.results(batch_id)

        for result in results:
            all_results[result.custom_id] = result

    return all_results
```

#### Skill 5: Test on Sample Set Before Full Batch

```python
def batch_strategy_with_sampling(all_documents, sample_size=100):
    """
    Test on sample before submitting full batch.
    """

    # Step 1: Test on small sample with regular API
    print("Testing on sample set with regular API...")
    sample = all_documents[:sample_size]

    sample_results = []
    for doc in sample:
        result = client.messages.create(
            model="claude-opus-4-1-20250805",
            max_tokens=1024,
            tools=[extraction_tool],
            messages=[{"role": "user", "content": f"Extract from: {doc}"}]
        )
        sample_results.append(result)

    # Step 2: Evaluate quality
    success_rate = sum(1 for r in sample_results if r.content[0].type == "tool_use") / len(sample_results)
    print(f"Success rate: {success_rate * 100:.1f}%")

    if success_rate < 0.8:
        print("Low success rate - improve prompt before batch")
        return None

    # Step 3: Refine prompt based on failures
    print("Analyzing failures...")
    failures = [r for r in sample_results if r.content[0].type != "tool_use"]
    if failures:
        print(f"Common issues: [analyze and improve prompt]")

    # Step 4: Submit full batch
    print(f"Quality acceptable - submitting full batch of {len(all_documents)} items")
    return prepare_batch_submission(all_documents)
```

### Exam-Style Question

**Scenario:** You need to process 500,000 documents. Processing must complete within 48 hours. Each document takes ~500 tokens. Current regular API cost is $3/M tokens. What's your strategy?

**Answer Approach:**
1. Calculate tokens: 500,000 docs × 500 tokens = 250M tokens
2. Regular API cost: 250M × $3/M = $750
3. Batch API cost: 250M × $1.50/M = $375 (savings $375)
4. Batch processing time: ~8 hours typical
5. Available submission window: 48 - 8 = 40 hours
6. Batch size: 10,000 per batch = 50 batches
7. Submission frequency: 40 hours / 50 batches = 0.8 hours (submit every 48 minutes)
8. Strategy: Use Batch API, submit continuously, retrieve results 8+ hours after each submission

---

## Task 4.6: Design Multi-Instance and Multi-Pass Review Architectures

### Learning Objectives
- Understand self-review limitations
- Design independent review instances
- Implement multi-pass review strategies
- Use confidence self-reporting for quality signals

### Core Concepts

#### Self-Review Limitations

**Problem:** When a model reviews its own output, it:
1. Retains original reasoning in context
2. Confirms prior conclusions rather than questioning them
3. Is less likely to catch subtle errors in own work
4. Exhibits confirmation bias in reasoning

**Example:**

Self-review (ineffective):
```
Original: Extract "John Smith" as customer name
Self-review: "Yes, I extracted 'John Smith' correctly from the document"
(Fails to notice it was "Smith, John" in document)
```

Independent review (effective):
```
Original extraction: "John Smith"
Independent reviewer: "Checking document... found 'Smith, John'
This extraction reversed the name order. Flag as incorrect."
```

#### Multi-Pass Architecture Pattern

**Pass 1: Local Analysis (file-level)**
- Extract data from individual documents
- Flag obvious issues within document context
- Generate confidence scores

**Pass 2: Cross-file Integration**
- Compare extractions across documents
- Identify inconsistencies
- Verify patterns

**Pass 3: Verification (focused review)**
- Deep review of low-confidence items
- Double-check flagged items
- Final quality gate

### Practical Skills: Multi-Instance Review

#### Skill 1: Independent Review Instance Pattern

```python
def parallel_review(document, review_criteria):
    """
    Use independent Claude instances for review.
    Each instance sees same document but makes independent assessment.
    """

    # Instance 1: Focused on compliance issues
    review_1 = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""
            Review this code for COMPLIANCE issues only:
            - Security vulnerabilities
            - Data privacy violations
            - License compliance

            Document: {document}
            """
        }]
    )

    # Instance 2: Focused on performance issues
    review_2 = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""
            Review this code for PERFORMANCE issues only:
            - Inefficient algorithms
            - Memory leaks
            - N+1 queries

            Document: {document}
            """
        }]
    )

    # Instance 3: Focused on maintainability
    review_3 = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""
            Review this code for MAINTAINABILITY issues only:
            - Poor naming
            - Lack of documentation
            - Complex logic

            Document: {document}
            """
        }]
    )

    # Combine results
    return {
        "compliance": extract_findings(review_1),
        "performance": extract_findings(review_2),
        "maintainability": extract_findings(review_3)
    }

def extract_findings(response):
    """Parse findings from review response."""
    # Implementation: extract structured findings
    pass
```

#### Skill 2: Independent vs Self-Review Comparison

```python
def compare_self_vs_independent_review(document):
    """
    Compare self-review vs independent review to demonstrate differences.
    """

    # Step 1: Initial extraction
    initial = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=1024,
        tools=[extraction_tool],
        tool_choice={"type": "tool", "name": "extract_data"},
        messages=[{
            "role": "user",
            "content": f"Extract structured data from:\n\n{document}"
        }]
    )
    extraction = initial.content[0].input

    # Step 2: Self-review (INEFFECTIVE)
    self_review = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"""
            Review this extraction for accuracy:

            Extraction: {json.dumps(extraction)}

            Original document: {document}

            Are there any errors? Be critical.
            """
        }]
    )

    # Step 3: Independent review (EFFECTIVE)
    # Use different phrasing, different focus
    independent_review = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=512,
        messages=[{
            "role": "user",
            "content": f"""
            You are a QA reviewer. Check this extraction against the source document.

            EXTRACTED DATA:
            {json.dumps(extraction)}

            SOURCE DOCUMENT:
            {document}

            Verify each extracted value against the source.
            List any discrepancies found.
            """
        }]
    )

    return {
        "extraction": extraction,
        "self_review": self_review.content[0].text,
        "independent_review": independent_review.content[0].text
    }
```

#### Skill 3: Split Multi-File Reviews into Focused Passes

```python
def multi_pass_document_review(documents, review_type="comprehensive"):
    """
    Split large document review into multiple focused passes.
    """

    if review_type == "comprehensive":
        # Pass 1: Extract from each document (parallel)
        print("Pass 1: Extracting data from each document...")
        extractions = []
        for doc in documents:
            extraction = extract_from_document(doc)
            extractions.append(extraction)

        # Pass 2: Cross-document validation (sequential)
        print("Pass 2: Validating consistency across documents...")
        inconsistencies = find_inconsistencies(extractions)

        # Pass 3: Deep review of flagged items (focused)
        print("Pass 3: Deep review of inconsistencies...")
        deep_reviews = []
        for inconsistency in inconsistencies:
            review = conduct_deep_review(
                inconsistency,
                documents[inconsistency["doc_indices"]]
            )
            deep_reviews.append(review)

        return {
            "extractions": extractions,
            "inconsistencies": inconsistencies,
            "deep_reviews": deep_reviews
        }

def find_inconsistencies(extractions):
    """
    Compare extractions to find inconsistencies.
    For example: same field has different values across documents.
    """

    inconsistencies = []

    # Check for conflicting values across documents
    for field in extraction_fields:
        values = [e.get(field) for e in extractions]
        unique_values = set(str(v) for v in values if v)

        if len(unique_values) > 1:
            # Inconsistency found
            inconsistencies.append({
                "field": field,
                "values": unique_values,
                "doc_indices": [i for i, v in enumerate(values) if str(v) in unique_values]
            })

    return inconsistencies

def conduct_deep_review(inconsistency, relevant_documents):
    """
    Conduct focused deep review of specific inconsistency.
    """

    response = client.messages.create(
        model="claude-opus-4-1-20250805",
        max_tokens=1024,
        messages=[{
            "role": "user",
            "content": f"""
            These documents have conflicting values for '{inconsistency['field']}':
            {inconsistency['values']}

            Please review the source documents and determine which value is correct.

            {format_documents(relevant_documents)}
            """
        }]
    )

    return response.content[0].text
```

#### Skill 4: Confidence Self-Reporting for Quality Signals

```python
# Add confidence scoring to extraction schema

extraction_with_confidence = {
    "name": "extract_with_confidence",
    "description": "Extract data and report confidence levels",
    "input_schema": {
        "type": "object",
        "properties": {
            "extraction": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                    "amount": {"type": "number"},
                    "date": {"type": "string"}
                },
                "required": ["customer_id", "amount", "date"]
            },
            "confidence_scores": {
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Confidence in customer_id extraction (0-1)"
                    },
                    "amount": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Confidence in amount extraction (0-1)"
                    },
                    "date": {
                        "type": "number",
                        "minimum": 0,
                        "maximum": 1,
                        "description": "Confidence in date extraction (0-1)"
                    }
                }
            },
            "overall_confidence": {
                "type": "number",
                "minimum": 0,
                "maximum": 1,
                "description": "Overall confidence in extraction (0-1)"
            },
            "uncertainty_notes": {
                "type": "string",
                "description": "Notes on any ambiguities or uncertainty in extraction"
            }
        },
        "required": ["extraction", "confidence_scores", "overall_confidence"]
    }
}

def prioritize_by_confidence(extractions, confidence_threshold=0.8):
    """
    Route extractions based on confidence scores.
    """

    high_confidence = []
    low_confidence = []

    for extraction in extractions:
        if extraction["overall_confidence"] >= confidence_threshold:
            high_confidence.append(extraction)
        else:
            low_confidence.append(extraction)

    return {
        "high_confidence": high_confidence,  # Accept as-is
        "low_confidence": low_confidence      # Route for review
    }

def use_confidence_for_adaptive_review(extractions):
    """
    Allocate review effort based on confidence scores.
    """

    # Items with confidence >= 0.95: skip review (high confidence)
    # Items with 0.8-0.95 confidence: light review
    # Items with 0.5-0.8 confidence: standard review
    # Items with <0.5 confidence: deep review + potential manual intervention

    review_queue = {}

    for extraction in extractions:
        conf = extraction["overall_confidence"]

        if conf >= 0.95:
            priority = "ACCEPT"
        elif conf >= 0.8:
            priority = "LIGHT_REVIEW"
        elif conf >= 0.5:
            priority = "STANDARD_REVIEW"
        else:
            priority = "DEEP_REVIEW"

        review_queue.setdefault(priority, []).append(extraction)

    return review_queue
```

#### Skill 5: Verification Pass with Confidence Self-Reporting

```python
def verification_pass(extractions_with_confidence):
    """
    Final verification pass using confidence reports as signal.
    """

    # Categorize by confidence
    categorized = {}
    for extraction in extractions_with_confidence:
        category = categorize_by_confidence(extraction["overall_confidence"])
        categorized.setdefault(category, []).append(extraction)

    # Process each category
    results = {
        "accepted": categorized.get("HIGH", []),
        "verified": [],
        "failed": []
    }

    # Light verification for medium-confidence items
    for extraction in categorized.get("MEDIUM", []):
        is_valid = verify_extraction(extraction)
        if is_valid:
            results["verified"].append(extraction)
        else:
            results["failed"].append(extraction)

    # Deep verification for low-confidence items
    for extraction in categorized.get("LOW", []):
        detailed_review = conduct_detailed_review(extraction)
        if detailed_review["is_valid"]:
            results["verified"].append(extraction)
        else:
            results["failed"].append({
                "extraction": extraction,
                "review": detailed_review
            })

    return results

def categorize_by_confidence(confidence):
    """Map confidence score to review category."""
    if confidence >= 0.85:
        return "HIGH"
    elif confidence >= 0.7:
        return "MEDIUM"
    else:
        return "LOW"

def verify_extraction(extraction, quick_check=True):
    """
    Verify extraction with appropriate depth.
    """

    if quick_check:
        # Light verification: spot-check key fields
        return check_basic_validity(extraction)
    else:
        # Full verification: detailed review
        response = client.messages.create(
            model="claude-opus-4-1-20250805",
            max_tokens=512,
            messages=[{
                "role": "user",
                "content": f"Verify this extraction: {json.dumps(extraction)}"
            }]
        )
        return "valid" in response.content[0].text.lower()
```

### Exam-Style Question

**Scenario:** Your code review system processes 10,000 files. Self-review catches 50% of its own errors. Independent review of same files catches 85% of errors. Cost per review is equal. Should you use self-review or independent review?

**Answer Approach:**
1. Self-review: 50% detection rate = 5,000 errors caught, 5,000 missed
2. Independent review: 85% detection rate = 8,500 errors caught, 1,500 missed
3. Cost: Same per file
4. Quality improvement: 85% - 50% = 35% better with independent
5. Recommendation: Use independent review, even if costs more in practice
6. Optimization: Use low-confidence signals to route only uncertain items to independent review
7. Hybrid: Self-review (fast) + independent spot-check (high-value items) = balanced approach

---

## Key Exam Tips

1. **Explicit Criteria Over General Instructions:** Never rely on vague instructions like "be thorough." Instead, provide specific categorical criteria with clear report-vs-skip boundaries.

2. **Few-Shot Examples Are Most Effective:** When unsure how to improve precision, add targeted few-shot examples demonstrating edge cases and ambiguous situations.

3. **Tool Use for Guaranteed Structure:** Use forced tool selection with JSON schemas for reliable, schema-compliant extraction. Don't rely on format hints in prompts.

4. **Validation is Semantic, Not Just Syntax:** JSON schema prevents syntax errors but not semantic ones (empty fields, invalid values). Always add semantic validation layer.

5. **Retries Work Only When Information Exists:** Don't retry when data is absent from source—retry only when model could recover with error feedback.

6. **Batch API is 50% Cheaper but Slow:** Match API to latency requirements. Batch API has no SLA; best for non-blocking workloads.

7. **Independent Review Beats Self-Review:** Models are biased toward their own conclusions. Always use independent review instances for quality-critical systems.

8. **Multi-Pass Architecture for Scale:** Split large reviews: local extraction → cross-file validation → focused verification on flagged items.

9. **Confidence Scores as Quality Signals:** Use self-reported confidence to route items to appropriate review depth, optimizing effort allocation.

10. **Sample Test Before Full Batch:** Always test prompt quality on small sample (regular API) before submitting large batch, ensuring >80% success rate first.

---

## Study Checklist

Review each item before taking the exam:

### Task 4.1: Explicit Criteria
- [ ] Can write categorical report-vs-skip criteria
- [ ] Understand false positive cost in developer trust
- [ ] Can design severity classification with code examples
- [ ] Know how to iteratively improve precision on sample set

### Task 4.2: Few-Shot Prompting
- [ ] Understand when few-shot outperforms instructions
- [ ] Can create 3-4 targeted examples with reasoning
- [ ] Know how to demonstrate edge case handling
- [ ] Can show format variation in few-shot examples

### Task 4.3: Structured Output
- [ ] Understand tool_choice modes ("auto", "any", forced)
- [ ] Can design JSON schema with required/optional/nullable fields
- [ ] Know enum + detail string pattern for ambiguous cases
- [ ] Can implement format normalization in schema

### Task 4.4: Validation & Retry
- [ ] Distinguish semantic errors (fixable) from schema errors (prevented)
- [ ] Know when retries are effective vs ineffective
- [ ] Can implement multi-turn validation feedback loop
- [ ] Understand detected_pattern tracking for analysis

### Task 4.5: Batch Processing
- [ ] Know Batch API: 50% cost savings, 24-hour window, no SLA
- [ ] Can calculate batch submission frequency from SLA
- [ ] Understand Batch API limitation: no multi-turn tool calling
- [ ] Know how to handle batch failures and resubmit
- [ ] Understand custom_id for request/response correlation

### Task 4.6: Multi-Instance Review
- [ ] Know self-review limitations (confirmation bias, retained context)
- [ ] Can design independent review instances for specific categories
- [ ] Understand multi-pass architecture (extraction → validation → verification)
- [ ] Can implement confidence self-reporting for routing
- [ ] Know when to use confidence to route items for review

### Cross-Task Skills
- [ ] Can combine: explicit criteria + few-shot + schema + validation
- [ ] Know cost-benefit of each technique
- [ ] Can explain tradeoffs: precision vs recall, cost vs latency, automation vs quality

---

## Practice Questions

**Q1:** Your extraction system flags 1,000 items for manual review per 10,000 inputs. Reviewers say 800 are false positives. What's your first action?

**Q2:** You're implementing extraction with tool use. Should you use `tool_choice: "auto"` or forced tool selection? Why?

**Q3:** Batch API processes 100K items in 48 hours. How would you schedule batch submissions if you need results in 72 hours?

**Q4:** Your self-review catches 60% of errors. Independent review catches 85%. Cost per item is $0.01 for both. Should you use both, one, or neither? Calculate ROI.

**Q5:** Design a schema with these fields: id (required), description (optional), type (enum: A/B/C or other). Write the JSON schema.

---

## References for Further Study

- Anthropic Models API Documentation: Tool Use, Batch API
- Claude Opus 4.1 Prompt Engineering Guide
- JSON Schema Specification for API Tool Parameters
- Message Batches API Best Practices
- Code Review Systems: Precision and Recall in Practice

---

**Module Status:** Ready for exam preparation
**Estimated Review Time:** 30-45 minutes per task
**Total Module Study Time:** 4-5 hours including practice questions

Last Updated: 2026-03-19
