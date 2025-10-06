import { useSocialStore } from "@/stores/socialStore";

export default function FeedTest() {
  const { posts, challenges, isLoading } = useSocialStore();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feed Test</h1>
      
      <div className="mb-4 p-4 bg-blue-100 rounded">
        <h2 className="font-bold">Store Data:</h2>
        <p>Posts: {posts.length}</p>
        <p>Challenges: {challenges.length}</p>
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Posts:</h2>
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                {post.userName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold">{post.userName}</p>
                <p className="text-sm text-gray-500">{post.type}</p>
              </div>
            </div>
            <p className="text-gray-800 mb-2">{post.content}</p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>📤 {post.shares}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <h2 className="text-xl font-semibold">Challenges:</h2>
        {challenges.map(challenge => (
          <div key={challenge.id} className="bg-white p-4 rounded-lg shadow border">
            <h3 className="font-semibold">{challenge.title}</h3>
            <p className="text-gray-600">{challenge.description}</p>
            <p className="text-sm text-gray-500">Participants: {challenge.participants}</p>
          </div>
        ))}
      </div>

      {posts.length === 0 && challenges.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucune donnée disponible</p>
        </div>
      )}
    </div>
  );
}
