import streamlit as st

from ui_common import fetch_github_repos, render_avatar, render_footer, render_sidebar_nav, setup_page


def main():
    setup_page("Projects & Experience")
    render_sidebar_nav("Projects and Experience")

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        render_avatar("avatar.png")
        st.markdown('<div class="main-header">Projects &amp; Experience</div>', unsafe_allow_html=True)
        st.markdown("---")

    st.markdown('<div class="section-header">Projects &amp; Experience</div>', unsafe_allow_html=True)

    tab1, tab2 = st.tabs(["Featured Projects", "Systems Architecture"])

    with tab1:
        st.markdown('<h3><span class="material-symbols-outlined">rocket_launch</span> Featured Projects</h3>', unsafe_allow_html=True)

        st.markdown(
            """
            <div class="project-card">
            <h4 style="color: #f5f5f5; margin-top: 0;">Persistence for Existence</h4>
            <p style="color: #e8e8e8; margin-bottom: 0.5rem; font-size: 0.9rem;">per4ex.org</p>
            <p style="color: #e8e8e8; line-height: 1.8;">
            A long-term exploration of how humans and intelligent systems co-evolve, preserve memory, 
            and maintain continuity. Building tools for evidence preservation, <span class="tech-term">RAG</span> systems, and 
            interactive demos exploring cognition and synthetic constitutions.
            </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown(
            """
            <div class="project-card">
            <h4 style="color: #f5f5f5; margin-top: 0;">AI Ecosystem Infrastructure</h4>
            <p style="color: #e8e8e8; margin-bottom: 0.5rem; font-size: 0.9rem;">Production Systems</p>
            <p style="color: #e8e8e8; line-height: 1.8;">
            Designed and implemented scalable infrastructure for AI workloads including distributed 
            training pipelines, model serving architectures, and real-time inference systems with 
            comprehensive monitoring and observability.
            </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

        st.markdown(
            """
            <div class="project-card">
            <h4 style="color: #f5f5f5; margin-top: 0;">Triadic</h4>
            <p style="color: #e8e8e8; margin-bottom: 0.5rem; font-size: 0.9rem;">
            <a href="https://triadic.streamlit.app/" target="_blank" style="color: #e8e8e8; text-decoration: none;">triadic.streamlit.app</a>
            </p>
            <p style="color: #e8e8e8; line-height: 1.8;">
            An AI-to-AI self-dialogue platform where multiple AI agents engage in conversations with each other. 
            Powered by OpenAI GPT-5, the app features interactive controls, multiple view modes (Bubbles and IRC Text), 
            telemetry tracking, vector store integration, and timeline visualization of AI interactions. Demonstrates 
            advanced multi-agent systems and real-time AI communication architectures.
            </p>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with tab2:
        st.markdown('<h3><span class="material-symbols-outlined">construction</span> Systems Architecture</h3>', unsafe_allow_html=True)

        arch_col1, arch_col2 = st.columns(2)

        with arch_col1:
            st.markdown(
                """
                <div class="expertise-card">
                <h4 style="color: #f5f5f5; margin-top: 0;">Distributed AI Systems</h4>
                <ul style="line-height: 2; color: #e8e8e8;">
                <li>Microservices architecture for AI workloads</li>
                <li>Event-driven processing pipelines</li>
                <li>Scalable vector search infrastructure</li>
                <li>Multi-region deployment strategies</li>
                </ul>
                </div>
                """,
                unsafe_allow_html=True,
            )

        with arch_col2:
            st.markdown(
                """
                <div class="expertise-card">
                <h4 style="color: #f5f5f5; margin-top: 0;">MLOps &amp; Observability</h4>
                <ul style="line-height: 2; color: #e8e8e8;">
                <li>End-to-end ML pipeline automation</li>
                <li>Model versioning and experiment tracking</li>
                <li>Real-time monitoring and alerting</li>
                <li>Automated retraining workflows</li>
                </ul>
                </div>
                """,
                unsafe_allow_html=True,
            )

    render_footer()


if __name__ == "__main__":
    main()


