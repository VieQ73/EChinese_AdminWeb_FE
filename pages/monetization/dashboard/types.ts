import { Payment } from "../../../types";

export interface ChartDataPoint {
  label: string;
  value: number;
}

export interface DashboardStats {
  revenueThisMonth: number;
  revenueThisYear: number;
  transactions: {
    successful: number;
    pending: number;
    failed: number;
  };
  activeSubscriptions: number;
  pendingRefunds: number;
  chartData: {
    day: ChartDataPoint[];
    week: ChartDataPoint[];
    month: ChartDataPoint[];
  };
}

// For quick search result
export type QuickSearchResult = Payment | null | 'not_found';
