"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Home,
  Layout,
  Zap,
  Droplets,
  Calculator,
  ArrowRight,
  CheckCircle,
  Star,
  Users,
  Award,
  Sparkles,
} from "lucide-react"

export default function HomePage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const services = [
    {
      icon: Layout,
      title: "Floor Plan AI",
      description: "Generate intelligent 2D floor plans with AI assistance for 1BHK, 2BHK, Duplex and more",
      color: "from-blue-500 to-cyan-500",
      href: "/floor-plan",
    },
    {
      icon: Zap,
      title: "Electrical Layout",
      description: "Smart electrical connection planning with optimal placement of switches, outlets and wiring",
      color: "from-yellow-500 to-orange-500",
      href: "/electrical",
    },
    {
      icon: Droplets,
      title: "Water & Sewerage",
      description: "Comprehensive plumbing layout design for fresh water supply and drainage systems",
      color: "from-blue-600 to-teal-500",
      href: "/plumbing",
    },
    {
      icon: Calculator,
      title: "Cost Estimation",
      description: "Accurate construction cost calculation with detailed material breakdown and labor costs",
      color: "from-green-500 to-emerald-500",
      href: "/cost-calculator",
    },
  ]

  const features = [
    "AI-Powered Design Generation",
    "Interactive 2D Floor Plans",
    "Real-time Cost Calculations",
    "Professional Quality Outputs",
    "Multiple Export Formats",
    "24/7 Customer Support",
  ]

  const stats = [
    { number: "10K+", label: "Happy Customers", icon: Users },
    { number: "50K+", label: "Plans Created", icon: Home },
    { number: "98%", label: "Satisfaction Rate", icon: Star },
    { number: "5+", label: "Years Experience", icon: Award },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SmartHome Planner
              </span>
            </div>

            <div className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Home
              </Link>
              <Link href="/floor-plan" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Floor Plans
              </Link>
              <Link href="/electrical" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Electrical
              </Link>
              <Link href="/plumbing" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Plumbing
              </Link>
              <Link href="/cost-calculator" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
                Cost Calculator
              </Link>
            </div>

            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
          >
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">AI-Powered Home Planning</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-teal-600 bg-clip-text text-transparent">
                Plan Your Dream Home
              </span>
              <br />
              <span className="text-gray-800">Smartly</span>
            </h1>

            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your vision into reality with our AI-powered home planning platform. Design floor plans, plan
              utilities, and estimate costs - all in one intelligent solution.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-4"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-8 py-4 border-2 hover:bg-blue-50 bg-transparent"
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-gradient-to-r from-teal-400 to-blue-400 rounded-full opacity-20 animate-pulse delay-1000"></div>
      </section>

      {/* Services Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Our Smart Services</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive home planning tools powered by artificial intelligence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service, index) => {
              const IconComponent = service.icon
              return (
                <Card
                  key={index}
                  className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-0 bg-white/70 backdrop-blur-sm"
                >
                  <CardContent className="p-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${service.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                    >
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4 leading-relaxed">{service.description}</p>
                    <Link href={service.href}>
                      <Button variant="ghost" className="group-hover:bg-blue-50 p-0 h-auto font-semibold text-blue-600">
                        Learn More
                        <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Why Choose SmartHome Planner?</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Advanced features that make home planning effortless and accurate
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/20 transition-colors"
              >
                <CheckCircle className="h-6 w-6 text-green-300 flex-shrink-0" />
                <span className="text-white font-medium">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="text-center group">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-4xl font-bold text-gray-800 mb-2">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-teal-500 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Plan Your Dream Home?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who have successfully planned and built their dream homes with our
            AI-powered platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 font-semibold">
              Start Planning Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-4 bg-transparent"
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg">
                <Home className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">SmartHome Planner</span>
            </div>
            <div className="text-gray-400">© 2024 SmartHome Planner. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
