"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabase";
import { useRouter } from "next/navigation";

const formatTime = (timeStr) => {
  if (!timeStr) return "";
  const [hours, minutes] = timeStr.split(':');
  let h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  const ampm = h >= 12 ? '오후' : '오전';
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return `${ampm} ${h}시${m > 0 ? ` ${m}분` : ''}`;
};

export default function Home() {
  const router = useRouter();
  
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Write Modal States
  const [selectedBadges, setSelectedBadges] = useState([]);
  const [showBadgeSelector, setShowBadgeSelector] = useState(false);
  const [showPrivateContentInput, setShowPrivateContentInput] = useState(false);
  const [privateContent, setPrivateContent] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [isEditingPostIt, setIsEditingPostIt] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [tutorialStep, setTutorialStep] = useState(0);

  // Real DB States
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRole, setCurrentUserRole] = useState(null); // 'mother' or 'partner'
  const [coupleId, setCoupleId] = useState(null);
  const [pregnancyId, setPregnancyId] = useState(null);
  const [inviteCode, setInviteCode] = useState(null);
  const [babyName, setBabyName] = useState(null);
  const [dueDate, setDueDate] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [allDiariesToExport, setAllDiariesToExport] = useState([]);
  
  const [isBabyInfoModalOpen, setIsBabyInfoModalOpen] = useState(false);
  const [isNewJourneyModalOpen, setIsNewJourneyModalOpen] = useState(false);
  const [tempBabyName, setTempBabyName] = useState("");
  const [tempDueDate, setTempDueDate] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportIncludesPrivate, setExportIncludesPrivate] = useState(false);
  
  const [allPregnancies, setAllPregnancies] = useState([]);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);

  // DB Data States
  const [monthDiaries, setMonthDiaries] = useState([]);
  const [monthSchedules, setMonthSchedules] = useState([]);
  const [selectedDayDiary, setSelectedDayDiary] = useState(null);
  const [selectedDaySchedule, setSelectedDaySchedule] = useState(null);
  const [selectedDayPostIt, setSelectedDayPostIt] = useState(null);

  // Input States
  const [diaryContent, setDiaryContent] = useState("");
  const [scheduleTitle, setScheduleTitle] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleAlarmMinutes, setScheduleAlarmMinutes] = useState(0);
  const [postItContent, setPostItContent] = useState("");

  useEffect(() => {
    const fetchUserAndProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      
      const { data: profile } = await supabase.from("profiles").select("role, couple_id").eq("id", user.id).single();
      if (profile) {
        setCurrentUserRole(profile.role);
        setCurrentUser(user);
        setCoupleId(profile.couple_id);
        
        // Listen for Expo Push Token from React Native WebView
        const handleExpoToken = async () => {
          if (window.EXPO_PUSH_TOKEN) {
            await supabase.from("profiles").update({ expo_push_token: window.EXPO_PUSH_TOKEN }).eq("id", user.id);
          }
        };
        window.addEventListener('expoTokenReady', handleExpoToken);
        if (window.EXPO_PUSH_TOKEN) handleExpoToken();
        
        // Load theme from localStorage for this specific user
        const savedTheme = localStorage.getItem(`diary_theme_${user.id}`);
        if (savedTheme) {
          setCurrentTheme(savedTheme);
          document.body.className = savedTheme;
        } else {
          setCurrentTheme('');
          document.body.className = '';
        }
        
        // Check Tutorial from user_metadata
        if (!user.user_metadata?.tutorial_seen) {
          setShowTutorial(true);
        }
        
        const { data: couple } = await supabase.from("couples").select("*").eq("id", profile.couple_id).single();
        if (couple) {
          if (profile.role === 'mother') setInviteCode(couple.invite_code);
          
          const { data: pregnancies } = await supabase.from('pregnancies').select('*').eq('couple_id', profile.couple_id).order('created_at', { ascending: false });
          if (pregnancies && pregnancies.length > 0) {
            setAllPregnancies(pregnancies);
            const activePregnancy = pregnancies.find(p => p.status === 'active') || pregnancies[0];
            setPregnancyId(activePregnancy.id);
            setBabyName(activePregnancy.baby_name);
            setDueDate(activePregnancy.due_date);
          }
        }
      } else {
        router.push("/login");
      }
      setLoading(false);
    };
    
    fetchUserAndProfile();
  }, [router]);

  const changeTheme = (themeClass) => {
    setCurrentTheme(themeClass);
    if (currentUser) {
      localStorage.setItem(`diary_theme_${currentUser.id}`, themeClass);
    }
    document.body.className = themeClass;
  };

  const themes = [
    { name: '연보라', class: '' },
    { name: '베이지', class: 'theme-beige' },
    { name: '핑크', class: 'theme-pink' },
    { name: '주황', class: 'theme-orange' },
    { name: '노랑', class: 'theme-yellow' },
    { name: '파랑', class: 'theme-blue' },
    { name: '빨강', class: 'theme-red' },
    { name: '화이트', class: 'theme-white' },
    { name: '다크', class: 'theme-black' }
  ];

  // Dynamic Calendar Logic
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1).getDay(); // 0(Sun) ~ 6(Sat)
  
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const dates = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  useEffect(() => {
    if (!pregnancyId) return;
    const fetchMonthData = async () => {
      const startDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`;
      const endDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`;
      
      const { data: diaries } = await supabase.from('diaries').select('*').eq('pregnancy_id', pregnancyId).gte('date', startDate).lte('date', endDate);
      const { data: schedules } = await supabase.from('schedules').select('*').eq('pregnancy_id', pregnancyId).gte('date', startDate).lte('date', endDate);
        
      setMonthDiaries(diaries || []);
      setMonthSchedules(schedules || []);
    };
    fetchMonthData();
  }, [currentYear, currentMonth, pregnancyId, daysInMonth]);

  useEffect(() => {
    const targetDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    const diary = monthDiaries.find(d => d.date === targetDate);
    const schedule = monthSchedules.find(s => s.date === targetDate);
    
    if (diary && diary.private_content && currentUserRole === 'partner') {
      // Partner sees the diary but without private_content
      setSelectedDayDiary({ ...diary, private_content: null });
      setDiaryContent(diary.content || "");
      setPrivateContent("");
    } else {
      setSelectedDayDiary(diary || null);
      if (diary) {
        setDiaryContent(diary.content || "");
        setPrivateContent(diary.private_content || "");
        setShowPrivateContentInput(!!diary.private_content);
        setAttachedImage(diary.image_url || null);
      } else {
        setDiaryContent("");
        setPrivateContent("");
        setShowPrivateContentInput(false);
        setAttachedImage(null);
      }
    }
    
    setSelectedDaySchedule(schedule || null);
    
    if (diary) {
      supabase.from('post_its').select('*').eq('diary_id', diary.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
        .then(({ data }) => setSelectedDayPostIt(data || null));
    } else {
      setSelectedDayPostIt(null);
    }
    
    setIsEditingPostIt(false); // Reset edit state when changing days
  }, [selectedDate, monthDiaries, monthSchedules, currentYear, currentMonth, currentUserRole]);

  // Dots Logic
  const hasPrivateDiary = monthDiaries.filter(d => d.private_content).map(d => parseInt(d.date.split('-')[2]));
  const hasPublicDiary = monthDiaries.filter(d => d.content || d.image_url || (d.badges && d.badges.length > 0)).map(d => parseInt(d.date.split('-')[2]));
  const hasSchedule = monthSchedules.map(s => parseInt(s.date.split('-')[2]));

  const sendPushNotification = async (targetUserId, title, body) => {
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

  const handleSaveDiary = async () => {
    if (!diaryContent.trim() && !privateContent.trim() && selectedBadges.length === 0 && !attachedImage) return;
    const targetDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
    
    const diaryData = { 
      couple_id: coupleId, 
      pregnancy_id: pregnancyId,
      author_id: currentUser.id, 
      date: targetDate, 
      content: diaryContent, 
      private_content: showPrivateContentInput ? privateContent : null, 
      image_url: attachedImage,
      badges: selectedBadges 
    };
    
    if (selectedDayDiary) {
      const { error } = await supabase.from('diaries').update(diaryData).eq('id', selectedDayDiary.id);
      if (error) { alert("저장 실패: " + error.message); return; }
    } else {
      const { error } = await supabase.from('diaries').insert(diaryData);
      if (error) { alert("저장 실패: " + error.message); return; }
      
      // 배우자에게 푸시 알림 전송 (엄마가 썼을 경우만)
      if (currentUserRole === 'mother') {
        const { data: partner } = await supabase.from('profiles').select('id').eq('couple_id', coupleId).eq('role', 'father').maybeSingle();
        if (partner) {
          sendPushNotification(partner.id, "새로운 일기 🍼", "아내가 새로운 다이어리를 작성했어요!");
        }
      }
    }
    
    setIsWriteModalOpen(false);
    setDiaryContent("");
    setPrivateContent("");
    setShowPrivateContentInput(false);
    setAttachedImage(null);
    
    const { data: diaries } = await supabase.from('diaries').select('*').eq('pregnancy_id', pregnancyId).gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`).lte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
    setMonthDiaries(diaries || []);
  };

  const handleDeletePublicDiary = async () => {
    if (!selectedDayDiary) return;
    if (window.confirm("공개 일기(내용, 사진, 뱃지)를 삭제하시겠습니까?")) {
      setIsUploading(true);
      const { error } = await supabase.from('diaries').update({ content: null, image_url: null, badges: [] }).eq('id', selectedDayDiary.id);
      if (error) { alert("삭제 실패: " + error.message); setIsUploading(false); return; }
      const { data: diaries } = await supabase.from('diaries').select('*').eq('pregnancy_id', pregnancyId).gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`).lte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
      setMonthDiaries(diaries || []);
      setIsUploading(false);
    }
  };

  const handleDeletePrivateDiary = async () => {
    if (!selectedDayDiary) return;
    if (window.confirm("비밀 일기를 삭제하시겠습니까?")) {
      setIsUploading(true);
      const { error } = await supabase.from('diaries').update({ private_content: null }).eq('id', selectedDayDiary.id);
      if (error) { alert("삭제 실패: " + error.message); setIsUploading(false); return; }
      const { data: diaries } = await supabase.from('diaries').select('*').eq('pregnancy_id', pregnancyId).gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`).lte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
      setMonthDiaries(diaries || []);
      setIsUploading(false);
    }
  };

  const handleDeletePostIt = async () => {
    if (!selectedDayPostIt) return;
    if (window.confirm("쪽지를 삭제하시겠습니까?")) {
      const { error } = await supabase.from('post_its').delete().eq('id', selectedDayPostIt.id);
      if (error) { alert("삭제 실패: " + error.message); return; }
      setSelectedDayPostIt(null);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${coupleId}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('diary-images')
      .upload(filePath, file);

    if (uploadError) {
      alert('사진 업로드 실패: ' + uploadError.message);
      setIsUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('diary-images')
      .getPublicUrl(filePath);

    setAttachedImage(publicUrl);
    setIsUploading(false);
  };

  const handleSaveSchedule = async () => {
    if (!scheduleTitle.trim()) {
      return;
    } else {
      if (!scheduleDate) return;
      if (selectedDaySchedule) {
        const { error } = await supabase.from('schedules').update({ date: scheduleDate, time: scheduleTime || null, title: scheduleTitle, alarm_minutes: scheduleAlarmMinutes }).eq('id', selectedDaySchedule.id);
        if (error) { alert("일정 수정 실패: " + error.message); return; }
      } else {
        const { error } = await supabase.from('schedules').insert({ couple_id: coupleId, pregnancy_id: pregnancyId, date: scheduleDate, time: scheduleTime || null, title: scheduleTitle, alarm_minutes: scheduleAlarmMinutes });
        if (error) { alert("일정 저장 실패: " + error.message); return; }
      }
      
      // 앱 내 로컬 푸시 예약 (앱 환경일 때만)
      if (window.ReactNativeWebView && scheduleTime && scheduleAlarmMinutes > 0) {
        const triggerDate = new Date(`${scheduleDate}T${scheduleTime}:00`);
        triggerDate.setMinutes(triggerDate.getMinutes() - scheduleAlarmMinutes);
        
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'SCHEDULE_ALARM',
          title: '일정 알림 ⏰',
          body: scheduleTitle,
          triggerTime: triggerDate.toISOString()
        }));
      }
    }
    
    setIsScheduleModalOpen(false);
    setScheduleTitle("");
    setScheduleTime("");
    
    const { data: schedules } = await supabase.from('schedules').select('*').eq('pregnancy_id', pregnancyId).gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`).lte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
    setMonthSchedules(schedules || []);
  };

  const handleDeleteSchedule = async () => {
    if (!selectedDaySchedule) return;
    if (window.confirm("정말 이 일정을 삭제하시겠습니까?")) {
      const { error } = await supabase.from('schedules').delete().eq('id', selectedDaySchedule.id);
      if (error) { alert("삭제 실패: " + error.message); return; }
      setIsScheduleModalOpen(false);
      const { data: schedules } = await supabase.from('schedules').select('*').eq('pregnancy_id', pregnancyId).gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`).lte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
      setMonthSchedules(schedules || []);
    }
  };

  const handleSavePostIt = async () => {
    if (!postItContent.trim()) return;
    
    let currentDiaryId = selectedDayDiary?.id;

    if (!currentDiaryId) {
      const targetDate = `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`;
      const { data, error } = await supabase.from('diaries').insert({
        couple_id: coupleId,
        pregnancy_id: pregnancyId,
        author_id: currentUser.id,
        date: targetDate,
        content: null,
        private_content: null,
        image_url: null,
        badges: []
      }).select().single();
      
      if (error) { alert("쪽지 저장 실패(일기 생성 오류): " + error.message); return; }
      currentDiaryId = data.id;
      
      const { data: diaries } = await supabase.from('diaries').select('*').eq('pregnancy_id', pregnancyId).gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`).lte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`);
      setMonthDiaries(diaries || []);
    }
    
    if (selectedDayPostIt) {
      const { error } = await supabase.from('post_its').update({ content: postItContent }).eq('id', selectedDayPostIt.id);
      if (error) { alert("쪽지 수정 실패: " + error.message); return; }
    } else {
      const { error } = await supabase.from('post_its').insert({ diary_id: currentDiaryId, author_id: currentUser.id, content: postItContent });
      if (error) { alert("쪽지 저장 실패: " + error.message); return; }
      
      // 아빠가 썼을 경우 엄마에게 푸시 알림 전송
      if (currentUserRole === 'father') {
        const { data: partner } = await supabase.from('profiles').select('id').eq('couple_id', coupleId).eq('role', 'mother').maybeSingle();
        if (partner) {
          sendPushNotification(partner.id, "새로운 쪽지 💌", "남편이 다이어리에 쪽지를 남겼어요!");
        }
      }
    }
    
    setPostItContent("");
    setIsEditingPostIt(false);
    
    const { data } = await supabase.from('post_its').select('*').eq('diary_id', currentDiaryId).order('created_at', { ascending: false }).limit(1).maybeSingle();
    setSelectedDayPostIt(data || null);
  };

  const handleExportAll = async (includePrivate) => {
    setIsExportModalOpen(false);
    setExportIncludesPrivate(includePrivate);
    setIsExporting(true);
    const { data: allDiaries } = await supabase.from('diaries').select('*, post_its(*)').eq('pregnancy_id', pregnancyId).order('date', { ascending: true });
    setAllDiariesToExport(allDiaries || []);
    
    // Give DOM time to render all diaries
    setTimeout(() => {
      if (window.ReactNativeWebView) {
        const exportContainer = document.querySelector('.printable-diary-export');
        if (exportContainer) {
          const htmlContent = `
            <html>
              <head>
                <meta charset="utf-8">
                <style>
                  body { font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333; }
                  .diary-entry { border-bottom: 1px solid #eee; padding-bottom: 20px; margin-bottom: 20px; page-break-inside: avoid; }
                  img { max-width: 100%; height: auto; border-radius: 8px; margin-top: 10px; }
                  .date { font-size: 1.2rem; font-weight: bold; color: #d48f87; margin-bottom: 10px; }
                  .content { font-size: 1rem; margin-bottom: 10px; }
                  .post-it { background: #fffde7; padding: 10px; border-radius: 5px; font-size: 0.9rem; margin-top: 10px; }
                </style>
              </head>
              <body>
                <h1 style="text-align: center; color: #d48f87; margin-bottom: 30px;">우리의 열달 다이어리</h1>
                ${exportContainer.innerHTML}
              </body>
            </html>
          `;
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DOWNLOAD_PDF_HTML',
            htmlContent
          }));
        } else {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'DOWNLOAD_PDF_HTML',
            htmlContent: '<html><body><h1>Error: Could not find container</h1></body></html>'
          }));
        }
      } else {
        window.print();
      }
      setIsExporting(false);
      setAllDiariesToExport([]);
    }, 1500);
  };

  const handleSaveBabyInfo = async () => {
    const { error } = await supabase.from('pregnancies').update({ baby_name: tempBabyName || null, due_date: tempDueDate || null }).eq('id', pregnancyId);
    if (error) {
      alert("정보 수정 실패: " + error.message);
      return;
    }
    setBabyName(tempBabyName || null);
    setDueDate(tempDueDate || null);
    setIsBabyInfoModalOpen(false);
  };

  const handleStartNewJourney = async () => {
    if (!tempDueDate) { alert("예정일을 입력해주세요."); return; }
    // Archive current pregnancy
    await supabase.from('pregnancies').update({ status: 'archived' }).eq('id', pregnancyId);
    
    // Create new pregnancy
    const { data: newPregnancy, error } = await supabase.from('pregnancies').insert({
      couple_id: coupleId,
      baby_name: tempBabyName || null,
      due_date: tempDueDate || null,
      status: 'active'
    }).select().single();
    
    if (error) { alert("시작 실패: " + error.message); return; }
    
    // Refresh all pregnancies
    const { data: updatedPregnancies } = await supabase.from('pregnancies').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false });
    if (updatedPregnancies) setAllPregnancies(updatedPregnancies);

    setPregnancyId(newPregnancy.id);
    setBabyName(newPregnancy.baby_name);
    setDueDate(newPregnancy.due_date);
    setIsNewJourneyModalOpen(false);
    setMonthDiaries([]);
    setMonthSchedules([]);
    alert("새로운 다이어리가 시작되었습니다!");
  };

  const handleDisconnect = async () => {
    const isConfirm = window.confirm(
      currentUserRole === 'mother' 
        ? "정말 남편(배우자)의 계정 연결을 끊으시겠습니까?\n\n연결을 끊더라도, 나중에 초대 코드를 다시 알려주면 언제든 돌아올 수 있습니다."
        : "정말 계정 연결을 해제하시겠습니까?\n\n연결 해제 후에도 아내의 초대 코드를 입력하시면 언제든 이 다이어리 방으로 다시 돌아오실 수 있습니다."
    );
    if (isConfirm) {
      if (currentUserRole === 'mother') {
        // 엄마가 끊는 경우: 파트너의 couple_id를 날려버림
        await supabase.from('profiles').update({ couple_id: null }).eq('couple_id', coupleId).eq('role', 'partner');
        alert("배우자 계정 연결이 해제되었습니다. (아빠 계정 접근이 차단되었습니다.)");
      } else {
        // 아빠가 스스로 끊는 경우: 본인의 couple_id를 날리고 튕겨나감
        await supabase.from('profiles').update({ couple_id: null }).eq('id', currentUser.id);
        alert("계정 연결이 해제되었습니다. 새로운 연결 화면으로 이동합니다.");
        router.push('/login');
      }
    }
  };

  const handleDeleteAccount = async () => {
    const isConfirm = window.confirm(
      "정말 탈퇴하시겠습니까?\n\n탈퇴 시 연결된 계정 정보와 작성하신 모든 일기/일정이 삭제되며, 복구할 수 없습니다."
    );
    if (isConfirm) {
      // 해결책: 프로필 삭제 전, 해당 회원이 작성한 일기와 일정을 먼저 삭제하여 외래키 제약조건 오류 방지
      await supabase.from('diaries').delete().eq('author_id', currentUser.id);
      await supabase.from('schedules').delete().eq('author_id', currentUser.id);

      const { error } = await supabase.rpc('delete_user');
      if (error) {
        alert("회원 탈퇴 처리 중 오류가 발생했습니다. (Supabase RPC 설정 필요)\n에러: " + error.message);
      } else {
        alert("회원 탈퇴가 완료되었습니다. 그동안 이용해 주셔서 감사합니다.");
        await supabase.auth.signOut();
        router.push('/login');
      }
    }
  };

  const handleDeletePregnancy = async (idToDelete) => {
    if(window.confirm('⚠️ 정말 이 다이어리를 완전히 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 포함된 모든 사진과 일기가 즉시 영구 삭제됩니다!')) {
      const { data: diariesToDelete } = await supabase.from('diaries').select('id').eq('pregnancy_id', idToDelete);
      if (diariesToDelete && diariesToDelete.length > 0) {
        const diaryIds = diariesToDelete.map(d => d.id);
        await supabase.from('post_its').delete().in('diary_id', diaryIds);
      }
      await supabase.from('diaries').delete().eq('pregnancy_id', idToDelete);
      await supabase.from('schedules').delete().eq('pregnancy_id', idToDelete);

      const { error } = await supabase.from('pregnancies').delete().eq('id', idToDelete);
      if (error) { alert('삭제 실패: ' + error.message); return; }
      alert('다이어리가 영구 삭제되었습니다.');
      
      const { data: updatedPregnancies } = await supabase.from('pregnancies').select('*').eq('couple_id', coupleId).order('created_at', { ascending: false });
      setAllPregnancies(updatedPregnancies || []);
      
      if (pregnancyId === idToDelete) {
        if (updatedPregnancies && updatedPregnancies.length > 0) {
          const nextP = updatedPregnancies[0];
          setPregnancyId(nextP.id);
          setBabyName(nextP.baby_name);
          setDueDate(nextP.due_date);
        } else {
          // If 0 left, create a default one
          const { data: newP } = await supabase.from('pregnancies').insert({ couple_id: coupleId, status: 'active' }).select().single();
          setPregnancyId(newP.id);
          setBabyName(null);
          setDueDate(null);
          setAllPregnancies([newP]);
        }
      }
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--text-secondary)' }}>앱을 준비 중입니다...</div>;

  return (
    <main className="main-content" style={{ position: 'relative' }}>
      
      {/* Top Navigation Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingTop: '10px' }}>
        {/* Left Side: Settings & Help */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <button 
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px' }}
            title="설정"
          >
            ⚙️
          </button>
          <button 
            onClick={() => { setTutorialStep(0); setShowTutorial(true); }}
            style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--text-secondary)', padding: '5px' }}
            title="도움말 (튜토리얼 보기)"
          >
            ❔
          </button>
          {/* Settings Dropdown */}
          {isSettingsOpen && (
            <div style={{ position: 'absolute', top: '100%', left: '0', backgroundColor: 'white', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', border: '1px solid var(--border-color)', minWidth: '160px', zIndex: 100, padding: '5px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '10px', fontSize: '0.9rem', color: 'var(--text-primary)', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
                설정 메뉴
              </div>
              
              {/* Theme Selector */}
              <div style={{ padding: '10px 10px 5px 10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>🎨 테마 색상</div>
              <div style={{ padding: '0 10px 10px 10px', display: 'flex', flexWrap: 'wrap', gap: '6px', borderBottom: '1px solid #eee' }}>
                {themes.map(t => (
                  <button 
                    key={t.name}
                    onClick={() => changeTheme(t.class)}
                    style={{ 
                      width: '24px', height: '24px', borderRadius: '12px', border: currentTheme === t.class ? '2px solid var(--text-primary)' : '1px solid #ddd',
                      backgroundColor: t.class === '' ? '#E8DEFF' : 
                                       t.class === 'theme-beige' ? '#f7f3e8' : 
                                       t.class === 'theme-pink' ? '#fff0f5' : 
                                       t.class === 'theme-orange' ? '#fff8eb' : 
                                       t.class === 'theme-yellow' ? '#fffde7' : 
                                       t.class === 'theme-blue' ? '#f0f4f8' : 
                                       t.class === 'theme-red' ? '#fcf0ee' : 
                                       t.class === 'theme-white' ? '#ffffff' : '#2c2c2c',
                      cursor: 'pointer'
                    }}
                    title={t.name}
                  />
                ))}
              </div>

              {/* Baby Info Edit */}
              {currentUserRole === 'mother' && (
                <button 
                  onClick={() => {
                    setTempBabyName(babyName || "");
                    setTempDueDate(dueDate || "");
                    setIsSettingsOpen(false);
                    setIsBabyInfoModalOpen(true);
                  }}
                  style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid #eee' }} 
                >
                  👶 아기 정보 (태명/예정일) 수정
                </button>
              )}

              {/* PDF Export Moved Below */}

              {/* Archive Viewer */}
              {allPregnancies.length > 1 && (
                <button 
                  onClick={() => {
                    setIsSettingsOpen(false);
                    setIsArchiveModalOpen(true);
                  }}
                  style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid #eee' }} 
                >
                  🗂️ 다이어리 기록 선택 (보관함)
                </button>
              )}

              {/* Start New Journey */}
              {currentUserRole === 'mother' && (
                <button 
                  onClick={() => {
                    setTempBabyName("");
                    setTempDueDate("");
                    setIsSettingsOpen(false);
                    setIsNewJourneyModalOpen(true);
                  }}
                  style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid #eee' }} 
                >
                  🌱 새로운 다이어리 시작
                </button>
              )}

              {/* Disconnect Account */}
              <button 
                onClick={handleDisconnect}
                style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid #eee' }} 
              >
                🔗 배우자 계정 연결 해제
              </button>

              {/* PDF Export */}
              <button 
                onClick={() => {
                  setIsSettingsOpen(false);
                  if (currentUserRole === 'mother') {
                    setIsExportModalOpen(true);
                  } else {
                    handleExportAll(false);
                  }
                }}
                style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'left', fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer', borderBottom: '1px solid #eee' }} 
              >
                📚 전체 일기장 PDF로 내려받기
              </button>

              <button 
                onClick={async () => {
                  if(window.confirm('정말 로그아웃 하시겠습니까?')) {
                    await supabase.auth.signOut(); 
                    router.push('/login'); 
                  }
                }}
                style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'left', fontSize: '0.85rem', color: '#d48f87', cursor: 'pointer', fontWeight: 'bold', marginTop: '5px' }} 
              >
                나가기 (로그아웃)
              </button>

              {/* Delete Account */}
              <button 
                onClick={handleDeleteAccount}
                style={{ background: 'none', border: 'none', padding: '10px', textAlign: 'left', fontSize: '0.8rem', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }} 
              >
                회원 탈퇴
              </button>
            </div>
          )}
        </div>

        {/* Invite Code Badge (Mother Only) */}
        {currentUserRole === 'mother' && inviteCode && (
          <div style={{ backgroundColor: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            초대코드: <strong style={{ color: 'var(--text-primary)' }}>{inviteCode}</strong>
          </div>
        )}
        {currentUserRole === 'partner' && (
          <div style={{ backgroundColor: 'white', padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', color: '#5c5227', border: '1px solid var(--border-color)', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
            아빠 계정
          </div>
        )}
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => setCurrentMonth(m => m === 1 ? 12 : m - 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>&lt;</button>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--text-primary)', fontWeight: 'normal', margin: 0 }}>
            {currentYear}년 {currentMonth}월
          </h1>
          <button onClick={() => setCurrentMonth(m => m === 12 ? 1 : m + 1)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: 'var(--text-secondary)' }}>&gt;</button>
        </div>
        <p style={{ color: currentUserRole === 'mother' ? 'var(--accent-color)' : '#5c5227', marginTop: '5px', fontSize: '0.9rem' }}>
          {dueDate ? (() => {
            const due = new Date(dueDate);
            due.setHours(0,0,0,0);
            const today = new Date();
            today.setHours(0,0,0,0);
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            
            const name = babyName || '우리 아기';
            
            if (diffDays > 280) return "임신 준비 중";
            if (diffDays < 0) return "출산 완료 🎉";
            if (diffDays === 0) return `${name} 만나는 날! 🎉`;
            return `${name}(이) 만나기까지 D-${diffDays}`;
          })() : "예정일을 입력해주세요"}
        </p>
      </div>
      
      {/* Calendar Grid */}
      <div style={{
        backgroundColor: 'var(--card-bg)',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border-color)',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: '10px' }}>
          {days.map(day => (
            <span key={day} style={{ fontSize: '0.8rem', color: day === '일' ? '#d48f87' : 'var(--text-secondary)' }}>{day}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
          {emptyDays.map(empty => <div key={`empty-${empty}`} />)}
          {dates.map(date => {
            const isSelected = date === selectedDate;
            const isDueDate = dueDate && new Date(dueDate).getFullYear() === currentYear && new Date(dueDate).getMonth() + 1 === currentMonth && new Date(dueDate).getDate() === date;
            const isToday = currentYear === today.getFullYear() && currentMonth === today.getMonth() + 1 && date === today.getDate();
            const hasPrivD = hasPrivateDiary.includes(date);
            const hasPubD = hasPublicDiary.includes(date);
            const hasS = hasSchedule.includes(date);
            
            // Partner cannot see private diary indicator
            const showDiaryDot = (currentUserRole === 'mother' && (hasPrivD || hasPubD)) || (currentUserRole === 'partner' && hasPubD);
            const showScheduleDot = hasS;

            return (
              <div 
                key={date} 
                onClick={() => setSelectedDate(date)}
                style={{
                  aspectRatio: '1',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: isSelected ? (currentUserRole === 'mother' ? 'var(--accent-color)' : '#a39763') : (isDueDate ? '#fff0f5' : 'transparent'),
                  color: isSelected ? 'white' : (isToday ? 'var(--text-primary)' : 'var(--text-primary)'),
                  borderRadius: '8px',
                  cursor: 'pointer',
                  position: 'relative',
                  border: isToday && !isSelected ? '1px solid var(--accent-color)' : (isDueDate && !isSelected ? '1px dashed var(--accent-color)' : 'none')
                }}
              >
                <span style={{ fontSize: '0.9rem', fontWeight: isToday ? 'bold' : 'normal' }}>{date}</span>
                {isToday && <span style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '0.55rem', color: isSelected ? 'rgba(255,255,255,0.9)' : 'var(--accent-color)', fontWeight: 'bold' }}>오늘</span>}
                {isDueDate && <span style={{ position: 'absolute', top: '2px', right: '2px', fontSize: '0.6rem' }}>👼</span>}
                <div style={{ position: 'absolute', bottom: '4px', display: 'flex', gap: '2px' }}>
                  {showDiaryDot && <div style={{ width: '4px', height: '4px', backgroundColor: isSelected ? 'white' : 'var(--text-secondary)', borderRadius: '50%' }} />}
                  {showScheduleDot && <div style={{ width: '4px', height: '4px', backgroundColor: isSelected ? 'white' : (currentUserRole === 'mother' ? 'var(--accent-color)' : '#a39763'), borderRadius: '50%' }} />}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {(() => {
        const isSelectedDueDate = dueDate && new Date(dueDate).getFullYear() === currentYear && new Date(dueDate).getMonth() + 1 === currentMonth && new Date(dueDate).getDate() === selectedDate;
        return (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h2 style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>{currentMonth}월 {selectedDate}일의 기록</h2>
              {currentUserRole === 'mother' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    onClick={() => {
                      setScheduleTitle(selectedDaySchedule ? selectedDaySchedule.title : "");
                      setScheduleTime(selectedDaySchedule ? (selectedDaySchedule.time || "") : "");
                      setScheduleDate(selectedDaySchedule ? selectedDaySchedule.date : `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`);
                      setIsScheduleModalOpen(true);
                    }}
                    style={{ width: '32px', height: '32px', borderRadius: '16px', border: 'none', backgroundColor: 'var(--accent-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', fontSize: '1.2rem', paddingBottom: '2px' }}
                    title="일정 추가"
                  >
                    📅
                  </button>
                  <button 
                    onClick={() => setIsWriteModalOpen(true)}
                    style={{ width: '32px', height: '32px', borderRadius: '16px', border: 'none', backgroundColor: 'var(--text-primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)', fontSize: '1rem' }}
                    title={selectedDayDiary ? "일기 수정" : "일기 쓰기"}
                  >
                    ✏️
                  </button>
                </div>
              )}
            </div>
            
            {selectedDayDiary || selectedDaySchedule || selectedDayPostIt || isSelectedDueDate || currentUserRole === 'partner' ? (
              <>
                {isSelectedDueDate && (
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    padding: '15px',
                    borderRadius: '12px',
                    borderLeft: '4px solid #ffb6c1',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>👼</span>
                    <div>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>우리아기 출산 예정일</p>
                    </div>
                  </div>
                )}

                {selectedDaySchedule && (
                  <div 
                    onClick={() => {
                      if (currentUserRole === 'mother') {
                        setScheduleTitle(selectedDaySchedule.title);
                        setScheduleTime(selectedDaySchedule.time || "");
                        setScheduleDate(selectedDaySchedule.date);
                        setIsScheduleModalOpen(true);
                      }
                    }}
                    style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.4)',
                    padding: '15px',
                    borderRadius: '12px',
                    borderLeft: currentUserRole === 'mother' ? '4px solid var(--accent-color)' : '4px solid #a39763',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    cursor: currentUserRole === 'mother' ? 'pointer' : 'default'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>🗓️</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)' }}>{selectedDaySchedule.title}</p>
                      {selectedDaySchedule.time && <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{formatTime(selectedDaySchedule.time)}</p>}
                    </div>
                    {currentUserRole === 'mother' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(); }} 
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c96b63', fontSize: '1.2rem', padding: '5px' }} 
                        title="일정 삭제"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                )}

                {(() => {
                  const hasPublic = selectedDayDiary && (selectedDayDiary?.content || selectedDayDiary?.image_url || (selectedDayDiary?.badges && selectedDayDiary?.badges.length > 0));
                  const hasPrivate = selectedDayDiary && selectedDayDiary?.private_content && currentUserRole === 'mother';
                  const hasPostItUI = currentUserRole === 'partner' || selectedDayPostIt;
                  
                  if (!hasPublic && !hasPrivate && !hasPostItUI) return null;
                  
                  return (
                  <div style={{
                    backgroundColor: 'var(--card-bg)',
                    padding: '20px',
                    borderRadius: '12px',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border-color)',
              marginBottom: '20px'
            }}>
              {/* Public Area Header */}
              {((selectedDayDiary?.content || selectedDayDiary?.image_url || (selectedDayDiary?.badges && selectedDayDiary?.badges.length > 0))) && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
                  {currentUserRole === 'mother' && (
                    <button onClick={handleDeletePublicDiary} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c96b63', fontSize: '0.85rem' }} title="공개 기록 지우기">
                      🗑️ 지우기
                    </button>
                  )}
                </div>
              )}

              {/* Mood Badges */}
              {selectedDayDiary?.badges && selectedDayDiary?.badges.length > 0 && (
                <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {selectedDayDiary.badges.map(badge => (
                    <span key={badge} style={{ fontSize: '0.8rem', backgroundColor: '#f0f0f0', padding: '4px 10px', borderRadius: '15px', color: 'var(--text-secondary)' }}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {selectedDayDiary?.content && (
                <p style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap', marginBottom: selectedDayDiary?.image_url ? '15px' : '0' }}>
                  {selectedDayDiary.content}
                </p>
              )}

              {/* Photo Area */}
              {selectedDayDiary?.image_url && (
                <div style={{ 
                  width: '100%', 
                  position: 'relative', 
                  borderRadius: '8px', 
                  overflow: 'hidden',
                  marginBottom: '15px',
                  backgroundColor: 'var(--bg-color)',
                  display: 'flex',
                  justifyContent: 'center'
                }}>
                  <img src={selectedDayDiary.image_url} alt="첨부 사진" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
              )}

              {/* Private Content */}
              {selectedDayDiary?.private_content && currentUserRole === 'mother' && (
                <div style={{ marginTop: (selectedDayDiary?.content || (selectedDayDiary?.badges && selectedDayDiary?.badges.length > 0)) ? '20px' : '0', paddingTop: (selectedDayDiary?.content || (selectedDayDiary?.badges && selectedDayDiary?.badges.length > 0)) ? '20px' : '0', borderTop: (selectedDayDiary?.content || (selectedDayDiary?.badges && selectedDayDiary?.badges.length > 0)) ? '1px dashed var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '0.85rem' }}>🔒</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>나만의 비밀 일기</span>
                    </div>
                    <button onClick={handleDeletePrivateDiary} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c96b63', fontSize: '0.85rem' }} title="비밀 일기 지우기">
                      🗑️ 지우기
                    </button>
                  </div>
                  <p style={{ lineHeight: '1.6', fontSize: '0.95rem', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                    {selectedDayDiary.private_content}
                  </p>
                </div>
              )}

              {/* Partner's Post-it Note or Input */}
              {hasPostItUI && (
                <div style={{
                  marginTop: '20px',
                  backgroundColor: '#fff7d6',
                  padding: '15px',
                  borderRadius: '2px 12px 12px 12px',
                  boxShadow: '2px 2px 5px rgba(0,0,0,0.05)',
                  position: 'relative',
                  borderLeft: '3px solid #ffde59'
                }}>
                  <span style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '1.2rem' }}>📌</span>
                  {selectedDayPostIt && !isEditingPostIt ? (
                    <>
                      {currentUserRole === 'partner' && (
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginBottom: '5px' }}>
                          <button 
                            onClick={handleDeletePostIt}
                            style={{ fontSize: '0.75rem', color: '#c96b63', background: 'none', border: 'none', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}
                          >
                            삭제
                          </button>
                          <button 
                            onClick={() => {
                              setPostItContent(selectedDayPostIt.content);
                              setIsEditingPostIt(true);
                            }}
                            style={{ fontSize: '0.75rem', color: '#a39763', background: 'none', border: 'none', cursor: 'pointer', padding: '0', textDecoration: 'underline' }}
                          >
                            수정
                          </button>
                        </div>
                      )}
                      <p style={{ fontSize: '0.85rem', color: '#5c5227', fontStyle: 'italic', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                        "{selectedDayPostIt.content}"
                      </p>
                    </>
                  ) : (
                    currentUserRole === 'partner' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <textarea 
                          value={postItContent}
                          onChange={(e) => setPostItContent(e.target.value)}
                          placeholder="쪽지로 마음을 남길수 있어요!" 
                          style={{ width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', resize: 'none', fontSize: '0.85rem', color: '#5c5227', fontStyle: 'italic', fontFamily: 'inherit' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          {isEditingPostIt && (
                            <button onClick={() => setIsEditingPostIt(false)} style={{ fontSize: '0.75rem', backgroundColor: 'transparent', color: '#a39763', border: '1px solid #a39763', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer' }}>취소</button>
                          )}
                          <button onClick={handleSavePostIt} style={{ fontSize: '0.75rem', backgroundColor: '#a39763', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer' }}>
                            {isEditingPostIt ? '수정하기' : '남기기'}
                          </button>
                        </div>
                      </div>
                    ) : null
                  )}
                </div>
              )}
            </div>
                  );
                })()}
        </>
      ) : (
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '30px 0' }}>이 날은 기록된 내용이 없습니다.</p>
      )}
      </>
    );
  })()}

      {/* Write Modal Overlay (Mother ONLY) */}
      {isWriteModalOpen && currentUserRole === 'mother' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end'
        }}>
          <div style={{
            width: '100%', maxWidth: '480px', height: '85vh',
            backgroundColor: 'var(--card-bg)', borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
            display: 'flex', flexDirection: 'column',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', overflow: 'hidden'
          }}>
            
            {/* Sticky Header */}
            <div style={{ padding: '20px 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>일기 쓰기</span>
              <span onClick={() => setIsWriteModalOpen(false)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>×</span>
            </div>

            {/* Scrollable Body */}
            <div style={{ padding: '0 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
              
              {/* Modal Actions */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap', flexShrink: 0 }}>
                 <button 
                   onClick={() => setShowBadgeSelector(!showBadgeSelector)}
                   style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '15px', border: '1px solid var(--border-color)', backgroundColor: 'white', cursor: 'pointer' }}>
                   + 기분 뱃지 추가
                 </button>
                 <button 
                   onClick={() => setShowPrivateContentInput(!showPrivateContentInput)}
                   style={{ fontSize: '0.85rem', padding: '6px 12px', borderRadius: '15px', border: showPrivateContentInput ? '1px solid var(--text-primary)' : '1px solid var(--border-color)', backgroundColor: showPrivateContentInput ? '#f0f0f0' : 'white', cursor: 'pointer', color: 'var(--text-primary)' }}>
                   🔒 비밀 일기 추가
                 </button>
              </div>

              {/* Badge Selector Popup (No nested scrollbar, let it expand) */}
              {showBadgeSelector && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: '10px', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                  {[
                    '😊 컨디션 최고!', '😢 감정 기복이 심해요', '😠 예민해요', '🥱 무기력해요', '😪 눕고만 싶어요', '😵 어지러워요/빈혈',
                    '🤢 입덧으로 고생 중', '😴 잠이 쏟아져요', '👀 불면증이에요', 
                    '🦶 다리가 붓고 무거워요', '🤕 허리/골반이 아파요', '🚽 화장실 자주 가요', '🤰 배가 뭉쳐요',
                    '🍓 상큼한 게 땡겨요', '🍎 과일이 땡겨요', '🌶️ 매운 게 땡겨요', '🍰 달달한 게 땡겨요', '🍖 고기가 땡겨요', '🍕 기름진/밀가루 땡겨요', '🍚 밥맛이 없어요',
                    '👶 태동이 느껴져요', '👣 역사적인 첫 태동!', '🩺 병원 다녀온 날', '💉 초음파/검사 한 날',
                    '💊 영양제 챙겨 먹음', '🏃‍♀️ 가볍게 산책했어요', '🧘‍♀️ 임산부 요가/스트레칭', '🛍️ 아기 용품 샀어요', '🍼 태교 동화/음악'
                  ].map(badge => (
                    <span 
                      key={badge} 
                      onClick={() => {
                        if (!selectedBadges.includes(badge)) {
                          setSelectedBadges([...selectedBadges, badge]);
                        }
                        setShowBadgeSelector(false);
                      }}
                      style={{ fontSize: '0.8rem', backgroundColor: 'white', padding: '6px 12px', borderRadius: '15px', cursor: 'pointer', border: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>
                      {badge}
                    </span>
                  ))}
                </div>
              )}

              {/* Selected Badges Area */}
              {selectedBadges.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '15px', flexShrink: 0 }}>
                  {selectedBadges.map(badge => (
                    <span key={badge} style={{ fontSize: '0.8rem', backgroundColor: 'var(--accent-color)', color: 'white', padding: '4px 10px', borderRadius: '15px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {badge}
                      <span style={{ cursor: 'pointer', fontSize: '0.9rem' }} onClick={() => setSelectedBadges(selectedBadges.filter(b => b !== badge))}>×</span>
                    </span>
                  ))}
                </div>
              )}

              <textarea 
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                style={{ 
                  width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', resize: 'vertical', 
                  fontSize: '1.05rem', color: 'var(--text-primary)', fontFamily: 'inherit', minHeight: '160px',
                  lineHeight: '32px', padding: '0 5px', flexShrink: 0,
                  backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--border-color) 31px, var(--border-color) 32px)',
                  backgroundAttachment: 'local'
                }}
              />
              
              {showPrivateContentInput && (
                <div style={{ marginTop: '10px', paddingTop: '15px', borderTop: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', width: '100%', flexShrink: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '0.85rem' }}>🔒</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>나만의 비밀 이야기</span>
                  </div>
                  <textarea 
                    value={privateContent}
                    onChange={(e) => setPrivateContent(e.target.value)}
                    placeholder="아빠에겐 보이지 않는 비밀 이야기를 적어보세요"
                    style={{ 
                      width: '100%', backgroundColor: 'transparent', border: 'none', outline: 'none', resize: 'vertical', 
                      fontSize: '1.05rem', color: 'var(--text-primary)', fontFamily: 'inherit', minHeight: '128px',
                      lineHeight: '32px', padding: '0 5px',
                      backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, var(--border-color) 31px, var(--border-color) 32px)',
                      backgroundAttachment: 'local'
                    }}
                  />
                </div>
              )}

              {/* Image Preview Area */}
              {attachedImage && (
                <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', marginTop: '15px', marginBottom: '10px', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  <img src={attachedImage} alt="미리보기" style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain', borderRadius: '8px' }} />
                  <button 
                    onClick={() => setAttachedImage(null)}
                    style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* Sticky Footer for Actions */}
            <div style={{ padding: '15px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--card-bg)', flexShrink: 0, display: 'flex', gap: '5px' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                ref={fileInputRef}
                style={{ display: 'none' }} 
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: '#e0dcd3', cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '0.9rem' }}
              >
                {isUploading ? '업로드 중...' : (attachedImage ? '사진 변경' : '사진 첨부')}
              </button>
              <button 
                onClick={handleSaveDiary} 
                disabled={isUploading}
                style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--accent-color)', color: 'white', cursor: isUploading ? 'not-allowed' : 'pointer', opacity: isUploading ? 0.7 : 1, fontSize: '0.9rem', fontWeight: 'bold' }}>
                {selectedDayDiary ? "수정하기" : "저장하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Modal Overlay (Mother ONLY) */}
      {isScheduleModalOpen && currentUserRole === 'mother' && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'flex-end'
        }}>
          <div style={{
            width: '100%', maxWidth: '480px', backgroundColor: 'var(--card-bg)', 
            maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
            borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
          }}>
            <div style={{ padding: '20px 20px 10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>일정 추가</span>
              <span onClick={() => setIsScheduleModalOpen(false)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>×</span>
            </div>
            
            <div style={{ padding: '0 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input type="text" value={scheduleTitle} onChange={(e) => setScheduleTitle(e.target.value)} placeholder="어떤 일정인가요?" style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }} />
              <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                <input type="date" value={scheduleDate || `${currentYear}-${String(currentMonth).padStart(2, '0')}-${String(selectedDate).padStart(2, '0')}`} onChange={(e) => setScheduleDate(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>
              <div style={{ width: '100%', marginTop: '5px' }}>
                <select value={scheduleAlarmMinutes} onChange={(e) => setScheduleAlarmMinutes(parseInt(e.target.value))} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.95rem', fontFamily: 'inherit', color: 'var(--text-primary)', backgroundColor: 'white' }}>
                  <option value={0}>알람 안 함</option>
                  <option value={0} disabled>---</option>
                  <option value={5}>5분 전 알람</option>
                  <option value={10}>10분 전 알람</option>
                  <option value={15}>15분 전 알람</option>
                  <option value={30}>30분 전 알람</option>
                  <option value={60}>1시간 전 알람</option>
                </select>
              </div>
            </div>

            <div style={{ padding: '15px 20px', display: 'flex', gap: '10px', flexShrink: 0, backgroundColor: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={handleSaveSchedule} style={{ flex: 1, padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--text-primary)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                {selectedDaySchedule ? "수정하기" : "등록하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tutorial Modal */}
      {showTutorial && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 9999,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            width: '100%', maxWidth: '340px', backgroundColor: 'var(--card-bg)',
            borderRadius: '20px', padding: '30px 20px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
            boxShadow: 'var(--shadow-md)'
          }}>
            {currentUserRole === 'mother' ? (
              <>
                {tutorialStep === 0 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>우리의 열달에 오신 것을 환영합니다!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      아빠와 엄마가 함께 아기를 기다리며<br/>추억을 기록하는 공간입니다.
                    </p>
                  </>
                )}
                {tutorialStep === 1 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💌</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>일기로 전하는 진심</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      남편에게 먹고 싶은 음식을 넌지시 말해보거나, 평소 직접 하지 못했던 말들을 일기의 형식을 빌려 전해보세요.
                    </p>
                  </>
                )}
                {tutorialStep === 2 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>✏️</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>기록 남기기</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      우측 하단의 글쓰기 버튼을 눌러 오늘의 기분을 뱃지로 선택하고, 간직하고 싶은 사진과 일기를 남겨보세요.
                    </p>
                  </>
                )}
                {tutorialStep === 3 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🤫</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>나만의 일기</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      가끔 혼자만 간직하고 싶은 감정이 있나요?<br/>글 작성 시 '나만의 일기'를 선택하면 아빠에겐 보이지 않는 비밀글이 됩니다.
                    </p>
                  </>
                )}
                {tutorialStep === 4 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎨</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>내 취향대로 꾸미기</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      우측 상단의 ⚙️ 설정 아이콘을 눌러<br/>언제든 예쁜 테마 색상으로 다이어리를 꾸밀 수 있어요!
                    </p>
                  </>
                )}
                {tutorialStep === 5 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🌱</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>새로운 다이어리 쓰기</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      새로운 다이어리를 작성하고 싶을 때, 설정에서 백지 상태의 새 다이어리를 시작해 보세요.<br/>이전 기록은 '다이어리 보관함'에 안전하게 남으며, 원하실 때 언제든 열람하거나 삭제할 수 있습니다.
                    </p>
                  </>
                )}
                {tutorialStep === 6 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔗</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>배우자 연결 관리</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      필요할 때 설정에서 언제든 파트너와의 계정 연결을 해제할 수 있어요. 연결을 끊어도 나중에 초대 코드로 다시 이어질 수 있답니다.
                    </p>
                  </>
                )}
              </>
            ) : (
              <>
                {tutorialStep === 0 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🎉</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>우리의 열달에 오신 것을 환영합니다!</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      아빠와 엄마가 함께 아기를 기다리며<br/>추억을 기록하는 공간입니다.
                    </p>
                  </>
                )}
                {tutorialStep === 1 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📅</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>기록 확인하기</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      엄마가 남긴 소중한 일기와 사진,<br/>그리고 캘린더의 일정들을 함께 확인할 수 있어요.
                    </p>
                  </>
                )}
                {tutorialStep === 2 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>💛</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>응원의 포스트잇</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      엄마가 남긴 일기를 읽고, 그 아래에<br/>따뜻한 메모(포스트잇)를 남겨 마음을 전해보세요.
                    </p>
                  </>
                )}
                {tutorialStep === 3 && (
                  <>
                    <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🔗</div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-primary)' }}>배우자 연결 관리</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '30px' }}>
                      설정 메뉴에서 언제든 아내와의 연결을 해제할 수 있어요. 해제하더라도 다시 초대 코드를 입력하면 언제든 돌아올 수 있습니다.
                    </p>
                  </>
                )}
              </>
            )}
            
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[...Array(currentUserRole === 'mother' ? 7 : 4).keys()].map((step) => (
                <div key={step} onClick={() => setTutorialStep(step)} style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: tutorialStep === step ? 'var(--accent-color)' : 'var(--border-color)',
                  transition: 'background-color 0.3s',
                  cursor: 'pointer'
                }} />
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              {tutorialStep > 0 && (
                <button 
                  onClick={() => setTutorialStep(tutorialStep - 1)}
                  style={{
                    flex: 1, padding: '14px', borderRadius: '10px',
                    backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)',
                    fontWeight: 'bold', border: '1px solid var(--border-color)', cursor: 'pointer', fontSize: '1rem'
                  }}
                >
                  이전
                </button>
              )}
              <button 
                onClick={async () => {
                  const totalSteps = currentUserRole === 'mother' ? 7 : 4;
                  if (tutorialStep < totalSteps - 1) {
                    setTutorialStep(tutorialStep + 1);
                  } else {
                    // Save tutorial state securely to Supabase user_metadata
                    await supabase.auth.updateUser({ data: { tutorial_seen: true } });
                    setShowTutorial(false);
                  }
                }}
                style={{
                  flex: tutorialStep > 0 ? 2 : 1, padding: '14px', borderRadius: '10px',
                  backgroundColor: 'var(--text-primary)', color: 'white',
                  fontWeight: 'bold', border: 'none', cursor: 'pointer', fontSize: '1rem'
                }}
              >
                {tutorialStep < (currentUserRole === 'mother' ? 6 : 3) ? "다음" : "다이어리 시작하기"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Baby Info Modal */}
      {isBabyInfoModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            width: '90%', maxWidth: '340px', backgroundColor: 'var(--card-bg)', 
            borderRadius: '20px', padding: '25px', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>아기 정보 수정</span>
              <span onClick={() => setIsBabyInfoModalOpen(false)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>×</span>
            </div>
            
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>우리 아기 태명 (선택)</label>
            <input type="text" value={tempBabyName} onChange={(e) => setTempBabyName(e.target.value)} placeholder="태명을 입력하세요" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '15px', fontSize: '1rem', fontFamily: 'inherit' }} />
            
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>출산 예정일</label>
            <input type="date" value={tempDueDate} onChange={(e) => setTempDueDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '25px', fontSize: '1rem', fontFamily: 'inherit' }} />
            
            <button onClick={handleSaveBabyInfo} style={{ padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              저장하기
            </button>
          </div>
        </div>
      )}

      {/* New Journey Modal */}
      {isNewJourneyModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            width: '90%', maxWidth: '340px', backgroundColor: 'var(--card-bg)', 
            borderRadius: '20px', padding: '25px', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-md)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>새로운 다이어리 시작 🌱</span>
              <span onClick={() => setIsNewJourneyModalOpen(false)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>×</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
              기존 다이어리는 보관함으로 이동하고, 백지 상태의 새로운 다이어리를 시작합니다.
            </p>
            
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>새로운 태명 (선택)</label>
            <input type="text" value={tempBabyName} onChange={(e) => setTempBabyName(e.target.value)} placeholder="새로운 태명을 입력하세요" style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '15px', fontSize: '1rem', fontFamily: 'inherit' }} />
            
            <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>출산 예정일 (필수)</label>
            <input type="date" value={tempDueDate} onChange={(e) => setTempDueDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '25px', fontSize: '1rem', fontFamily: 'inherit' }} />
            
            <button onClick={handleStartNewJourney} style={{ padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
              새로운 다이어리 시작하기
            </button>
          </div>
        </div>
      )}

      {/* Archive Modal */}
      {isArchiveModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            width: '90%', maxWidth: '340px', backgroundColor: 'var(--card-bg)', 
            borderRadius: '20px', padding: '25px', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-md)', maxHeight: '80vh', overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>다이어리 기록 선택</span>
              <span onClick={() => setIsArchiveModalOpen(false)} style={{ fontSize: '1.5rem', cursor: 'pointer' }}>×</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {allPregnancies.map((p, index) => (
                <div 
                  key={p.id}
                  onClick={() => {
                    setPregnancyId(p.id);
                    setBabyName(p.baby_name);
                    setDueDate(p.due_date);
                    setIsArchiveModalOpen(false);
                  }}
                  style={{ 
                    padding: '15px', 
                    borderRadius: '10px', 
                    border: p.id === pregnancyId ? '2px solid var(--accent-color)' : '1px solid var(--border-color)', 
                    backgroundColor: p.id === pregnancyId ? '#FAF7F2' : 'transparent',
                    cursor: 'pointer' 
                  }}
                >
                  <div style={{ fontWeight: 'bold', color: 'var(--text-primary)', marginBottom: '5px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      {p.baby_name ? `${p.baby_name}의 다이어리` : `다이어리 기록 #${allPregnancies.length - index}`}
                      {p.id === pregnancyId && <span style={{ marginLeft: '10px', fontSize: '0.75rem', border: '1px solid var(--text-primary)', color: 'var(--text-primary)', padding: '1px 5px', borderRadius: '10px', fontWeight: 'normal' }}>열람 중</span>}
                    </div>
                    {currentUserRole === 'mother' && (
                      <span 
                        onClick={(e) => { e.stopPropagation(); handleDeletePregnancy(p.id); }}
                        style={{ fontSize: '1rem', color: '#d48f87', padding: '5px' }}
                        title="삭제"
                      >🗑️</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                    예정일: {p.due_date ? new Date(p.due_date).toLocaleDateString() : '미정'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '5px' }}>
                    생성일: {new Date(p.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal (Mother Only) */}
      {isExportModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
          <div style={{
            width: '90%', maxWidth: '340px', backgroundColor: 'var(--card-bg)', 
            borderRadius: '20px', padding: '25px', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-md)'
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '15px', color: 'var(--text-primary)', textAlign: 'center' }}>PDF 다운로드 옵션</h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '25px', textAlign: 'center', lineHeight: '1.5' }}>
              엄마만의 비밀 일기(🔒)를<br/>PDF에 포함하시겠습니까?
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button onClick={() => handleExportAll(true)} style={{ padding: '15px', borderRadius: '10px', border: 'none', backgroundColor: 'var(--accent-color)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                네, 포함할래요
              </button>
              <button onClick={() => handleExportAll(false)} style={{ padding: '15px', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'transparent', color: 'var(--text-primary)', cursor: 'pointer', fontWeight: 'bold' }}>
                아니요, 비밀글은 뺄래요
              </button>
              <button onClick={() => setIsExportModalOpen(false)} style={{ padding: '10px', marginTop: '5px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable View for PDF Export */}
      {isExporting && (
        <div className="printable-diary-export" style={{ position: 'absolute', top: 0, left: 0, width: '100%', minHeight: '100vh', backgroundColor: 'var(--bg-color)', zIndex: 99999, padding: '0', boxSizing: 'border-box', color: 'var(--text-primary)' }}>
          
          {/* Cover Page */}
          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pageBreakAfter: 'always', padding: '40px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', backgroundColor: 'var(--card-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', marginBottom: '30px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
              🤍
            </div>
            <h1 style={{ textAlign: 'center', marginBottom: '15px', color: 'var(--text-primary)', fontSize: '2.5rem', fontWeight: 'bold' }}>우리의 열달 기록</h1>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '0' }}>
              {babyName ? `${babyName}와(과) 함께한 소중한 시간들` : '우리 아기와 함께한 소중한 시간들'}
            </p>
          </div>
          
          {/* Diary Entries */}
          <div style={{ padding: '40px' }}>
            {allDiariesToExport.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '50px' }}>기록된 일기가 없습니다.</p>
            ) : (
              allDiariesToExport.map(diary => {
                const hasVisibleContent = diary.content || (diary.badges && diary.badges.length > 0) || diary.image_url || (currentUserRole === 'mother' && diary.private_content && exportIncludesPrivate) || (diary.post_its && diary.post_its.length > 0);
                if (!hasVisibleContent) return null;
                
                return (
                  <div key={diary.id} style={{ marginBottom: '50px', padding: '40px', backgroundColor: 'var(--card-bg)', borderRadius: '20px', boxShadow: 'var(--shadow-sm)', pageBreakInside: 'avoid', border: '1px solid var(--border-color)' }}>
                    
                    <div style={{ borderBottom: '2px solid var(--bg-color)', paddingBottom: '15px', marginBottom: '20px' }}>
                      <h2 style={{ color: 'var(--text-primary)', margin: '0', fontSize: '1.5rem' }}>{diary.date}</h2>
                    </div>
                    
                    {diary.badges && diary.badges.length > 0 && (
                      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
                        {diary.badges.map(b => <span key={b} style={{ backgroundColor: 'var(--bg-color)', color: 'var(--text-primary)', padding: '8px 15px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>{b}</span>)}
                      </div>
                    )}
                    
                    {diary.content && (
                      <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-primary)', fontSize: '1.05rem', margin: diary.image_url ? '0 0 20px 0' : '0' }}>
                        {diary.content}
                      </p>
                    )}
                    
                    {diary.image_url && (
                      <div style={{ marginBottom: diary.content ? '20px' : '0', borderRadius: '15px', overflow: 'hidden', backgroundColor: 'var(--bg-color)', display: 'flex', justifyContent: 'center' }}>
                        <img src={diary.image_url} style={{ maxWidth: '100%', maxHeight: '500px', objectFit: 'contain' }} />
                      </div>
                    )}
                    
                    {currentUserRole === 'mother' && diary.private_content && exportIncludesPrivate && (
                      <div style={{ marginTop: '20px', padding: '25px', backgroundColor: 'var(--bg-color)', borderRadius: '15px', border: '1px dashed var(--accent-color)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '10px' }}>
                          <span style={{ fontSize: '1.2rem' }}>🔒</span>
                          <strong style={{ color: 'var(--accent-color)', fontSize: '1rem' }}>나만의 비밀 이야기</strong>
                        </div>
                        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-primary)', margin: '0', lineHeight: '1.8' }}>{diary.private_content}</p>
                      </div>
                    )}
                    
                    {diary.post_its && diary.post_its.length > 0 && (
                      <div style={{
                        marginTop: '20px',
                        backgroundColor: '#fff7d6',
                        padding: '15px',
                        borderRadius: '2px 12px 12px 12px',
                        position: 'relative',
                        borderLeft: '3px solid #ffde59'
                      }}>
                        <span style={{ position: 'absolute', top: '-10px', left: '10px', fontSize: '1.2rem' }}>📌</span>
                        <p style={{ fontSize: '0.95rem', color: '#5c5227', fontStyle: 'italic', lineHeight: '1.6', whiteSpace: 'pre-wrap', margin: '10px 0 0 0' }}>
                          "{diary.post_its[0].content}"
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Media query for FAB on mobile */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 480px) {
          div[style*="calc(50% - 210px)"] {
            right: 20px !important;
          }
        }
      `}} />
    </main>
  );
}
