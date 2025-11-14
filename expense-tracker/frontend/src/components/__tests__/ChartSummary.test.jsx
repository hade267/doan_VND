import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import ChartSummary from '../ChartSummary';

vi.mock('react-chartjs-2', () => ({
  Line: () => <div data-testid="line-chart" />,
  Doughnut: () => <div data-testid="doughnut-chart" />,
  Pie: () => <div data-testid="pie-chart" />,
}));

const buildSummary = () => ({
  totalIncome: 1_000_000,
  totalExpense: 420_000,
  balance: 580_000,
  monthly: [
    { month: '2025-01-01', income: 1_000_000, expense: 500_000 },
    { month: '2025-02-01', income: 1_200_000, expense: 420_000 },
  ],
  categoryBreakdown: [
    {
      category: { name: 'Ăn uống' },
      type: 'expense',
      total: 250_000,
    },
    {
      category: { name: 'Lương' },
      type: 'income',
      total: 1_000_000,
    },
  ],
});

describe('<ChartSummary />', () => {
  it('renders the main KPI cards with formatted numbers', () => {
    render(<ChartSummary summary={buildSummary()} />);

    expect(screen.getByText('Thu nhập')).toBeInTheDocument();
    expect(screen.getByText('Chi tiêu')).toBeInTheDocument();
    expect(screen.getByText(/1\.000\.000/)).toBeInTheDocument();
    expect(screen.getByText(/420\.000/)).toBeInTheDocument();
    expect(screen.getByText(/580\.000/)).toBeInTheDocument();
    expect(screen.getByText('Tỷ lệ thu vs chi')).toBeInTheDocument();
    expect(screen.getAllByTestId('pie-chart')).toHaveLength(1);
  });

  it('returns null when no summary is provided', () => {
    const { container } = render(<ChartSummary summary={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
