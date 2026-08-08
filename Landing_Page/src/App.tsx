/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useMemo } from "react";
import Lenis from "lenis";
// Added useScroll and useTransform for the stacking scroll effect
import { motion, AnimatePresence, useMotionValue, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import {
  Menu, X, ArrowRight, Play, Check,
  AppWindow, Sparkles, Lock, Rocket, Cpu, Eye, Star,
  Package, Plug, Terminal, CheckCircle, RefreshCw,
  BarChart2, ChevronUp, ChevronDown,
  Brain, Zap, Sliders, Settings,
  ArrowLeft, LayoutDashboard, Plus, Folder, Search, MessageSquare, Accessibility
} from "lucide-react";
// import { Key as KeyIcon } from "@phosphor-icons/react";
import { RadialGlowButton } from "@/components/ui/radial-glow-button";
import { BorderBeam } from "@/components/ui/border-beam";
import { SmoothCursor } from "@/components/ui/smooth-cursor";
import { SharedTooltipAvatars } from "@/components/ui/shared-tooltip-avatars";
import "./App.css";

/* ─── Data ─── */
const SITE = { name: "Oryonix AI", chrome: "https://chromewebstore.google.com/detail/oryonix-ai/nlodkmgcicilpgbdlgndlomomnofpaeb", github: "https://github.com/Subhankar-Patra1/Oryonix-ai" };

const BROWSER_AVATARS = [
  { id: "chrome", name: "Google Chrome", image: "/early-access/icons/chrome.svg" },
  { id: "brave", name: "Brave", image: "/early-access/icons/brave.svg" },
  { id: "edge", name: "Microsoft Edge", image: "/early-access/icons/edge.svg" },
  { id: "opera", name: "Opera", image: "/early-access/icons/opera.svg" },
  { id: "helium", name: "Helium Browser", image: "/early-access/icons/helium.svg" },
  { id: "arc", name: "Arc", image: "/early-access/icons/arc.svg" },
];

const NAV = [
  { label: "Features", href: "#features" },
  { label: "Demo", href: "#demo" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Open Source", href: "#open-source" },
];
const FEATURES = [
  {
    Icon: AppWindow,
    title: "Multi-Tab Control",
    desc: "Navigate, open, close, and switch between multiple tabs simultaneously.",
    checklist: [
      "Agent works across 10+ tabs seamlessly",
      "Data aggregation from multiple sources",
      "Background execution without interrupting you"
    ],
    color: "rgba(217, 70, 239, 0.25)",
    dots: true,
    visual: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'row' }}>

        {/* Browser Main Window (Left Side) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Browser Top Bar - Tabs */}
          <div style={{ display: 'flex', alignItems: 'flex-end', padding: '16px 16px 0 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            {/* Mac window buttons */}
            <div style={{ display: 'flex', gap: '6px', paddingBottom: '10px', marginRight: '20px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ff5f56' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ffbd2e' }} />
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#27c93f' }} />
            </div>

            {/* Active Tab */}
            <div style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.08)', borderTopLeftRadius: '8px', borderTopRightRadius: '8px', border: '1px solid rgba(255,255,255,0.05)', borderBottom: 'none', display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', fontSize: '0.75rem', position: 'relative', width: '140px' }}>
              <LayoutDashboard size={14} color="#a855f7" />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Dashboard</span>
              <X size={12} color="rgba(255,255,255,0.4)" style={{ cursor: 'pointer' }} />
              <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '1px', background: 'rgba(15,15,18,1)', zIndex: 2 }} />
            </div>

            {/* Inactive Tab */}
            <div style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', width: '120px' }}>
              <BarChart2 size={14} />
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Analytics</span>
              <X size={12} color="rgba(255,255,255,0.2)" />
            </div>

            <div style={{ padding: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)', marginLeft: '4px' }}>
              <Plus size={14} />
            </div>
          </div>

          {/* Browser Address Bar */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', color: 'rgba(255,255,255,0.3)' }}>
              <ArrowLeft size={16} />
              <ArrowRight size={16} />
              <RefreshCw size={14} />
            </div>
            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', borderRadius: '6px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <Lock size={12} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>app.oryonix.ai/dashboard</span>
            </div>
          </div>

          {/* Main Web Page Content */}
          <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', opacity: 0.3, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1, height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div style={{ flex: 1, height: '120px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
          </div>
        </div>

        {/* Extension Sidebar */}
        <div style={{
          width: '280px',
          background: 'rgba(12, 12, 14, 1)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 10,
          borderBottomRightRadius: '24px'
        }}>
          {/* Sidebar Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <img src="/logo.svg" alt="Logo" style={{ width: '16px', height: '16px' }} />
              <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Oryonix AI</span>
            </div>
            <div style={{ background: 'rgba(249, 115, 22, 0.1)', padding: '4px 8px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(249, 115, 22, 0.2)' }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#f97316' }} />
              <span style={{ color: '#f97316', fontSize: '0.65rem', fontWeight: 500 }}>Agent is Idle</span>
            </div>
          </div>

          {/* Sidebar Body */}
          <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <img src="/logo.svg" alt="Logo Large" style={{ width: '40px', height: '40px', marginBottom: '12px' }} />
            <h2 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '8px', textAlign: 'center' }}>
              <span style={{ color: '#f97316' }}>Oryonix</span> <span style={{ color: '#fff' }}>AI</span>
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textAlign: 'center', lineHeight: '1.5', marginBottom: '20px' }}>
              Your autonomous browser copilot. I can navigate pages, analyze visual context, and execute complex workflows directly in your browser.
            </p>

            {/* Feature Buttons */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Sparkles size={14} color="#f97316" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Autonomous Execution</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', lineHeight: '1.3' }}>Give me a goal and watch me navigate.</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Eye size={14} color="#f97316" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Visual DOM Perception</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', lineHeight: '1.3' }}>Advanced spatial understanding of web layouts.</div>
                </div>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '32px', height: '32px', flexShrink: 0, borderRadius: '50%', background: 'rgba(249, 115, 22, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Zap size={14} color="#f97316" />
                </div>
                <div>
                  <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600, marginBottom: '2px' }}>Intelligent Summarization</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', lineHeight: '1.3' }}>Concise insights and actionable results.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Footer Input */}
          <div style={{ padding: '16px', display: 'flex', gap: '8px' }}>
            <div style={{ flex: 1, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '8px 12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>What do you want me to do?</span>
            </div>
            <button style={{ background: 'rgba(249, 115, 22, 0.1)', color: '#f97316', border: 'none', borderRadius: '20px', padding: '0 16px', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
              Run
            </button>
          </div>
        </div>
      </div>
    )
  },
  {
    Icon: Sparkles,
    title: "Natural Language",
    desc: "Just describe your task in plain English — no coding, no scripts required.",
    checklist: [
      "No complex CSS selectors or XPath",
      "Understands context and intent automatically",
      "Self-corrects if the page layout changes"
    ],
    color: "rgba(249, 115, 22, 0.25)",
    customBg: () => (
      <div style={{
        position: 'absolute',
        inset: '-1px',
        background: 'radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.45) 0%, transparent 70%), radial-gradient(circle at 100% 100%, rgba(249, 115, 22, 0.2) 0%, transparent 60%), radial-gradient(circle at 10% 90%, rgba(6, 95, 70, 0.35) 0%, transparent 80%)',
        opacity: 1,
        pointerEvents: 'none',
        borderRadius: '24px'
      }} />
    ),
    dots: true,
    visual: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '32px', gap: '24px', position: 'relative' }}>

        {/* User Prompt Bubble */}
        <div style={{
          alignSelf: 'flex-end',
          background: '#1a1410',
          border: '1px solid rgba(249, 115, 22, 0.4)',
          padding: '16px 20px',
          borderRadius: '20px 20px 4px 20px',
          maxWidth: '85%',
          boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
        }}>
          <span style={{ color: '#fff', fontSize: '0.95rem', lineHeight: '1.5' }}>
            Find me the cheapest roundtrip flights to Tokyo for the first week of October, and compile the options into a Google Sheet.
          </span>
        </div>

        {/* Agent Processing Block */}
        <div style={{
          alignSelf: 'flex-start',
          background: '#141418',
          border: '1px solid rgba(255,255,255,0.08)',
          padding: '20px',
          borderRadius: '20px 20px 20px 4px',
          width: '90%',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f97316', fontSize: '0.85rem', fontWeight: 600 }}>
            <Brain size={16} /> Parsing Natural Language...
          </div>

          <div style={{
            background: 'rgba(0,0,0,0.6)',
            borderRadius: '12px',
            padding: '16px',
            fontFamily: 'var(--font-family)',
            fontSize: '0.8rem',
            color: 'rgba(255,255,255,0.4)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            border: '1px solid rgba(255,255,255,0.03)',
            letterSpacing: '0.01em'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#10b981', opacity: 0.8 }}>✓</span>
              <span>Intent: <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Flight Search & Data Extraction</span></span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#10b981', opacity: 0.8 }}>✓</span>
              <span>Destination: <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>NRT / HND (Tokyo)</span></span>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span style={{ color: '#10b981', opacity: 0.8 }}>✓</span>
              <span>Date: <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>Oct 1 - Oct 7 (flexible)</span></span>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
              <Settings size={14} color="#f97316" className="animate-spin" />
              <span style={{ color: '#f97316' }}>Generating DOM selection strategy...</span>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    Icon: Sliders,
    title: "Custom Projects & Instructions",
    desc: "Create unique projects with tailored system guidelines. Set 'Marketing Mode' or 'Code Review Mode' once, ensuring every AI model follows your project's direction throughout.",
    checklist: [
      "One-time setup keeps all AI replies on-brand and on-task.",
      "Instantly switch modes across chats",
      "Maintain consistent tone and rules without repetition."
    ],
    color: "rgba(16, 185, 129, 0.25)",
    customBg: () => (
      <div style={{
        position: 'absolute',
        inset: '-1px',
        background: 'radial-gradient(circle at 100% 0%, rgba(16, 185, 129, 0.3) 0%, transparent 60%), radial-gradient(circle at 0% 100%, rgba(59, 130, 246, 0.15) 0%, transparent 70%), linear-gradient(135deg, #0c0c0e 0%, #0f172a 100%)',
        opacity: 1,
        pointerEvents: 'none',
        borderRadius: '24px'
      }} />
    ),
    dots: true,
    visual: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 24px 16px 24px', gap: '16px', position: 'relative' }}>
        {/* Project Selector Mockup */}
        <div style={{
          background: '#141418',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
            <Folder size={14} color="#10b981" />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.05em' }}>PROJECT SETTINGS</span>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{
              flex: 1,
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <div style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600 }}>Marketing Mode</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>Tone: Professional & Energetic</div>
            </div>
            <div style={{
              flex: 1,
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '10px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              opacity: 0.5
            }}>
              <div style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>Code Review</div>
              <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>Tone: Critical & Technical</div>
            </div>
          </div>
        </div>

        {/* System Instructions Editor */}
        <div style={{
          background: '#0c0c0e',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '16px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Terminal size={14} color="#10b981" />
            <span style={{ color: '#fff', fontSize: '0.75rem', fontWeight: 600 }}>System Instructions</span>
          </div>
          <div style={{
            fontFamily: 'monospace',
            fontSize: '0.7rem',
            lineHeight: '1.6',
            color: 'rgba(16, 185, 129, 0.8)'
          }}>
            <span style={{ color: 'rgba(255,255,255,0.3)' }}>{"// Project: Marketing"}</span><br />
            {"You are a marketing expert. Always focus on value propositions and maintain a premium tone. Avoid technical jargon unless requested."}
            <span className="animate-pulse" style={{ borderLeft: '2px solid #10b981', marginLeft: '2px' }}>&nbsp;</span>
          </div>
        </div>
      </div>
    )
  },
  {
    Icon: Cpu,
    title: "Any LLM, Your Choice",
    desc: "Bring your own model — Ollama, OpenAI, Anthropic, Groq, or any compatible API.",
    checklist: [
      "Run local open-source models for 100% privacy",
      "Connect premium cloud APIs for maximum reasoning",
      "Switch models instantly based on your current task"
    ],
    color: "rgba(59, 130, 246, 0.25)",
    dots: true,
    visual: () => (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 24px 16px 24px', gap: '16px', position: 'relative', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {[
            {
              name: 'Ollama',
              color: '#fff',
              bg: 'rgba(255,255,255,0.05)',
              icon: (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z" />
                </svg>
              )
            },
            {
              name: 'OpenAI',
              color: '#10a37f',
              bg: 'rgba(16, 163, 127, 0.1)',
              icon: (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
                </svg>
              )
            },
            {
              name: 'Claude',
              color: '#d97757',
              bg: 'rgba(217, 119, 87, 0.1)',
              icon: (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.143-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
                </svg>
              )
            },
            {
              name: 'Groq',
              color: '#f55036',
              bg: 'rgba(245, 80, 54, 0.1)',
              icon: (
                <svg viewBox="0 0 200 200" width="18" height="18" fill="currentColor">
                  <path d="m128 49 1.895 1.52C136.336 56.288 140.602 64.49 142 73c.097 1.823.148 3.648.161 5.474l.03 3.247.012 3.482.017 3.613c.01 2.522.016 5.044.02 7.565.01 3.84.041 7.68.072 11.521.007 2.455.012 4.91.016 7.364l.038 3.457c-.033 11.717-3.373 21.83-11.475 30.547-4.552 4.23-9.148 7.372-14.891 9.73l-2.387 1.055c-9.275 3.355-20.3 2.397-29.379-1.13-5.016-2.38-9.156-5.17-13.234-8.925 3.678-4.526 7.41-8.394 12-12l3.063 2.375c5.572 3.958 11.135 5.211 17.937 4.625 6.96-1.384 12.455-4.502 17-10 4.174-6.784 4.59-12.222 4.531-20.094l.012-3.473c.003-2.414-.005-4.827-.022-7.241-.02-3.68 0-7.36.026-11.04-.003-2.353-.008-4.705-.016-7.058l.025-3.312c-.098-7.996-1.732-13.21-6.681-19.47-6.786-5.458-13.105-8.211-21.914-7.792-7.327 1.188-13.278 4.7-17.777 10.601C75.472 72.012 73.86 78.07 75 85c2.191 7.547 5.019 13.948 12 18 5.848 3.061 10.892 3.523 17.438 3.688l2.794.103c2.256.082 4.512.147 6.768.209v16c-16.682.673-29.615.654-42.852-10.848-8.28-8.296-13.338-19.55-13.71-31.277.394-9.87 3.93-17.894 9.562-25.875l1.688-2.563C84.698 35.563 110.05 34.436 128 49Z" />
                </svg>
              )
            },
            {
              name: 'Mistral',
              color: '#fdba74',
              bg: 'rgba(253, 186, 116, 0.1)',
              icon: (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M17.143 3.429v3.428h-3.429v3.429h-3.428V6.857H6.857V3.43H3.43v13.714H0v3.428h10.286v-3.428H6.857v-3.429h3.429v3.429h3.429v-3.429h3.428v3.429h-3.428v3.428H24v-3.428h-3.43V3.429z" />
                </svg>
              )
            },
            {
              name: 'Gemini',
              color: '#4285f4',
              bg: 'rgba(66, 133, 244, 0.1)',
              icon: (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M20.616 10.835a14.147 14.147 0 01-4.45-3.001 14.111 14.111 0 01-3.678-6.452.503.503 0 00-.975 0 14.134 14.134 0 01-3.679 6.452 14.155 14.155 0 01-4.45 3.001c-.65.28-1.318.505-2.002.678a.502.502 0 000 .975c.684.172 1.35.397 2.002.677a14.147 14.147 0 014.45 3.001 14.112 14.112 0 013.679 6.453.502.502 0 00.975 0c.172-.685.397-1.351.677-2.003a14.145 14.145 0 013.001-4.45 14.113 14.113 0 016.453-3.678.503.503 0 000-.975 13.245 13.245 0 01-2.003-.678z" />
                </svg>
              )
            }
          ].map((m) => (
            <div key={m.name} style={{
              background: m.bg,
              border: `1px solid ${m.color}33`,
              padding: '6px 12px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: m.color,
              fontSize: '0.75rem',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              transition: 'all 0.3s ease'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.9 }}>
                {m.icon}
              </span>
              {m.name}
            </div>
          ))}
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.05)',
          borderRadius: '16px',
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', fontWeight: 500 }}>CURRENT ACTIVE MODEL</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="#3b82f6">
              <path d="M16.361 10.26a.894.894 0 0 0-.558.47l-.072.148.001.207c0 .193.004.217.059.353.076.193.152.312.291.448.24.238.51.3.872.205a.86.86 0 0 0 .517-.436.752.752 0 0 0 .08-.498c-.064-.453-.33-.782-.724-.897a1.06 1.06 0 0 0-.466 0zm-9.203.005c-.305.096-.533.32-.65.639a1.187 1.187 0 0 0-.06.52c.057.309.31.59.598.667.362.095.632.033.872-.205.14-.136.215-.255.291-.448.055-.136.059-.16.059-.353l.001-.207-.072-.148a.894.894 0 0 0-.565-.472 1.02 1.02 0 0 0-.474.007Zm4.184 2c-.131.071-.223.25-.195.383.031.143.157.288.353.407.105.063.112.072.117.136.004.038-.01.146-.029.243-.02.094-.036.194-.036.222.002.074.07.195.143.253.064.052.076.054.255.059.164.005.198.001.264-.03.169-.082.212-.234.15-.525-.052-.243-.042-.28.087-.355.137-.08.281-.219.324-.314a.365.365 0 0 0-.175-.48.394.394 0 0 0-.181-.033c-.126 0-.207.03-.355.124l-.085.053-.053-.032c-.219-.13-.259-.145-.391-.143a.396.396 0 0 0-.193.032zm.39-2.195c-.373.036-.475.05-.654.086-.291.06-.68.195-.951.328-.94.46-1.589 1.226-1.787 2.114-.04.176-.045.234-.045.53 0 .294.005.357.043.524.264 1.16 1.332 2.017 2.714 2.173.3.033 1.596.033 1.896 0 1.11-.125 2.064-.727 2.493-1.571.114-.226.169-.372.22-.602.039-.167.044-.23.044-.523 0-.297-.005-.355-.045-.531-.288-1.29-1.539-2.304-3.072-2.497a6.873 6.873 0 0 0-.855-.031zm.645.937a3.283 3.283 0 0 1 1.44.514c.223.148.537.458.671.662.166.251.26.508.303.82.02.143.01.251-.043.482-.08.345-.332.705-.672.957a3.115 3.115 0 0 1-.689.348c-.382.122-.632.144-1.525.138-.582-.006-.686-.01-.853-.042-.57-.107-1.022-.334-1.35-.68-.264-.28-.385-.535-.45-.946-.03-.192.025-.509.137-.776.136-.326.488-.73.836-.963.403-.269.934-.46 1.422-.512.187-.02.586-.02.773-.002zm-5.503-11a1.653 1.653 0 0 0-.683.298C5.617.74 5.173 1.666 4.985 2.819c-.07.436-.119 1.04-.119 1.503 0 .544.064 1.24.155 1.721.02.107.031.202.023.208a8.12 8.12 0 0 1-.187.152 5.324 5.324 0 0 0-.949 1.02 5.49 5.49 0 0 0-.94 2.339 6.625 6.625 0 0 0-.023 1.357c.091.78.325 1.438.727 2.04l.13.195-.037.064c-.269.452-.498 1.105-.605 1.732-.084.496-.095.629-.095 1.294 0 .67.009.803.088 1.266.095.555.288 1.143.503 1.534.071.128.243.393.264.407.007.003-.014.067-.046.141a7.405 7.405 0 0 0-.548 1.873c-.062.417-.071.552-.071.991 0 .56.031.832.148 1.279L3.42 24h1.478l-.05-.091c-.297-.552-.325-1.575-.068-2.597.117-.472.25-.819.498-1.296l.148-.29v-.177c0-.165-.003-.184-.057-.293a.915.915 0 0 0-.194-.25 1.74 1.74 0 0 1-.385-.543c-.424-.92-.506-2.286-.208-3.451.124-.486.329-.918.544-1.154a.787.787 0 0 0 .223-.531c0-.195-.07-.355-.224-.522a3.136 3.136 0 0 1-.817-1.729c-.14-.96.114-2.005.69-2.834.563-.814 1.353-1.336 2.237-1.475.199-.033.57-.028.776.01.226.04.367.028.512-.041.179-.085.268-.19.374-.431.093-.215.165-.333.36-.576.234-.29.46-.489.822-.729.413-.27.884-.467 1.352-.561.17-.035.25-.04.569-.04.319 0 .398.005.569.04a4.07 4.07 0 0 1 1.914.997c.117.109.398.457.488.602.034.057.095.177.132.267.105.241.195.346.374.43.14.068.286.082.503.045.343-.058.607-.053.943.016 1.144.23 2.14 1.173 2.581 2.437.385 1.108.276 2.267-.296 3.153-.097.15-.193.27-.333.419-.301.322-.301.722-.001 1.053.493.539.801 1.866.708 3.036-.062.772-.26 1.463-.533 1.854a2.096 2.096 0 0 1-.224.258.916.916 0 0 0-.194.25c-.054.109-.057.128-.057.293v.178l.148.29c.248.476.38.823.498 1.295.253 1.008.231 2.01-.059 2.581a.845.845 0 0 0-.044.098c0 .006.329.009.732.009h.73l.02-.074.036-.134c.019-.076.057-.3.088-.516.029-.217.029-1.016 0-1.258-.11-.875-.295-1.57-.597-2.226-.032-.074-.053-.138-.046-.141.008-.005.057-.074.108-.152.376-.569.607-1.284.724-2.228.031-.26.031-1.378 0-1.628-.083-.645-.182-1.082-.348-1.525a6.083 6.083 0 0 0-.329-.7l-.038-.064.131-.194c.402-.604.636-1.262.727-2.04a6.625 6.625 0 0 0-.024-1.358 5.512 5.512 0 0 0-.939-2.339 5.325 5.325 0 0 0-.95-1.02 8.097 8.097 0 0 1-.186-.152.692.692 0 0 1 .023-.208c.208-1.087.201-2.443-.017-3.503-.19-.924-.535-1.658-.98-2.082-.354-.338-.716-.482-1.15-.455-.996.059-1.8 1.205-2.116 3.01a6.805 6.805 0 0 0-.097.726c0 .036-.007.066-.015.066a.96.96 0 0 1-.149-.078A4.857 4.857 0 0 0 12 3.03c-.832 0-1.687.243-2.456.698a.958.958 0 0 1-.148.078c-.008 0-.015-.03-.015-.066a6.71 6.71 0 0 0-.097-.725C8.997 1.392 8.337.319 7.46.048a2.096 2.096 0 0 0-.585-.041Zm.293 1.402c.248.197.523.759.682 1.388.03.113.06.244.069.292.007.047.026.152.041.233.067.365.098.76.102 1.24l.002.475-.12.175-.118.178h-.278c-.324 0-.646.041-.954.124l-.238.06c-.033.007-.038-.003-.057-.144a8.438 8.438 0 0 1 .016-2.323c.124-.788.413-1.501.696-1.711.067-.05.079-.049.157.013zm9.825-.012c.17.126.358.46.498.888.28.854.36 2.028.212 3.145-.019.14-.024.151-.057.144l-.238-.06a3.693 3.693 0 0 0-.954-.124h-.278l-.119-.178-.119-.175.002-.474c.004-.669.066-1.19.214-1.772.157-.623.434-1.185.68-1.382.078-.062.09-.063.159-.012z" />
            </svg>
            <span style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 'bold' }}>llama3:8b-instruct-fp16</span>
          </div>
        </div>
      </div>
    )
  }
];
const STEPS = [
  { n: 1, Icon: Package, title: "Install", desc: "Add from Chrome Web Store. One click, zero config." },
  { n: 2, Icon: Plug, title: "Connect", desc: "Run Ollama locally — your AI, your machine, your rules." },
  { n: 3, Icon: Terminal, title: "Command", desc: "Type what you want in the side panel. Plain English." },
  { n: 4, Icon: CheckCircle, title: "Done", desc: "Watch the agent work autonomously. Review the results." },
];
const TESTIMONIALS = [
  { q: "This replaced three separate browser automation tools for me. The natural language interface is a game-changer.", name: "Alex Chen", role: "Full-Stack Developer", av: "AC" },
  { q: "Finally, browser automation that respects my privacy. Running locally with Ollama gives me full control.", name: "Sarah Martinez", role: "Security Engineer", av: "SM" },
  { q: "I use it daily for testing workflows. The multi-tab support saves me hours every week.", name: "James Park", role: "QA Lead", av: "JP" },
  { q: "Open source, local-first, and it actually works. This is how AI tools should be built.", name: "Priya Sharma", role: "DevOps Engineer", av: "PS" },
];
const OS_FEATURES = ["Full multi-tab browser agent", "Local LLM support (Ollama)", "Custom LLM endpoint support", "Smart page reading & interaction", "Tab grouping & management", "MIT Licensed — forever free"];
const FOOTER_COLS = [
  { title: "Product", links: [{ l: "Features", h: "#features" }, { l: "Demo", h: "#demo" }, { l: "How It Works", h: "#how-it-works" }] },
  { title: "Resources", links: [{ l: "Getting Started", h: "#" }, { l: "FAQ", h: "#faq" }, { l: "Terms & Conditions", h: "/terms.html" }, { l: "Privacy Policy", h: "/privacy.html" }] },
  { title: "Connect", links: [{ l: "GitHub", h: SITE.github }, { l: "X (Twitter)", h: "#" }, { l: "Report a Bug", h: "#" }] },
];

