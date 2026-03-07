# @webspecs/image-ascii

Convert images to ANSI art for terminal display using half-block characters.

## Features

- Fetches images from URLs with timeout and error handling
- Renders images as ANSI art using Unicode half-block characters (`▄`)
- 24-bit RGB color support via chalk
- Aspect ratio preservation for og:image and other formats
- Discriminated union results for type-safe error handling
- No native dependencies (uses jimp for image processing)

## Installation

```bash
npm install @webspecs/image-ascii
# or
bun add @webspecs/image-ascii
```

## Usage

### Fetch and render an image

```typescript
import { fetchAndRenderAscii } from '@webspecs/image-ascii'

const result = await fetchAndRenderAscii('https://example.com/og-image.jpg', {
  width: 48, // Character width (default: 48)
})

if (result.ok) {
  console.log(result.lines.join('\n'))
} else {
  console.error(result.error.message)
}
```

### Separate fetch and render

```typescript
import { fetchImage, renderAscii } from '@webspecs/image-ascii'

// Fetch the image
const fetchResult = await fetchImage('https://example.com/image.png', {
  timeout: 5000,
  headers: { Authorization: 'Bearer token' },
})

if (!fetchResult.ok) {
  console.error('Fetch failed:', fetchResult.error.message)
  process.exit(1)
}

// Render to ASCII
const renderResult = await renderAscii(fetchResult.buffer, {
  width: 48,
  charAspectRatio: 0.5,
})

if (renderResult.ok) {
  console.log(renderResult.lines.join('\n'))
}
```

## API

### `fetchAndRenderAscii(url, options?)`

Convenience function that fetches and renders an image in one call.

**Options:**

- `timeout?: number` - Request timeout in ms (default: 5000)
- `headers?: Record<string, string>` - Additional request headers
- `width?: number` - Output width in characters (default: 48)
- `height?: number` - Output height in characters (auto-calculated if omitted)
- `charAspectRatio?: number` - Character aspect ratio (default: 0.5)

**Returns:** `Promise<AsciiImageResult>`

### `fetchImage(url, options?)`

Fetches an image from a URL with error handling.

**Options:**

- `timeout?: number` - Request timeout in ms (default: 5000)
- `headers?: Record<string, string>` - Additional request headers

**Returns:** `Promise<ImageFetchResult>`

### `renderAscii(buffer, options?)`

Renders an image buffer as ANSI art.

**Options:**

- `width?: number` - Output width in characters (default: 48)
- `height?: number` - Output height in characters (auto-calculated if omitted)
- `charAspectRatio?: number` - Character aspect ratio (default: 0.5)

**Returns:** `Promise<ImageRenderResult>`

## How it works

The renderer uses Unicode lower half-block characters (`▄`) with 24-bit ANSI colors:

- Each character cell represents 2 vertical pixels
- Background color = top pixel
- Foreground color = bottom pixel

This technique doubles the vertical resolution compared to full-block rendering.

### og:image rendering

Standard og:image dimensions are 1200×630 (1.91:1 aspect ratio). With default settings:

- Width: 48 characters
- Height: ~12-13 characters (auto-calculated)

## Supported formats

- JPEG
- PNG
- GIF
- WebP
- BMP
- TIFF

## Error handling

All functions return discriminated union results for type-safe error handling:

```typescript
const result = await fetchImage(url)

if (result.ok) {
  // result.buffer and result.contentType are available
} else {
  // result.error.type and result.error.message are available
  switch (result.error.type) {
    case 'TIMEOUT':
      // Handle timeout
      break
    case 'HTTP_ERROR':
      // result.error.statusCode is available
      break
    // ... etc
  }
}
```

### Fetch error types

- `TIMEOUT` - Request timed out
- `NETWORK_ERROR` - Network failure
- `HTTP_ERROR` - HTTP error response (4xx, 5xx)
- `INVALID_URL` - Invalid URL format
- `UNSUPPORTED_FORMAT` - Content type not supported

### Render error types

- `DECODE_ERROR` - Failed to decode image
- `INVALID_DIMENSIONS` - Invalid width/height specified
- `UNSUPPORTED_FORMAT` - Image format not supported

## License

MIT
