---
title: "Getting Started with Enhanced Markdown"
description: "A guide to using our enhanced markdown features for expressive articles"
category: "Documentation"
date: "2025-03-07"
image: "/images/markdown-guide.jpg"
author: "Content Team"
keywords: ["markdown", "writing", "documentation"]
lastModified: "2025-03-07"
readingTime: "4 min"
featured: true
---

# Getting Started with Enhanced Markdown

Welcome to our enhanced markdown platform! This article will show you ==how to use all the special features== available to make your content more engaging and expressive.

## Basic Formatting

You can use all the standard markdown formatting like **bold**, *italic*, and ***bold italic*** text. You can also create [links to websites](https://example.com) and insert images:

![Sample image alt text](/images/sample.jpg "Sample image title")

## Using Icons

Icons can make your content more visually appealing. Here are some examples:

:icon[fa-solid fa-check] Use the check icon for completed items  
:icon[fa-solid fa-lightbulb] The lightbulb is great for tips and ideas  
:icon[fa-solid fa-warning] Use the warning icon for important notices  
:icon[fa-brands fa-twitter] Add social media icons when needed  

## Text Highlighting

You can ==highlight important information== to make it stand out. This is perfect for key points you want readers to remember.

## Embedding PDFs

Need to share a document? You can embed PDFs directly in your article: Though this is not recommended since the pdf can't be viewed on mobile. Rather just add a link to the resource instead. also note the pdf you want to embed must be in the public/resources/pdfs folder

{{pdf:original-cv.pdf}}

## Creating Lists

### Unordered Lists

- First item
- Second item
  - Nested item 1
  - Nested item 2
- Third item

### Ordered Lists

1. First step
2. Second step
3. Third step

### Task Lists

- [x] Write introduction
- [x] Add examples of basic formatting
- [ ] Include advanced examples
- [ ] Proofread the article

## Tables

| Feature | Description | Example |
|---------|-------------|---------|
| Highlighting | Highlight important text | ==Like this== |
| Icons | Insert FontAwesome icons | :icon[fa-solid fa-star] |
| PDF Embedding | Embed PDF documents | {{pdf:document.pdf}} |

## Code Blocks

```javascript
// A simple JavaScript function
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet("Reader"));
```

## Blockquotes

> The purpose of writing is to communicate ideas effectively.
>
> Adding visual elements can enhance the readability of your content.

## Emojis

Writing articles should be fun :smile: and rewarding :trophy:!

## Mathematical Expressions

You can include mathematical expressions:

$E = mc^2$

Or more complex formulas:

$$
\frac{1}{n} \sum_{i=1}^{n} x_i = \bar{x}
$$

## Conclusion

These enhanced markdown features allow you to create more engaging, expressive, and professional-looking articles. Experiment with them in your next piece!

For more details, check out our [full documentation](/resources/markdown-guide).