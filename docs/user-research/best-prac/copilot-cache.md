Yes, that claim is correct. In agentic and multi-turn coding sessions, GitHub Copilot (and the underlying OpenAI/Anthropic models it leverages) bills cached input tokens at roughly 10% of the normal input price, effectively giving you a 90% discount.

Because uncached input tokens cost up to 10 times as much as cached ones, maximizing your cache hit rate is crucial for keeping costs down and reducing time-to-first-token latency.

Here is how prompt caching works under the hood and the best practices for keeping your context stable.

### How Prefix Caching Works

LLM caching relies on **prefix matching**. The system reads your prompt from top to bottom. If the sequence of tokens exactly matches a previous request up to a certain point (the "prefix"), it pulls that chunk from the cache. The moment a single token differs from the previous prompt, the cache breaks, and the model must process everything from that point onward from scratch.

### Best Practices for Cache Stability

To keep your cached files stable and maximize that 90% discount, you need to structure your context around how frequently different pieces of information change.

**1. Order matters: Static first, dynamic last**
Always place the most stable content at the very beginning of your prompt and the most volatile content at the end. A standard optimized structure looks like this:

* **Top:** System prompts, core instructions, and tool definitions.
* **Middle:** Large, stable context files (e.g., API documentation, database schemas, or unchanging reference code).
* **Bottom:** Actively edited files, chat history, and the current user query.

**2. Eliminate dynamic variables in the prefix**
Never include elements like dynamic timestamps, random session IDs, or real-time metrics near the top of your prompt. A single updated timestamp at the top of the file will break the prefix match instantly, causing a cache miss for the entire payload.

**3. Be mindful of formatting (Exact matching)**
Caching requires a 100% exact, byte-for-byte string match. If you change a single space, reorder a list of included files, or modify the indentation in a file loaded at the top of your context, the cache will invalidate from that character onward.

**4. Batch your file edits**
When working with an AI coding assistant, jumping rapidly between different files and making micro-edits can thrash the cache. If a file is loaded high up in the context window, try to batch your edits or ask your questions before modifying it, as saving the file changes its token representation.

**5. Keep an eye on the TTL (Time to Live)**
Caches typically live in fast GPU memory for about 5 to 10 minutes of inactivity. Every time you get a cache hit, this timer resets. If you step away for a coffee and the cache expires, your next prompt will cold-start and you'll pay the full token price to rebuild it.