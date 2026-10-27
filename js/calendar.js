export function getCalendarData(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    let days = [];
    let emptyDays = firstDay === 0 ? 6 : firstDay - 1;
    for (let i = 0; i < emptyDays; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    
    return days;
}

export function isToday(day, currentMonth, currentYear) {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && 
           currentMonth === today.getMonth() && 
           currentYear === today.getFullYear();
}
