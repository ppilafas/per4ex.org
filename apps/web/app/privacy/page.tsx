import { Shield, Database, Lock, Eye, Server, Mail } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="space-y-12">
      {/* Header */}
      <div className="flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold text-center text-foreground mb-2">Privacy Policy</h1>
        <p className="text-muted text-center">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Introduction */}
      <div className="glass-panel">
        <p className="text-lg leading-relaxed text-muted mb-4">
          At Per4ex.org, we are committed to protecting your privacy and ensuring transparency about how we collect, use, and safeguard your information. This Privacy Policy explains our practices regarding data collection and usage when you visit our website or interact with our services.
        </p>
        <p className="text-muted">
          By using Per4ex.org, you agree to the collection and use of information in accordance with this policy.
        </p>
      </div>

      {/* Information We Collect */}
      <div className="glass-panel border-l-4 border-l-accent">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Database className="w-6 h-6 text-accent" />
          Information We Collect
        </h2>
        <div className="space-y-4 text-muted">
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Information You Provide</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li>Contact information (email address) when you reach out via contact forms or email</li>
              <li>Messages and communications sent through our website or chat interfaces</li>
              <li>Any other information you voluntarily provide when interacting with our services</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Automatically Collected Information</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li>IP address and general location data</li>
              <li>Browser type and version</li>
              <li>Device information and operating system</li>
              <li>Pages visited, time spent on pages, and navigation patterns</li>
              <li>Referral sources and search terms used to find our website</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">AI Service Interactions</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li>Conversation history and messages when using Catalyst AI chat or voice features</li>
              <li>Session identifiers for maintaining conversation context</li>
              <li>Audio data (if using voice features) - processed in real-time and not stored</li>
            </ul>
          </div>
        </div>
      </div>

      {/* How We Use Information */}
      <div className="glass-panel">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Eye className="w-6 h-6 text-accent" />
          How We Use Your Information
        </h2>
        <ul className="space-y-3 text-muted list-disc pl-6">
          <li>To provide, maintain, and improve our website and services</li>
          <li>To respond to your inquiries, comments, or requests</li>
          <li>To enable AI-powered features like Catalyst chat and voice interactions</li>
          <li>To analyze website usage and improve user experience</li>
          <li>To detect, prevent, and address technical issues or security threats</li>
          <li>To comply with legal obligations and enforce our terms of service</li>
        </ul>
      </div>

      {/* Data Storage and Security */}
      <div className="glass-panel border-l-4 border-l-accent">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Lock className="w-6 h-6 text-accent" />
          Data Storage and Security
        </h2>
        <div className="space-y-4 text-muted">
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Security Measures</h3>
            <ul className="space-y-2 list-disc pl-6">
              <li>Encryption in transit (HTTPS/TLS) for all data transmission</li>
              <li>Secure authentication and access controls</li>
              <li>Regular security assessments and updates</li>
              <li>Multi-tenant isolation for AI service data (Postgres RLS)</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Data Retention</h3>
            <p>
              We retain your personal information only for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Conversation data from AI interactions may be retained for service improvement purposes but can be deleted upon request.
            </p>
          </div>
        </div>
      </div>

      {/* Third-Party Services */}
      <div className="glass-panel">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Server className="w-6 h-6 text-accent" />
          Third-Party Services
        </h2>
        <div className="space-y-4 text-muted">
          <p>
            Our website and services may use third-party services that have their own privacy policies:
          </p>
          <ul className="space-y-2 list-disc pl-6">
            <li><strong className="text-foreground">Vercel Analytics:</strong> Website analytics and performance monitoring</li>
            <li><strong className="text-foreground">AI Service Providers:</strong> OpenAI, Anthropic, and other AI providers for Catalyst features (data handling subject to their privacy policies)</li>
            <li><strong className="text-foreground">Hosting Services:</strong> Vercel and other cloud providers for website hosting</li>
          </ul>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share information only as necessary to provide our services or as required by law.
          </p>
        </div>
      </div>

      {/* Your Rights */}
      <div className="glass-panel border-l-4 border-l-accent">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Shield className="w-6 h-6 text-accent" />
          Your Rights
        </h2>
        <div className="space-y-3 text-muted">
          <p>You have the right to:</p>
          <ul className="space-y-2 list-disc pl-6">
            <li>Access and receive a copy of your personal information</li>
            <li>Request correction of inaccurate or incomplete data</li>
            <li>Request deletion of your personal information</li>
            <li>Object to or restrict processing of your information</li>
            <li>Withdraw consent where processing is based on consent</li>
            <li>Request data portability in a structured format</li>
          </ul>
          <p className="mt-4">
            To exercise these rights, please contact us using the information provided in the Contact section below.
          </p>
        </div>
      </div>

      {/* Cookies and Tracking */}
      <div className="glass-panel">
        <h2 className="text-2xl font-bold text-foreground mb-4">Cookies and Tracking Technologies</h2>
        <div className="space-y-3 text-muted">
          <p>
            We use cookies and similar tracking technologies to track activity on our website and store certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
          </p>
          <p>
            Types of cookies we may use:
          </p>
          <ul className="space-y-2 list-disc pl-6">
            <li><strong className="text-foreground">Essential cookies:</strong> Required for website functionality</li>
            <li><strong className="text-foreground">Analytics cookies:</strong> Help us understand how visitors interact with our website</li>
            <li><strong className="text-foreground">Session cookies:</strong> Maintain your session state during website visits</li>
          </ul>
        </div>
      </div>

      {/* Children's Privacy */}
      <div className="glass-panel">
        <h2 className="text-2xl font-bold text-foreground mb-4">Children's Privacy</h2>
        <p className="text-muted">
          Our services are not directed to individuals under the age of 13. We do not knowingly collect personal information from children under 13. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
        </p>
      </div>

      {/* Changes to This Policy */}
      <div className="glass-panel border-l-4 border-l-accent">
        <h2 className="text-2xl font-bold text-foreground mb-4">Changes to This Privacy Policy</h2>
        <p className="text-muted">
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
        </p>
      </div>

      {/* Contact */}
      <div className="glass-panel">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
          <Mail className="w-6 h-6 text-accent" />
          Contact Us
        </h2>
        <div className="space-y-3 text-muted">
          <p>
            If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us:
          </p>
          <div className="bg-background/50 p-4 rounded-lg border border-card-border">
            <p className="text-foreground font-medium mb-2">Per4ex.org</p>
            <p>Email: <a href="mailto:contact@per4ex.org" className="text-accent hover:underline">contact@per4ex.org</a></p>
            <p className="mt-2">Website: <a href="https://per4ex.org" className="text-accent hover:underline">https://per4ex.org</a></p>
          </div>
        </div>
      </div>
    </div>
  )
}

