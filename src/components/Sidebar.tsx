import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Cloud, 
  Files, 
  Users, 
  Upload, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import rumiLogo from '@/assets/rumi-logo.png';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'My Files', href: '/files', icon: Files },
  { name: 'Friends', href: '/friends', icon: Users },
  { name: 'Upload', href: '/upload', icon: Upload },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { signOut, user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-border">
        <img src={rumiLogo} alt="Rumi.com" className="h-8 w-auto" />
        <span className="text-xl font-bold text-foreground">Rumi.com</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-4">
        {navigation.map((item) => (
          <NavLink
            key={item.name}
            to={item.href}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground ${
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground'
              }`
            }
          >
            <item.icon className="h-5 w-5" />
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="border-t border-border p-4 space-y-3">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {user?.user_metadata?.display_name || 'User'}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}