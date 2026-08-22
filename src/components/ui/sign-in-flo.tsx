import React, { useState, useEffect, useRef } from "react";
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  ArrowLeft, 
  ArrowRight, 
  Loader2, 
  Sparkles, 
  Crown,
  KeyRound
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

// 🌟 Animated Form Field with Radial Cursor Spotlight & Floating Label
interface FormFieldProps {
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  icon: React.ReactNode;
  showToggle?: boolean;
  onToggle?: () => void;
  showPassword?: boolean;
  required?: boolean;
}

const AnimatedFormField: React.FC<FormFieldProps> = ({
  type,
  placeholder,
  value,
  onChange,
  icon,
  showToggle,
  onToggle,
  showPassword,
  required
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="relative group">
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out backdrop-blur-md ${
          isFocused 
            ? 'border-[#6B1420] ring-2 ring-[#6B1420]/25 bg-white shadow-md scale-[1.008]' 
            : 'border-[#D8C7AA] bg-[#F7F0DD]/80 hover:bg-white/90 hover:border-[#A67C3D]'
        }`}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <div className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors duration-200 ${
          isFocused ? 'text-[#6B1420]' : 'text-[#A67C3D]'
        }`}>
          {icon}
        </div>
        
        <input
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          required={required}
          className="w-full bg-transparent pl-11 pr-12 py-4 text-xs sm:text-sm text-[#2B1810] font-hanken placeholder:text-transparent focus:outline-hidden"
          placeholder=""
        />
        
        <label className={`absolute left-11 transition-all duration-200 ease-out pointer-events-none ${
          isFocused || value 
            ? 'top-1.5 text-[10px] text-[#6B1420] font-fraunces font-bold tracking-wider uppercase' 
            : 'top-1/2 -translate-y-1/2 text-xs text-[#6B5A4A] font-hanken font-medium'
        }`}>
          {placeholder}
        </label>

        {showToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A67C3D] hover:text-[#6B1420] transition-colors cursor-pointer p-1 rounded-lg hover:bg-black/5"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}

        {/* Dynamic Cursor Spotlight Effect */}
        {isHovering && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(160px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(212, 175, 55, 0.2) 0%, transparent 70%)`
            }}
          />
        )}
      </div>
    </div>
  );
};

// 🌌 High-Performance Interactive Gold Stardust Particles Canvas
const HeavyParticleConstellation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const mouse = { x: -1000, y: -1000, radius: 140 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);

    class Particle {
      x: number;
      y: number;
      baseX: number;
      baseY: number;
      size: number;
      speedX: number;
      speedY: number;
      density: number;
      opacity: number;
      hue: number;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseX = this.x;
        this.baseY = this.y;
        this.size = Math.random() * 2.5 + 1;
        this.speedX = (Math.random() - 0.5) * 0.45;
        this.speedY = (Math.random() - 0.5) * 0.45;
        this.density = Math.random() * 30 + 1;
        this.opacity = Math.random() * 0.6 + 0.2;
        this.hue = Math.random() > 0.6 ? 42 : 18;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          const forceDirectionX = dx / distance;
          const forceDirectionY = dy / distance;
          const force = (mouse.radius - distance) / mouse.radius;
          const directionX = forceDirectionX * force * this.density * 0.5;
          const directionY = forceDirectionY * force * this.density * 0.5;

          this.x -= directionX;
          this.y -= directionY;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.hue === 42 
          ? `rgba(212, 175, 55, ${this.opacity})` 
          : `rgba(196, 82, 42, ${this.opacity * 0.85})`;
        ctx.shadowColor = '#D4AF37';
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.restore();
      }
    }

    const count = Math.min(65, Math.floor((width * height) / 18000));
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }

    let animId: number;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.18;
            ctx.strokeStyle = `rgba(166, 124, 61, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
    />
  );
};

export interface SignInFloProps {
  onBackToHome?: () => void;
  onSuccessRedirect?: () => void;
}

export const Component: React.FC<SignInFloProps> = ({ onBackToHome, onSuccessRedirect }) => {
  const { 
    loginWithEmail, 
    signupWithEmail, 
    loginWithGoogle, 
    loading 
  } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+91 9409360336");
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3D Perspective Card Tilt State
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || window.innerWidth < 1024) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;

    setTilt({ rotateX, rotateY, glareX, glareY });
  };

  const handleCardMouseLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0, glareX: 50, glareY: 50 });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email address and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      if (isSignUp) {
        if (!name.trim()) {
          setError("Please enter your full name or couple names.");
          setIsSubmitting(false);
          return;
        }
        const ok = await signupWithEmail(name, email, password, phone);
        if (ok && onSuccessRedirect) onSuccessRedirect();
      } else {
        const ok = await loginWithEmail(email, password);
        if (ok && onSuccessRedirect) onSuccessRedirect();
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const ok = await loginWithGoogle();
      if (ok && onSuccessRedirect) onSuccessRedirect();
    } catch (err: any) {
      setError(err?.message || "Google Sign-In failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = (targetSignUp: boolean) => {
    setIsSignUp(targetSignUp);
    setError(null);
    setShowPassword(false);
  };

  return (
    <div className="min-h-screen bg-[#EDE0C8] text-[#2B1810] flex flex-col justify-between p-3 sm:p-6 relative overflow-hidden font-hanken selection:bg-[#C4522A]/30">
      
      {/* 🌌 High-Performance Canvas Particles Engine */}
      <HeavyParticleConstellation />

      {/* Floating Animated Radial Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-5%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-[#6B1420]/30 to-[#D4AF37]/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '7s' }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-gradient-to-br from-[#D4AF37]/25 via-[#C4522A]/20 to-[#6B1420]/30 blur-3xl pointer-events-none animate-pulse" style={{ animationDuration: '9s' }} />

      {/* Top Header Navigation */}
      <header className="relative z-20 max-w-6xl mx-auto w-full flex items-center justify-between py-2 sm:py-3">
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="group inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-[#F7F0DD]/90 hover:bg-[#FFFDF9] border border-[#D8C7AA] hover:border-[#A67C3D] text-[#6B1420] text-xs font-fraunces font-bold shadow-xs transition-all duration-200 cursor-pointer hover:-translate-x-1"
          >
            <ArrowLeft className="w-4 h-4 text-[#A67C3D] group-hover:text-[#6B1420] transition-colors" />
            <span>Back to Home</span>
          </button>
        )}

        <div className="flex items-center gap-2.5 select-none group cursor-pointer" onClick={onBackToHome}>
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#7E1827] via-[#6B1420] to-[#4A0C14] border-2 border-[#A67C3D] flex items-center justify-center text-base shadow-md text-[#D4B37F] group-hover:scale-105 transition-transform">
            <Crown className="w-4 h-4 text-[#D4B37F]" />
          </div>
          <span className="font-fraunces font-black text-lg text-[#6B1420] tracking-wider uppercase drop-shadow-xs">
            SHAHI STUDIO
          </span>
        </div>

        <div className="w-24 hidden sm:block"></div>
      </header>
      
      {/* 🏰 Centerpiece 3D Tilt Card Container */}
      <main className="relative z-10 w-full max-w-xl mx-auto my-auto py-4 flex items-center justify-center">
        <div 
          ref={cardRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          style={{
            transform: `perspective(1200px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="w-full relative group"
        >
          {/* ✨ Animated Laser Shimmer Edge Border */}
          <div className="absolute -inset-[2px] rounded-[28px] bg-gradient-to-r from-[#D4AF37] via-[#C4522A] to-[#6B1420] opacity-75 blur-[2px] group-hover:opacity-100 transition duration-500 animate-pulse" style={{ animationDuration: '4s' }} />

          {/* Main Card Shell */}
          <div className="relative bg-[#F7F0DD]/95 backdrop-blur-2xl border-2 border-[#A67C3D] rounded-[26px] p-6 sm:p-10 shadow-[0_25px_60px_-15px_rgba(43,24,16,0.35)] space-y-6 overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]">
            
            {/* Specular Glare Effect on Mouse Hover */}
            <div 
              className="absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity duration-300"
              style={{
                background: `radial-gradient(circle at ${tilt.glareX}% ${tilt.glareY}%, rgba(255,255,255,0.6) 0%, transparent 60%)`
              }}
            />

            {/* Header Badge & Smooth Morphing Title */}
            <div className="text-center space-y-2 relative z-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#7E1827] via-[#6B1420] to-[#4A0C14] text-[#D4AF37] border-2 border-[#A67C3D] rounded-2xl shadow-lg hover:scale-105 transition-transform duration-300">
                <Crown className="w-7 h-7" />
              </div>
              
              <div className="overflow-hidden min-h-[36px] flex items-center justify-center">
                <h1 className="text-2xl sm:text-3xl font-fraunces font-black text-[#6B1420] tracking-tight transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {isSignUp ? 'Create Your Royal Account' : 'Welcome to Shahi Studio'}
                </h1>
              </div>

              <div className="overflow-hidden min-h-[20px] flex items-center justify-center">
                <p className="text-xs text-[#6B5A4A] font-hanken font-medium max-w-sm mx-auto transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]">
                  {isSignUp 
                    ? 'Sign up to design, customize and broadcast your 3D wedding invitation' 
                    : 'Sign in to access your wedding invitations suite and guest concierge'
                  }
                </p>
              </div>
            </div>

            {/* 🌊 Fluid Physical Sliding Indicator Pill Tabs */}
            <div className="relative z-10 flex bg-[#EDE0C8] p-1.5 rounded-2xl border border-[#D8C7AA] shadow-inner font-fraunces font-bold text-xs uppercase tracking-wider overflow-hidden">
              {/* Sliding Indicator Pill */}
              <div 
                className={`absolute top-1.5 bottom-1.5 w-[calc(50%-6px)] bg-[#6B1420] rounded-xl shadow-md transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                  isSignUp ? 'left-[calc(50%+3px)]' : 'left-1.5'
                }`}
              />

              <button
                type="button"
                onClick={() => toggleMode(false)}
                className={`relative z-10 flex-1 py-2.5 rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  !isSignUp ? 'text-[#F7F0DD] font-black' : 'text-[#6B5A4A] hover:text-[#6B1420]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => toggleMode(true)}
                className={`relative z-10 flex-1 py-2.5 rounded-xl transition-colors duration-300 cursor-pointer flex items-center justify-center gap-2 ${
                  isSignUp ? 'text-[#F7F0DD] font-black' : 'text-[#6B5A4A] hover:text-[#6B1420]'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Sign Up</span>
              </button>
            </div>

            {/* Error Alert Pill */}
            {error && (
              <div className="relative z-10 p-3.5 rounded-2xl bg-red-50/90 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 shadow-sm animate-shake">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0 animate-ping" />
                <span className="font-hanken font-semibold">{error}</span>
              </div>
            )}

            {/* Interactive Form with Smooth Animated Accordion Fields */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-3.5">
              
              {/* Animated Expandable Name Field */}
              <div 
                className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                  isSignUp 
                    ? 'max-h-24 opacity-100 translate-y-0' 
                    : 'max-h-0 opacity-0 -translate-y-3 pointer-events-none'
                }`}
              >
                <AnimatedFormField
                  type="text"
                  placeholder="Full Name or Couple Names *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  icon={<User size={18} />}
                  required={isSignUp}
                />
              </div>

              {/* Email Field (Always Visible) */}
              <AnimatedFormField
                type="email"
                placeholder="Email Address *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail size={18} />}
                required
              />

              {/* Animated Expandable WhatsApp Number Field */}
              <div 
                className={`transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden ${
                  isSignUp 
                    ? 'max-h-24 opacity-100 translate-y-0' 
                    : 'max-h-0 opacity-0 -translate-y-3 pointer-events-none'
                }`}
              >
                <AnimatedFormField
                  type="tel"
                  placeholder="WhatsApp Number (for Concierge)"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  icon={<Phone size={18} />}
                />
              </div>

              {/* Password Field (Always Visible) */}
              <AnimatedFormField
                type={showPassword ? "text" : "password"}
                placeholder="Password *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock size={18} />}
                showToggle
                onToggle={() => setShowPassword(!showPassword)}
                showPassword={showPassword}
                required
              />

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#6B1420] bg-white border-[#D8C7AA] rounded-md focus:ring-[#6B1420] cursor-pointer"
                  />
                  <span className="text-[#6B5A4A] font-medium font-hanken">Remember me</span>
                </label>
              </div>

              {/* Primary Heavy Action CTA Button */}
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full relative group btn-vermillion text-xs sm:text-sm font-fraunces font-bold uppercase tracking-widest py-4 px-6 rounded-2xl transition-all duration-300 ease-out shadow-xl hover:shadow-2xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden cursor-pointer flex items-center justify-center gap-2.5 min-h-[48px] mt-2"
              >
                {/* Moving Shine Swipe */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#F7F0DD]" />
                    <span>{isSignUp ? 'Creating Royal Account...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <div className="flex items-center gap-2 transition-all duration-300">
                    <span>{isSignUp ? 'Create Royal Account' : 'Enter Shahi Studio'}</span>
                    <ArrowRight className="w-4 h-4 text-[#F7F0DD] group-hover:translate-x-1.5 transition-transform duration-200" />
                  </div>
                )}
              </button>
            </form>

            {/* Social Logins */}
            <div className="relative z-10 space-y-4 pt-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#D8C7AA]" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-widest text-[#6B5A4A]">
                  <span className="px-3 bg-[#F7F0DD] font-bold">Or continue with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={isSubmitting || loading}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-neutral-50 border-2 border-[#D8C7AA] hover:border-[#A67C3D] text-[#2B1810] text-xs font-fraunces font-bold tracking-wider flex items-center justify-center gap-3 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer disabled:opacity-50 min-h-[44px] hover:-translate-y-0.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#A67C3D]" />
                    <span>Connecting to Google...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>

            {/* Toggle Mode Footer */}
            <div className="relative z-10 text-center pt-2 border-t border-[#D8C7AA]/60">
              <p className="text-xs text-[#6B5A4A]">
                {isSignUp ? 'Already have an account?' : "Don't have an account yet?"}{' '}
                <button
                  type="button"
                  onClick={() => toggleMode(!isSignUp)}
                  className="text-[#6B1420] hover:text-[#C4522A] underline font-fraunces font-bold ml-1 cursor-pointer transition-colors duration-200"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 text-center text-[11px] font-mono text-[#6B5A4A] py-2">
        Shahi Studio · India's Premier Digital Wedding Invitation Suite
      </footer>
    </div>
  );
};

export default Component;
