import streamlit as st

from ui_common import render_avatar, render_footer, render_sidebar_nav, setup_page


def main():
    setup_page("Connect")
    render_sidebar_nav("Connect")

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        render_avatar("avatar.png")
        st.markdown('<div class="main-header">Connect</div>', unsafe_allow_html=True)
        st.markdown("---")

    st.markdown('<div class="section-header">Connect</div>', unsafe_allow_html=True)

    contact_cols = st.columns(4)
    with contact_cols[0]:
        st.markdown(
            """
            <div style="text-align: center;">
            <strong style="color: #f5f5f5;">Email</strong>
            <a href="mailto:contact@per4ex.org" class="contact-link" style="margin-top: 0.5rem;">
                <span class="material-symbols-outlined">mail</span> Get in touch
            </a>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with contact_cols[1]:
        st.markdown(
            """
            <div style="text-align: center;">
            <strong style="color: #f5f5f5;">GitHub</strong>
            <a href="https://github.com" class="contact-link" style="margin-top: 0.5rem;">
                <span class="material-symbols-outlined">code</span> github.com
            </a>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with contact_cols[2]:
        st.markdown(
            """
            <div style="text-align: center;">
            <strong style="color: #f5f5f5;">LinkedIn</strong>
            <a href="https://linkedin.com" class="contact-link" style="margin-top: 0.5rem;">
                <span class="material-symbols-outlined">work</span> linkedin.com
            </a>
            </div>
            """,
            unsafe_allow_html=True,
        )
    with contact_cols[3]:
        st.markdown(
            """
            <div style="text-align: center;">
            <strong style="color: #f5f5f5;">Website</strong>
            <a href="https://per4ex.org" class="contact-link" style="margin-top: 0.5rem;">
                <span class="material-symbols-outlined">language</span> per4ex.org
            </a>
            </div>
            """,
            unsafe_allow_html=True,
        )

    render_footer()


if __name__ == "__main__":
    main()


