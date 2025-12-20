import streamlit as st

from ui_common import render_avatar, render_footer, render_sidebar_nav, setup_page


def main():
    setup_page("Authored Works")
    render_sidebar_nav("Authored Works")

    col1, col2, col3 = st.columns([1, 2, 1])
    with col2:
        render_avatar("parisian_author.png")
        st.markdown(
            '<div class="main-header"><span class="material-symbols-outlined">menu_book</span> Authored Works</div>',
            unsafe_allow_html=True,
        )
        st.markdown("---")

    st.markdown('<div class="section-header">Cosmic Dice</div>', unsafe_allow_html=True)

    st.markdown(
        """
**Cosmic Dice**

*Putting Consciousness at the Helm of the Universe*  
Book · Systems Philosophy · AI & Agency  
**Author:** Panagiotis Pilafas

### Overview

Cosmic Dice is a systems-level exploration of agency, responsibility, and probabilistic decision-making in humans, institutions, and artificial intelligence.  
It treats minds—human and synthetic—not as deterministic machines or mystical exceptions, but as probabilistic systems operating within constrained landscapes of possibility.

The book connects modern physics, cognitive science, philosophy, and AI into a single conceptual framework, focusing on how choice, responsibility, and meaning remain possible in a world governed by laws, uncertainty, and stochastic computation.

### Key Themes

- Minds as probabilistic systems, not deterministic scripts  
- Willed randomness: constrained agency within stochastic processes  
- Consciousness as a field of experience, not a control mechanism  
- Artificial intelligence as shared socio-technical systems, not isolated tools  
- Responsibility as probability-shaping, not metaphysical free will  

### Relevance to My Engineering Work

The ideas developed in Cosmic Dice directly inform how I design agentic AI systems, including:

- Explicit agent state and control flow  
- Cost-aware and uncertainty-aware model orchestration  
- Retrieval-augmented systems with long-term memory  
- Tool-augmented agents operating under real-world constraints  
- AI systems viewed as decision infrastructures, not black boxes  

This work provides the conceptual foundation behind projects like **Catalyst AI**, where probabilistic models, tools, memory, and human interaction are treated as parts of a single, coherent system.

### Links

- 📘 **Read the book (PDF):** [per4ex.org/cosmic-dice](https://per4ex.org/cosmic-dice)  
- 🧠 **Related system: Catalyst AI:** [github.com/ppilafas/catalyst-swift-app](https://github.com/ppilafas/catalyst-swift-app)
        """
    )

    render_footer()


if __name__ == "__main__":
    main()


