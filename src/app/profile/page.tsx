export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">User Profile</h2>
          <div className="grid gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1">John Doe</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1">john@example.com</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <p className="mt-1">Freelancer</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}