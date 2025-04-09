// PDFViewer.js
import React, { useState, useRef, useEffect } from 'react';

const PDFViewer = () => {
  const defaultPdfPath = '/assets/book/gwc_book.pdf'; // Your local PDF path
  const [pdfUrl] = useState(defaultPdfPath);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pdfDocument, setPdfDocument] = useState(null);
  const [canvasRefs, setCanvasRefs] = useState([]);
  const containerRef = useRef(null);

  // Load PDF.js
  useEffect(() => {
    const pdfJsScript = document.createElement('script');
    pdfJsScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    pdfJsScript.async = true;

    pdfJsScript.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
      loadPDF(pdfUrl);
    };

    document.body.appendChild(pdfJsScript);
    return () => {
      document.body.removeChild(pdfJsScript);
    };
  }, [pdfUrl]);

  // Disable right-click + Print/Save keyboard shortcuts
  useEffect(() => {
    const preventDefaultAction = (e) => {
      e.preventDefault();
      return false;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('contextmenu', preventDefaultAction);
    }

    const preventKeyboardShortcuts = (e) => {
      if (e.ctrlKey && ['p', 's'].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener('keydown', preventKeyboardShortcuts);

    return () => {
      if (container) {
        container.removeEventListener('contextmenu', preventDefaultAction);
      }
      document.removeEventListener('keydown', preventKeyboardShortcuts);
    };
  }, []);

  // Inject print prevention styles
  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      @media print {
        body * {
          display: none !important;
        }
        body::after {
          content: "Printing is disabled";
          display: block;
          text-align: center;
          font-size: 24px;
          margin-top: 40vh;
        }
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  // Render PDF after loading
  useEffect(() => {
    if (pdfDocument && canvasRefs.length === pdfDocument.numPages) {
      renderPDF();
    }
  }, [pdfDocument, canvasRefs]);

  const loadPDF = async (url) => {
    if (!window.pdfjsLib) {
      setError('PDF.js library not loaded yet.');
      return;
    }

    try {
      setIsLoading(true);
      const loadingTask = window.pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      setPdfDocument(pdf);

      // Set canvasRefs for each page
      const refs = Array.from({ length: pdf.numPages }, () => React.createRef());
      setCanvasRefs(refs);

      setError('');
    } catch (err) {
      console.error('Error loading PDF:', err);
      setError('Failed to load PDF.');
      setPdfDocument(null);
    } finally {
      setIsLoading(false);
    }
  };

  const renderPDF = async () => {
    if (!pdfDocument || canvasRefs.length === 0) return;

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const canvasRef = canvasRefs[pageNum - 1];
      const canvas = canvasRef?.current;

      if (!canvas) {
        console.warn(`Canvas not found for page ${pageNum}`);
        continue;
      }

      const context = canvas.getContext('2d');
      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({
        canvasContext: context,
        viewport
      }).promise;
    }
  };

  const styles = {
    pdfViewer: {
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      width: '100%',
      fontFamily: 'Arial, sans-serif'
    },
    error: {
      color: 'red',
      padding: '10px',
      textAlign: 'center'
    },
    loading: {
      padding: '20px',
      textAlign: 'center'
    },
    canvasContainer: {
      flex: 1,
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '10px',
      backgroundColor: '#f4f4f4'
    },
    canvas: {
      margin: '10px 0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      backgroundColor: 'white',
      maxWidth: '100%',
      width: 'auto',
    },
    emptyState: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
      color: '#666',
      fontSize: '16px'
    }
  };

  return (
    <div style={styles.pdfViewer}>
      {error && <div style={styles.error}>{error}</div>}
      {isLoading && <div style={styles.loading}>Loading PDF...</div>}

      <div ref={containerRef} style={styles.canvasContainer}>
        {pdfDocument ? (
          canvasRefs.map((ref, index) => (
            <canvas key={index} ref={ref} style={styles.canvas} />
          ))
        ) : (
          !isLoading && !error && (
            <div style={styles.emptyState}>No PDF loaded.</div>
          )
        )}
      </div>
    </div>
  );
};

export default PDFViewer;
