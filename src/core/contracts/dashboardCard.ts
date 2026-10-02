export type DashboardCardData = Readonly<{
  id: string;
  title: string;
  summary: string;
  to: string;
  imageUrl?: string;
  alert?: Readonly<{
    level: 'info' | 'warning' | 'critical';
    text: string;
  }>;
}>;

export type DashboardCardState =
  | { status: 'loading' }
  | { status: 'ready'; card: DashboardCardData }
  | { status: 'error'; message: string };
