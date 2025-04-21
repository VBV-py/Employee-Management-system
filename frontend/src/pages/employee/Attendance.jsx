// src/pages/employee/Attendance.jsx
import React, { useState, useEffect } from 'react';
import EmployeeLayout from '../../components/layouts/EmployeeLayout.jsx';
import api from '../../services/api.js';
import {
    format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval,
    isWeekend, isEqual, startOfWeek, endOfWeek, getYear, getMonth, getDate, isPast, isToday // Add isPast, isToday
} from 'date-fns';
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiLoader } from 'react-icons/fi';

// --- Main Attendance Component ---
const Attendance = () => {
    const [loading, setLoading] = useState(true);
    const [attendanceData, setAttendanceData] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [summary, setSummary] = useState({});
    const [userId, setUserId] = useState('me'); // Use 'me' for the logged-in user

    useEffect(() => {
        const fetchAttendanceData = async () => {
            setLoading(true);
            try {
                const year = getYear(currentMonth);
                const month = getMonth(currentMonth) + 1;
                const response = await api.get(`/employees/${userId}/attendance`, { params: { year, month } });
                console.log("Employee Attendance Response:", response.data); // Keep for debugging
                setAttendanceData(response.data.records || []);
                setSummary(response.data.summary || {});
            } catch (error) {
                console.error('Error fetching attendance data:', error);
                setAttendanceData([]);
                setSummary({});
            } finally {
                setLoading(false);
            }
        };
        fetchAttendanceData();
    }, [currentMonth, userId]);

    const goToPreviousMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() - 1);
        setCurrentMonth(newDate);
    };

    const goToNextMonth = () => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + 1);
        if (newDate <= endOfMonth(new Date())) {
             setCurrentMonth(newDate);
        }
    };

    // Get days for the calendar grid
     const getCalendarDays = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
        const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
        return eachDayOfInterval({ start: startDate, end: endDate });
    };

    // Get attendance record using date component comparison
     const getAttendanceForDate = (calendarDay) => {
        const calYear = getYear(calendarDay);
        const calMonth = getMonth(calendarDay);
        const calDate = getDate(calendarDay);
         const record = attendanceData.find(rec => {
            if (!rec.date) return false;
             try {
                const recordDateObj = new Date(rec.date);
                const recYear = recordDateObj.getFullYear();
                const recMonth = recordDateObj.getMonth();
                const recDate = recordDateObj.getDate();
                return calYear === recYear && calMonth === recMonth && calDate === recDate;
            } catch (e) {
                console.warn("Could not parse or compare attendance record date:", rec.date, e);
                return false;
             }
         });
         return record;
     };

    const daysForGrid = getCalendarDays();

    return (
        // Use opening and closing tags for EmployeeLayout
        <EmployeeLayout>
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>
                <p className="text-gray-600">View your monthly attendance records</p>
            </div>

            {/* Month selector */}
            <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
                <button onClick={goToPreviousMonth} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-150" aria-label="Previous month"><FiChevronLeft className="h-5 w-5" /></button>
                <h2 className="text-xl font-semibold text-gray-800">{format(currentMonth, 'MMMM yyyy')}</h2>
                <button onClick={goToNextMonth} className="p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed" disabled={endOfMonth(currentMonth) >= endOfMonth(new Date())} aria-label="Next month"><FiChevronRight className="h-5 w-5" /></button>
            </div>

            {/* Attendance summary */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <FiCalendar className="mr-2" /> Monthly Summary
                </h3>
                 {loading ? (
                     <div className="flex justify-center items-center h-20"><FiLoader className="animate-spin h-8 w-8 text-primary-500" /></div>
                 ) : Object.keys(summary).length === 0 && attendanceData.length === 0 ? (
                     <p className="text-center text-gray-500">No attendance data available for this month.</p>
                 ) : (
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-4"> {/* Removed Absent card */}
                      <div className="bg-green-50 p-4 rounded-lg text-center"> <p className="text-sm text-gray-600">Present</p> <p className="text-2xl font-bold text-green-600">{summary.present_count || 0}</p> </div>
                      <div className="bg-yellow-50 p-4 rounded-lg text-center"> <p className="text-sm text-gray-600">Late</p> <p className="text-2xl font-bold text-yellow-600">{summary.late_count || 0}</p> </div>
                      <div className="bg-orange-50 p-4 rounded-lg text-center"> <p className="text-sm text-gray-600">Half-Day</p> <p className="text-2xl font-bold text-orange-600">{summary.half_day_count || 0}</p> </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center"> <p className="text-sm text-gray-600">On Leave</p> <p className="text-2xl font-bold text-blue-600">{summary.leave_count || 0}</p> </div>
                 </div>
                )}
            </div>

            {/* Calendar view */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                 {/* Calendar Header */}
                <div className="grid grid-cols-7 bg-gray-100 border-b border-gray-200">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (<div key={day} className="py-3 text-center text-xs md:text-sm font-semibold text-gray-600">{day}</div>))}
                </div>
                 {/* Calendar Body */}
                {loading ? (
                    <div className="flex justify-center items-center h-64"><FiLoader className="animate-spin h-12 w-12 text-primary-500" /></div>
                ) : (
                <div className="grid grid-cols-7 min-h-[30rem] border-l border-gray-200">
                    {daysForGrid.map((day) => {
                        const dayOfMonth = getDate(day);
                        const currentMonthStatic = currentMonth; // Capture state for use in comparisons
                        const isCurrentViewMonth = getMonth(day) === getMonth(currentMonthStatic);
                        const isWeekendDay = isWeekend(day);
                        const attendance = getAttendanceForDate(day);
                        const isTodayCheck = isToday(day);
                        const isPastCheck = isPast(day) && !isTodayCheck; // isPast already implies !isToday

                        // Determine styles
                        let cellBg = 'bg-white';
                        let dayTextColor = 'text-gray-700';
                        let impliedAbsentStyle = ''; // Style for implied absence dot

                         if (!isCurrentViewMonth) {
                             cellBg = 'bg-gray-50';
                             dayTextColor = 'text-gray-400';
                         } else if (isWeekendDay) {
                             cellBg = 'bg-gray-100';
                             dayTextColor = 'text-gray-500';
                         } else if (isPastCheck && !attendance) {
                             // Apply red dot style for implied absence on past workdays
                             impliedAbsentStyle = 'relative before:content-[""] before:absolute before:top-1.5 before:right-1.5 before:w-1.5 before:h-1.5 before:bg-red-400 before:rounded-full';
                         }

                         if (isTodayCheck && isCurrentViewMonth) {
                             dayTextColor = 'text-white font-bold';// Style for today's number
                         }

                        return (
                            <div
                                key={format(day, 'yyyy-MM-dd')}
                                className={`p-1.5 md:p-2 border-b border-r border-gray-200 flex flex-col justify-between overflow-hidden
                                            ${cellBg} ${!isCurrentViewMonth ? 'opacity-60': ''}
                                            ${isTodayCheck && isCurrentViewMonth ? 'ring-2 ring-inset ring-primary-500 z-10' : ''}
                                            ${impliedAbsentStyle}
                                        `} style={{minHeight: '6rem'}} // Ensure min height
                            >
                                {/* Top: Day Number & Status Badge */}
                                <div className="flex justify-between items-start">
                                    <span className={`text-xs md:text-sm font-medium flex items-center justify-center ${isTodayCheck && isCurrentViewMonth ? 'bg-primary-600 rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center':''} ${dayTextColor}`}>
                                        {dayOfMonth}
                                    </span>
                                    {attendance && isCurrentViewMonth && (
                                          <span className={`hidden md:inline-block px-1.5 md:px-2 py-0.5 text-[10px] md:text-xs rounded-full font-semibold leading-tight whitespace-nowrap ${
                                              attendance.status === 'present' ? 'bg-green-100 text-green-800' :
                                              attendance.status === 'late' ? 'bg-yellow-100 text-yellow-800' :
                                              attendance.status === 'absent' ? 'bg-red-100 text-red-800' :
                                              attendance.status === 'half-day' ? 'bg-orange-100 text-orange-800' :
                                              attendance.status === 'on-leave' ? 'bg-blue-100 text-blue-800' :
                                              'bg-gray-100 text-gray-800'
                                          }`}>
                                         
                                               {attendance.status?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) ?? 'N/A'}
                                          </span>
                                      )}
                                 </div>

                                 {/* Bottom: Times/Note */}
                                  <div className="flex-grow flex flex-col justify-end">
                                       {attendance && isCurrentViewMonth ? (
                                           <div className="text-[10px] md:text-xs space-y-0.5 overflow-hidden mt-1">
                                                 {attendance.check_in && (
                                                      <div className="flex items-center text-green-700" title={`In: ${format(new Date(attendance.check_in), 'p')}`}>
                                                          <FiClock size={10} className="mr-0.5 md:mr-1 flex-shrink-0" />
                                                          <span className="truncate">{format(new Date(attendance.check_in), 'h:mma').toLowerCase()}</span>
                                                      </div>
                                                  )}
                                                  {attendance.check_out && (
                                                     <div className="flex items-center text-red-700" title={`Out: ${format(new Date(attendance.check_out), 'p')}`}>
                                                         <FiClock size={10} className="mr-0.5 md:mr-1 flex-shrink-0" />
                                                         <span className="truncate">{format(new Date(attendance.check_out), 'h:mma').toLowerCase()}</span>
                                                     </div>
                                                 )}
                                                {attendance.note && (
                                                     <div className="text-gray-500 pt-0.5 border-t border-gray-100 mt-1 truncate" title={attendance.note}>
                                                         {attendance.note}
                                                    </div>
                                                 )}
                                            </div>
                                       ) : null } {/* Empty space if no attendance */}
                                   </div>

                                   {/* Mobile Status Indicator (Only for current month & if attendance exists) */}
                                  {attendance && isCurrentViewMonth && (
                                       <div className={`md:hidden h-1.5 w-1.5 rounded-full absolute bottom-1.5 right-1.5 ${
                                            attendance.status === 'present' ? 'bg-green-500' :
                                            attendance.status === 'late' ? 'bg-yellow-500' :
                                            attendance.status === 'absent' ? 'bg-red-500' :
                                            attendance.status === 'half-day' ? 'bg-orange-500' :
                                            attendance.status === 'on-leave' ? 'bg-blue-500' :
                                            'bg-transparent'
                                        }`}></div>
                                   )}
                            </div>
                        );
                    })}
                 </div>
                 )}
             </div>
        </EmployeeLayout> // Make sure this closing tag matches the opening one
    );
};

export default Attendance;