import Image from "next/image"

export default function TechnicalExpertise() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr_1fr] gap-4 mb-8">
        <div />
        <div className="flex flex-col items-center">
          <div className="relative w-[140px] h-[140px] mb-6 rounded-full overflow-hidden border-[3px] border-foreground">
             <Image src="/current_focus.png" alt="Technical Expertise" fill className="object-cover" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground">Technical Expertise</h1>
          <hr className="w-full border-t border-card-border mt-6" />
        </div>
        <div />
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mb-6 border-b-2 border-sidebar-border pb-3">Technical Expertise</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="glass-panel">
             <h3 className="text-xl font-bold text-foreground mb-4">Infrastructure & DevOps</h3>
             <ul className="space-y-2 text-muted leading-relaxed list-disc pl-4">
                <li>Cloud Platforms (AWS, GCP, Azure)</li>
                <li>Container Orchestration (K8s, Docker)</li>
                <li>CI/CD Pipelines</li>
                <li>Infrastructure as Code</li>
                <li>Monitoring & Observability</li>
                <li>Service Mesh Architectures</li>
             </ul>
           </div>
           
           <div className="glass-panel">
             <h3 className="text-xl font-bold text-foreground mb-4">AI/ML Systems</h3>
             <ul className="space-y-2 text-muted leading-relaxed list-disc pl-4">
                <li>LLM Integration & Fine-tuning</li>
                <li>RAG (Retrieval-Augmented Generation)</li>
                <li>Vector Databases & Embeddings</li>
                <li>Model Serving & Inference</li>
                <li>Training Pipelines</li>
                <li>Multi-Agent Systems</li>
             </ul>
           </div>

           <div className="glass-panel">
             <h3 className="text-xl font-bold text-foreground mb-4">Software Engineering</h3>
             <ul className="space-y-2 text-muted leading-relaxed list-disc pl-4">
                <li>Python, Go, TypeScript</li>
                <li>Distributed Systems Design</li>
                <li>API Design & Microservices</li>
                <li>Event-Driven Architectures</li>
                <li>Database Systems (SQL/NoSQL)</li>
                <li>Real-time Data Processing</li>
             </ul>
           </div>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-foreground mt-12 mb-6 border-b-2 border-sidebar-border pb-3">Technologies & Tools</h2>
        <div className="glass-panel">
             <p className="text-lg leading-relaxed text-muted mb-6">
                The Catalyst backend service is a persistent macOS <span className="bg-card-border px-2 py-0.5 rounded text-foreground text-base">launchd</span> daemon that provides long-running state management,
                proactive message generation, background data fetching, and WebSocket communication for the Catalyst AI assistant platform.
             </p>
             <div className="flex flex-wrap justify-center gap-2 mt-4">
                {[
                  "Python", "Go", "TypeScript", "Kubernetes", "Docker", "AWS", "GCP", 
                  "Terraform", "LangChain", "LlamaIndex", "Pinecone", "Weaviate", 
                  "PostgreSQL", "Redis", "Apache Kafka", "Apache Airflow", "MLflow", 
                  "Prometheus", "Grafana", "FastAPI", "Streamlit", "React", "Git"
                ].map(tech => (
                  <span key={tech} className="bg-card text-foreground px-4 py-2 rounded border border-card-border text-sm">
                    {tech}
                  </span>
                ))}
             </div>
        </div>
      </div>
    </div>
  )
}

