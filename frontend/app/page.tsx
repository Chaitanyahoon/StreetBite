import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MapPin, Search, Star, ChefHat, ArrowRight, Sparkles, TrendingUp, Clock } from 'lucide-react'
import { Logo } from '@/components/logo'
import { Navbar } from '@/components/navbar'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background overflow-hidden">
      {/* Enhanced Navbar */}
      <Navbar />

      <main className="flex-1 pt-20">
        {/* Enhanced Hero Section */}
        <section className="relative py-24 md:py-40 overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-float -z-10" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-3xl -z-20" />

          <div className="container mx-auto px-4 text-center relative z-10">
            {/* Live Badge */}
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-primary/20 text-sm font-semibold mb-8 animate-scale-in shadow-soft hover-lift">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-primary"></span>
              </span>
              <span className="bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                Live in Nashik
              </span>
            </div>
            
            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tight text-foreground leading-[1.1] animate-slide-up">
              Discover the Best <br />
              <span className="relative inline-block">
                <span className="text-gradient-animate">
                  Street Food
                </span>
                <div className="absolute -top-6 -right-8 animate-float" style={{ animationDelay: '0.5s' }}>
                  <Sparkles className="h-8 w-8 text-primary opacity-70" />
                </div>
              </span>
              <br />
              Near You
            </h1>
            
            {/* Subheadline */}
            <p className="text-lg md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up font-medium" style={{ animationDelay: '0.1s' }}>
              From spicy <span className="text-primary font-semibold">Vada Pav</span> to delicious <span className="text-primary font-semibold">Misal</span>, find authentic local vendors, 
              view menus, and satisfy your cravings <span className="inline-block">instantly.</span>
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Link href="/explore">
                <Button size="lg" className="h-16 px-10 rounded-full text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-primary hover-lift hover-glow group">
                  <Search className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                  Find Food Now
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/signup?type=vendor">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-full text-lg font-semibold border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all hover-lift group">
                  <ChefHat className="mr-2 h-6 w-6 group-hover:scale-110 transition-transform" />
                  List Your Stall
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1">500+</div>
                <div className="text-sm text-muted-foreground font-medium">Vendors</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1">10K+</div>
                <div className="text-sm text-muted-foreground font-medium">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-black text-primary mb-1">4.9</div>
                <div className="text-sm text-muted-foreground font-medium">Avg Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-24 bg-gradient-to-b from-muted/50 to-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4 animate-scale-in">
                WHY STREETBITE
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-foreground mb-4 animate-slide-up">
                Your Gateway to <span className="text-gradient">Authentic Flavors</span>
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto animate-slide-up">
                Everything you need to discover, enjoy, and share amazing street food experiences
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="group bg-card p-8 rounded-3xl border border-border hover:border-primary/50 hover:shadow-elevated transition-all hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <MapPin className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-card-foreground">Live Tracking</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Real-time location updates ensure you never miss your favorite moving food stall.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group bg-card p-8 rounded-3xl border border-border hover:border-secondary/50 hover:shadow-elevated transition-all hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary/10 flex items-center justify-center mb-6 text-secondary group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-card-foreground">Trusted Reviews</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Authentic ratings from real foodies help you discover the best hidden gems.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group bg-card p-8 rounded-3xl border border-border hover:border-primary/50 hover:shadow-elevated transition-all hover:-translate-y-2 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mb-6 text-primary group-hover:scale-110 transition-transform">
                  <ChefHat className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-card-foreground">Vendor Tools</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Powerful dashboard with analytics and menu management to grow your business.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced CTA Section */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="relative bg-gradient-to-br from-primary via-primary to-orange-600 rounded-[3rem] p-12 md:p-20 text-center text-primary-foreground overflow-hidden shadow-floating animate-scale-in">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white rounded-full blur-3xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 text-white text-sm font-bold mb-6">
                  <TrendingUp className="h-4 w-4" />
                  Join the Movement
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight">
                  Ready to Start Your<br />Food Journey?
                </h2>
                <p className="text-xl md:text-2xl opacity-95 mb-10 max-w-2xl mx-auto font-medium">
                  Join <span className="font-bold">10,000+ food lovers</span> in Nashik discovering hidden gems every day.
                </p>
                <Link href="/signup">
                  <Button size="lg" className="h-16 px-12 rounded-full text-lg font-bold bg-white text-primary hover:bg-white/95 shadow-floating hover-lift hover-glow group">
                    Get Started Free
                    <ArrowRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Enhanced Footer */}
      <footer className="bg-muted/30 border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <Logo />
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              © 2024 StreetBite. Built with ❤️ for Street Food.
            </div>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Terms
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors font-medium">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
