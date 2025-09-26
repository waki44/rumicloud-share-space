import { Button } from '@/components/ui/button';
import { Cloud, Lock, Users } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import rumiLogo from '@/assets/rumi-logo.png';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary-soft to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex items-center gap-3">
            <img src={rumiLogo} alt="Rumi.com" className="h-10 w-auto" />
            <h1 className="text-2xl font-bold text-foreground">Rumi.com</h1>
          </div>
          <Button 
            variant="outline" 
            onClick={() => navigate('/auth')}
            className="hover:bg-primary hover:text-primary-foreground transition-all duration-300"
          >
            Sign In
          </Button>
        </header>

        {/* Hero Section */}
        <main className="text-center">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <Cloud className="h-20 w-20 text-primary mx-auto mb-6 animate-pulse" />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary to-primary-hover bg-clip-text text-transparent">
              Your private space for memories
            </h2>
            
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Share photos, videos, and documents securely with friends. 
              Your personal cloud that keeps memories safe and accessible.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Button 
                size="lg"
                onClick={() => navigate('/auth?tab=signup')}
                className="text-lg px-8 py-6 bg-primary hover:bg-primary-hover shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Get Started Free
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate('/auth')}
                className="text-lg px-8 py-6 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Sign In
              </Button>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300">
                <Lock className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Private & Secure</h3>
                <p className="text-muted-foreground">
                  Your files are encrypted and protected. Only you and your friends have access.
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300">
                <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Share with Friends</h3>
                <p className="text-muted-foreground">
                  Easily share memories with friends and create collaborative spaces.
                </p>
              </div>

              <div className="bg-card/50 backdrop-blur-sm rounded-xl p-6 border border-border/50 hover:shadow-lg transition-all duration-300">
                <Cloud className="h-12 w-12 text-primary mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-3">Always Available</h3>
                <p className="text-muted-foreground">
                  Access your files from anywhere, anytime. Your memories, always with you.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}