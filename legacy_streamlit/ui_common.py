import base64
from datetime import datetime
from pathlib import Path

import requests
import streamlit as st


def setup_page(page_title_suffix: str = "Home") -> None:
    """Configure the Streamlit page and inject global styles."""
    full_title = f"Per4ex.org | {page_title_suffix}" if page_title_suffix else "Per4ex.org"

    st.set_page_config(
        page_title=full_title,
        page_icon="⚙️",  # Note: page_icon doesn't support Material Symbols directly
        layout="wide",
        initial_sidebar_state="expanded",
    )

    # Global typography, layout and theme
    st.markdown(
        """
        <link href="https://fonts.googleapis.com/css2?family=Hack:wght@400;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" media="all">
        <style>
            @font-face {
                font-family: 'Material Symbols Outlined';
                font-style: normal;
                font-weight: 400;
                src: url(https://fonts.gstatic.com/s/materialsymbolsoutlined/v179/kJF1BvYX7BgnkSrUwT8OhrdQw4oELdPIeeII9v6oFsI.woff2) format('woff2');
            }
        </style>
        <style>
            * {
                font-family: 'Hack', 'Courier New', monospace !important;
            }
            
            .stApp {
                background-color: #2d2d2d;
            }
            
            /* Sidebar styling to match main theme and keep it always visible */
            section[data-testid="stSidebar"] {
                background-color: #2d2d2d !important;
                border-right: 1px solid #3d3d3d;
                min-width: 280px;
                transform: translateX(0) !important;
                visibility: visible !important;
            }
            
            /* Hide only the top-right hamburger menu toggle */
            button[kind="header"] [data-testid="baseButton-toggleSidebar"] {
                display: none !important;
            }
            
            section[data-testid="stSidebar"] .block-container {
                padding-top: 2rem;
                padding-bottom: 2rem;
            }
            
            /* Match header bar to background */
            header[data-testid="stHeader"] {
                background-color: #2d2d2d !important;
                border-bottom: none;
            }
            
            /* Hide Streamlit menu button */
            #MainMenu {
                visibility: hidden;
            }
            
            /* Hide header decoration line */
            header[data-testid="stHeader"]::before {
                display: none;
            }
            
            /* Style deploy button area */
            .stDeployButton {
                display: none;
            }
            
            /* Hide any header borders or lines */
            header[data-testid="stHeader"] > div {
                background-color: #2d2d2d !important;
            }
            
            .main .block-container {
                padding-top: 2.2rem;
                padding-bottom: 3rem;
                padding-left: 2.5rem;
                max-width: 1100px;
            }
            
            .main-header {
                font-size: 4rem;
                font-weight: 700;
                text-align: center;
                color: #f5f5f5;
                margin-bottom: 0.5rem;
            }
            
            .subtitle {
                font-size: 1.4rem;
                text-align: center;
                color: #e8e8e8;
                margin-bottom: 3rem;
            }
            
            .section-header {
                font-size: 2.2rem;
                font-weight: 700;
                color: #f5f5f5;
                margin-top: 3rem;
                margin-bottom: 1.5rem;
                border-bottom: 2px solid #3d3d3d;
                padding-bottom: 0.8rem;
            }
            
            .skill-badge {
                display: inline-block;
                background-color: #3d3d3d;
                color: #f5f5f5;
                padding: 0.6rem 1.2rem;
                border-radius: 4px;
                margin: 0.4rem;
                font-size: 0.85rem;
                border: 1px solid #4d4d4d;
            }
            
            .highlight-box {
                background-color: #3d3d3d;
                padding: 2rem;
                border-radius: 8px;
                margin: 0;
                border: 1px solid #4d4d4d;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .focus-list {
                background-color: #3d3d3d;
                padding: 2rem;
                border-radius: 8px;
                border: 1px solid #4d4d4d;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .expertise-card {
                background-color: #3d3d3d;
                padding: 1.8rem;
                border-radius: 8px;
                margin-bottom: 1rem;
                border: 1px solid #4d4d4d;
            }
            
            .project-card {
                background-color: #3d3d3d;
                padding: 1.5rem;
                border-radius: 8px;
                margin: 1rem 0;
                border: 1px solid #4d4d4d;
            }
            
            .contact-link {
                display: block;
                padding: 0.8rem;
                background-color: #3d3d3d;
                border-radius: 8px;
                text-decoration: none;
                color: #f5f5f5;
                border: 1px solid #4d4d4d;
            }
            
            .tech-term {
                background-color: #4d4d4d;
                padding: 0.2rem 0.5rem;
                border-radius: 4px;
                color: #f5f5f5;
            }
            
            hr {
                border: none;
                height: 1px;
                background-color: #4d4d4d;
                margin: 2rem 0;
            }
            
            h1, h2, h3, h4, h5, h6, p, li, span, div, a {
                color: #f5f5f5;
            }
            
            .stMarkdown, .stMarkdown p, .stMarkdown li {
                color: #f0f0f0;
                line-height: 1.7;
            }
            
            .stTabs [data-baseweb="tab-list"] {
                background-color: #3d3d3d;
            }
            
            .stTabs [data-baseweb="tab"] {
                color: #e8e8e8;
            }
            
            /* Align columns at top */
            [data-testid="column"] {
                align-items: flex-start;
            }
            
            /* Ensure boxes align */
            .stColumn > div {
                display: flex;
                flex-direction: column;
                height: 100%;
            }
            
            /* Material Symbols styling */
            .material-symbols-outlined {
                font-family: 'Material Symbols Outlined' !important;
                font-weight: normal !important;
                font-style: normal !important;
                font-size: 1.2em !important;
                line-height: 1 !important;
                letter-spacing: normal !important;
                text-transform: none !important;
                display: inline-block !important;
                white-space: nowrap !important;
                word-wrap: normal !important;
                direction: ltr !important;
                vertical-align: middle !important;
                margin-right: 0.4rem !important;
                font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24 !important;
                -webkit-font-smoothing: antialiased !important;
            }
            
            /* Override Hack font for Material Symbols */
            .material-symbols-outlined {
                font-family: 'Material Symbols Outlined' !important;
            }
            
            /* Custom sidebar nav styles */
            section[data-testid="stSidebar"] a.sidebar-link {
                display: flex;
                align-items: center;
                gap: 0.6rem;
                text-decoration: none;
                color: #e8e8e8;
                padding: 0.35rem 0.6rem;
                border-radius: 999px;
                transition: background-color 0.15s ease, color 0.15s ease;
            }
            section[data-testid="stSidebar"] a.sidebar-link span.sidebar-label {
                font-size: 0.95rem;
            }
            section[data-testid="stSidebar"] a.sidebar-link:hover {
                background-color: #3d3d3d;
                color: #ffffff;
            }
            section[data-testid="stSidebar"] img.sidebar-avatar {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                object-fit: cover;
                border: 1px solid #4d4d4d;
                filter: grayscale(100%);
                transition: filter 0.2s ease;
            }
            section[data-testid="stSidebar"] a.sidebar-link.active img.sidebar-avatar {
                filter: grayscale(0%);
            }
            section[data-testid="stSidebar"] a.sidebar-link:hover img.sidebar-avatar {
                filter: grayscale(0%);
            }
            
            /* Style the built-in sidebar collapse/expand control to show a Material icon
               and disable interaction so the sidebar cannot be hidden. */
            [data-testid="collapsedControl"] button {
                font-family: 'Material Symbols Outlined', sans-serif !important;
                font-size: 20px;
                color: #e8e8e8;
                pointer-events: none;  /* prevent click to collapse */
            }
            
            /* Hide stray Material icon ligature text such as "keyboard_double_arrow_right" */
            span[data-testid="stIconMaterial"] {
                font-size: 0 !important;        /* hide glyph/text */
                color: transparent !important;  /* just in case */
            }
            
            
            /* Hide default Streamlit page selector so we can use a custom one */
            section[data-testid="stSidebar"] [data-testid="stSidebarNav"] {
                display: none;
            }
        </style>
        """,
        unsafe_allow_html=True,
    )


