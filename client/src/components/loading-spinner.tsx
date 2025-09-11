export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="relative">
        <div className="w-12 h-12 border-4 border-bitcoin/20 rounded-full animate-spin"></div>
        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-bitcoin rounded-full animate-spin"></div>
      </div>
      <div className="ml-4 text-lg text-gray-600">
        Loading...
      </div>
    </div>
  );
}