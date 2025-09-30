import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * @fileoverview Utility functions for merging Tailwind CSS classes.
 * @description Provides a `cn` function that intelligently merges Tailwind CSS classes,
 * resolving conflicts and ensuring proper override order.
 */

/**
 * Combines multiple class names into a single string,
 * intelligently merging Tailwind CSS classes and resolving conflicts.
 *
 * @param inputs - An array of class values (strings, arrays, objects, booleans, null, undefined).
 * @returns A single string of merged class names.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}