/* ─── SVG Icons ─── */
const GithubIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
  </svg>
);

/* ─── Animation helpers ─── */
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

/* ═══════════ NAVBAR ═══════════ */
function Navbar({ visible, activeSection, onNavClick, onInstallClick }: { visible: boolean, activeSection: string, onNavClick: (e: any, href: string) => void, onInstallClick: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <header
        className={`nav ${scrolled ? "nav--scrolled" : ""} ${visible ? "nav--visible" : ""}`}
      >
        <nav className="container nav__inner">
          <a href="/" className="nav__logo">
            <img src="/logo.svg" alt="Oryonix AI Logo" className="nav__logo-img" />
            <span className="accent-text">Oryonix AI</span>
          </a>

          <div className="nav__links-wrapper">
            <ul className="nav__links">
              {NAV.map(n => {
                const isActive = activeSection === n.href.substring(1);
                return (
                  <li key={n.href}>
                    <a
                      href={n.href}
                      className={`nav__link ${isActive ? "nav__link--active" : ""}`}
                      onClick={(e) => onNavClick(e, n.href)}
                    >
                      {n.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <button onClick={onInstallClick} className="btn btn--primary btn--sm nav__cta" style={{ cursor: 'pointer' }}>Install Free</button>
          <button className="nav__burger" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
          <AnimatePresence>
            {open && (
              <motion.div className="nav__mobile" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                {NAV.map(n => <a key={n.href} href={n.href} className="nav__mobile-link" onClick={(e) => { onNavClick(e, n.href); setOpen(false); }}>{n.label}</a>)}
                {/*
                <a href="/early-access/form.html" className="btn btn--primary">
                  <KeyIcon size={16} weight="fill" style={{ transform: 'translateY(1.5px)' }} />
                  Apply for Early Access
                </a>
                */}
                <a href={SITE.chrome} target="_blank" rel="noopener noreferrer" className="btn btn--primary">
                  Add to Browser
                </a>
              </motion.div>
            )}
          </AnimatePresence>
        </nav>
      </header>
    </>
  );
}

function Hero({ onNavClick }: { onNavClick?: (e: any, href: string) => void }) {
  // Generate random twinkling stars/dots in space
  const stars = useMemo(() => {
    return Array.from({ length: 160 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 2.2 + 1.2, // 1.2px to 3.4px
      delay: `${Math.random() * 5}s`,
      duration: `${Math.random() * 4 + 3}s`, // 3s to 7s
      opacity: Math.random() * 0.7 + 0.3,
    }));
  }, []);

  return (
    <section className="hero" id="hero">
      <div className="hero__glow" />
      <div className="hero__grid" />

      {/* Twinkling Space Stars Background */}
      <div className="hero__stars">
        {stars.map((star) => (
          <span
            key={star.id}
            className="hero__star"
            style={{
              top: star.top,
              left: star.left,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: star.delay,
              animationDuration: star.duration,
              opacity: star.opacity,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Halley's Comets (Shooting Stars) */}
      <div className="hero__comet hero__comet--1" />
      <div className="hero__comet hero__comet--2" />
      <div className="hero__comet hero__comet--3" />

      <div className="container hero__inner">
        <motion.div className="hero__content" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>
          <motion.div className="hero__badge" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
            <span className="hero__badge-dot" />Open Source & Free Forever
            <BorderBeam size={60} duration={2.5} colorFrom="#f97316" colorTo="#fdba74" borderWidth={1.5} />
          </motion.div>
          <h1 className="hero__title">Your AI Co-pilot<br /><span className="accent-text">for the Browser</span></h1>
          <p className="hero__sub">Tell it what to do. Watch it work.<br className="hide-mobile" /> Open source & privacy-first.</p>
          <div className="hero__actions">
            {/*
            <a href="/early-access/form.html" className="btn btn--primary btn--lg"><KeyIcon size={18} weight="fill" style={{ transform: 'translateY(1.5px)' }} />Apply for Early Access</a>
            */}
            <a href={SITE.chrome} target="_blank" rel="noopener noreferrer" className="hero-cta-btn-wrapper" style={{ textDecoration: 'none' }}>
              <RadialGlowButton>Add to Browser</RadialGlowButton>
            </a>
            <a href="#demo" className="btn btn--glass btn--lg" onClick={(e) => onNavClick?.(e, '#demo')}>Watch Demo<ArrowRight size={16} /></a>
          </div>
        </motion.div>

        <motion.div className="mockup" initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
          <div className="mockup__frame">
            <div className="mockup__bar">
              <div className="mockup__dots"><span className="dot dot--r" /><span className="dot dot--y" /><span className="dot dot--g" /></div>
              <div className="mockup__url">oryonix.ai</div>
            </div>
            <div className="mockup__body">
              <div className="mockup__panel">
                <div className="mockup__panel-head">
                  <img src="/logo.svg" alt="Oryonix AI Logo" className="mockup__panel-logo" />
                  Oryonix AI
                </div>
                <div className="mockup__input"><span>Book a flight to NYC for next Friday...</span><span className="mockup__cursor" /></div>
                <div className="mockup__status"><span className="mockup__status-dot" />Agent is working...</div>
                <div className="mockup__steps">
                  <div className="mockup__step mockup__step--done"><Check size={16} strokeWidth={2} style={{ display: 'inline', marginRight: '6px' }} /> Opened Google Flights</div>
                  <div className="mockup__step mockup__step--done"><Check size={16} strokeWidth={2} style={{ display: 'inline', marginRight: '6px' }} /> Entered destination: NYC</div>
                  <div className="mockup__step mockup__step--active"><RefreshCw size={16} strokeWidth={2} className="animate-spin" style={{ display: 'inline', marginRight: '6px' }} /> Selecting date...</div>
                </div>
              </div>
              <div className="mockup__page">
                <div className="skel skel--h" /><div className="skel-grid"><div className="skel skel--card" /><div className="skel skel--card" /><div className="skel skel--card" /></div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
          <div className="trust__item"><span className="trust__val"><Star size={16} className="trust__star" /> 4.9</span><span className="trust__label">Chrome Rating</span></div>
          <div className="trust__div" />
          <div className="trust__item"><span className="trust__val">100%</span><span className="trust__label">Open Source</span></div>
          <div className="trust__div" />
          <div className="trust__item"><span className="trust__val">0 bytes</span><span className="trust__label">Data Shared</span></div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ FEATURES ═══════════ */
const FeatureCard = ({ f, i, progress, range, targetScale }: { f: any, i: number, progress: any, range: number[], targetScale: number }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // Smoothly scale down as user scrolls past this specific card
  const scale = useTransform(progress, range, [1, targetScale]);

  return (
    <div
      id={`feature-card-${i}`}
      className="stack-card-container"
      style={{
        position: "sticky",
        top: `calc(100px + ${i * 32}px)`,
        zIndex: i + 1,
        // The magic padding that creates scroll space for the sticky effect to be visible
        marginBottom: i === FEATURES.length - 1 ? "0" : "40vh"
      }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        className="card group relative overflow-hidden stack-card-sticky"
        style={{
          scale,
          transformOrigin: "top center",
          height: (i === 2 || i === 3) ? "490px" : "440px",
          position: "relative",
          zIndex: i + 1,
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          padding: 0,
          background: '#0c0c0e', // Solid background to prevent overlap transparency
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none'
        }}
      >
        <motion.div
          className="pointer-events-none absolute -inset-px rounded-[24px] opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                1200px circle at ${mouseX}px ${mouseY}px,
                ${f.color || 'rgba(249, 115, 22, 0.15)'},
                transparent 100%
              )
            `,
          }}
        />

        {f.customBg ? f.customBg() : f.color && (
          <div style={{
            position: 'absolute',
            inset: '-1px',
            background: `radial-gradient(ellipse at left, ${f.color}, transparent 80%)`,
            opacity: 0.8,
            pointerEvents: 'none',
            borderRadius: '24px'
          }} />
        )}

        {f.dots && (
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'radial-gradient(rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            maskImage: 'linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.3) 100%)',
            pointerEvents: 'none',
            borderRadius: '24px'
          }} />
        )}

        <div className="stack-card-inner relative z-10" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'stretch', flex: 1, height: '100%' }}>
          <div className="stack-card-left" style={{ flex: '1', maxWidth: f.visual ? '450px' : '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px 40px' }}>
            <div className="card__icon" style={{
              width: '48px', height: '48px', minWidth: '48px', minHeight: '48px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
              alignSelf: 'flex-start', flexShrink: 0
            }}>
              <f.Icon size={20} strokeWidth={1.5} color="#fff" />
            </div>

            <h3 style={{ fontSize: '1.75rem', marginBottom: '12px', fontWeight: 'bold', lineHeight: '1.2', color: '#fff', opacity: 1, display: 'block' }}>{f.title}</h3>
            {f.desc && <p style={{ fontSize: '1rem', color: '#fff', lineHeight: '1.6', marginBottom: f.checklist ? '24px' : '0', opacity: 0.9 }}>{f.desc}</p>}

            {f.checklist && (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {f.checklist.map((item: string, idx: number) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '0.9rem', color: '#fff' }}>
                    <CheckCircle size={18} color="#fff" style={{ flexShrink: 0, marginTop: '2px', opacity: 0.6 }} />
                    <span style={{ opacity: 0.95 }}>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {f.visual && (
            <div className="stack-card-right" style={{
              flex: '1.2',
              display: 'flex',
              alignItems: 'stretch',
              paddingTop: '40px',
              paddingLeft: '20px'
            }}>
              <div style={{
                flex: 1,
                background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.03) 100%)',
                backdropFilter: 'blur(20px)',
                WebkitBackdropFilter: 'blur(20px)',
                borderTopLeftRadius: '24px',
                borderBottomRightRadius: '24px',
                borderTop: '1px solid rgba(255,255,255,0.2)',
                borderLeft: '1px solid rgba(255,255,255,0.2)',
                padding: '12px 0 0 12px',
                boxShadow: '-20px -20px 60px rgba(0,0,0,0.5), inset 0 1px 1px rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'stretch'
              }}>
                <div style={{
                  flex: 1,
                  background: 'rgba(15,15,18,1)',
                  borderTopLeftRadius: '12px',
                  borderBottomRightRadius: '24px',
                  borderTop: '1px solid rgba(255,255,255,0.08)',
                  borderLeft: '1px solid rgba(255,255,255,0.08)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {typeof f.visual === 'function' ? f.visual() : (
                    <div style={{
                      position: 'absolute',
                      inset: '20px',
                      border: '2px dashed rgba(255,255,255,0.05)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'rgba(255,255,255,0.2)',
                      fontWeight: 'bold',
                      letterSpacing: '1px'
                    }}>
                      IMAGE / APP SLOT
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

/* ═══════════ TRY IT OUT ═══════════ */
function TryItOut() {
  const promptText = "Goto docs in navigation bar, find Quick-Start section, and summarize in markdown";
  const [isRunning, setIsRunning] = useState(false);
  const [runStatus, setRunStatus] = useState<string | null>(null);

  // Agent overlay state
  const [agentActive, setAgentActive] = useState(false);
  const [cursorPx, setCursorPx] = useState({ x: 0, y: 0 });
  const [cursorType, setCursorType] = useState<'arrow' | 'hand'>('arrow');
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const abortRef = useRef(false);
  const rippleIdRef = useRef(0);

  const wait = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

  useEffect(() => {
    if (agentActive) {
      const preventDefault = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      };

      // Block manual wheel/touch scrolls in capturing phase
      window.addEventListener("wheel", preventDefault, { passive: false, capture: true });
      window.addEventListener("touchmove", preventDefault, { passive: false, capture: true });

      // Block scroll keys in capturing phase
      const preventKeyScroll = (e: KeyboardEvent) => {
        const keys = ["ArrowUp", "ArrowDown", "Space", "PageUp", "PageDown", "Home", "End"];
        if (keys.includes(e.code)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
        }
      };
      window.addEventListener("keydown", preventKeyScroll, { passive: false, capture: true });

      return () => {
        window.removeEventListener("wheel", preventDefault, { capture: true });
        window.removeEventListener("touchmove", preventDefault, { capture: true });
        window.removeEventListener("keydown", preventKeyScroll, { capture: true });
      };
    }
  }, [agentActive]);

  const getCenter = (selector: string) => {
    const el = document.querySelector(selector);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (!r.width && !r.height) return null;
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  const fireRipple = (x: number, y: number) => {
    const id = ++rippleIdRef.current;
    setRipples(p => [...p, { id, x, y }]);
    setTimeout(() => setRipples(p => p.filter(r => r.id !== id)), 700);
  };

  // Scroll the viewport to keep the document content aligned under the cursor
  const scrollPageTo = (scrollY: number) => {
    window.scrollTo({ top: scrollY, behavior: 'smooth' });
  };

  const visitSection = async (href: string, sectionId: string, label: string) => {
    if (abortRef.current) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    const isMobile = W <= 768;

    // ── Step 1: page scrolls BACK TO TOP while cursor travels up to nav ──
    //    Both run simultaneously so page content and cursor arrive together
    scrollPageTo(0);
    await wait(700); // let the scroll start so nav is at natural position
    const navPos = getCenter(isMobile ? `.mobile-dock a[href="${href}"]` : `.nav a[href="${href}"]`);
    setCursorType('arrow');
    if (navPos) setCursorPx(navPos);
    await wait(1300); // cursor transition 1.15s + small settle
    if (abortRef.current) return;

    // ── Step 2: hover pause as hand ──
    setCursorType('hand');
    await wait(420);

    // ── Step 3: click — ripple + flash the nav link ──
    const selector = isMobile ? `.mobile-dock a[href="${href}"]` : `.nav a[href="${href}"]`;
    const navEl = document.querySelector(selector) as HTMLElement | null;
    if (navPos) {
      fireRipple(navPos.x, navPos.y);
      if (navEl) {
        const saved = navEl.style.cssText;
        navEl.style.cssText += ';background:rgba(249,115,22,0.28)!important;border-radius:6px!important;transition:background .15s!important;';
        setTimeout(() => { navEl.style.cssText = saved; }, 500);
      }
    }
    setActionLog(p => [...p, `🖱️ Clicking ${label}...`]);
    await wait(560);
    if (abortRef.current) return;

    // ── Step 4: page scrolls DOWN to section AND cursor drifts to viewport
    //    center simultaneously — page content arrives under the cursor ──
    if (sectionId === 'features') {
      // Specialized scroll behavior for Features section cards!
      for (let i = 0; i < FEATURES.length; i++) {
        if (abortRef.current) return;
        const cardEl = document.getElementById(`feature-card-${i}`);

        // Log action for each card
        const cardTitle = FEATURES[i].title;
        setActionLog(p => [...p, `🔍 Scanning card: ${cardTitle}...`]);

        if (cardEl) {
          cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        setCursorType('arrow');
        // Drift cursor slightly offset
        setCursorPx({ x: W * 0.44 + (i % 2 === 0 ? 15 : -15), y: H * 0.40 });
        await wait(1200); // Wait for smooth scroll and cursor settle
        if (abortRef.current) return;

        // ── Step 5: small "reading" drift so agent looks alive ──
        setCursorPx({ x: W * 0.46 + (i % 2 === 0 ? 15 : -15), y: H * 0.47 });
        await wait(600);
        if (abortRef.current) return;

        // ── Step 6: glow-border the card ──
        const innerCard = cardEl?.querySelector('.stack-card-sticky') as HTMLElement | null;
        if (innerCard) {
          innerCard.style.outline = '3px solid rgba(249,115,22,0.78)';
          innerCard.style.boxShadow = '0 0 0 6px rgba(249,115,22,0.10), 0 0 60px rgba(249,115,22,0.28)';
          innerCard.style.borderRadius = '24px';
          innerCard.style.transition = 'outline .35s ease, box-shadow .35s ease';
        }
        setActionLog(p => [...p, `✓ Card ${i + 1}: ${cardTitle}`]);
        await wait(1800);
        if (innerCard) {
          innerCard.style.outline = '';
          innerCard.style.boxShadow = '';
          innerCard.style.transition = '';
        }
        await wait(100);
      }
    } else {
      const section = document.getElementById(sectionId);
      section?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setCursorType('arrow');
      setCursorPx({ x: W * 0.44, y: H * 0.40 });
      await wait(1200); // scroll + cursor both settle ~same time
      if (abortRef.current) return;

      // ── Step 5: small "reading" drift so agent looks alive ──
      setCursorPx({ x: W * 0.46, y: H * 0.47 });
      await wait(750);
      if (abortRef.current) return;

      // ── Step 6: glow-border the section ──
      if (section) {
        section.style.outline = '3px solid rgba(249,115,22,0.78)';
        section.style.boxShadow = '0 0 0 6px rgba(249,115,22,0.10), 0 0 60px rgba(249,115,22,0.28)';
        section.style.borderRadius = '12px';
        section.style.transition = 'outline .35s ease, box-shadow .35s ease';
      }
      setActionLog(p => [...p, `✓ ${label}`]);
      await wait(2200);
      if (section) {
        section.style.outline = '';
        section.style.boxShadow = '';
        section.style.transition = '';
      }
      await wait(220);
    }
  };

  const handleRun = async () => {
    if (isRunning) return;
    abortRef.current = false;
    setIsRunning(true);
    setRunStatus(null);
    setActionLog([]);
    setRipples([]);

    // Stop Lenis custom scrolling to lock user scroll inputs
    if ((window as any).lenis) {
      (window as any).lenis.stop();
    }

    const W = window.innerWidth;
    const H = window.innerHeight;

    // Scroll to top + show overlay with cursor at page center
    scrollPageTo(0);
    setCursorPx({ x: W * 0.5, y: H * 0.5 });
    setCursorType('arrow');
    setAgentActive(true);
    setActionLog(['🤖 Oryonix agent initializing...']);
    await wait(900);
    if (abortRef.current) { endDemo(); return; }

    // Cursor sweeps up to nav area — page is already at top so both align
    const isMobile = W <= 768;
    setCursorPx({ x: W * 0.5, y: isMobile ? H - 40 : 80 });
    setActionLog(p => [...p, '🔍 Parsing navigation structure...']);
    await wait(1300);

    // Walk through every nav section
    await visitSection('#features', 'features', 'Features');
    await visitSection('#demo', 'demo', 'Demo');
    if (!isMobile) {
      await visitSection('#how-it-works', 'how-it-works', 'How It Works');
      await visitSection('#open-source', 'open-source', 'Open Source');
    }
    if (abortRef.current) { endDemo(); return; }

    // Return home — scroll to try-it-out, cursor follows to center
    document.getElementById('try-it-out')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setCursorPx({ x: W * 0.5, y: H * 0.5 });
    await wait(1100);
    setActionLog(p => [...p, '✅ Task complete!']);
    await wait(1800);

    // Tear down overlay
    setAgentActive(false);
    setIsRunning(false);
    setRunStatus("Task simulated successfully!");

    // Restore Lenis scrolling
    if ((window as any).lenis) {
      (window as any).lenis.start();
    }

    setTimeout(() => {
      document.getElementById("hero")?.scrollIntoView({ behavior: 'smooth' });
    }, 1500);
  };

  const endDemo = () => {
    setAgentActive(false);
    setIsRunning(false);
    setRipples([]);

    // Restore Lenis scrolling
    if ((window as any).lenis) {
      (window as any).lenis.start();
    }
  };

  return (
    <section className="section container" id="try-it-out" style={{ paddingBottom: '80px', paddingTop: '40px' }}>

      {/* ── Oryonix agent live overlay (full viewport) ── */}
      {agentActive && (
        <>
          {/* Rolling-border glow frame */}
          <div className="ory-overlay" />

          {/* Orange cursor */}
          <div
            className={`ory-cursor ${cursorType === 'hand' ? 'ory-hand' : 'ory-arrow'}`}
            style={{ transform: `translate(${cursorPx.x}px, ${cursorPx.y}px)` }}
          />

          {/* Click ripple rings */}
          {ripples.map(r => (
            <div key={r.id} className="ory-ripple" style={{ '--x': `${r.x}px`, '--y': `${r.y}px` } as React.CSSProperties} />
          ))}

          {/* HUD log panel */}
          <div className="ory-log">
            <div className="ory-log-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span className="ory-log-dot" />
                Oryonix AI — Live
              </div>
              <button
                onClick={() => {
                  abortRef.current = true;
                  endDemo();
                }}
                className="ory-log-stop-btn"
                title="Stop Automation"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                </svg>
                Stop
              </button>
            </div>
            {actionLog.slice(-6).map((msg, i) => (
              <div key={i} className="ory-log-entry">{msg}</div>
            ))}
          </div>
        </>
      )}

      {/* ── Card ── */}
      <motion.div
        className="try-it-now-card-wrapper"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f97316 50%, #ea580c 100%)',
          padding: '2px',
          borderRadius: '26px',
          boxShadow: '0 20px 60px rgba(249, 115, 22, 0.25)',
          maxWidth: '960px',
          margin: '0 auto'
        }}
      >
        <div style={{
          background: '#121216',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            background: 'rgba(249, 115, 22, 0.12)',
            borderBottom: '2px solid #f97316',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: '#fff',
            fontWeight: 'bold',
            fontSize: '1.1rem'
          }}>
            <Rocket size={20} className="text-accent" />
            <span>Try It Now</span>
          </div>

          {/* Content */}
          <div className="try-it-now-content" style={{ padding: '36px 32px' }}>
            {/* Input + Run */}
            <div className="try-it-now-input-wrapper" style={{
              background: '#160d0a',
              border: '1px solid rgba(249, 115, 22, 0.25)',
              borderRadius: '999px',
              padding: '8px 8px 8px 28px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
            }}>
              <input
                type="text"
                value={promptText}
                readOnly
                placeholder="Enter a task for the agent..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.05rem',
                  width: '100%',
                  outline: 'none',
                  boxShadow: 'none',
                  padding: 0,
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                  cursor: 'default',
                  pointerEvents: 'none'
                }}
              />
              <button
                className="run-btn"
                onClick={handleRun}
                disabled={isRunning}
                style={{
                  background: isRunning ? 'rgba(255,255,255,0.2)' : 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  padding: '14px 36px',
                  fontWeight: 'bold',
                  fontSize: '1.05rem',
                  cursor: isRunning ? 'wait' : 'pointer',
                  boxShadow: isRunning ? 'none' : '0 4px 15px rgba(249, 115, 22, 0.4)',
                  transition: 'all 0.3s ease',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isRunning ? (
                  <>
                    <RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    <span>Running</span>
                  </>
                ) : (
                  <span>Run</span>
                )}
              </button>
            </div>

            {/* Status message (shown after demo ends) */}
            <AnimatePresence>
              {runStatus && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    marginTop: '20px',
                    padding: '12px 16px',
                    background: isRunning ? 'rgba(249, 115, 22, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                    borderLeft: isRunning ? '4px solid #f97316' : '4px solid #22c55e',
                    borderRadius: '8px',
                    color: isRunning ? '#fdba74' : '#4ade80',
                    fontSize: '0.95rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}
                >
                  {isRunning ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={16} />}
                  <span>{runStatus}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div style={{
              marginTop: '24px',
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              <span>
                Powered by free testing LLM API. By clicking Run you agree to the{' '}
                <a href="/terms.html" style={{ textDecoration: 'underline', color: 'rgba(255,255,255,0.7)' }}>Terms of Use</a>
              </span>
              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                Sandbox v2.4 (Active)
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

function Features() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress purely within the Features section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  return (
    <section className="section" id="features" ref={containerRef}>
      <div className="container">
        <div className="section__head" style={{ marginBottom: '80px' }}>
          <h2>Everything you need to <span className="accent-text">automate the web</span></h2>
          <p>No coding. No cloud. Just natural language.</p>
        </div>
        <div className="features-stack-wrapper">
          {FEATURES.map((f, i) => {
            // Calculate dynamic targets so earlier cards scale down more as others pile up
            const targetScale = 1 - ((FEATURES.length - 1 - i) * 0.05);
            // Calculate specific scroll segment [0 to 1] where this card should scale
            const range = [i * (1 / FEATURES.length), 1];

            return (
              <FeatureCard
                key={f.title}
                f={f}
                i={i}
                progress={scrollYProgress}
                range={range}
                targetScale={targetScale}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════ CORE FEATURES ═══════════ */
function CoreFeatures() {
  const CORE_ITEMS = [
    {
      Icon: Brain,
      iconColor: "#ec4899", // Pink/Magenta
      title: "Smart DOM Analysis",
      desc: "DOM-based analysis with high-intensity dehydration. No visual recognition needed. Pure text for fast and precise operations.",
      bg: "linear-gradient(135deg, rgba(30, 27, 75, 0.5) 0%, rgba(12, 12, 14, 0.8) 100%)",
      borderColor: "rgba(99, 102, 241, 0.25)",
      hoverBorder: "rgba(99, 102, 241, 0.6)",
      shadow: "0 10px 30px rgba(30, 27, 75, 0.4)"
    },
    {
      Icon: Lock,
      iconColor: "#f59e0b", // Amber/Yellow
      title: "Secure & Controllable",
      desc: "Supports operation allowlists, data masking protection. Inject custom knowledge to make AI work by your rules.",
      bg: "linear-gradient(135deg, rgba(88, 28, 135, 0.5) 0%, rgba(12, 12, 14, 0.8) 100%)",
      borderColor: "rgba(168, 85, 247, 0.25)",
      hoverBorder: "rgba(168, 85, 247, 0.6)",
      shadow: "0 10px 30px rgba(88, 28, 135, 0.4)"
    },
    {
      Icon: Zap,
      iconColor: "#f97316", // Orange
      title: "Zero Backend",
      desc: "No Playwright, Puppeteer, or heavy cloud infrastructure required. It lives directly inside your web page via CDN or NPM import with custom LLM endpoints.",
      bg: "linear-gradient(135deg, rgba(6, 78, 59, 0.5) 0%, rgba(12, 12, 14, 0.8) 100%)",
      borderColor: "rgba(16, 185, 129, 0.25)",
      hoverBorder: "rgba(16, 185, 129, 0.6)",
      shadow: "0 10px 30px rgba(6, 78, 59, 0.4)"
    },
    {
      Icon: Accessibility,
      iconColor: "#3b82f6", // Blue
      title: "Accessible Intelligence",
      desc: "Provides natural language interface for complex B2B systems and admin panels. Makes software easy for everyone.",
      bg: "linear-gradient(135deg, rgba(127, 29, 29, 0.4) 0%, rgba(12, 12, 14, 0.8) 100%)",
      borderColor: "rgba(239, 68, 68, 0.25)",
      hoverBorder: "rgba(239, 68, 68, 0.6)",
      shadow: "0 10px 30px rgba(127, 29, 29, 0.4)"
    }
  ];

  return (
    <section className="section container" id="core-features" style={{ paddingBottom: '120px' }}>
      <div style={{ marginBottom: '56px', textAlign: 'center' }}>
        <h2 className="core-title-text" style={{
          fontSize: '2.5rem',
          fontWeight: '800',
          letterSpacing: '-0.03em',
          lineHeight: '1.2',
          margin: 0
        }}>
          Core Features
        </h2>
      </div>

      <div className="core-features-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
        gap: '24px'
      }}>
        {CORE_ITEMS.map((item, idx) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="core-feature-card group"
            style={{
              background: item.bg,
              border: `1px solid ${item.borderColor}`,
              borderRadius: '20px',
              padding: '36px 32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              cursor: 'default'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = item.hoverBorder;
              e.currentTarget.style.transform = 'translateY(-6px)';
              e.currentTarget.style.boxShadow = item.shadow;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = item.borderColor;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
            }}
          >
            {/* Top accent glow */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '15%',
              right: '15%',
              height: '2px',
              background: `linear-gradient(90deg, transparent, ${item.iconColor}, transparent)`,
              opacity: 0.8
            }} />

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '44px', height: '44px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0
              }}>
                <item.Icon size={22} color={item.iconColor} strokeWidth={2} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#fff', letterSpacing: '-0.01em', margin: 0 }}>
                {item.title}
              </h3>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.6', margin: 0 }}>
              {item.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ═══════════ DEMO ═══════════ */
function Demo() {
  return (
    <section className="section" id="demo">
      <div className="container">
        <div className="section__head">
          <h2>See it <span className="accent-text">in action</span></h2>
          <p>Watch the agent complete real tasks — autonomously.</p>
        </div>
        <motion.div className="demo" initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="demo__player">
            <video
              src="/demo-video.mp4"
              controls
              loop
              style={{ width: '100%', display: 'block', borderRadius: 'inherit' }}
            >
              Your browser does not support the video tag.
            </video>
          </div>
          <div className="demo__tags">
            {["Compare prices", "Fill forms", "Research topics", "Test workflows"].map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ HOW IT WORKS ═══════════ */
function HowItWorks() {
  return (
    <section className="section section-alt" id="how-it-works">
      <div className="container">
        <div className="section__head">
          <h2>Up and running in <span className="accent-text">60 seconds</span></h2>
          <p>From install to automation — four simple steps.</p>
        </div>
        <motion.div className="steps" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
          {STEPS.map((s, i) => (
            <motion.div key={s.n} className="step-card" variants={fadeUp} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <div className="step-card__num">{s.n}</div>
              <span className="step-card__icon"><s.Icon size={28} strokeWidth={1.5} /></span>
              <h3 className="step-card__title">{s.title}</h3>
              <p className="step-card__desc">{s.desc}</p>
              {i < STEPS.length - 1 && <div className="step-card__connector" />}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ OPEN SOURCE ═══════════ */
function OpenSource() {
  return (
    <section className="section" id="open-source">
      <div className="container">
        <div className="section__head">
          <h2>Free forever. <span className="accent-text">Open source always.</span></h2>
          <p>No paywalls. No telemetry. No vendor lock-in. MIT licensed.</p>
        </div>
        <motion.div className="os-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <div className="os-card__features">
            {OS_FEATURES.map(f => <div key={f} className="os-card__feat"><Check size={18} className="os-card__check" /><span>{f}</span></div>)}
          </div>
          <div className="os-card__actions">
            <a href={SITE.github} className="btn btn--glass btn--lg" target="_blank" rel="noopener noreferrer"><GithubIcon size={20} />Star on GitHub</a>
            {/*
            <a href="/early-access/form.html" className="btn btn--primary btn--lg"><KeyIcon size={18} weight="fill" style={{ transform: 'translateY(1.5px)' }} />Apply for Early Access</a>
            */}
            <a href={SITE.chrome} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--lg">
              Add to Browser
            </a>
          </div>
          <div className="os-card__stats">
            <div className="os-card__stat"><span className="os-card__stat-val">MIT</span><span className="os-card__stat-label">License</span></div>
            <div className="os-card__stat-div" />
            <div className="os-card__stat"><span className="os-card__stat-val">$0</span><span className="os-card__stat-label">Forever</span></div>
            <div className="os-card__stat-div" />
            <div className="os-card__stat"><span className="os-card__stat-val">0</span><span className="os-card__stat-label">Telemetry</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ TESTIMONIALS ═══════════ */
function Testimonials() {
  return (
    <section className="section section-alt">
      <div className="container">
        <div className="section__head">
          <h2>Loved by <span className="accent-text">developers</span></h2>
          <p>See what people are saying about Oryonix AI.</p>
        </div>
        <motion.div className="test-grid" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}>
          {TESTIMONIALS.map(t => (
            <motion.div key={t.name} className="test-card" variants={fadeUp} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <p className="test-card__quote">&ldquo;{t.q}&rdquo;</p>
              <div className="test-card__author">
                <div className="test-card__avatar">{t.av}</div>
                <div><div className="test-card__name">{t.name}</div><div className="test-card__role">{t.role}</div></div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ═══════════ FINAL CTA ═══════════ */
function CTA() {
  return (
    <section className="section cta-section">
      <div className="cta-glow" />
      <div className="container">
        <motion.div className="cta-card" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}>
          <h2>Ready to put your browser on <span className="accent-text">autopilot?</span></h2>
          <p>Install in seconds. Start automating immediately. No account required.</p>
          <div className="cta-card__actions">
            {/*
            <a href="/early-access/form.html" className="btn btn--primary btn--lg"><KeyIcon size={18} weight="fill" style={{ transform: 'translateY(1.5px)' }} />Apply for Early Access</a>
            */}
            <a href={SITE.chrome} target="_blank" rel="noopener noreferrer" className="btn btn--primary btn--lg">
              Add to Browser
            </a>
            <a href={SITE.github} className="btn btn--glass btn--lg" target="_blank" rel="noopener noreferrer"><GithubIcon size={18} />Star on GitHub</a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ─── FAQ Data ─── */
const FAQS = [
  {
    question: "Is Oryonix AI free to use?",
    answer: <>Yes, the browser extension is completely open-source and free to install. You can check out our <a href={SITE.github} target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)', textDecoration: 'none' }}>GitHub repository</a>.</>
  },
  {
    question: "Do I need my own API key?",
    answer: <>Oryonix allows you to <strong>Bring Your Own Key (BYOK)</strong> or connect to a local <a href="https://ollama.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--color-accent-primary)', textDecoration: 'none' }}>Ollama</a> instance, giving you complete control over your usage and privacy.</>
  },
  { question: "What data does the agent collect?", answer: "Oryonix is privacy-first. It runs locally in your browser and only accesses the active tab when you explicitly trigger it." },
  { question: "Can it bypass CAPTCHAs?", answer: "While highly capable, Oryonix relies on standard web accessibility. Heavy bot protection or complex CAPTCHAs may require human intervention." },
  { question: "How is this different from standard browser automation?", answer: <>Instead of rigid, easily broken scripts (like <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.9em' }}>Puppeteer</code>), Oryonix uses AI to understand natural language. It 'sees' the page like a human and adapts to layout changes automatically.</> },
  { question: "Does it work on any website?", answer: "Yes. Oryonix is designed to interact with the DOM directly, meaning it can navigate and perform actions on virtually any website, from simple blogs to complex web apps." },
  { question: "Can I use it with multiple Chrome profiles?", answer: "Absolutely. Oryonix installs as a standard Chrome extension and maintains separate settings and history for each of your browser profiles." },
  { question: "Is it available on other browsers?", answer: "Currently, Oryonix is optimized for Chrome and Chromium-based browsers (Edge, Brave). A Firefox version is on our roadmap for future release." },
  { question: "How secure is my browsing history?", answer: "Extremely secure. Since Oryonix runs locally (BYOK or Ollama), your commands and browsing data never touch our servers. You have 100% data sovereignty." }
];

/* ─── FAQ Component ─── */
function FAQ() {
  const [openIndices, setOpenIndices] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFAQ = (index: number) => {
    setOpenIndices(prev =>
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const filteredFAQs = FAQS.map((faq, originalIndex) => ({ ...faq, originalIndex }))
    .filter(f => f.question.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <section id="faq" className="section container" style={{ paddingBottom: '80px' }}>
      <div className="section__head">
        <h2 style={{ textAlign: 'center', marginBottom: '32px' }}>
          Frequently Asked <span className="accent-text">Questions</span>
        </h2>
      </div>

      <div className="faq-search-wrapper">
        <Search size={20} style={{ color: 'var(--color-text-tertiary)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search questions..."
          className="faq-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="faq-card-grid">
        <AnimatePresence mode="popLayout">
          {filteredFAQs.map((faq) => {
            const isOpen = openIndices.includes(faq.originalIndex);
            return (
              <motion.div
                layout
                key={faq.originalIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className={`faq-modern-card ${isOpen ? 'faq-modern-card--active' : ''}`}
                onClick={() => toggleFAQ(faq.originalIndex)}
              >
                <div className="faq-card-header">
                  <h3 className="faq-card-question">{faq.question}</h3>
                  <div className="faq-card-icon">
                    <ChevronDown size={20} />
                  </div>
                </div>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                      style={{ overflow: 'hidden' }}
                    >
                      <div className="faq-card-answer">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredFAQs.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px', color: 'var(--color-text-tertiary)' }}>
          No results found for "{searchQuery}"
        </div>
      )}

      {/* Extended Footer CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="faq-footer-cta"
      >
        <div className="faq-footer-cta__text">
          <MessageSquare size={20} className="faq-footer-cta__icon" />
          <p>Still have questions? Can't find the answer you're looking for?</p>
        </div>
        <a href={SITE.github} className="btn btn--sm btn--glass faq-footer-cta__btn" target="_blank" rel="noopener noreferrer">
          <span style={{ marginRight: '8px', display: 'inline-flex', alignItems: 'center' }}><GithubIcon size={16} /></span>Read Documentation
        </a>
      </motion.div>
    </section>
  );
}

/* ═══════════ FOOTER ═══════════ */
function Footer({ onNavClick }: { onNavClick?: (e: any, href: string) => void }) {
  const footerRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: footerRef,
    offset: ["start end", "end end"]
  });

  const glowScaleY = useTransform(scrollYProgress, [0, 1], [0.3, 1.25]);
  const glowScaleX = useTransform(scrollYProgress, [0, 1], [0.6, 1.2]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 0.4, 0.9]);
  const glowY = useTransform(scrollYProgress, [0, 1], [150, 0]);

  return (
    <footer ref={footerRef} className="footer">
      <div className="footer__glow-container">
        <motion.div
          style={{
            scaleY: glowScaleY,
            scaleX: glowScaleX,
            opacity: glowOpacity,
            y: glowY,
            originY: 1
          }}
          className="footer__glow"
        />
      </div>
      <div className="container footer__inner">
        <div className="footer__brand">
          <a href="/" className="nav__logo">
            <img src="/logo.svg" alt="Oryonix AI Logo" className="nav__logo-img" />
            <span className="accent-text">Oryonix AI</span>
          </a>
          <p className="footer__desc">AI-powered browser automation.<br />Open source & privacy-first.</p>
        </div>
        <div className="footer__cols">
          {FOOTER_COLS.map(c => (
            <div key={c.title} className="footer__col">
              <h4>{c.title}</h4>
              <ul>{c.links.map(l => <li key={l.l}><a href={l.h} onClick={l.h.startsWith('#') && l.h !== '#' && onNavClick ? (e) => onNavClick(e, l.h) : undefined}>{l.l}</a></li>)}</ul>
            </div>
          ))}
        </div>
      </div>
      <div className="footer__bottom"><div className="container"><p>© {new Date().getFullYear()} Oryonix AI. Open Source under MIT License.</p></div></div>
    </footer>
  );
}

/* ═══════════════════════════════════════════
   AMBIENT BACKGROUND
   ═══════════════════════════════════════════ */
function AmbientBackground() {
  return (
    <div className="ambient-bg" aria-hidden="true">
      <div className="ambient-blob ambient-blob--1" />
      <div className="ambient-blob ambient-blob--2" />
      <div className="ambient-blob ambient-blob--3" />
      <div className="ambient-noise" />
    </div>
  );
}

/* ═══════════════════════════════════════════
   APP
   ═══════════════════════════════════════════ */
export default function App() {
  const [showTop, setShowTop] = useState(false);
  const [visibleDock, setVisibleDock] = useState(true);
  const [activeSection, setActiveSection] = useState("");
  const [showInstallNotice, setShowInstallNotice] = useState(false);
  const lastScrollY = useRef(0);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleNotice = () => setShowInstallNotice(true);
    window.addEventListener('show-install-notice', handleNotice);
    return () => window.removeEventListener('show-install-notice', handleNotice);
  }, []);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (!href.startsWith("#")) {
      window.open(href, "_blank", "noopener,noreferrer");
      return;
    }

    setActiveSection(href.substring(1));
    isScrollingRef.current = true;
    setVisibleDock(true); // Force visible on click

    const target = document.querySelector(href);
    if (target) {
      target.classList.remove("highlight-pulse");
      // Force reflow to restart animation if already present
      void (target as HTMLElement).offsetWidth;
      target.classList.add("highlight-pulse");
      setTimeout(() => target.classList.remove("highlight-pulse"), 2200);

      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(target, {
          offset: -80,
          duration: 2.0,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          onComplete: () => {
            setTimeout(() => { isScrollingRef.current = false; }, 100);
          }
        });
      } else {
        const y = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top: y, behavior: "smooth" });
        setTimeout(() => { isScrollingRef.current = false; }, 1000);
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowTop(currentScrollY > 400);

      // Only hide if it's a REAL user scroll (not programmatic)
      if (!isScrollingRef.current) {
        if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
          setVisibleDock(false);
        } else {
          setVisibleDock(true);
        }
      }

      lastScrollY.current = currentScrollY;

      // Scroll Spy Logic
      if (isScrollingRef.current) return;
      const sections = NAV.map(n => n.href.substring(1)).filter(Boolean);
      let current = "";
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            current = section;
            break;
          }
        }
      }
      if (currentScrollY < 100) current = "";
      setActiveSection(current);
      lastScrollY.current = currentScrollY;
    };

    // Reset isScrollingRef on any manual interaction
    const handleManualReset = () => {
      isScrollingRef.current = false;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleManualReset, { passive: true });
    window.addEventListener("touchstart", handleManualReset, { passive: true });
    handleScroll();

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    (window as any).lenis = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as any).lenis;
    };
  }, []);

  return (
    <>
      <AmbientBackground />
      <SmoothCursor />
      <Navbar
        visible={visibleDock}
        activeSection={activeSection}
        onNavClick={handleNavClick}
        onInstallClick={() => setShowInstallNotice(true)}
      />
      <main id="main-content">
        <Hero onNavClick={handleNavClick} />
        <TryItOut />
        <Features />
        <CoreFeatures />
        <Demo />
        <HowItWorks />
        <OpenSource />
        <Testimonials />
        <CTA />
        <FAQ />
      </main>
      <Footer onNavClick={handleNavClick} />

      {/* Mobile Bottom Dock */}
      <AnimatePresence>
        {visibleDock && (
          <motion.div
            className="mobile-dock"
            initial={{ y: 100, x: "-50%", opacity: 0 }}
            animate={{ y: 0, x: "-50%", opacity: 1 }}
            exit={{ y: 100, x: "-50%", opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <div className="mobile-dock__inner">
              <a
                href="#features"
                className={`mobile-dock__item ${activeSection === "features" ? "mobile-dock__item--active" : ""}`}
                onClick={(e) => handleNavClick(e, "#features")}
              >
                <img src="/logo.svg" alt="Oryonix AI" className="mobile-dock__logo" />
                <span>Features</span>
              </a>
              <a
                href="#demo"
                className={`mobile-dock__item ${activeSection === "demo" ? "mobile-dock__item--active" : ""}`}
                onClick={(e) => handleNavClick(e, "#demo")}
              >
                <Play size={20} />
                <span>Demo</span>
              </a>
              <a
                href={SITE.github}
                className="mobile-dock__item"
                target="_blank"
                rel="noopener noreferrer"
              >
                <GithubIcon size={20} />
                <span>Github</span>
              </a>
              <div className="mobile-dock__div"></div>
              {/*
              <a href="/early-access/form.html" className="mobile-dock__cta btn btn--primary btn--sm">
                <KeyIcon size={16} weight="fill" style={{ transform: 'translateY(1.5px)' }} />
                <span>Early Access</span>
              </a>
              */}
              <a href={SITE.chrome} target="_blank" rel="noopener noreferrer" className="mobile-dock__cta btn btn--primary btn--sm">
                <span>Add to Browser</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTop && (
          <motion.button
            className="scroll-top"
            onClick={() => {
              if ((window as any).lenis) {
                (window as any).lenis.scrollTo(0);
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            aria-label="Scroll to top"
          >
            <ChevronUp size={24} strokeWidth={2} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showInstallNotice && (
          <motion.div
            className="install-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowInstallNotice(false)}
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              zIndex: 9999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                boxSizing: 'border-box',
                background: 'linear-gradient(135deg, rgba(26,20,16,0.95), rgba(15,12,10,0.98))',
                border: '1px solid rgba(249,115,22,0.3)',
                borderRadius: '24px',
                padding: '24px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(249,115,22,0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '20px'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px'
              }}>
                {/* Web Store Circle */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#1a1410',
                  border: '2px solid rgba(255,255,255,0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  zIndex: 1,
                  transform: 'translateX(8px)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
                }}>
                  <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <circle cx="12" cy="12" r="4"></circle>
                    <line x1="21.17" y1="8" x2="12" y2="8"></line>
                    <line x1="3.95" y1="6.06" x2="8.54" y2="14"></line>
                    <line x1="10.88" y1="21.94" x2="15.46" y2="14"></line>
                  </svg>
                </div>

                {/* Oryonix Circle */}
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: '#1a1410',
                  border: '2px solid rgba(249,115,22,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 2,
                  transform: 'translateX(-8px)',
                  boxShadow: '0 8px 24px rgba(249,115,22,0.2)'
                }}>
                  <img src="/logo.svg" alt="Oryonix" style={{ width: '32px', height: '32px' }} />
                </div>
              </div>

              {/*
              <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'white' }}>Pending Web Store Approval</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Oryonix AI is currently under review by the Chrome Web Store. Once approved, automatic 1-click installation will be available here.
                <br/><br/>
                For now, you can download the unpacked extension and install it manually from our <a href={SITE.github} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-accent-primary)', textDecoration: 'underline' }}>GitHub repository</a>.
              </p>
              */}

              <h3 style={{ fontSize: '1.4rem', margin: 0, color: 'white' }}>Install Oryonix AI</h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>
                Oryonix AI is now officially approved and published on the Chrome Web Store.
                Click below to add it to your browser instantly.
              </p>

              <div style={{ display: 'flex', gap: '12px', width: '100%', marginTop: '12px', flexDirection: 'column' }}>
                {/*
                <a 
                  href="/early-access/form.html" 
                  className="btn btn--primary btn--lg" 
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => setShowInstallNotice(false)}
                >
                  <KeyIcon size={18} weight="fill" style={{ transform: 'translateY(1.5px)' }} />
                  <span style={{ marginLeft: '8px' }}>Apply for Early Access</span>
                </a>
                */}

                <a
                  href={SITE.chrome}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--primary btn--lg"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 30px' }}
                  onClick={() => setShowInstallNotice(false)}
                >
                  <SharedTooltipAvatars
                    items={BROWSER_AVATARS}
                    className="mr-2"
                  />
                  <span style={{ marginLeft: '6px' }}>Add to Browser</span>
                </a>

                <a
                  href={SITE.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn--glass btn--lg"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px 30px' }}
                  onClick={() => setShowInstallNotice(false)}
                >
                  <GithubIcon size={18} />
                  <span style={{ marginLeft: '8px' }}>Get from GitHub</span>
                </a>
                <button
                  className="btn btn--glass btn--lg"
                  style={{ width: '100%', justifyContent: 'center', background: 'transparent', opacity: 0.7, padding: '10px 30px' }}
                  onClick={() => setShowInstallNotice(false)}
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}