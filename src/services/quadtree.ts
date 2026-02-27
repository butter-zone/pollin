import type { Point, Rect } from '@/types/canvas';

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/**
 * Returns `true` when rectangles **a** and **b** overlap (share at least one
 * point).  Touching edges count as overlapping.
 */
export function rectsOverlap(a: Rect, b: Rect): boolean {
  return (
    a.x <= b.x + b.width &&
    a.x + a.width >= b.x &&
    a.y <= b.y + b.height &&
    a.y + a.height >= b.y
  );
}

/**
 * Returns `true` when the given **point** lies inside (or on the border of)
 * the rectangle.
 */
export function rectContainsPoint(rect: Rect, point: Point): boolean {
  return (
    point.x >= rect.x &&
    point.x <= rect.x + rect.width &&
    point.y >= rect.y &&
    point.y <= rect.y + rect.height
  );
}

// ---------------------------------------------------------------------------
// Internal node
// ---------------------------------------------------------------------------

/** Maximum items a leaf node may hold before it subdivides. */
const MAX_ITEMS = 8;

/** Maximum tree depth (root = 0). */
const MAX_DEPTH = 8;

/**
 * An item stored in the tree – just an ID paired with its axis-aligned
 * bounding rect.
 */
interface Entry {
  id: string;
  bounds: Rect;
}

/**
 * Internal quadtree node.  Each node covers a rectangular region of 2-D space.
 * Leaf nodes store entries directly; interior nodes delegate to four children
 * (NW, NE, SW, SE).
 */
class QTNode {
  /** The region this node covers. */
  readonly boundary: Rect;

  /** Current depth (root = 0). */
  readonly depth: number;

  /** Entries stored in this leaf (empty for interior nodes). */
  entries: Entry[] = [];

  /** Child quadrants – `null` while this node is a leaf. */
  children: [QTNode, QTNode, QTNode, QTNode] | null = null;

  constructor(boundary: Rect, depth: number) {
    this.boundary = boundary;
    this.depth = depth;
  }

  // -----------------------------------------------------------------------
  // Subdivision
  // -----------------------------------------------------------------------

  /**
   * Split this leaf into four children and redistribute its entries.
   */
  private subdivide(): void {
    const { x, y, width, height } = this.boundary;
    const hw = width / 2;
    const hh = height / 2;
    const d = this.depth + 1;

    this.children = [
      new QTNode({ x, y, width: hw, height: hh }, d),               // NW
      new QTNode({ x: x + hw, y, width: hw, height: hh }, d),       // NE
      new QTNode({ x, y: y + hh, width: hw, height: hh }, d),       // SW
      new QTNode({ x: x + hw, y: y + hh, width: hw, height: hh }, d), // SE
    ];

    // Re-insert existing entries into children.
    for (const entry of this.entries) {
      this.insertIntoChildren(entry);
    }
    this.entries = [];
  }

