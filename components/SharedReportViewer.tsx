import React, { useEffect, useState } from 'react';
import { getReportByShareToken } from '../services/reportService';
import type { SavedReport } from '../services/reportService';

interface SharedReportViewerProps {
  shareToken: string;
}

export const SharedReportViewer: React.FC<SharedReportViewerProps> = ({ shareToken }) => {
  const [report, setReport] = useState<SavedReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        const fetchedReport = await getReportByShareToken(shareToken);
        if (!fetchedReport) {
          setError('Report not found or the sharing link is invalid.');
        } else {
          setReport(fetchedReport);
        }
      } catch (err) {
        console.error('Error fetching shared report:', err);
        setError(err instanceof Error ? err.message : 'Failed to load the shared report.');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [shareToken]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading shared report...</p>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-900/50 border border-red-700 text-red-300 px-6 py-4 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Report Not Found</h2>
            <p>{error || 'The shared report could not be found.'}</p>
          </div>
          <button 
            onClick={() => window.location.href = '/'}
            className="mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
          >
            Go to Main App
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="bg-gray-800 border-b border-gray-700 p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-green-400">Shared Report: {report.clientName}</h1>
          <p className="text-gray-400 text-sm">Created on {new Date(report.createdAt).toLocaleDateString()}</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Create Your Own Report
        </button>
      </div>
      <iframe
        srcDoc={report.htmlContent}
        title={`Shared Report: ${report.clientName}`}
        className="w-full h-screen border-0"
        sandbox="allow-scripts allow-same-origin"
        style={{ height: 'calc(100vh - 80px)' }}
      />
    </div>
  );
};