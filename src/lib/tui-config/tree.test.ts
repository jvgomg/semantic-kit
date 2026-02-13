/**
 * Unit tests for TUI config tree building utilities.
 */
import { describe, test, expect } from 'bun:test'
import {
  buildConfigTree,
  flattenConfigTree,
  countConfigUrls,
  getAllConfigUrls,
} from './tree.js'
import type { TuiConfig } from './schema.js'

describe('buildConfigTree', () => {
  test('builds tree from flat URLs', () => {
    const config: TuiConfig = {
      urls: [
        { url: 'https://example.com' },
        { url: 'https://example.org', title: 'Another Site' },
      ],
    }

    const tree = buildConfigTree(config)

    expect(tree.length).toBe(2)
    expect(tree[0].type).toBe('url')
    expect(tree[1].type).toBe('url')
    if (tree[0].type === 'url') {
      expect(tree[0].url).toBe('https://example.com')
    }
    if (tree[1].type === 'url') {
      expect(tree[1].label).toBe('Another Site')
    }
  })

  test('builds tree with groups', () => {
    const config: TuiConfig = {
      urls: [
        {
          group: 'Blog',
          urls: [
            { url: 'https://example.com/blog/1' },
            { url: 'https://example.com/blog/2' },
          ],
        },
      ],
    }

    const tree = buildConfigTree(config)

    expect(tree.length).toBe(1)
    expect(tree[0].type).toBe('group')
    if (tree[0].type === 'group') {
      expect(tree[0].label).toBe('Blog')
      expect(tree[0].children.length).toBe(2)
      expect(tree[0].urlCount).toBe(2)
    }
  })

  test('builds mixed tree', () => {
    const config: TuiConfig = {
      urls: [
        { url: 'https://example.com', title: 'Home' },
        {
          group: 'Blog',
          urls: [{ url: 'https://example.com/blog/1' }],
        },
        { url: 'https://example.org' },
      ],
    }

    const tree = buildConfigTree(config)

    expect(tree.length).toBe(3)
    expect(tree[0].type).toBe('url')
    expect(tree[1].type).toBe('group')
    expect(tree[2].type).toBe('url')
  })

  test('extracts display URL from path', () => {
    const config: TuiConfig = {
      urls: [{ url: 'https://example.com/some/path/page' }],
    }

    const tree = buildConfigTree(config)

    expect(tree[0].type).toBe('url')
    if (tree[0].type === 'url') {
      expect(tree[0].label).toBe('/some/path/page')
    }
  })

  test('uses hostname for root path', () => {
    const config: TuiConfig = {
      urls: [{ url: 'https://example.com/' }],
    }

    const tree = buildConfigTree(config)

    expect(tree[0].type).toBe('url')
    if (tree[0].type === 'url') {
      expect(tree[0].label).toBe('example.com')
    }
  })
})

describe('flattenConfigTree', () => {
  test('flattens tree without expansion', () => {
    const config: TuiConfig = {
      urls: [
        { url: 'https://example.com' },
        {
          group: 'Blog',
          urls: [
            { url: 'https://example.com/blog/1' },
            { url: 'https://example.com/blog/2' },
          ],
        },
      ],
    }

    const tree = buildConfigTree(config)
    const flat = flattenConfigTree(tree, new Set())

    // Without expansion, group children are not visible
    expect(flat.length).toBe(2)
  })

  test('flattens tree with group expanded', () => {
    const config: TuiConfig = {
      urls: [
        {
          group: 'Blog',
          urls: [
            { url: 'https://example.com/blog/1' },
            { url: 'https://example.com/blog/2' },
          ],
        },
      ],
    }

    const tree = buildConfigTree(config)
    const groupId = tree[0].id
    const flat = flattenConfigTree(tree, new Set([groupId]))

    // With expansion, group + 2 children are visible
    expect(flat.length).toBe(3)
    expect(flat[0].node.type).toBe('group')
    expect(flat[1].node.type).toBe('url')
    expect(flat[1].parentGroup).toBe('Blog')
    expect(flat[2].node.type).toBe('url')
  })
})

describe('countConfigUrls', () => {
  test('counts flat URLs', () => {
    const config: TuiConfig = {
      urls: [
        { url: 'https://example.com' },
        { url: 'https://example.org' },
      ],
    }

    expect(countConfigUrls(config)).toBe(2)
  })

  test('counts URLs in groups', () => {
    const config: TuiConfig = {
      urls: [
        {
          group: 'Blog',
          urls: [
            { url: 'https://example.com/blog/1' },
            { url: 'https://example.com/blog/2' },
          ],
        },
      ],
    }

    expect(countConfigUrls(config)).toBe(2)
  })

  test('counts mixed URLs', () => {
    const config: TuiConfig = {
      urls: [
        { url: 'https://example.com' },
        {
          group: 'Blog',
          urls: [
            { url: 'https://example.com/blog/1' },
            { url: 'https://example.com/blog/2' },
          ],
        },
        { url: 'https://example.org' },
      ],
    }

    expect(countConfigUrls(config)).toBe(4)
  })
})

describe('getAllConfigUrls', () => {
  test('gets all flat URLs', () => {
    const config: TuiConfig = {
      urls: [
        { url: 'https://example.com', title: 'Home' },
        { url: 'https://example.org' },
      ],
    }

    const urls = getAllConfigUrls(config)

    expect(urls.length).toBe(2)
    expect(urls[0].url).toBe('https://example.com')
    expect(urls[0].title).toBe('Home')
  })

  test('gets URLs from groups', () => {
    const config: TuiConfig = {
      urls: [
        {
          group: 'Blog',
          urls: [
            { url: 'https://example.com/blog/1', title: 'Post 1' },
            { url: 'https://example.com/blog/2' },
          ],
        },
      ],
    }

    const urls = getAllConfigUrls(config)

    expect(urls.length).toBe(2)
    expect(urls[0].title).toBe('Post 1')
  })

  test('gets URLs in order (flat, then grouped)', () => {
    const config: TuiConfig = {
      urls: [
        { url: 'https://example.com/first' },
        {
          group: 'Blog',
          urls: [{ url: 'https://example.com/blog/1' }],
        },
        { url: 'https://example.com/last' },
      ],
    }

    const urls = getAllConfigUrls(config)

    expect(urls.length).toBe(3)
    expect(urls[0].url).toBe('https://example.com/first')
    expect(urls[1].url).toBe('https://example.com/blog/1')
    expect(urls[2].url).toBe('https://example.com/last')
  })
})
