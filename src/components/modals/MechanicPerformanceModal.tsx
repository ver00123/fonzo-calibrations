import { Dialog, DialogContent, DialogBody, DialogFooter } from '@/components/ui/dialog';
import { BarChart3, TrendingUp, Users, CheckCircle2, Award } from "lucide-react";
import type { Database } from '@/types/database.types';

type Mechanic = Database['public']['Tables']['mechanics']['Row'];

interface MechanicPerformanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: Mechanic[];
}

export function MechanicPerformanceModal({ open, onOpenChange, data }: MechanicPerformanceModalProps) {

  const totalMechanics = data.length;
  const avgEfficiency = totalMechanics > 0 
    ? (data.reduce((acc, curr) => acc + (curr.efficiency_rating || 0), 0) / totalMechanics).toFixed(1)
    : 0;
  const totalJobs = data.reduce((acc, curr) => acc + (curr.jobs_completed || 0), 0);
  
  const topPerformers = [...data]
    .sort((a, b) => (b.efficiency_rating || 0) - (a.efficiency_rating || 0))
    .slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Performance Analytics"
        onClose={() => onOpenChange(false)}
      >
        <DialogBody className="space-y-6">
          {/* Overview Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <BarChart3 className="h-4 w-4" />
              <span>Team Overview</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 text-blue-600 mb-1">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Avg Efficiency</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{avgEfficiency}%</p>
              </div>
              
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 text-emerald-600 mb-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Total Jobs</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{totalJobs}</p>
              </div>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-2 text-purple-600 mb-1">
                  <Users className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Mechanics</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{totalMechanics}</p>
              </div>
            </div>
          </div>

          {/* Ranking Section */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Award className="h-4 w-4" />
              <span>Top Performers</span>
            </div>

            <div className="pl-6 space-y-3">
              {topPerformers.map((m, i) => (
                <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-400 transition-all duration-200 group">
                  <div className="flex items-center gap-4">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-full font-bold text-xs ${
                      i === 0 ? 'bg-yellow-100 text-yellow-700' : 
                      i === 1 ? 'bg-gray-100 text-gray-700' : 
                      'bg-orange-50 text-orange-700'
                    }`}>
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{m.full_name}</p>
                      <p className="text-xs text-gray-500">{m.role} • {m.jobs_completed} jobs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-blue-600">{m.efficiency_rating}%</p>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                        style={{ width: `${m.efficiency_rating}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DialogBody>

        {/*Footer*/}
        <DialogFooter>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="px-5 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg cursor-pointer"
          >
            Close
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}