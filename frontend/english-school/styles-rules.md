Project Style Guide

This document outlines the standard visual design guidelines, including colors, typography, and component styles, to ensure a consistent and cohesive user experience across the application. All styles are implemented using Tailwind CSS utility classes.
1. Color Palette

Our color palette is designed to be modern, clean, and accessible, with a dark-mode-first approach.
Primary Colors

    Background: The primary background for all pages.

        Class: bg-slate-900

        Usage: Main <body> or root container.

    Surface/Card Background: For containers, cards, and modal backgrounds. Uses transparency for a layered effect.

        Class: bg-slate-800/50

        Usage: Plan cards, calendar day containers.

    Borders: Subtle borders to define component edges.

        Class: border-slate-700

        Usage: Cards, dividers.

Accent Colors

    Primary Accent (Sky Blue): Used for highlighting, primary calls-to-action, and selected states.

        Classes: bg-sky-500, text-sky-400, border-sky-400

        Usage: "Most Popular" plan, selected time slots, gradient headings.

    Success (Emerald Green): Used for confirmation actions and positive feedback.

        Classes: bg-emerald-500, text-emerald-400

        Usage: "Proceed to Checkout" button, feature list checkmarks.

    Warning (Amber): Used for cautionary messages or to draw attention.

        Class: text-amber-400

        Usage: "Sessions remaining" text.

Text Colors

    Primary Text: For headings and primary content.

        Class: text-white

    Secondary Text: For descriptions, subheadings, and less important information.

        Class: text-slate-300, text-slate-400

    Muted/Disabled Text: For placeholder text or disabled states.

        Class: text-slate-500

2. Typography

We use the default Tailwind CSS sans-serif font stack (Inter, system-ui).

    H1 / Page Title: Large, bold, and often with a gradient for visual impact.

        Classes: text-4xl md:text-5xl font-extrabold tracking-tight

    H3 / Card Title:

        Classes: text-2xl font-bold text-white

    Body Paragraph:

        Classes: text-lg text-slate-400

    Small/Helper Text:

        Classes: text-sm text-slate-400

3. UI Components

Standardized styles for common interface elements.
Buttons

    Primary Action (Success):

        Classes: bg-emerald-500 hover:bg-emerald-600 text-white

    Secondary/Default:

        Classes: bg-slate-700 hover:bg-slate-600 text-slate-200

    Selected State (Accent):

        Classes: bg-sky-500 text-white

    General Sizing & Style:

        Classes: font-semibold py-3 px-8 rounded-lg transition-colors duration-300

Cards

    Base Style:

        Classes: bg-slate-800/50 border border-slate-700 rounded-xl p-4

    Highlighted/Selected Card:

        Classes: border-sky-400 scale-105 shadow-2xl shadow-sky-500/20

4. Effects & Animations

    Transitions: All interactive elements should have smooth transitions.

        Classes: transition-all, duration-200, duration-300

    Fade-in Animation: Used for loading new views or components.

        Class: animate-fade-in (custom animation defined in styles)

    Backdrop Blur: Used on the fixed navigation bar for a "frosted glass" effect on scroll.

        Class: backdrop-blur-xl