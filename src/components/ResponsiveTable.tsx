import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface ResponsiveTableProps {
  headers: string[];
  rows: ReactNode[][];
  mobileCard?: (row: ReactNode[], index: number) => ReactNode;
}

export const ResponsiveTable = ({ headers, rows, mobileCard }: ResponsiveTableProps) => {
  return (
    <>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              {headers.map((header, index) => (
                <th key={index} className="text-left py-3 px-4 font-medium text-sm">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-b hover:bg-accent/50 transition-colors">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="py-3 px-4 text-sm">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {rows.map((row, index) => (
          <Card key={index} className="touch-target">
            <CardContent className="p-4">
              {mobileCard ? mobileCard(row, index) : (
                <div className="space-y-2">
                  {row.map((cell, cellIndex) => (
                    <div key={cellIndex} className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        {headers[cellIndex]}:
                      </span>
                      <span className="text-sm">{cell}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
};
