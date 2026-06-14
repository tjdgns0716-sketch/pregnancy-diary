const fs = require('fs');
const file = 'src/app/page.js';
let content = fs.readFileSync(file, 'utf8');

// Find the time input and inject the select below it
const searchString = '<input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ flex: 1, padding: \'12px\', borderRadius: \'8px\', border: \'1px solid var(--border-color)\', fontSize: \'0.95rem\', fontFamily: \'inherit\', color: \'var(--text-primary)\', boxSizing: \'border-box\' }} />';

if (content.includes(searchString)) {
  const replacement = searchString + \`
              </div>
              <div style={{ width: '100%', marginTop: '10px' }}>
                <select value={scheduleAlarmMinutes} onChange={(e) => setScheduleAlarmMinutes(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--text-primary)', backgroundColor: 'white' }}>
                  <option value={0}>알람 안 함</option>
                  <option value={0} disabled>---</option>
                  <option value={5}>5분 전 알람</option>
                  <option value={10}>10분 전 알람</option>
                  <option value={15}>15분 전 알람</option>
                  <option value={30}>30분 전 알람</option>
                  <option value={60}>1시간 전 알람</option>
                </select>\`;
                
  content = content.replace(searchString + '\\n              </div>', replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Alarm UI Injected');
} else {
  console.log('Search string not found!');
}
