import React from 'react';
import { Calendar, Clock, BookOpen, Target, CheckCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const Dashboard3 = () => {
  // Mock study plan data
  const studyPlan = {
    upcomingMilestones: [
      { date: 'Mar 25', title: 'Fundamentals Block', type: 'block-start', duration: '2 weeks' },
      { date: 'Apr 8', title: 'Med-Surg Block', type: 'block-start', duration: '3 weeks' },
      { date: 'Jun 22', title: 'NCLEX Exam', type: 'exam', duration: '6 hours' }
    ],
    weeklySchedule: [
      {
        week: 'Week 1 (Mar 25 - Mar 31)',
        focus: 'Fundamentals of Nursing',
        tasks: [
          { day: 'Monday', topic: 'Patient Safety', duration: '4h', completed: true },
          { day: 'Tuesday', topic: 'Nursing Process', duration: '4h', completed: true },
          { day: 'Wednesday', topic: 'Documentation', duration: '4h', completed: false },
          { day: 'Thursday', topic: 'Practice Questions', duration: '2h', completed: false },
          { day: 'Friday', topic: 'Review & Weak Areas', duration: '3h', completed: false }
        ]
      },
      {
        week: 'Week 2 (Apr 1 - Apr 7)',
        focus: 'Basic Care & Comfort',
        tasks: [
          { day: 'Monday', topic: 'Vital Signs', duration: '4h', completed: false },
          { day: 'Tuesday', topic: 'Mobility', duration: '4h', completed: false },
          { day: 'Wednesday', topic: 'Hygiene', duration: '4h', completed: false },
          { day: 'Thursday', topic: 'Practice Questions', duration: '2h', completed: false },
          { day: 'Friday', topic: 'Review & Weak Areas', duration: '3h', completed: false }
        ]
      }
    ]
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Study Planner</h2>
          <p className="text-gray-500 dark:text-gray-400">Your personalized NCLEX preparation schedule</p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">NCLEX Exam Date:</span>
          <span className="text-lg font-semibold text-blue-600 dark:text-blue-400">June 22, 2024</span>
        </div>
      </div>

      {/* Timeline Section */}
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Upcoming Milestones</h3>
        <div className="relative">
          <div className="absolute top-0 bottom-0 left-[19px] w-0.5 bg-blue-100 dark:bg-blue-900"></div>
          <div className="space-y-6">
            {studyPlan.upcomingMilestones.map((milestone, index) => (
              <div key={index} className="flex items-start">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center shrink-0
                  ${milestone.type === 'exam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}
                  dark:bg-opacity-20
                `}>
                  {milestone.type === 'exam' ? '📝' : '📚'}
                </div>
                <div className="ml-4">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{milestone.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {milestone.date} • {milestone.duration}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {studyPlan.weeklySchedule.map((week, weekIndex) => (
          <div key={weekIndex} className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{week.week}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Focus: {week.focus}</p>
            </div>
            <div className="space-y-3">
              {week.tasks.map((task, taskIndex) => (
                <div 
                  key={taskIndex}
                  className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-dark/50"
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      task.completed 
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                      {task.completed ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white">{task.topic}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{task.day} • {task.duration}</p>
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    {task.completed ? 'Review' : 'Start'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Study Resources */}
      <div className="bg-white dark:bg-dark-lighter rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recommended Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2" />
            <h4 className="font-medium text-gray-800 dark:text-white">Study Materials</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Access your content library</p>
          </div>
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
            <Target className="w-6 h-6 text-green-600 dark:text-green-400 mb-2" />
            <h4 className="font-medium text-gray-800 dark:text-white">Practice Tests</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Take a quiz on today's topics</p>
          </div>
          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
            <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400 mb-2" />
            <h4 className="font-medium text-gray-800 dark:text-white">Progress Tracking</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">Monitor your improvement</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard3;