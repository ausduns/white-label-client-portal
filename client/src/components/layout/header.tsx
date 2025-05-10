import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logoutMutation } = useAuth();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, implement search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <header className="bg-card shadow-sm z-10 border-b">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Mobile menu button rendered in Sidebar component */}
        
        {/* Search */}
        <div className="flex-1 flex justify-center px-2 lg:ml-6 lg:justify-start">
          <div className="max-w-lg w-full lg:max-w-xs">
            <form onSubmit={handleSearch}>
              <label htmlFor="search" className="sr-only">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-muted-foreground"></i>
                </div>
                <Input
                  id="search"
                  name="search"
                  className="block w-full pl-10 pr-3 py-2 border border-input rounded-md leading-5 bg-background placeholder-muted-foreground focus:outline-none sm:text-sm"
                  placeholder="Search"
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        </div>
        
        {/* Right side buttons */}
        <div className="flex items-center">
          {/* Theme toggle */}
          <ThemeToggle />
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 ml-1 text-gray-400 rounded-full hover:text-gray-500">
                <span className="sr-only">View notifications</span>
                <i className="fas fa-bell"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications</p>
            </TooltipContent>
          </Tooltip>
          
          {/* Notification indicator */}
          <div className="relative">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="flex-shrink-0 ml-1 text-gray-400 rounded-full hover:text-gray-500">
                  <span className="sr-only">Messages</span>
                  <i className="fas fa-comment"></i>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Messages</p>
              </TooltipContent>
            </Tooltip>
            <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></div>
          </div>
          
          {/* Help button */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 ml-1 text-gray-400 rounded-full hover:text-gray-500">
                <span className="sr-only">Help</span>
                <i className="fas fa-question-circle"></i>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Help Center</p>
            </TooltipContent>
          </Tooltip>

          {/* User profile dropdown */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-2 px-2 flex items-center gap-2 text-sm h-9 border border-transparent hover:border-input">
                  <Avatar className="h-7 w-7">
                    {user.avatar ? (
                      <AvatarImage src={user.avatar} alt={user.fullName || user.username} />
                    ) : (
                      <AvatarFallback className="text-xs">
                        {user.fullName 
                          ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase() 
                          : user.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <span>{user.company || user.fullName || user.username}</span>
                  <i className="fas fa-chevron-down text-xs ml-1"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="font-medium">{user.company || user.fullName || user.username}</div>
                  <div className="text-xs text-muted-foreground">Administrator</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <span className="w-full">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
