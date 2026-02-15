import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, LayoutDashboard, Menu, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";

export function NavBar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { href: "/artists", label: "Find Artists" },
    // Add more public links here if needed
  ];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <span className="font-display text-xl font-bold tracking-tight">
            GlowGetter<span className="text-primary">.my</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === link.href ? "text-primary" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9 border-2 border-primary/20">
                    <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || "User"} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {user?.firstName?.[0] || <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <a href="/api/login">
                <Button variant="ghost">Log In</Button>
              </a>
              <a href="/api/login">
                <Button className="bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25">
                  Sign Up
                </Button>
              </a>
            </div>
          )}
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-8 mt-8">
                {navLinks.map((link) => (
                  <Link 
                    key={link.href} 
                    href={link.href}
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-medium"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="h-px bg-border my-2" />
                {isAuthenticated ? (
                  <>
                    <Link 
                      href="/dashboard"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-2 text-lg font-medium"
                    >
                      <LayoutDashboard className="h-5 w-5" />
                      Dashboard
                    </Link>
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="justify-start px-0 text-destructive hover:text-destructive"
                    >
                      <LogOut className="mr-2 h-5 w-5" />
                      Log out
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col gap-4">
                    <a href="/api/login" onClick={() => setIsOpen(false)}>
                      <Button variant="outline" className="w-full">Log In</Button>
                    </a>
                    <a href="/api/login" onClick={() => setIsOpen(false)}>
                      <Button className="w-full">Sign Up</Button>
                    </a>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
