'use client'

import { Users, Zap, Shield, Trophy } from 'lucide-react'

export default function StatsSection() {
  const stats = [
    { icon: Users, label: 'Active Players', value: '2,400+', color: 'text-primary' },
    { icon: Zap, label: 'Server Uptime', value: '99.8%', color: 'text-accent' },
    { icon: Shield, label: 'Safe & Secure', value: '24/7 Admin', color: 'text-primary' },
    { icon: Trophy, label: 'Top Rated', value: '#1 Server', color: 'text-accent' },
  ]

  return (
    <section className="py-20 px-10 bg-background relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-8xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon
            return (
              <div
                key={idx}
                className="p-6 bg-card border border-primary/20 rounded-lg hover:border-primary/50 transition-all duration-300 glow-pulse group cursor-pointer"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`${stat.color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={32} />
                </div>
                <p className="text-foreground/60 text-sm font-medium mb-2">{stat.label}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
