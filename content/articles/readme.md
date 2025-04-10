---
title: "Getting Started with Writing Articles in Markdown"
description: "A guide to using our enhanced markdown features for expressive articles"
category: "Documentation"
image: "/resources/readme.png"
author: "Farrukh"
authorImage: "/media/farrukh-av.png"
keywords: ["markdown", "documentation", "guide", "content creation"]
featured: true
partnerships: [
  { company: "Accenture", collaborators: ["recruiter"] },
  { company: "Digital Catapult", collaborators: ["apprentice", "recruiter"] }
]
---

# Getting Started with Enhanced Markdown

Welcome to our enhanced markdown platform! This article will show you ==how to use all the special features== available to make your content more engaging and expressive.

## Basic Formatting

You can use all the standard markdown formatting like **bold**, *italic*, and ***bold italic*** text. You can also create [links to websites](https://example.com) and insert images:

![Sample image alt text](/images/sample.jpg "Sample image title")

## Using Icons

Icons can make your content more visually appealing. Here are some examples:

**Font Awesome Icons**

:icon[fa-solid fa-check] Use the check icon for completed items  
:icon[fa-solid fa-lightbulb] The lightbulb is great for tips and ideas  
:icon[fa-solid fa-warning] Use the warning icon for important notices  
:icon[fa-brands fa-twitter] Add social media icons when needed 

**Lucide Icons**

:icon[lucide-check] Use Lucide Icons

:icon[lucide-github] Lucide Icons are also available

:icon[lucide-star] Lucide Icons are also available

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

## Conclusion

These enhanced markdown features allow you to create more engaging, expressive, and professional-looking articles. Experiment with them in your next piece!

## Article Metadata

The following metadata fields are available for articles:

```yaml
title: "Your Article Title"              # Required
description: "Article description"        # Required
category: "Category Name"                 # Required
date: "YYYY-MM-DD"                       # Required
image: "/images/your-image.jpg"          # Optional, article hero image
author: "Author Name"                    # Optional
authorImage: "/images/author.jpg"        # Optional, author's profile picture (recommended: 96x96)
keywords: ["keyword1", "keyword2"]       # Optional, for SEO and related topics
lastModified: "YYYY-MM-DD"              # Optional
featured: true                           # Optional, shows article in featured section
partnerships:                            # Optional, shows company logos and collaboration type
  - company: "Company1"                  # Must match exact company name
    collaborators: ["apprentice"]        # "apprentice" and/or "recruiter"
  - company: "Company2"
    collaborators: ["apprentice", "recruiter"]
```

## How to Use Article Features

<span class="badge-primary">new</span> <span class="badge-info">guide</span> <span class="badge-success">beginner</span>

## Using Badges

Badges are a great way to highlight important information or categorize content. They're designed to look like modern coding or keyword badges with a clean, minimal style. Here's how to use them:

```markdown
<span class="badge-primary">primary</span>
<span class="badge-secondary">secondary</span>
<span class="badge-success">success</span>
<span class="badge-danger">danger</span>
<span class="badge-warning">warning</span>
<span class="badge-info">info</span>
```

Which will render as:

<span class="badge-primary">primary</span>
<span class="badge-secondary">secondary</span>
<span class="badge-success">success</span>
<span class="badge-danger">danger</span>
<span class="badge-warning">warning</span>
<span class="badge-info">info</span>

## Creating Premium Tables

Tables in ApprenticeWatch articles have a premium glassmorphism effect. Here's an example:

| Feature | Description | Status |
|---------|-------------|--------|
| Badges | Modern keyword-style badges | <span class="badge-success">available</span> |
| Tables | Premium glassmorphism tables | <span class="badge-success">available</span> |
| CTAs | Elegant call-to-action sections | <span class="badge-success">available</span> |
| Code Blocks | Syntax highlighting | <span class="badge-success">available</span> |
| Blockquotes | Styled quote sections | <span class="badge-success">available</span> |

## Adding Call-to-Action Sections

To add a call-to-action (CTA) section to your article, use the following format:

```markdown
<div class="article-cta">
  <h3 class="article-cta-title">Ready to Start Your Apprenticeship Journey?</h3>
  <p class="article-cta-description">Join thousands of apprentices who have found their dream career path with ApprenticeWatch.</p>
  <a href="/register" class="article-cta-button">Get Started Today</a>
</div>
```

Which will render as a beautiful CTA section with an elegant animation on hover:

<div class="article-cta">
  <h3 class="article-cta-title">Ready to Start Your Apprenticeship Journey?</h3>
  <p class="article-cta-description">Join thousands of apprentices who have found their dream career path with ApprenticeWatch.</p>
  <a href="/register" class="article-cta-button">Get Started Today</a>
</div>

## Blockquote Styling

Blockquotes are styled with a subtle orange accent:

> "The best way to predict the future is to create it." 
> 
> — Abraham Lincoln

## Keywords Section

At the end of each article, a keywords section will automatically be generated based on the tags defined in the article's frontmatter. These keywords will appear as badges, making it easy for readers to identify related topics.

## Conclusion

Using these formatting features will help you create engaging and visually appealing articles that provide value to your readers. Experiment with different combinations to find what works best for your content.

<div class="article-cta">
  <h3 class="article-cta-title">Want to See More Examples?</h3>
  <p class="article-cta-description">Check out our collection of sample articles to see these features in action.</p>
  <a href="/resources" class="article-cta-button">Browse Resources</a>
</div>

For more details check out the [full documentation](/resources/markdown-guide).