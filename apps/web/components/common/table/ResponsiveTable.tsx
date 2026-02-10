'use client';

export function ResponsiveTable({
  children,
  minWidth = '600px',
}: {
  children: React.ReactNode;
  minWidth?: string;
}) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
      <div style={{ minWidth }}>
        {children}
      </div>
    </div>
  );
}
