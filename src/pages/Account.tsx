import React from 'react';
import { User, Settings, Bell, Shield, CreditCard } from 'lucide-react';

const Account = () => {
  const user = {
    name: "John McManaman",
    email: "john@example.com",
    subscription: "Premium",
    joinDate: "January 15, 2024"
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Account Settings</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <User className="w-12 h-12 text-blue-500 mr-4" />
                <div>
                  <h3 className="text-xl font-semibold">{user.name}</h3>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={user.name}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={user.email}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <button className="text-blue-600 hover:text-blue-800">
                    Change Password
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 bg-white rounded-lg shadow-lg">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-medium">{user.subscription} Plan</p>
                  <p className="text-sm text-gray-500">Renewed monthly</p>
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  Upgrade Plan
                </button>
              </div>
              <div className="border-t pt-4">
                <p className="text-sm text-gray-500">Member since {user.joinDate}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Quick Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="w-5 h-5 text-gray-400 mr-2" />
                  <span>Email Notifications</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-5 h-5 text-gray-400 mr-2" />
                  <span>Two-Factor Auth</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Payment Methods</h3>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CreditCard className="w-5 h-5 text-gray-400 mr-2" />
                <span>•••• 4242</span>
              </div>
              <button className="text-blue-600 hover:text-blue-800">Edit</button>
            </div>
            <button className="w-full bg-gray-100 text-gray-600 px-4 py-2 rounded hover:bg-gray-200">
              Add Payment Method
            </button>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
            <button className="w-full bg-red-50 text-red-600 px-4 py-2 rounded hover:bg-red-100">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;