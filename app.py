import time

import streamlit as st

from ui_common import render_avatar, render_footer, render_sidebar_nav, setup_page

# Configure page and theme
setup_page("Home")
render_sidebar_nav("app")

def typewriter_subtitle(text: str, speed: float = 40):
    """Simple typewriter effect for the hero subtitle on first page load."""
    placeholder = st.empty()
    rendered = ""
    for ch in text:
        rendered += ch
        placeholder.markdown(
            f'<div class="subtitle">{rendered}</div>',
            unsafe_allow_html=True,
        )
        time.sleep(1.0 / speed)


# ----------------------------
# Hero Section (Home)
# ----------------------------
col1, col2, col3 = st.columns([1, 2, 1])
with col2:
    render_avatar("avatar.png")
    st.markdown('<div class="main-header">Per4ex.org</div>', unsafe_allow_html=True)
    if "hero_typed" not in st.session_state:
        typewriter_subtitle("Specialized in AI-Related Ecosystems")
        st.session_state["hero_typed"] = True
    else:
        st.markdown(
            '<div class="subtitle">Specialized in AI-Related Ecosystems</div>',
            unsafe_allow_html=True,
        )

st.markdown(
    """
    <p style="font-size: 1.1rem; line-height: 1.9; color: #e8e8e8;">
    Welcome to Per4ex.org, a systems-focused portfolio for AI-related ecosystems.
    </p>
    """,
    unsafe_allow_html=True,
)

# ----------------------------
# About content (merged from About page)
# ----------------------------
st.markdown('<div class="section-header">About</div>', unsafe_allow_html=True)

col_left, col_right = st.columns([2, 1])

with col_left:
    st.markdown(
        """
        <div class="highlight-box">
        <p style="font-size: 1.05rem; line-height: 1.9; color: #e8e8e8;">
        I design, build, and optimize complex systems at the intersection of artificial intelligence, 
        infrastructure, and human-computer interaction. My expertise spans the full stack of AI ecosystems—from 
        distributed computing architectures and <span class="tech-term">MLOps</span> pipelines to intelligent agent systems and knowledge 
        management platforms.
        </p>
        <p style="font-size: 1.05rem; line-height: 1.9; margin-top: 1.5rem; color: #e8e8e8;">
        I focus on creating robust, scalable systems that enable AI capabilities while maintaining 
        reliability, observability, and ethical considerations. Whether it's building <span class="tech-term">RAG</span> systems, 
        orchestrating multi-agent workflows, or architecting data pipelines for machine learning, 
        I bring a systems thinking approach to every challenge.
        </p>
        <p style="font-size: 1.05rem; line-height: 1.9; margin-top: 1.5rem; color: #e8e8e8;">
        The Catalyst backend service is a persistent macOS <span class="tech-term">launchd</span> daemon that provides long-running state management, 
        proactive message generation, background data fetching, and WebSocket communication for the Catalyst AI assistant platform.
        </p>
        </div>
        """,
        unsafe_allow_html=True,
    )

with col_right:
    st.markdown(
        """
        <div class="focus-list">
        <h3 style="margin-top: 0; color: #f5f5f5;">Core Focus Areas</h3>
        <ul style="line-height: 2; color: #e8e8e8;">
        <li><span class="material-symbols-outlined">smart_toy</span> <strong>AI/ML Infrastructure</strong></li>
        <li><span class="material-symbols-outlined">sync</span> <strong>Distributed Systems</strong></li>
        <li><span class="material-symbols-outlined">psychology</span> <strong>Intelligent Agents</strong></li>
        <li><span class="material-symbols-outlined">bar_chart</span> <strong>Data Engineering</strong></li>
        <li><span class="material-symbols-outlined">search</span> <strong>RAG &amp; Knowledge Systems</strong></li>
        <li><span class="material-symbols-outlined">settings</span> <strong>MLOps &amp; Observability</strong></li>
        </ul>
        </div>
        """,
        unsafe_allow_html=True,
    )

render_footer()
