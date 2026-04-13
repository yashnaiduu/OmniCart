import { Injectable, Logger } from '@nestjs/common';

/**
 * AI Engine Service — Rule-Based MVP
 * Per 09_AI_ENGINE_SPEC.md
 *
 * Components:
 * 1. Input Parser — converts natural language to structured item list
 * 2. Suggestion Engine — suggests co-purchase items
 * 3. Product Normalizer — cleans messy product names
 *
 * Priority: Rules → Graph → Heuristics → LLM (last resort, not in MVP)
 */

export interface ParsedItem {
  item: string;
  quantity?: string;
}

@Injectable()
export class AiEngineService {
  private readonly logger = new Logger(AiEngineService.name);

  /**
   * 3.1 Input Parsing Engine
   * "need groceries for pasta dinner" → [{item: "pasta"}, {item: "sauce"}, {item: "cheese"}]
   */
  private readonly recipeMap: Record<string, ParsedItem[]> = {
    pasta: [
      { item: 'pasta', quantity: '500g' },
      { item: 'sauce', quantity: '1 jar' },
      { item: 'cheese', quantity: '200g' },
    ],
    sandwich: [
      { item: 'bread', quantity: '1 pack' },
      { item: 'butter', quantity: '100g' },
      { item: 'cheese', quantity: '200g' },
    ],
    breakfast: [
      { item: 'bread', quantity: '1 pack' },
      { item: 'eggs', quantity: '6 pcs' },
      { item: 'milk', quantity: '500ml' },
      { item: 'butter', quantity: '100g' },
    ],
    'birthday party': [
      { item: 'cake', quantity: '1 kg' },
      { item: 'chips', quantity: '3 packs' },
      { item: 'drinks', quantity: '2L' },
    ],
    tea: [
      { item: 'tea', quantity: '250g' },
      { item: 'milk', quantity: '500ml' },
      { item: 'sugar', quantity: '500g' },
    ],
    biryani: [
      { item: 'rice', quantity: '1kg' },
      { item: 'oil', quantity: '500ml' },
    ],
    dal: [
      { item: 'dal', quantity: '500g' },
      { item: 'oil', quantity: '200ml' },
    ],
  };

  /**
   * 3.2 Real-Time Suggestion Engine (Co-Purchase)
   * Per 09_AI_ENGINE_SPEC.md §3.2 + §3.3
   */
  private readonly suggestionMap: Record<string, string[]> = {
    bread: ['butter', 'jam', 'eggs', 'cheese'],
    pasta: ['sauce', 'cheese', 'garlic'],
    milk: ['bread', 'eggs', 'sugar', 'tea'],
    rice: ['dal', 'oil', 'salt'],
    eggs: ['bread', 'butter', 'milk'],
    butter: ['bread', 'jam'],
    cheese: ['bread', 'pasta', 'sauce'],
    tea: ['sugar', 'milk'],
    sugar: ['tea', 'milk'],
    oil: ['rice', 'salt', 'dal'],
    dal: ['rice', 'oil'],
    sauce: ['pasta', 'cheese'],
    chips: ['drinks', 'dip'],
  };

  /**
   * Brand noise patterns to strip during normalization
   */
  private readonly brandPatterns =
    /\b(amul|mother dairy|harvest gold|india gate|barilla|fortune|nandini|modern|kissan|maggi|del monte|daawat|bb royal|borges|gowardhan|trust|fresho|english oven|disano|country|farm fresh|taaza|gold|full cream|toned|white|multigrain|basmati|penne|rigate|pasteurised|salted|processed|slices|pack of|classic)\b/gi;

  /**
   * Parse raw user input into structured items
   * Per 09_AI_ENGINE_SPEC.md §3.1
   */
  parseInput(text: string): ParsedItem[] {
    if (!text || text.trim().length === 0) return [];

    const input = text.toLowerCase().trim();
    this.logger.debug(`Parsing input: "${input}"`);

    // 1. Check recipe/context mapping first
    for (const [keyword, items] of Object.entries(this.recipeMap)) {
      if (input.includes(keyword)) {
        this.logger.debug(`Matched recipe: ${keyword}`);
        return items;
      }
    }

    // 2. Split by common delimiters: "and", ",", "+"
    const tokens = input
      .split(/\s*(?:,|\band\b|\+|&)\s*/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    return tokens.map((token) => ({
      item: this.normalize(token),
      quantity: this.inferQuantity(token),
    }));
  }

  /**
   * Get co-purchase suggestions for a given item
   * Per 09_AI_ENGINE_SPEC.md §3.2
   */
  getSuggestions(item: string): string[] {
    const normalizedItem = this.normalize(item);
    return this.suggestionMap[normalizedItem] || [];
  }

  /**
   * Get suggestions for multiple items (deduped)
   */
  getSuggestionsForItems(items: string[]): string[] {
    const normalizedItems = new Set(items.map((i) => this.normalize(i)));
    const suggestions = new Set<string>();

    for (const item of normalizedItems) {
      const itemSuggestions = this.suggestionMap[item] || [];
      for (const suggestion of itemSuggestions) {
        // Don't suggest items already in the list
        if (!normalizedItems.has(suggestion)) {
          suggestions.add(suggestion);
        }
      }
    }

    return Array.from(suggestions);
  }

  /**
   * 3.4 Product Normalization Engine
   * "Amul Taaza Milk 500ml" → "milk"
   * Per 09_AI_ENGINE_SPEC.md §3.4
   */
  normalize(name: string): string {
    return name
      .toLowerCase()
      .replace(this.brandPatterns, '')
      .replace(/\d+\s*(g|kg|ml|l|pcs|pack|ltr|litre|liter)\b/gi, '')
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * 3.5 Quantity Inference Engine
   * Per 09_AI_ENGINE_SPEC.md §3.5
   */
  private inferQuantity(text: string): string | undefined {
    const quantityMatch = text.match(
      /(\d+)\s*(g|kg|ml|l|pcs|pack|ltr|litre|liter)/i,
    );
    if (quantityMatch) {
      return `${quantityMatch[1]}${quantityMatch[2]}`;
    }
    return undefined;
  }
}
