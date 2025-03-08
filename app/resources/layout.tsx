import React from 'react';

/**
 * Renders child components inside a React fragment.
 *
 * This layout component simply wraps its provided children without adding
 * any extra HTML elements, facilitating a clean composition of nested components.
 *
 * @param children - The child elements to render.
 *
 * @returns A React fragment containing the provided children.
 */
export default function ResourcesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
    </>
  );
}
