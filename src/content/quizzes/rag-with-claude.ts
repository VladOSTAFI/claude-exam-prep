import type { Quiz } from "@/types/quiz";

const quiz: Quiz = {
  slug: "rag-with-claude",
  title: "RAG with Claude (Contextual Retrieval)",
  questions: [
    {
      id: "q1",
      prompt:
        "Starting from a baseline of 5.7% retrieval failure rate, adding Contextual Embeddings reduces failure to 3.7%. What does adding Contextual BM25 on top of that reduce the failure rate to?",
      choices: [
        { id: "a", text: "3.2% (−44% from baseline)." },
        { id: "b", text: "2.9% (−49% from baseline)." },
        { id: "c", text: "2.1% (−63% from baseline)." },
        { id: "d", text: "1.9% (−67% from baseline)." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's table shows the progression: baseline 5.7% → contextual embeddings 3.7% (−35%) → + contextual BM25 2.9% (−49%) → + reranking 1.9% (−67%). The −49% figure corresponds to the BM25 layer added on top of embeddings.",
    },
    {
      id: "q2",
      prompt:
        "Why does vector search alone fail to retrieve a chunk containing the exact error code 'ERR_AUTH_TOKEN_EXPIRED'?",
      choices: [
        { id: "a", text: "Vector embeddings cannot handle strings longer than 50 characters." },
        { id: "b", text: "Semantic embeddings capture meaning but often miss exact-match terms like IDs, error codes, and rare strings; BM25 covers this gap." },
        { id: "c", text: "The error code must be indexed separately in a relational database, not a vector store." },
        { id: "d", text: "Claude's embedding model strips punctuation, so underscores in error codes are lost." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module explains that BM25 catches 'exact terms — IDs, error codes, acronyms, rare names' that semantic vectors miss. This is a different failure mode from semantic mismatch, which is why hybrid search (vector + BM25, fused with RRF) outperforms either alone.",
    },
    {
      id: "q3",
      prompt:
        "Why is prompt caching essential for making contextual retrieval economically viable?",
      choices: [
        { id: "a", text: "Caching prevents the same chunk from being embedded twice, halving embedding costs." },
        { id: "b", text: "Without caching, contextualizing 1,000 chunks of a 100k-token document means paying for the document 1,000 times. Caching the document makes each chunk call cost only the chunk portion." },
        { id: "c", text: "Caching stores the contextualized chunks so they never need to be re-generated across users." },
        { id: "d", text: "The cache eliminates the need for BM25 indexing, reducing infrastructure cost." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module states: 'Without caching, the cost would be ~10× higher.' By caching the full source document at the start and varying only the chunk in each contextualization call, cache reads cost ~10% of input price, making the per-chunk contextualization economically viable at scale.",
    },
    {
      id: "q4",
      prompt:
        "An organization runs Postgres on Azure and wants to add vector search to their RAG system with minimal new infrastructure. Which vector store does the module recommend?",
      choices: [
        { id: "a", text: "Pinecone — it is managed and therefore requires no infrastructure from the team." },
        { id: "b", text: "Qdrant — it offers the best self-hosted performance benchmarks." },
        { id: "c", text: "pgvector — the team already runs Postgres, so pgvector is the simplest path." },
        { id: "d", text: "Weaviate — built-in hybrid search removes the need for a separate BM25 index." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's guidance is: 'The exam tests architectural fit, not vendor benchmarks. If the scenario says we run Postgres on Azure, the right answer is pgvector.' Adding an extension to existing infrastructure is simpler than managing a separate vector database.",
    },
    {
      id: "q5",
      prompt:
        "What is the correct chunk size range recommended by the module for RAG chunking?",
      choices: [
        { id: "a", text: "50–100 tokens — smaller chunks improve precision." },
        { id: "b", text: "200–500 tokens — the recommended sweet spot." },
        { id: "c", text: "1,000–2,000 tokens — larger chunks preserve more context per chunk." },
        { id: "d", text: "There is no recommended range — chunk size should always match the embedding model's maximum." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module's chunking guidelines specify 200–500 tokens as the sweet spot, using token-based splitting (not character count), 10–20% overlap to preserve cross-chunk context, and avoiding splits at mid-sentence boundaries.",
    },
    {
      id: "q6",
      prompt:
        "What is the baseline retrieval failure rate (before any contextual retrieval techniques are applied) reported in the module's evaluation set?",
      choices: [
        { id: "a", text: "1.9%" },
        { id: "b", text: "3.7%" },
        { id: "c", text: "5.7%" },
        { id: "d", text: "8.2%" },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's headline numbers come from a 248-query evaluation set: baseline (vector embeddings only) is 5.7%. The other three values — 3.7%, 2.9%, and 1.9% — represent the failure rates after adding contextual embeddings, contextual BM25, and reranking respectively.",
    },
    {
      id: "q7",
      prompt:
        "How long should the contextualizing summary prepended to each chunk be, according to the module?",
      choices: [
        { id: "a", text: "10–25 tokens — keep it terse so the embedding doesn't drift." },
        { id: "b", text: "50–100 tokens — explaining the document and what came before." },
        { id: "c", text: "500–1000 tokens — include as much surrounding text as possible." },
        { id: "d", text: "Whatever fits — the size is irrelevant as long as some context is added." },
      ],
      correctChoiceId: "b",
      explanation:
        "Layer 1 (Contextual Embeddings) prepends each chunk with a 50–100 token contextualizing summary generated by Claude. The summary explains what document the chunk is from and what came before, so the chunk carries its context into the embedding.",
    },
    {
      id: "q8",
      prompt:
        "In the RRF (Reciprocal Rank Fusion) formula used to combine vector and BM25 rankings, what is the typical value of the constant k?",
      choices: [
        { id: "a", text: "0" },
        { id: "b", text: "10" },
        { id: "c", text: "60" },
        { id: "d", text: "1000" },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's RRF code sample uses k = 60 as the default. The score for a document is 1 / (k + rank + 1) summed across rankings, which dampens the impact of being top-ranked in any single list and rewards documents that appear consistently across both vector and BM25 results.",
    },
    {
      id: "q9",
      prompt:
        "What is the cache write cost multiplier for the default 5-minute TTL prompt cache, relative to the regular input price?",
      choices: [
        { id: "a", text: "0.5× (cheaper than a normal input token)." },
        { id: "b", text: "1× (same as a normal input token)." },
        { id: "c", text: "1.25× (a small premium over a normal input token)." },
        { id: "d", text: "10× (much more expensive than a normal input token)." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module's prompt caching mechanics table lists cache write cost as 1.25× input for the 5-minute TTL and 2× input for the 1-hour TTL. Cache reads, by contrast, cost only ~10% of the input price — that asymmetry is what makes per-chunk contextualization economical.",
    },
    {
      id: "q10",
      prompt:
        "What is the maximum number of cache breakpoints supported by Claude's prompt caching, according to the module?",
      choices: [
        { id: "a", text: "1" },
        { id: "b", text: "4" },
        { id: "c", text: "10" },
        { id: "d", text: "Unlimited" },
      ],
      correctChoiceId: "b",
      explanation:
        "The prompt caching mechanics table in the module specifies a maximum of 4 cache breakpoints. The cache hierarchy is Tools → System → Messages, cached top-down, with 5-minute TTL by default and 1-hour TTL available as an extended option.",
    },
    {
      id: "q11",
      prompt:
        "What is the purpose of Anthropic's citations API as described in the module?",
      choices: [
        { id: "a", text: "It automatically rewrites a query to better match indexed documents before retrieval." },
        { id: "b", text: "It lets Claude cite the exact passages it used, reducing hallucination, enabling user verification, and providing audit trails for compliance." },
        { id: "c", text: "It performs reranking on the top-N retrieved chunks before they are sent to the model." },
        { id: "d", text: "It generates contextualizing summaries for each chunk during indexing." },
      ],
      correctChoiceId: "b",
      explanation:
        "The module describes citations as a grounding mechanism: Claude cites the exact passages it used. This reduces hallucination, lets users verify answers, and provides audit trails for compliance — which is why the self-check insists you use citations in the final Claude call.",
    },
    {
      id: "q12",
      prompt:
        "Why does the module recommend running a cross-encoder reranker (Cohere Rerank, Voyage Rerank) only on the top-N candidates rather than the entire corpus?",
      choices: [
        { id: "a", text: "Rerankers are inaccurate on large sets, so they require a small input." },
        { id: "b", text: "The reranker is more expensive per pair but more accurate; restricting it to a small candidate set (e.g., top-20) keeps cost manageable while still improving precision." },
        { id: "c", text: "Rerankers cannot read documents longer than the top-N combined." },
        { id: "d", text: "Reranking the full corpus would invalidate the cache used during contextualization." },
      ],
      correctChoiceId: "b",
      explanation:
        "Layer 3 — Reranking — explains that cross-encoder rerankers are 'more expensive per pair but more accurate; you only pay for it on a small candidate set.' Running it over a top-20 from the RRF-fused list gives a precision boost without the cost of scoring every document in the index.",
    },
    {
      id: "q13",
      prompt:
        "Why is the chunk 'Q3 revenue rose 5%' a poor candidate for naive (non-contextual) embedding?",
      choices: [
        { id: "a", text: "It contains a number, and embedding models discard numeric tokens." },
        { id: "b", text: "It is too short — embeddings require at least 100 tokens to be meaningful." },
        { id: "c", text: "Without surrounding context the chunk is ambiguous (whose Q3? which company? which year?), so its embedding is also ambiguous and retrieval misses it on specific queries." },
        { id: "d", text: "It lacks an exact-match keyword, so BM25 cannot index it." },
      ],
      correctChoiceId: "c",
      explanation:
        "The module uses this exact example to motivate contextual retrieval: chunked in isolation, the sentence loses its surrounding context, so the embedding is ambiguous and a query like 'What was Acme's 2025 third-quarter revenue growth?' fails to retrieve it. Prepending a contextualizing summary fixes this.",
    },
    {
      id: "q14",
      prompt:
        "Which model does the module's Step 2 contextualization example call to generate per-chunk context summaries, and why?",
      choices: [
        { id: "a", text: "claude-sonnet-4-6 — its larger context window is necessary for the document." },
        { id: "b", text: "claude-haiku-4-5-20251001 — a cheaper model, paired with prompt caching of the full document, makes per-chunk contextualization affordable." },
        { id: "c", text: "An OpenAI embedding model — Claude isn't used in the contextualization step." },
        { id: "d", text: "claude-opus — only Opus has the reasoning depth required for accurate contextualization." },
      ],
      correctChoiceId: "b",
      explanation:
        "The Step 2 code sample uses claude-haiku-4-5-20251001 with the full document placed in the system block under cache_control. Haiku is cheap, and combined with prompt caching of the document the per-chunk cost is dominated by the chunk text rather than the whole document.",
    },
    {
      id: "q15",
      prompt:
        "Which of the following is listed as a wrong answer to reject in the module's 'exam traps' table?",
      choices: [
        { id: "a", text: "'Use BM25 alongside vector search to catch exact terms.'" },
        { id: "b", text: "'Cache the source document during contextualization to lower cost.'" },
        { id: "c", text: "'Just use a bigger context window — RAG is obsolete.'" },
        { id: "d", text: "'Use citations to ground answers and create audit trails.'" },
      ],
      correctChoiceId: "c",
      explanation:
        "The 'exam traps to reject' table flags 'Just use a bigger context window — RAG is obsolete' as wrong because cost, latency, and attention all suffer at very large context sizes. The other three options listed here are the recommended practices, not traps.",
    },
    {
      id: "q16",
      prompt:
        "What chunk overlap percentage does the module recommend to preserve cross-chunk context?",
      choices: [
        { id: "a", text: "0% — overlap wastes embedding budget." },
        { id: "b", text: "10–20% — enough to preserve cross-chunk context without excessive duplication." },
        { id: "c", text: "50% — every chunk should overlap heavily with its neighbors." },
        { id: "d", text: "Whatever the embedding model defaults to." },
      ],
      correctChoiceId: "b",
      explanation:
        "The chunking guidelines table recommends 10–20% overlap. This preserves enough cross-chunk context (so a sentence split across boundaries isn't lost) without significantly inflating storage and embedding costs.",
    },
    {
      id: "q17",
      prompt:
        "In what order is the prompt caching hierarchy applied in Claude, according to the module?",
      choices: [
        { id: "a", text: "Messages → System → Tools (bottom-up)." },
        { id: "b", text: "Tools → System → Messages (top-down)." },
        { id: "c", text: "System → Tools → Messages." },
        { id: "d", text: "There is no hierarchy — each cache breakpoint is independent." },
      ],
      correctChoiceId: "b",
      explanation:
        "The prompt caching mechanics table specifies the cache hierarchy as Tools → System → Messages, cached top-down. Notably, changing tool definitions invalidates downstream cache (System and Messages), which is why tool definitions should be stable.",
    },
    {
      id: "q18",
      prompt:
        "What is the retrieval failure rate after the full contextual retrieval stack — Contextual Embeddings + Contextual BM25 + Reranking — is applied?",
      choices: [
        { id: "a", text: "0.5% (−91% from baseline)." },
        { id: "b", text: "1.9% (−67% from baseline)." },
        { id: "c", text: "2.9% (−49% from baseline)." },
        { id: "d", text: "3.7% (−35% from baseline)." },
      ],
      correctChoiceId: "b",
      explanation:
        "The full stack — contextual embeddings, contextual BM25, and reranking — drives the retrieval failure rate down to 1.9%, a 67% reduction from the 5.7% baseline. The module emphasizes memorizing this final number as it appears in scenario questions.",
    },
    {
      id: "q19",
      prompt:
        "Why does the module argue against re-embedding chunks 'without contextualization to save cost'?",
      choices: [
        { id: "a", text: "Re-embedding is slower than re-using existing embeddings, so cost savings are illusory." },
        { id: "b", text: "The contextualization step IS the win — skipping it forfeits the entire 35–67% failure-rate reduction that justifies the architecture." },
        { id: "c", text: "Embedding models cannot run twice on the same chunk without producing different vectors." },
        { id: "d", text: "Re-embedding without contextualization invalidates the BM25 index." },
      ],
      correctChoiceId: "b",
      explanation:
        "Both the self-check ('I never re-embed without contextualization to save cost — the contextualization step IS the win') and the exam-traps table reject this answer. The whole point of contextual retrieval is the prepended context; removing it collapses retrieval back toward the 5.7% baseline.",
    },
    {
      id: "q20",
      prompt:
        "What is the recommended chunking method according to the module's guidelines?",
      choices: [
        { id: "a", text: "Character-based splitting at fixed character counts." },
        { id: "b", text: "Token-based splitting using a tokenizer, avoiding mid-sentence breaks." },
        { id: "c", text: "Sentence-by-sentence splitting with one sentence per chunk." },
        { id: "d", text: "Random splitting to ensure even coverage of the document." },
      ],
      correctChoiceId: "b",
      explanation:
        "The chunking guidelines specify token-based splitting (use a tokenizer, not character count), boundaries that don't split mid-sentence (prefer paragraph or section breaks), 200–500 tokens per chunk, and 10–20% overlap. Token-aware splitting aligns chunk sizes with how the embedding model actually counts input.",
    },
  ],
};

export default quiz;
