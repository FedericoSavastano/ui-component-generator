# 🎨 UI Component Generator

AI-powered tool to generate React + TypeScript + Tailwind CSS components from natural language descriptions.

[🚀 Live Demo](https://tu-url.vercel.app) | [📹 Video Demo](#)

![Demo](screenshot.png)

## ✨ Features

- **AI-Powered Generation**: Describe components in plain language
- **Live Preview**: See components rendered in real-time with Tailwind CSS
- **Edit & Iterate**: Refine components with natural language instructions
- **Multiple Variants**: Auto-generates size/style variations
- **Download & Copy**: Export as .tsx files or copy to clipboard
- **Component Library**: Browse and reuse previously generated components

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **AI**: Groq (Llama 3.3 70B)
- **Database**: Supabase (PostgreSQL)
- **Editor**: Monaco Editor
- **Deploy**: Vercel

## 🚀 Quick Start

```bash
git clone https://github.com/tu-usuario/ui-component-generator.git
cd ui-component-generator
npm install
```

Create `.env.local`:

```env
GROQ_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
```

```bash
npm run dev
```

## 💡 Usage Examples

**Generate a Button:**

> "A blue gradient button with rounded corners, white text, and smooth hover animation"

**Edit Component:**

> "Change the color to green and make it larger"

## 🎯 Key Features Showcase

- **Isolated Preview**: Components render in sandbox iframe with independent Tailwind instance
- **Smart Props**: AI generates appropriate default props based on component type
- **Variant Generation**: Automatically creates size/color variations
- **Edit Mode**: Modify existing components with natural language

## 📝 License

MIT
