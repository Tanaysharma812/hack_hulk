"use client"

import Link from 'next/link'
import { Brain, Phone, Mail, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 dark:bg-black text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 text-xl font-bold mb-4">
              <Brain className="h-8 w-8 text-indigo-400" />
              <span>MindConnect</span>
            </Link>
            <p className="text-gray-400 text-sm">
              Empowering students with mental wellness resources and support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/" className="hover:text-indigo-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="#about" className="hover:text-indigo-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/events" className="hover:text-indigo-400 transition-colors">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-indigo-400 transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">
                  Mental Health Guide
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">
                  Crisis Support
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">
                  Self-Help Tools
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-indigo-400 transition-colors">
                  Find a Therapist
                </a>
              </li>
            </ul>
          </div>

          {/* Emergency Helplines */}
          <div>
            <h3 className="font-semibold mb-4 text-red-400">Emergency Helplines</h3>
            <div className="space-y-3 text-gray-400 text-sm">
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold text-white">National Suicide Prevention</p>
                  <a href="tel:988" className="hover:text-indigo-400">988</a>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold text-white">Crisis Text Line</p>
                  <p>Text HOME to 741741</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-1 flex-shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold text-white">Student Helpline</p>
                  <a href="tel:1-800-273-8255" className="hover:text-indigo-400">1-800-273-8255</a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-800 pt-8 mb-8">
          <div className="grid md:grid-cols-3 gap-4 text-gray-400 text-sm">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-indigo-400" />
              <a href="mailto:support@mindconnect.org" className="hover:text-indigo-400">
                support@mindconnect.org
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-indigo-400" />
              <a href="tel:1-800-MIND-CONNECT" className="hover:text-indigo-400">
                1-800-MIND-CONNECT
              </a>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>Available nationwide</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; {new Date().getFullYear()} MindConnect. All rights reserved.</p>
          <p className="mt-2">
            If you or someone you know is in crisis, please call 988 or seek immediate help.
          </p>
        </div>
      </div>
    </footer>
  )
}
