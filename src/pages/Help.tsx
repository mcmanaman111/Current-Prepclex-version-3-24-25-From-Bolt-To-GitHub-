import React from 'react';
import { HelpCircle, Book, MessageCircle, Video } from 'lucide-react';

const Help = () => {
  const faqs = [
    {
      question: "How do I create a custom test?",
      answer: "Navigate to the 'Create Test' page and select your preferred options for number of questions, topics, and time limit."
    },
    {
      question: "Can I review my previous test attempts?",
      answer: "Yes, visit the 'Previous Tests' page to see all your past attempts, scores, and detailed analysis."
    },
    {
      question: "How are my scores calculated?",
      answer: "Scores are calculated based on the number of correct answers divided by the total number of questions, expressed as a percentage."
    }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-800">Help Center</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Book className="w-8 h-8 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">User Guide</h3>
          <p className="text-gray-600 mb-4">Comprehensive guide to using the platform</p>
          <button className="text-blue-600 hover:text-blue-800">Read Guide</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <Video className="w-8 h-8 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Video Tutorials</h3>
          <p className="text-gray-600 mb-4">Step-by-step video instructions</p>
          <button className="text-green-600 hover:text-green-800">Watch Videos</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <MessageCircle className="w-8 h-8 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Live Chat</h3>
          <p className="text-gray-600 mb-4">Get help from our support team</p>
          <button className="text-purple-600 hover:text-purple-800">Start Chat</button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg text-center">
          <HelpCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">FAQs</h3>
          <p className="text-gray-600 mb-4">Find answers to common questions</p>
          <button className="text-red-600 hover:text-red-800">View FAQs</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg">
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6">Frequently Asked Questions</h3>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b pb-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">{faq.question}</h4>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Still Need Help?</h3>
          <p className="text-blue-600 mb-6">Our support team is available 24/7 to assist you</p>
          <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};

export default Help;