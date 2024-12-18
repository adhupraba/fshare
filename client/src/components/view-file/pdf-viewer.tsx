import { useEffect, useRef, useState } from "react";
import type { PDFDocumentProxy } from "pdfjs-dist";

interface IPDFViewerProps {
  pdfUrl: string;
}

const PdfViewer: React.FC<IPDFViewerProps> = ({ pdfUrl }) => {
  const [pdfDocument, setPdfDocument] = useState<PDFDocumentProxy | null>(null);
  const [loadedPages, setLoadedPages] = useState(new Set()); // Tracks which pages are loaded
  const containerRef = useRef<HTMLDivElement>(null);

  const loadPDFJS = async () => {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.6.347/pdf.worker.min.js`; // Worker setup
    return pdfjs;
  };

  useEffect(() => {
    // Load the PDF document
    const loadPdf = async () => {
      try {
        const { getDocument } = await loadPDFJS();

        const pdf = await getDocument(pdfUrl).promise;
        setPdfDocument(pdf); // Save the PDF document for rendering
      } catch (error) {
        console.error("Error loading PDF:", error);
      }
    };

    loadPdf();
  }, [pdfUrl]);

  useEffect(() => {
    if (!pdfDocument || !containerRef.current) return;

    // Observe pages for lazy loading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const pageNumber = parseInt((entry.target as any).dataset.pageNumber, 10);
          if (entry.isIntersecting && !loadedPages.has(pageNumber)) {
            renderPage(pageNumber);
          }
        });
      },
      { root: containerRef.current, rootMargin: "0px", threshold: 0.1 }
    );

    const pageElements = containerRef.current?.querySelectorAll(".pdf-page") as NodeListOf<HTMLCanvasElement>;
    pageElements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [pdfDocument, loadedPages]);

  // Render a single page
  const renderPage = async (pageNumber: number) => {
    if (!pdfDocument) return;

    const page = await pdfDocument.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1.3 });

    const canvas = document.querySelector(`#page-${pageNumber}`) as HTMLCanvasElement;
    const context = canvas?.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    await page.render({ canvasContext: context!, viewport }).promise;

    // Mark the page as loaded
    setLoadedPages((prev) => new Set(prev).add(pageNumber));
  };

  // Generate placeholders for all pages
  const placeholders = pdfDocument
    ? Array.from({ length: pdfDocument.numPages }, (_, i) => i + 1).map((pageNumber) => (
        <canvas
          key={pageNumber}
          id={`page-${pageNumber}`}
          data-page-number={pageNumber}
          className="pdf-page my-4 border border-gray-400 border-solid w-full"
          onContextMenu={(e) => e.preventDefault()}
        />
      ))
    : null;

  return <div ref={containerRef}>{placeholders}</div>;
};

export default PdfViewer;
