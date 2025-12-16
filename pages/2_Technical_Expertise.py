import streamlit as st

from ui_common import render_avatar, render_footer, render_sidebar_nav, setup_page


def main():
    setup_page("Technical Expertise")
    render_sidebar_nav("Technical Expertise")

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        render_avatar("avatar.png")
        st.markdown('<div class="main-header">Technical Expertise</div>', unsafe_allow_html=True)
        st.markdown("---")

    st.markdown('<div class="section-header">Technical Expertise</div>', unsafe_allow_html=True)

    expertise_cols = st.columns(3)

    with expertise_cols[0]:
        st.markdown(
            """
            <div class="expertise-card">
            <h3 style="color: #f5f5f5; margin-top: 0;">Infrastructure &amp; DevOps</h3>
            <ul style="line-height: 2; color: #e8e8e8;">
            <li>Cloud Platforms (AWS, GCP, Azure)</li>
            <li>Container Orchestration (K8s, Docker)</li>
            <li>CI/CD Pipelines</li>
            <li>Infrastructure as Code</li>
            <li>Monitoring &amp; Observability</li>
            <li>Service Mesh Architectures</li>
            </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with expertise_cols[1]:
        st.markdown(
            """
            <div class="expertise-card">
            <h3 style="color: #f5f5f5; margin-top: 0;">AI/ML Systems</h3>
            <ul style="line-height: 2; color: #e8e8e8;">
            <li>LLM Integration &amp; Fine-tuning</li>
            <li>RAG (Retrieval-Augmented Generation)</li>
            <li>Vector Databases &amp; Embeddings</li>
            <li>Model Serving &amp; Inference</li>
            <li>Training Pipelines</li>
            <li>Multi-Agent Systems</li>
            </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

    with expertise_cols[2]:
        st.markdown(
            """
            <div class="expertise-card">
            <h3 style="color: #f5f5f5; margin-top: 0;">Software Engineering</h3>
            <ul style="line-height: 2; color: #e8e8e8;">
            <li>Python, Go, TypeScript</li>
            <li>Distributed Systems Design</li>
            <li>API Design &amp; Microservices</li>
            <li>Event-Driven Architectures</li>
            <li>Database Systems (SQL/NoSQL)</li>
            <li>Real-time Data Processing</li>
            </ul>
            </div>
            """,
            unsafe_allow_html=True,
        )

    render_footer()


if __name__ == "__main__":
    main()