  /**
   * Insert an entry into whichever children overlap its bounds.  An item
   * that spans a split boundary will be stored in multiple children.
   */
  private insertIntoChildren(entry: Entry): void {
    for (const child of this.children!) {
      if (rectsOverlap(child.boundary, entry.bounds)) {
        child.insert(entry);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Public operations
  // -----------------------------------------------------------------------

  /**
   * Insert an entry into this subtree.
   */
  insert(entry: Entry): void {
    // Ignore entries that don't overlap this node's region at all.
    if (!rectsOverlap(this.boundary, entry.bounds)) return;

    if (this.children) {
      // Interior node – delegate.
      this.insertIntoChildren(entry);
      return;
    }

    // Leaf node – store directly.
    this.entries.push(entry);

    // Subdivide when we exceed the capacity *and* haven't hit max depth.
    if (this.entries.length > MAX_ITEMS && this.depth < MAX_DEPTH) {
      this.subdivide();
    }
  }

  /**
   * Remove every occurrence of the given ID from this subtree.
   * Returns `true` if at least one entry was removed.
   */
  remove(id: string): boolean {
    if (this.children) {
      let removed = false;
      for (const child of this.children) {
        if (child.remove(id)) removed = true;
      }

      // Collapse children back into a leaf when they collectively hold
      // few enough items.
      if (removed) {
        this.tryCollapse();
      }
      return removed;
    }

    const before = this.entries.length;
    this.entries = this.entries.filter((e) => e.id !== id);
    return this.entries.length < before;
  }

  /**
   * If all four children are leaves and their combined entry count fits in
   * a single leaf, merge them back.
   */
  private tryCollapse(): void {
    if (!this.children) return;

    for (const child of this.children) {
      if (child.children) return; // still has grandchildren
    }

    // Collect all entries and deduplicate by id (an item may reside in
    // multiple children).
    const seen = new Set<string>();
    const merged: Entry[] = [];
    for (const child of this.children) {
      for (const entry of child.entries) {
        if (!seen.has(entry.id)) {
          seen.add(entry.id);
          merged.push(entry);
        }
      }
    }

    if (merged.length <= MAX_ITEMS) {
      this.children = null;
      this.entries = merged;
    }
  }

  /**
   * Collect the IDs of all entries whose bounds overlap **region**.
   * Results are added to the provided set (to deduplicate across children).
   */
  query(region: Rect, result: Set<string>): void {
    if (!rectsOverlap(this.boundary, region)) return;

    if (this.children) {
      for (const child of this.children) {
        child.query(region, result);
      }
      return;
    }

    for (const entry of this.entries) {
      if (rectsOverlap(entry.bounds, region)) {
        result.add(entry.id);
      }
    }
  }

  /**
   * Collect the IDs of all entries whose bounds contain **point**.
   */
  queryPoint(point: Point, result: Set<string>): void {
    if (!rectContainsPoint(this.boundary, point)) return;

    if (this.children) {
      for (const child of this.children) {
        child.queryPoint(point, result);
      }
      return;
    }

    for (const entry of this.entries) {
      if (rectContainsPoint(entry.bounds, point)) {
        result.add(entry.id);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * A spatial index that partitions 2-D space into a hierarchy of quadrants,
 * enabling fast region and point queries over axis-aligned bounding rects.
 *
 * ```
 * const qt = new QuadTree({ x: 0, y: 0, width: 4000, height: 3000 });
 * qt.insert('obj-1', { x: 10, y: 20, width: 100, height: 50 });
 * const hits = qt.query({ x: 0, y: 0, width: 200, height: 200 });
 * ```
 */
export class QuadTree {
  private root: QTNode;

  /** Lookup from item ID to bounds – keeps `remove` O(1) per ID. */
  private itemMap: Map<string, Rect> = new Map();

  /** The world-space boundary the tree covers. */
  private worldBounds: Rect;

  /**
   * @param worldBounds  The total area managed by this tree.  Items whose
   *                     bounds lie entirely outside this region will still be
   *                     stored (they are clamped to the root) but queries
   *                     outside the region won't find them unless the query
   *                     rect overlaps the root.
   */
  constructor(worldBounds: Rect) {
    this.worldBounds = worldBounds;
    this.root = new QTNode(worldBounds, 0);
  }

  // -----------------------------------------------------------------------
  // Mutation
  // -----------------------------------------------------------------------

  /**
   * Insert a new item or *update* an existing one.  If the item already
   * exists it is removed first so its new bounds are indexed correctly.
   */
  insert(id: string, bounds: Rect): void {
    if (this.itemMap.has(id)) {
      this.remove(id);
    }
    this.itemMap.set(id, bounds);
    this.root.insert({ id, bounds });
  }

  /**
   * Remove an item by its ID.  No-op if the ID is not present.
   */
  remove(id: string): void {
    if (!this.itemMap.has(id)) return;
    this.itemMap.delete(id);
    this.root.remove(id);
  }

  /**
   * Remove every item and reset the tree structure.
   */
  clear(): void {
    this.itemMap.clear();
    this.root = new QTNode(this.worldBounds, 0);
  }

  /**
   * Efficiently replace the entire contents of the tree.  Useful after an
   * undo/redo operation restores a full canvas snapshot.
   *
   * @param items  The complete set of items that should be indexed.
   */
  rebuild(items: Array<{ id: string; bounds: Rect }>): void {
    this.clear();
    for (const { id, bounds } of items) {
      this.itemMap.set(id, bounds);
      this.root.insert({ id, bounds });
    }
  }

  // -----------------------------------------------------------------------
  // Queries
  // -----------------------------------------------------------------------

  /**
   * Return the IDs of every item whose bounding rect overlaps **region**.
   */
  query(region: Rect): string[] {
    const result = new Set<string>();
    this.root.query(region, result);
    return Array.from(result);
  }

  /**
   * Return the IDs of every item whose bounding rect contains **point**.
   */
  queryPoint(point: Point): string[] {
    const result = new Set<string>();
    this.root.queryPoint(point, result);
    return Array.from(result);
  }

  // -----------------------------------------------------------------------
  // Introspection
  // -----------------------------------------------------------------------

  /** Number of items currently stored. */
  get size(): number {
    return this.itemMap.size;
  }

  /** Whether the given item ID is present in the tree. */
  has(id: string): boolean {
    return this.itemMap.has(id);
  }

  /** Retrieve the stored bounds for an item, or `undefined`. */
  getBounds(id: string): Rect | undefined {
    return this.itemMap.get(id);
  }
}
