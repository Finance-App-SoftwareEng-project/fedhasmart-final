/**
 * Utility Functions
 * 
 * Common utility functions used throughout the application.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Class name utility function
 * 
 * Combines clsx and tailwind-merge to handle conditional class names
 * and resolve Tailwind CSS class conflicts intelligently.
 * 
 * @param inputs - Class names or conditional class objects
 * @returns Merged class string
 * 
 * @example
 * cn('px-2', 'px-4') // Returns 'px-4' (later class wins)
 * cn('text-red-500', isActive && 'text-blue-500') // Conditional classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
