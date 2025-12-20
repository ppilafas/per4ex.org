import streamlit as st

from ui_common import render_avatar, render_footer, render_sidebar_nav, setup_page


def main():
    setup_page("Technical Expertise")
    render_sidebar_nav("Technical Expertise")

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        render_avatar("current_focus.png")
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

    # Technologies & Tools (merged from former separate page)
    st.markdown('<div class="section-header">Technologies &amp; Tools</div>', unsafe_allow_html=True)

    st.markdown(
        """
        <div style="padding: 1.5rem; background-color: #3d3d3d; border-radius: 8px; margin: 1rem 0; border: 1px solid #4d4d4d;">
            <p style="text-align: left; font-size: 1.0rem; line-height: 1.8; color: #e8e8e8; margin-bottom: 1.2rem;">
                The Catalyst backend service is a persistent macOS <span class="tech-term">launchd</span> daemon that provides long-running state management,
                proactive message generation, background data fetching, and WebSocket communication for the Catalyst AI assistant platform.
            </p>
            <div style="text-align: center; margin-top: 0.5rem;">
            <span class="skill-badge">Python</span>
            <span class="skill-badge">Go</span>
            <span class="skill-badge">TypeScript</span>
            <span class="skill-badge">Kubernetes</span>
            <span class="skill-badge">Docker</span>
            <span class="skill-badge">AWS</span>
            <span class="skill-badge">GCP</span>
            <span class="skill-badge">Terraform</span>
            <span class="skill-badge">LangChain</span>
            <span class="skill-badge">LlamaIndex</span>
            <span class="skill-badge">Pinecone</span>
            <span class="skill-badge">Weaviate</span>
            <span class="skill-badge">PostgreSQL</span>
            <span class="skill-badge">Redis</span>
            <span class="skill-badge">Apache Kafka</span>
            <span class="skill-badge">Apache Airflow</span>
            <span class="skill-badge">MLflow</span>
            <span class="skill-badge">Prometheus</span>
            <span class="skill-badge">Grafana</span>
            <span class="skill-badge">FastAPI</span>
            <span class="skill-badge">Streamlit</span>
            <span class="skill-badge">React</span>
            <span class="skill-badge">Git</span>
            </div>
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


