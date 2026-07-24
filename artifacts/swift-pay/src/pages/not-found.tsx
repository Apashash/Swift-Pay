import { useRoute } from "wouter";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  const [match] = useRoute("/404");

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="max-w-md w-full p-8 bg-card border border-border/50 rounded-2xl shadow-xl text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">
          404 Page Not Found
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <a 
          href="/"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-black hover:bg-primary/90 h-10 px-6"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
