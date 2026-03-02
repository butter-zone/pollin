import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { Screen, CanvasObject, ComponentObject } from '@/types/canvas';
import type { FlowLink } from '@/types/canvas';
import { renderTreeToHTML } from '@/services/component-renderer';

// ── Helpers ─────────────────────────────────────────────

/** Objects whose centre falls within a screen's bounds. */
function objectsInScreen(screen: Screen, objects: CanvasObject[]): CanvasObject[] {
  const sx = screen.x;
  const sy = screen.y;
  const sw = screen.width;
  const sh = screen.height;

  return objects.filter((obj) => {
    // Centre point of the object
    let cx: number;
    let cy: number;
    if (obj.kind === 'image' || obj.kind === 'component' || obj.kind === 'ellipse') {
      cx = obj.x;
      cy = obj.y;
    } else {
      cx = obj.x;
      cy = obj.y;
    }
    return cx >= sx && cx <= sx + sw && cy >= sy && cy <= sy + sh;
  });
}

/** Build an iframe-friendly HTML document from screen contents. */
function buildScreenHTML(
  screen: Screen,
  objects: CanvasObject[],
  flowLinks: FlowLink[],
): string {
  const screenObjects = objectsInScreen(screen, objects);

  // Gather component trees from ComponentObjects
  const compObjs = screenObjects.filter(
    (o) => o.kind === 'component' && (o as ComponentObject).tree,
  ) as ComponentObject[];

  // If there's exactly one component, render its full tree HTML directly
  if (compObjs.length === 1) {
    const tree = compObjs[0].tree;
    const html = renderTreeToHTML(tree);
    // Inject click handler script for flow links
    const linksForScreen = flowLinks.filter(
      (l) => l.sourceScreenId === screen.id,
    );
    if (linksForScreen.length === 0) return html;

    // Build a small script that listens for clicks on elements whose
    // data-node-id matches a flow link source
    const linkMap = JSON.stringify(
      linksForScreen.map((l) => ({
        sourceNodeId: l.sourceNodeId,
        targetScreenId: l.targetScreenId,
        transition: l.transition,
      })),
    );

    const script = `
<script>
  const links = ${linkMap};
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-node-id]');
    if (!el) return;
    const nodeId = el.getAttribute('data-node-id');
    const link = links.find(l => l.sourceNodeId === nodeId);
    if (link) {
      e.preventDefault();
      e.stopPropagation();
      window.parent.postMessage({
        type: 'pollin:navigate',
        targetScreenId: link.targetScreenId,
        transition: link.transition,
      }, '*');
    }
  });
<\/script>`;

    return html.replace('</body>', `${script}</body>`);
  }

  // Multiple or no components — render a placeholder
  const bg = screen.backgroundColor || '#ffffff';
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { width: ${screen.width}px; height: ${screen.height}px; overflow: hidden; background: ${bg}; }
  body { display: flex; align-items: center; justify-content: center; font-family: system-ui; color: #666; }
</style>
</head>
<body>
  <p>${screenObjects.length} object${screenObjects.length !== 1 ? 's' : ''} on ${screen.name}</p>
</body>
</html>`;
}

// ── Component ───────────────────────────────────────────

interface PrototypePlayerProps {
  screens: Screen[];
  objects: CanvasObject[];
  flowLinks: FlowLink[];
  startScreenId: string;
  onClose: () => void;
}

export function PrototypePlayer({
  screens,
  objects,
  flowLinks,
  startScreenId,
  onClose,
}: PrototypePlayerProps) {
  const [currentScreenId, setCurrentScreenId] = useState(startScreenId);
  const [history, setHistory] = useState<string[]>([startScreenId]);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [transition, setTransition] = useState<'none' | 'fade' | 'slide-left' | 'slide-up' | 'push'>('none');
  const [transitioning, setTransitioning] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentScreen = useMemo(
    () => screens.find((s) => s.id === currentScreenId),
    [screens, currentScreenId],
  );

  const screenHTML = useMemo(() => {
    if (!currentScreen) return '';
    return buildScreenHTML(currentScreen, objects, flowLinks);
  }, [currentScreen, objects, flowLinks]);

  // Write content to the iframe
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !screenHTML) return;
    const doc = iframe.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(screenHTML);
    doc.close();
  }, [screenHTML]);

  // Listen for navigation messages from the iframe
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type !== 'pollin:navigate') return;
      navigateTo(e.data.targetScreenId, e.data.transition || 'fade');
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);  // eslint-disable-line react-hooks/exhaustive-deps

  const navigateTo = useCallback(
    (screenId: string, trans: typeof transition = 'fade') => {
      if (screenId === currentScreenId) return;
      if (!screens.find((s) => s.id === screenId)) return;

      setTransition(trans);
      setTransitioning(true);

      // Small delay for transition effect
      setTimeout(() => {
        setCurrentScreenId(screenId);
        setHistory((prev) => [...prev.slice(0, historyIdx + 1), screenId]);
        setHistoryIdx((prev) => prev + 1);
        // End transition after content loads
        setTimeout(() => setTransitioning(false), 150);
      }, trans === 'none' ? 0 : 120);
    },
    [currentScreenId, screens, historyIdx],
  );

  const canGoBack = historyIdx > 0;
  const canGoForward = historyIdx < history.length - 1;

  const goBack = useCallback(() => {
    if (!canGoBack) return;
    const prevIdx = historyIdx - 1;
    setHistoryIdx(prevIdx);
    setCurrentScreenId(history[prevIdx]);
  }, [canGoBack, historyIdx, history]);

  const goForward = useCallback(() => {
    if (!canGoForward) return;
    const nextIdx = historyIdx + 1;
    setHistoryIdx(nextIdx);
    setCurrentScreenId(history[nextIdx]);
  }, [canGoForward, historyIdx, history]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!currentScreen) return null;

  const transClass = transitioning
    ? `pp-frame--${transition}`
    : '';

  return (
    <div className="pp-overlay">
      {/* Top toolbar */}
      <div className="pp-toolbar">
        <div className="pp-toolbar-left">
          <button
            className="pp-nav-btn"
            onClick={goBack}
            disabled={!canGoBack}
            title="Back"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            className="pp-nav-btn"
            onClick={goForward}
            disabled={!canGoForward}
            title="Forward"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="pp-toolbar-center">
          <span className="pp-screen-name">{currentScreen.name}</span>
          <span className="pp-screen-dims">
            {currentScreen.width}×{currentScreen.height}
          </span>
        </div>

        <div className="pp-toolbar-right">
          <button className="pp-close-btn" onClick={onClose} title="Close preview (Esc)">
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Device frame */}
      <div className="pp-viewport">
        <div
          className={`pp-device-frame ${transClass}`}
          style={{
            width: currentScreen.width,
            height: currentScreen.height,
          }}
        >
          <iframe
            ref={iframeRef}
            className="pp-iframe"
            sandbox="allow-scripts"
            title={`Preview: ${currentScreen.name}`}
          />
        </div>
      </div>

      {/* Screen list at bottom */}
      {screens.length > 1 && (
        <div className="pp-screen-bar">
          {screens.map((s) => (
            <button
              key={s.id}
              className={`pp-screen-thumb ${s.id === currentScreenId ? 'pp-screen-thumb--active' : ''}`}
              onClick={() => navigateTo(s.id, 'fade')}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
