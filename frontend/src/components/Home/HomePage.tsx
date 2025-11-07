import { Zap, Users, Palette, TrendingUp } from 'lucide-react';

interface HomePageProps {
  onCreateMeme: () => void;
}

export default function HomePage({ onCreateMeme }: HomePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Create Amazing Memes in Minutes
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The ultimate meme creation platform. Design, customize, and share your memes with powerful editing tools and an intuitive interface.
          </p>
          <button
            onClick={onCreateMeme}
            className="inline-flex items-center space-x-3 px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
          >
            <Palette className="w-6 h-6" />
            <span>Start Creating</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <FeatureCard
            icon={<Zap className="w-8 h-8 text-yellow-600" />}
            title="Lightning Fast"
            description="Create memes in seconds with our intuitive drag-and-drop interface"
          />
          <FeatureCard
            icon={<Palette className="w-8 h-8 text-blue-600" />}
            title="Powerful Tools"
            description="Text, images, shapes, and more. Everything you need to create viral content"
          />
          <FeatureCard
            icon={<Users className="w-8 h-8 text-green-600" />}
            title="Share Instantly"
            description="Export and share your memes across all social media platforms"
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8 text-red-600" />}
            title="Template Library"
            description="Access thousands of templates or upload your own creations"
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Go Viral?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of creators making incredible memes every day
          </p>
          <div className="flex justify-center space-x-4">
            <button
              onClick={onCreateMeme}
              className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Create Your First Meme
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
