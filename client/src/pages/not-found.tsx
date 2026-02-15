import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">404 Page Not Found</h1>
      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
      <Link href="/">
        <Button>Return Home</Button>
      </Link>
    </div>
  );
}
