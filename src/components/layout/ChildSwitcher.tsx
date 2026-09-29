import React from 'react';
import { useSchool } from '../../lib/store/school-store';
import { UserCheck, Sparkles } from 'lucide-react';

export function ChildSwitcher() {
  const { currentUser, parentChildren, activeChild, switchActiveChild } = useSchool();

  if (currentUser.role !== 'parent' || parentChildren.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-l from-blue-700 via-blue-600 to-indigo-700 text-white rounded-2xl p-4 sm:p-5 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-white/10 rounded-lg backdrop-blur-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
            <h2 className="text-base font-bold">بوابة متابعة الأبناء الأكاديمية</h2>
          </div>
          <p className="text-xs text-blue-100 mt-1">
            اختر الابن لاستعراض كشف الدرجات، الحضور والغياب، الواجبات والامتحانات الخاصة به
          </p>
        </div>

        {/* Children Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {parentChildren.map((child) => {
            const isSelected = activeChild?.id === child.id;
            return (
              <button
                key={child.id}
                onClick={() => switchActiveChild(child.id)}
                className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-blue-900 shadow-md ring-2 ring-white/50 scale-102'
                    : 'bg-white/15 text-white hover:bg-white/25 border border-white/20'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-white/30 text-white'
                  }`}
                >
                  {child.first_name[0]}
                </div>
                <div className="text-right">
                  <div className="leading-tight">{child.first_name}</div>
                  <div className="text-[10px] font-normal opacity-80 leading-tight">
                    {child.grade_name?.split(' ')[1] || child.grade_name}
                  </div>
                </div>
                {isSelected && <UserCheck className="w-3.5 h-3.5 text-blue-600 mr-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
