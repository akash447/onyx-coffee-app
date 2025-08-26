import { CatalogItem } from '../types';

interface SearchableItem {
  id: string;
  searchText: string;
  item: CatalogItem;
  matches: string[];
}

interface ScoredSearchItem extends SearchableItem {
  score: number;
}

/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching scoring
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];
  const len1 = str1.length;
  const len2 = str2.length;

  if (len1 === 0) return len2;
  if (len2 === 0) return len1;

  // Initialize matrix
  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (str1.charAt(i - 1) === str2.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[len1][len2];
}

/**
 * Calculate fuzzy match score for a query against text
 * Returns 0-1 where 1 is perfect match
 */
function calculateFuzzyScore(query: string, text: string): number {
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();

  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    const matchIndex = textLower.indexOf(queryLower);
    // Prefer matches at start of string
    const positionScore = Math.max(0, (text.length - matchIndex) / text.length);
    return 0.9 + (positionScore * 0.1);
  }

  // Calculate based on edit distance
  const distance = levenshteinDistance(queryLower, textLower);
  const maxLength = Math.max(query.length, text.length);
  
  // Normalize to 0-1 score (higher is better)
  const similarity = Math.max(0, (maxLength - distance) / maxLength);
  
  // Apply threshold - only return scores above 0.6 for fuzzy matches
  return similarity >= 0.6 ? similarity : 0;
}

/**
 * Check if query words appear in text with some tolerance
 */
function hasWordMatches(query: string, text: string): boolean {
  const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 2);
  const textLower = text.toLowerCase();
  
  // At least 70% of query words should have some match
  const matchingWords = queryWords.filter(word => {
    // Check for substring match or fuzzy match on individual words
    if (textLower.includes(word)) return true;
    
    // Check for partial matches (at least 3 characters and 80% similarity)
    const textWords = textLower.split(/\s+/);
    return textWords.some(textWord => {
      if (textWord.length < 3 || word.length < 3) return false;
      const similarity = 1 - (levenshteinDistance(word, textWord) / Math.max(word.length, textWord.length));
      return similarity >= 0.8;
    });
  });
  
  return matchingWords.length / queryWords.length >= 0.7;
}

/**
 * Prepare items for searching by creating searchable text
 */
function prepareSearchItems(items: CatalogItem[]): SearchableItem[] {
  return items.map(item => {
    // Create comprehensive search text combining all searchable fields
    const searchFields = [
      item.name,
      item.desc,
      item.category || '',
      item.roastProfile || '',
      item.brewStyle || '',
      ...(item.flavorNotes || []),
    ].filter(Boolean);

    const searchText = searchFields.join(' ');
    
    return {
      id: item.id,
      searchText: searchText.toLowerCase(),
      item,
      matches: []
    };
  });
}

/**
 * Perform fuzzy search on catalog items
 */
export function fuzzySearchProducts(
  query: string,
  items: CatalogItem[],
  maxResults: number = 20
): CatalogItem[] {
  if (!query.trim() || items.length === 0) {
    return [];
  }

  const queryTrimmed = query.trim();
  const searchItems = prepareSearchItems(items);
  
  // Score and filter items
  const scoredItems = searchItems
    .map(searchItem => {
      const nameScore = calculateFuzzyScore(queryTrimmed, searchItem.item.name);
      const descScore = calculateFuzzyScore(queryTrimmed, searchItem.item.desc || '') * 0.7;
      const categoryScore = calculateFuzzyScore(queryTrimmed, searchItem.item.category || '') * 0.5;
      const flavorScore = Math.max(...(searchItem.item.flavorNotes || []).map(note => 
        calculateFuzzyScore(queryTrimmed, note)
      ), 0) * 0.8;
      
      // Combined search across all text
      const overallScore = calculateFuzzyScore(queryTrimmed, searchItem.searchText) * 0.6;
      
      // Word-based matching for multi-word queries
      const wordMatchScore = hasWordMatches(queryTrimmed, searchItem.searchText) ? 0.3 : 0;
      
      // Weighted total score
      const totalScore = Math.max(
        nameScore * 2,      // Name matches are most important
        descScore * 1.5,    // Description matches
        categoryScore,      // Category matches
        flavorScore * 1.3,  // Flavor note matches
        overallScore,       // Overall text match
        wordMatchScore      // Multi-word matches
      );

      return {
        ...searchItem,
        score: totalScore
      } as ScoredSearchItem;
    })
    .filter(item => item.score > 0.1) // Filter out very poor matches
    .sort((a, b) => b.score - a.score) // Sort by score descending
    .slice(0, maxResults); // Limit results

  return scoredItems.map(item => item.item);
}

/**
 * Get search suggestions based on partial query
 */
export function getSearchSuggestions(
  query: string,
  items: CatalogItem[],
  maxSuggestions: number = 5
): string[] {
  if (!query.trim() || items.length === 0) {
    return [];
  }

  const queryLower = query.toLowerCase();
  const suggestions = new Set<string>();

  items.forEach(item => {
    // Suggest product names
    if (item.name.toLowerCase().includes(queryLower)) {
      suggestions.add(item.name);
    }

    // Suggest categories
    if (item.category && item.category.toLowerCase().includes(queryLower)) {
      suggestions.add(item.category);
    }

    // Suggest flavor notes
    if (item.flavorNotes) {
      item.flavorNotes.forEach(note => {
        if (note.toLowerCase().includes(queryLower)) {
          suggestions.add(note);
        }
      });
    }
  });

  return Array.from(suggestions).slice(0, maxSuggestions);
}

/**
 * Highlight matching text in search results
 */
export function highlightSearchMatch(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  const index = textLower.indexOf(queryLower);
  
  if (index >= 0) {
    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    return `${before}<mark>${match}</mark>${after}`;
  }
  
  return text;
}