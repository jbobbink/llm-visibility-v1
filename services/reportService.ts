import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type ReportRow = Database['public']['Tables']['reports']['Row'];
type ReportInsert = Database['public']['Tables']['reports']['Insert'];

export interface SavedReport {
  id: string;
  clientName: string;
  htmlContent: string;
  shareToken: string;
  createdAt: string;
  updatedAt: string;
  userId?: string | null;
}

// Convert database row to our SavedReport interface
function mapReportRow(row: ReportRow): SavedReport {
  return {
    id: row.id,
    clientName: row.client_name,
    htmlContent: row.html_content,
    shareToken: row.share_token,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    userId: row.user_id,
  };
}

export async function saveReport(clientName: string, htmlContent: string): Promise<SavedReport> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const reportData: ReportInsert = {
    client_name: clientName,
    html_content: htmlContent,
    user_id: user?.id || null,
  };

  const { data, error } = await supabase
    .from('reports')
    .insert(reportData)
    .select()
    .single();

  if (error) {
    console.error('Error saving report:', error);
    throw new Error(`Failed to save report: ${error.message}`);
  }

  return mapReportRow(data);
}

export async function getUserReports(): Promise<SavedReport[]> {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('user_id', user?.id || null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    throw new Error(`Failed to fetch reports: ${error.message}`);
  }

  return data.map(mapReportRow);
}

export async function getReportByShareToken(shareToken: string): Promise<SavedReport | null> {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('share_token', shareToken)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching shared report:', error);
    throw new Error(`Failed to fetch shared report: ${error.message}`);
  }

  return mapReportRow(data);
}

export async function deleteReport(reportId: string): Promise<void> {
  const { error } = await supabase
    .from('reports')
    .delete()
    .eq('id', reportId);

  if (error) {
    console.error('Error deleting report:', error);
    throw new Error(`Failed to delete report: ${error.message}`);
  }
}

export function generateShareUrl(shareToken: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/shared/${shareToken}`;
}