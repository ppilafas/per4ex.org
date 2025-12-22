import Link from "next/link"

export function Footer() {
  return (
    <footer className="mt-12 pt-8 border-t border-card-border text-center text-muted text-sm pb-8">
      <p className="mb-4">© {new Date().getFullYear()} Systems Engineer | AI Ecosystems Specialist — Built with Next.js & Tailwind</p>
      <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
        <Link 
          href="/privacy" 
          className="text-muted hover:text-accent transition-colors duration-200"
        >
          Privacy Policy
        </Link>
        <span className="text-card-border">•</span>
        <Link 
          href="/terms" 
          className="text-muted hover:text-accent transition-colors duration-200"
        >
          Terms of Service
        </Link>
      </div>
    </footer>
  )
}

