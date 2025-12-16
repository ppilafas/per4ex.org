import streamlit as st

from ui_common import render_avatar, render_footer, render_sidebar_nav, setup_page


def main():
    setup_page("Catalyst AI")
    render_sidebar_nav("Catalyst AI")

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        render_avatar("catalyst.png")
        st.markdown(
            '<div class="main-header">'
            "Catalyst AI</div>",
            unsafe_allow_html=True,
        )
        st.markdown(
            '<div class="subtitle">A local-first, always-on personal AI operating system for your local setup</div>',
            unsafe_allow_html=True,
        )
        st.markdown("---")

    st.markdown('<div class="section-header">Catalyst AI — Expanded System Overview</div>', unsafe_allow_html=True)

    st.markdown(
        """
<p style="font-size: 1.05rem; line-height: 1.9; color: #e8e8e8;">
<strong>Catalyst</strong> is a local-first, multi-component personal assistant system designed to run as a real, 
always-available “second brain” on your own machine. It combines a persistent backend service, a web dashboard, and 
native desktop clients to deliver tool-augmented LLM workflows, long-lived context, proactive background intelligence, 
and advanced voice interaction.
</p>

<hr/>

### 1) Persistent Service Core (macOS <span class="tech-term">launchd</span> daemon)

At the heart of Catalyst is a long-running backend service that runs independently of any UI. It is installed as a 
<span class="tech-term">launchd</span> daemon on macOS, so it can maintain state across restarts and keep background tasks running continuously.

**Core responsibilities**

- Conversation state management (authoritative, persistent state across sessions)
- WebSocket server for real-time, bidirectional client communication  
  <span class="tech-term">Default:</span> <code>ws://localhost:8765</code> (configurable)
- Tool calling and routing (custom tools + built-in tools)
- Background work orchestration (cron-like scheduler, job queue, caches)
- Service health monitoring and operational logging

<hr/>

### 2) Voice Architecture (two execution modes)

Catalyst supports two voice modes, optimized for different trade-offs—cost/reliability vs. ultra-low latency.

**Chained Voice (default)**

- Flow: Voice → STT → LLM → TTS → Audio
- Better for structured workflows, explicit transcripts, and complex tool-heavy turns
- Streams MP3 audio output

**Realtime Voice (beta)**

- Flow: Voice → GPT Realtime API → PCM16 audio → client
- Ultra-low latency and natural interruptions
- Uses PCM16 24 kHz mono audio
- Supports function calling (tools) in realtime sessions

<hr/>

### 3) Tool System (actions, retrieval, integrations)

Catalyst is built around an explicit tool layer: the model can call tools, receive results, and continue reasoning with 
evidence and side effects.

**Built-in tools (provider-native)**

- <span class="tech-term">file_search</span> — vector-store search
- <span class="tech-term">web_search</span> / <span class="tech-term">web_search_preview</span> (depending on model class)

**Custom function tools (Catalyst-native)**

- SQL querying over allow-listed local databases
- Gmail reading/searching and email drafting/sending (with confirmation gates)
- Google Calendar and Contacts reading/searching
- Local RAG semantic search over embeddings
- Settings read/modify endpoints for dynamic behavior control

<hr/>

### 4) Retrieval, Memory, and Persistence (local-first)

Catalyst persists state and intelligence locally using SQLite-backed storage, with optional vector-store flows depending 
on configuration. The system is designed to retain continuity: not a “chat tab,” but a long-lived assistant with 
structured memory operations.

**Key mechanisms**

- DB-backed cache for background-fetched external data (Gmail, news, calendar snapshots)
- Autonomous checkpointing (periodic summary checkpoints of conversation state)
- Persona evolution at longer intervals for long-term assistant tuning
- Token tracking and per-turn accounting (cost and context efficiency visibility)

<hr/>

### 5) Proactive &amp; Background Intelligence (always-on workflows)

Catalyst is not purely reactive. The service runs background loops that can refresh context and generate proactive 
messages when you're idle.

**Examples**

- <strong>Proactive listener:</strong> monitors inactivity and can generate proactive messages (with cooldown control)
- <strong>Background fetcher:</strong> periodically pulls Gmail, world/Greek news, and calendar into cache for fast 
  “Today’s&nbsp;Pulse” style answers
- <strong>Cron loop:</strong> processes periodic tasks, job queue, summaries, and health checks

<hr/>

### 6) Multi-LLM Routing (provider-agnostic execution)

Catalyst routes LLM calls through a provider-agnostic layer so different workloads can use different models/providers 
(e.g., realtime chat vs. summarization vs. proactive jobs) without changing call sites. Routing profiles are configurable 
and persisted so you can tune cost, latency, and quality per use case.

<hr/>

### 7) Client Surfaces (native &amp; web dashboard)

Catalyst intentionally separates the “assistant experience” from the “control surface.”

**Streamlit Dashboard (web UI)**

- Chat UI with streaming responses
- Settings, tool toggles, and routing profiles
- Conversation history and token tracking analytics
- “Today’s&nbsp;Pulse” dashboards (news / Gmail / calendar snapshots)
- Service status and debugging workflows

**Native Desktop Clients**

- <strong>SwiftUI client:</strong> fully native macOS client with direct WebSocket connection to the service; supports both voice architectures
- <strong>Tauri client:</strong> cross-platform wrapper (WebView over the Streamlit UI) for lightweight distribution

<hr/>

### 8) What Makes Catalyst Different

Catalyst is not just “an LLM UI.” It’s a personal agent system with:

- A persistent daemon (stateful, proactive, always-on)
- A tool runtime that can reason-and-act across real data sources
- Dual voice modes (chained and realtime) with full tool support
- A strong emphasis on observability (tokens, routing, logs, service health)
- A modular architecture built to be extended without rewriting the stack

<hr/>

### Links

- 🔧 <strong>Catalyst Service (Backend) — docs / overview:</strong> <em>(add repo or site link here)</em>  
- 🖥️ <strong>Catalyst Streamlit App — docs / overview:</strong> <em>(add repo or site link here)</em>  
- 💻 <strong>Catalyst Native Client — docs / overview:</strong> <em>(add repo or site link here)</em>
        """,
        unsafe_allow_html=True,
    )

    render_footer()


if __name__ == "__main__":
    main()


