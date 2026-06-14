const fs = require('fs');
const file = 'src/app/page.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add state variable
content = content.replace(
  'const [scheduleTime, setScheduleTime] = useState("");',
  'const [scheduleTime, setScheduleTime] = useState("");\n  const [scheduleAlarmMinutes, setScheduleAlarmMinutes] = useState(0);'
);

// 2. Add Push Token Listener
content = content.replace(
  '// Load theme from localStorage for this specific user',
  `// Listen for Expo Push Token from React Native WebView
        const handleExpoToken = async () => {
          if (window.EXPO_PUSH_TOKEN) {
            await supabase.from("profiles").update({ expo_push_token: window.EXPO_PUSH_TOKEN }).eq("id", user.id);
          }
        };
        window.addEventListener('expoTokenReady', handleExpoToken);
        if (window.EXPO_PUSH_TOKEN) handleExpoToken();
        
        // Load theme from localStorage for this specific user`
);

// 3. Add sendPushNotification helper function before handleSaveDiary
content = content.replace(
  'const handleSaveDiary = async () => {',
  `const sendPushNotification = async (targetUserId, title, body) => {
    try {
      const { data: profile } = await supabase.from('profiles').select('expo_push_token').eq('id', targetUserId).single();
      if (profile && profile.expo_push_token) {
        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: profile.expo_push_token,
            sound: 'default',
            title: title,
            body: body,
          }),
        });
      }
    } catch (e) { console.log('Push error', e); }
  };

  const handleSaveDiary = async () => {`
);

// 4. Send Push on handleSaveDiary
content = content.replace(
  `setMonthDiaries(diaries || []);
  };`,
  `setMonthDiaries(diaries || []);
    
    // Send Push Notification
    if (currentUserRole === 'mother') {
      const { data: partners } = await supabase.from('profiles').select('id').eq('couple_id', coupleId).eq('role', 'partner');
      if (partners && partners.length > 0) {
        sendPushNotification(partners[0].id, '새로운 일기 🍼', '아내가 새로운 다이어리를 작성했어요!');
      }
    }
  };`
);

// 5. Send Push on handleSavePostIt
content = content.replace(
  `setSelectedDayPostIt(data || null);
  };`,
  `setSelectedDayPostIt(data || null);
    
    // Send Push Notification
    if (currentUserRole === 'partner') {
      const { data: mothers } = await supabase.from('profiles').select('id').eq('couple_id', coupleId).eq('role', 'mother');
      if (mothers && mothers.length > 0) {
        sendPushNotification(mothers[0].id, '새로운 쪽지 💌', '남편이 다이어리에 쪽지를 남겼어요!');
      }
    }
  };`
);

// 6. Modify handleSaveSchedule to include alarm and send message
content = content.replace(
  `if (selectedDaySchedule) {
        const { error } = await supabase.from('schedules').update({ date: scheduleDate, time: scheduleTime || null, title: scheduleTitle }).eq('id', selectedDaySchedule.id);
        if (error) { alert("일정 수정 실패: " + error.message); return; }
      } else {
        const { error } = await supabase.from('schedules').insert({ couple_id: coupleId, pregnancy_id: pregnancyId, date: scheduleDate, time: scheduleTime || null, title: scheduleTitle });
        if (error) { alert("일정 저장 실패: " + error.message); return; }
      }`,
  `if (selectedDaySchedule) {
        const { error } = await supabase.from('schedules').update({ date: scheduleDate, time: scheduleTime || null, title: scheduleTitle, alarm_minutes: scheduleAlarmMinutes }).eq('id', selectedDaySchedule.id);
        if (error) { alert("일정 수정 실패: " + error.message); return; }
      } else {
        const { error } = await supabase.from('schedules').insert({ couple_id: coupleId, pregnancy_id: pregnancyId, date: scheduleDate, time: scheduleTime || null, title: scheduleTitle, alarm_minutes: scheduleAlarmMinutes });
        if (error) { alert("일정 저장 실패: " + error.message); return; }
      }
      
      // Schedule Alarm via App Bridge
      if (window.ReactNativeWebView && scheduleTime && scheduleAlarmMinutes > 0) {
        const triggerDate = new Date(\`\${scheduleDate}T\${scheduleTime}:00\`);
        triggerDate.setMinutes(triggerDate.getMinutes() - scheduleAlarmMinutes);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SCHEDULE_ALARM',
          title: '일정 알림 ⏰',
          body: scheduleTitle,
          triggerTime: triggerDate.toISOString()
        }));
      }`
);

// 7. Reset schedule states
content = content.replace(
  `setIsScheduleModalOpen(false);
    setScheduleTitle("");
    setScheduleTime("");`,
  `setIsScheduleModalOpen(false);
    setScheduleTitle("");
    setScheduleTime("");
    setScheduleAlarmMinutes(0);`
);

// 8. Edit schedule initial state
content = content.replace(
  `setScheduleTime(selectedDaySchedule ? (selectedDaySchedule.time || "") : "");
                      setScheduleDate(selectedDaySchedule ? selectedDaySchedule.date : \`\${currentYear}-\${String(currentMonth).padStart(2, '0')}-\${String(selectedDate).padStart(2, '0')}\`);`,
  `setScheduleTime(selectedDaySchedule ? (selectedDaySchedule.time || "") : "");
                      setScheduleAlarmMinutes(selectedDaySchedule ? (selectedDaySchedule.alarm_minutes || 0) : 0);
                      setScheduleDate(selectedDaySchedule ? selectedDaySchedule.date : \`\${currentYear}-\${String(currentMonth).padStart(2, '0')}-\${String(selectedDate).padStart(2, '0')}\`);`
);

// 9. Schedule Modal JSX
content = content.replace(
  `<input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>`,
  `<input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ width: '100%', marginTop: '5px' }}>
                <select value={scheduleAlarmMinutes} onChange={(e) => setScheduleAlarmMinutes(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--text-primary)', backgroundColor: 'white' }}>
                  <option value={0}>알람 안 함</option>
                  <option value={0} disabled>---</option>
                  <option value={5}>5분 전</option>
                  <option value={10}>10분 전</option>
                  <option value={15}>15분 전</option>
                  <option value={30}>30분 전</option>
                  <option value={60}>1시간 전</option>
                </select>
              </div>`
);

// 10. PDF Export Bridge
content = content.replace(
  `// Give DOM time to render all diaries
    setTimeout(() => {
      window.print();
      setIsExporting(false);
      setAllDiariesToExport([]);
    }, 1500);`,
  `// Give DOM time to render all diaries
    setTimeout(async () => {
      if (window.ReactNativeWebView) {
        // App Export Logic (Using a third party service or we can just send html)
        // But the simplest is to just tell them to use window.print in webview, but WebView on Android doesn't print to PDF easily.
        // For now, let's just use window.print() but alert them it's generating.
        // A better approach for React Native is generating the PDF using an API, but since we are purely client side,
        // we'll trigger window.print() and let iOS handle it, and for Android we might need a custom print handler.
        // Actually, let's just trigger window.print() first. We can refine the Base64 bridge later if needed.
      }
      window.print();
      setIsExporting(false);
      setAllDiariesToExport([]);
    }, 1500);`
);

fs.writeFileSync(file, content, 'utf8');
console.log('Modifications applied successfully!');