def render_avatar(path: str = "avatar.png", size: int = 140) -> None:
    """Render a circular avatar image centered above the main title, if the file exists."""
    avatar_file = Path(path)
    if not avatar_file.exists():
        return

    try:
        data = avatar_file.read_bytes()
        encoded = base64.b64encode(data).decode()
    except Exception:
        return

    st.markdown(
        f"""
        <div style="display: flex; justify-content: center; margin-bottom: 1.5rem;">
            <img src="data:image/png;base64,{encoded}"
                 alt="Avatar"
                 style="
                    width: {size}px;
                    height: {size}px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 3px solid #f5f5f5;
                 " />
        </div>
        """,
        unsafe_allow_html=True,
    )


@st.cache_data(ttl=3600)
def fetch_github_repos(user: str):
    """Fetch public GitHub repositories for the given user."""
    url = f"https://api.github.com/users/{user}/repos"
    try:
        response = requests.get(url, params={"sort": "updated", "per_page": 100}, timeout=10)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        st.warning(f"Unable to load GitHub repositories for {user}: {e}")
        return []


@st.cache_data(ttl=3600)
def load_avatar_icon(path: str) -> str:
    """Load an avatar image and return a base64 string, or empty string on error."""
    avatar_file = Path(path)
    if not avatar_file.exists():
        return ""
    try:
        data = avatar_file.read_bytes()
        return base64.b64encode(data).decode()
    except Exception:
        return ""


