import { useSocialStore } from "@/stores/socialStore";

export default function FeedSimple() {
  const { posts, challenges, friends, isLoading } = useSocialStore();

  console.log('FeedSimple render:', { posts, challenges, friends, isLoading });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Feed Simple</h1>
      
      <div className="mb-4">
        <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        <p>Posts: {posts.length}</p>
        <p>Challenges: {challenges.length}</p>
        <p>Friends: {friends.length}</p>
      </div>

      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div>
                <p className="font-semibold">{post.userName}</p>
                <p className="text-sm text-gray-500">{post.type}</p>
              </div>
            </div>
            <p className="text-gray-800">{post.content}</p>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
              <span>❤️ {post.likes}</span>
              <span>💬 {post.comments}</span>
              <span>📤 {post.shares}</span>
            </div>
          </div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">Aucun post disponible</p>
        </div>
      )}
    </div>
  );
}
