'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
  badge?: React.ReactNode;
}

export interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;
  defaultExpanded?: string[];
  className?: string;
}

export function Accordion({
  items,
  allowMultiple = false,
  defaultExpanded = [],
  className = '',
}: AccordionProps) {
  const [expanded, setExpanded] = useState<string[]>(defaultExpanded);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setExpanded((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setExpanded((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((item) => {
        const isExpanded = expanded.includes(item.id);
        const headerId = `accordion-header-${item.id}`;
        const panelId = `accordion-panel-${item.id}`;

        return (
          <div
            key={item.id}
            className={`rounded-xl border transition-all ${
              isExpanded
                ? 'bg-koraCharcoal-surface border-koraCharcoal-border shadow-md'
                : 'bg-koraCharcoal-surface/60 border-koraCharcoal-border/70 hover:border-koraSlate/40'
            }`}
          >
            <h3>
              <button
                id={headerId}
                aria-controls={panelId}
                aria-expanded={isExpanded}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center justify-between p-4 text-left font-medium text-koraOffWhite text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-koraRed rounded-xl"
              >
                <div className="flex items-center gap-2.5">
                  <span className="font-heading font-semibold">{item.title}</span>
                  {item.badge}
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-koraSecondary transition-transform duration-200 shrink-0 ${
                    isExpanded ? 'rotate-180 text-koraRed' : ''
                  }`}
                />
              </button>
            </h3>

            {isExpanded && (
              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                className="px-4 pb-4 pt-1 text-xs text-koraSecondary leading-relaxed border-t border-koraCharcoal-border/60"
              >
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
