import streamlit as st

from ui_common import fetch_github_repos, render_avatar, render_footer, render_sidebar_nav, setup_page


def main():
    setup_page("GitHub")
    render_sidebar_nav("GitHub")

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        render_avatar("github.png")
        st.markdown('<div class="main-header"><span class="material-symbols-outlined">code</span> GitHub</div>', unsafe_allow_html=True)
        st.markdown("---")

    st.markdown('<div class="section-header">GitHub</div>', unsafe_allow_html=True)

    refresh = st.button("🔄 Refresh from GitHub", help="Clear cache and reload public repositories from GitHub.")
    if refresh:
        fetch_github_repos.clear()
    repos = fetch_github_repos("ppilafas")
    if not repos:
        st.info("No public repositories found or unable to fetch data from GitHub right now.")
    else:
        st.markdown(
            """
            <p style="color: #e8e8e8; margin-bottom: 1rem;">
            Showing public repositories from <a href="https://github.com/ppilafas" style="color: #e8e8e8; text-decoration: underline;">github.com/ppilafas</a>.
            </p>
            """,
            unsafe_allow_html=True,
        )
        # Sort by updated_at descending just in case
        repos_sorted = sorted(repos, key=lambda r: r.get("updated_at", ""), reverse=True)
        for repo in repos_sorted:
            name = repo.get("name", "Unnamed repository")
            description = repo.get("description") or "No description provided."
            html_url = repo.get("html_url", "")
            language = repo.get("language") or "Unknown"
            stars = repo.get("stargazers_count", 0)
            updated_at = repo.get("updated_at", "")

            st.markdown(
                f"""
                <div class="project-card">
                    <h4 style="color: #f5f5f5; margin-top: 0;">
                        <a href="{html_url}" style="color: #f5f5f5; text-decoration: none;">
                            {name}
                        </a>
                    </h4>
                    <p style="color: #e8e8e8; margin-bottom: 0.5rem; font-size: 0.9rem;">
                        <span class="tech-term">{language}</span>
                        &nbsp;•&nbsp;
                        <span class="material-symbols-outlined" style="font-size: 1rem; vertical-align: text-bottom;">star</span>
                        {stars}
                    </p>
                    <p style="color: #e8e8e8; line-height: 1.7; margin-bottom: 0.5rem;">
                        {description}
                    </p>
                    <p style="color: #a8a8a8; font-size: 0.8rem; margin-bottom: 0;">
                        Last updated: {updated_at}
                    </p>
                </div>
                """,
                unsafe_allow_html=True,
            )

    render_footer()


if __name__ == "__main__":
    main()