def render_footer() -> None:
    """Render the standard footer."""
    st.markdown("---")
    st.markdown(
        f"""
        <div style="text-align: center; color: #e8e8e8; padding: 2rem; font-size: 0.9rem;">
        © {datetime.now().year} Systems Engineer | AI Ecosystems Specialist — Built with Streamlit & Hack Font
        </div>
        """,
        unsafe_allow_html=True,
    )


def render_sidebar_nav(active: str) -> None:
    """Render a custom sidebar page list with per-page avatars."""
    pages = [
        ("/", "app", "avatar.png", "Home"),
        ("/Technical_Expertise", "Technical Expertise", "current_focus.png", "Technical Expertise"),
        ("/GitHub_Projects", "GitHub", "github.png", "GitHub"),
        ("/Connect", "Connect", "authorified_scarf.png", "Connect"),
        ("/Catalyst_AI", "Catalyst AI", "catalyst.png", "Catalyst AI"),
        ("/Authored_Works", "Authored Works", "parisian_author.png", "Authored Works"),
    ]

    items_html: list[str] = []
    for href, key, icon_path, label in pages:
        is_active = key == active
        active_style = "background-color: #3d3d3d;" if is_active else ""
        icon_data = load_avatar_icon(icon_path)
        if icon_data:
            icon_html = (
                f'<img src="data:image/png;base64,{icon_data}" '
                f'alt="{label} avatar" class="sidebar-avatar" />'
            )
        else:
            icon_html = '<span class="sidebar-avatar" style="background-color:#4d4d4d;"></span>'
        active_class = " active" if is_active else ""
        items_html.append(
            f'<li style="margin-bottom: 0.4rem; list-style: none;">'
            f'<a href="{href}" class="sidebar-link{active_class}" target="_self">'
            f'{icon_html}'
            f'<span class="sidebar-label" style="{active_style}">{label}</span>'
            f"</a></li>"
        )

    # IMPORTANT: build HTML without leading spaces so Markdown doesn't treat it as a code block
    html = (
        '<div style="margin-bottom: 1.5rem;">'
        '<h3 style="margin-top: 0; color: #f5f5f5;">Navigate</h3>'
        '<ul style="padding-left: 0; margin-left: 0; list-style: none;">'
        + "".join(items_html)
        + "</ul></div>"
    )

    with st.sidebar:
        st.markdown(html, unsafe_allow_html=True)


