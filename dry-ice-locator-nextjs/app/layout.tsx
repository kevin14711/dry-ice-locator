
export const metadata = {
  title: "Dry Ice Locator",
  description: "Find local dry ice suppliers by store type, form, and location.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
