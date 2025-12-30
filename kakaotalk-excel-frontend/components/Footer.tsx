export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 bg-white py-8">
      <div className="container mx-auto max-w-[1200px] px-4 text-center text-sm text-gray-600">
        <p>© {currentYear} Talk to Excel. All rights reserved.</p>
      </div>
    </footer>
  );
}
