"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("landing"); // landing, login, signup, setup_role
  const [role, setRole] = useState(null); // 'mother' or 'partner'
  const [inviteCode, setInviteCode] = useState("");
  const [babyName, setBabyName] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // Drag to scroll refs and states
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [agreeSensitive, setAgreeSensitive] = useState(false);
  
  // Modal states for Terms and Privacy
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState("");

  const termsOfServiceText = `서비스 이용약관

제1조 목적
본 약관은 우리의 열달 스튜디오가 운영하는 우리의 열달에서 제공하는 산모 일기 작성, 임신 기록 저장, 사진·이미지 업로드, 배우자 또는 게스트 계정 공유, 알림 및 관련 부가서비스의 이용조건과 회사와 회원의 권리·의무 및 책임사항을 정하는 것을 목적으로 합니다.

제2조 용어의 정의
① “서비스”란 회사가 제공하는 산모 일기, 임신 기록 관리, 사진·이미지 저장, 게스트 공유, 알림 등 관련 기능을 말합니다.
② “회원”이란 본 약관에 동의하고 서비스 계정을 생성한 이용자를 말합니다.
③ “게스트”란 회원의 초대 또는 승인에 따라 회원이 허용한 범위 안에서 일기 또는 기록을 열람하거나 댓글 등 제한된 기능을 이용할 수 있는 이용자를 말합니다.
④ “콘텐츠”란 회원이 서비스에 작성·업로드·저장한 일기, 문구, 사진, 초음파 이미지, 검진 관련 메모, 댓글, 파일 등 일체의 자료를 말합니다.
⑤ “민감기록”이란 임신 여부, 임신 주수, 출산예정일, 건강상태, 증상, 검진·진료 관련 기록, 병원 관련 메모, 초음파 이미지 등 건강 또는 사생활과 밀접한 정보를 말합니다.

제3조 약관의 게시 및 변경
① 회사는 본 약관의 내용을 회원이 쉽게 확인할 수 있도록 서비스 초기 화면 또는 연결 화면에 게시합니다.
② 회사는 관련 법령을 위반하지 않는 범위에서 본 약관을 변경할 수 있습니다.
③ 회사가 약관을 변경하는 경우 적용일자와 변경 사유를 명시하여 사전에 공지합니다. 회원에게 불리하거나 중요한 변경인 경우에는 합리적인 기간을 두고 별도로 고지합니다.
④ 회원이 변경 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.

제4조 회원가입 및 계정관리
① 회원가입은 이용자가 본 약관과 개인정보 처리에 관한 사항에 동의하고, 회사가 정한 가입절차를 완료함으로써 성립합니다.
② 회원은 가입 시 정확한 정보를 제공해야 하며, 타인의 정보를 이용하거나 허위 정보를 제공해서는 안 됩니다.
③ 회원은 본인의 계정과 비밀번호를 직접 관리해야 하며, 계정 도용 또는 무단 사용을 알게 된 경우 즉시 회사에 알려야 합니다.
④ 회사는 허위 가입, 타인 명의 사용, 서비스 부정 이용, 법령 또는 약관 위반이 확인되는 경우 이용을 제한하거나 계정을 해지할 수 있습니다.

제5조 서비스의 내용
회사는 다음 각 호의 서비스를 제공합니다.
1. 산모 일기 작성 및 저장 기능
2. 임신 주수, 출산예정일, 컨디션, 증상 등 임신 관련 기록 기능
3. 사진, 초음파 이미지, 검진 관련 메모 등 업로드 및 저장 기능
4. 회원이 지정한 게스트와의 일기 또는 기록 공유 기능
5. 임신 기록 알림, 일정 알림, 서비스 이용 안내 기능
6. 기타 회사가 정하는 부가서비스

제6조 게스트 초대 및 공유 기능
① 회원은 본인이 작성하거나 업로드한 콘텐츠 중 일부 또는 전부를 게스트에게 공유할 수 있습니다.
② 게스트는 회원이 허용한 범위 안에서만 콘텐츠를 열람하거나 제한된 기능을 이용할 수 있습니다.
③ 회원은 언제든지 게스트의 접근권한을 변경하거나 공유를 해제할 수 있습니다.
④ 공유 해제 후 게스트의 신규 접근은 차단됩니다. 다만 게스트가 이미 열람, 저장, 촬영, 캡처 또는 외부 전송한 정보는 회사가 기술적으로 회수할 수 없습니다.
⑤ 회원은 배우자, 가족, 지인 등 게스트에게 민감기록을 공유할 때 그 의미와 위험을 스스로 확인해야 하며, 회사는 회원의 선택에 따른 가족·관계 분쟁에 개입하지 않습니다.
⑥ 게스트는 회원의 동의 없이 콘텐츠를 복제, 저장, 외부 공유, 게시, 전송하거나 제3자에게 공개해서는 안 됩니다.

제7조 콘텐츠의 권리와 이용
① 회원이 작성하거나 업로드한 콘텐츠의 권리는 원칙적으로 회원에게 있습니다.
② 회사는 서비스 제공, 저장, 백업, 동기화, 보안관리, 장애 대응, 고객문의 처리에 필요한 범위에서 콘텐츠를 처리할 수 있습니다.
③ 회사는 회원의 별도 동의 없이 회원의 일기, 사진, 초음파 이미지 등 콘텐츠를 광고, 홍보, 제3자 판매 목적으로 사용하지 않습니다.
④ 회원은 본인이 서비스에 업로드하는 콘텐츠가 타인의 권리, 명예, 사생활, 개인정보를 침해하지 않도록 해야 합니다.

제8조 금지행위
회원 및 게스트는 다음 행위를 해서는 안 됩니다.
1. 타인의 계정 또는 개인정보를 무단으로 이용하는 행위
2. 타인의 임신, 건강, 가족관계, 사생활 정보를 무단으로 게시·공유하는 행위
3. 회원의 동의 없이 콘텐츠를 캡처, 복제, 유포, 판매 또는 공개하는 행위
4. 서비스의 정상 운영을 방해하거나 보안상 위험을 발생시키는 행위
5. 음란, 폭력, 혐오, 명예훼손, 불법정보를 게시하는 행위
6. 관련 법령 또는 본 약관을 위반하는 행위

제9조 의료행위 아님
① 서비스는 일기 작성, 임신 기록 저장, 가족 공유 및 개인 기록 관리를 위한 서비스이며, 의료기관의 진단, 치료, 예방, 상담 또는 응급의료 서비스를 대체하지 않습니다.
② 회원은 건강 이상, 통증, 출혈, 태동 이상, 고위험 임신 의심 등 의학적 판단이 필요한 경우 의료기관 또는 전문의의 진료를 받아야 합니다.
③ 회사가 제공하는 일반 정보 또는 알림은 참고용이며, 개별 회원의 건강상태에 대한 의학적 판단으로 해석되지 않습니다.

제10조 서비스의 변경·중단
① 회사는 운영상, 기술상 필요한 경우 서비스의 전부 또는 일부를 변경하거나 중단할 수 있습니다.
② 회사는 서비스 중단이 예정된 경우 사전에 공지합니다. 다만 장애, 보안사고, 천재지변, 긴급점검 등 부득이한 경우 사후에 공지할 수 있습니다.

제11조 회원탈퇴 및 데이터 삭제
① 회원은 언제든지 서비스 내 기능 또는 고객센터를 통해 탈퇴를 요청할 수 있습니다.
② 회원 탈퇴 시 회사는 관련 법령 또는 내부 분쟁 대응을 위해 필요한 경우를 제외하고 회원의 개인정보와 콘텐츠를 지체 없이 삭제합니다.
③ 회원이 직접 삭제한 일기, 사진, 기록은 복구가 제한될 수 있습니다.
④ 법령상 보존이 필요한 정보는 해당 법령에서 정한 기간 동안 분리 보관 후 파기합니다.

제12조 회사의 책임 제한
① 회사는 관련 법령상 허용되는 범위에서 무료로 제공되는 서비스의 변경, 중단, 장애에 대해 책임을 제한할 수 있습니다.
② 회사는 회원 또는 게스트의 귀책사유로 발생한 계정 도용, 콘텐츠 유출, 가족·관계 분쟁에 대해 책임을 부담하지 않습니다.
③ 단, 회사의 고의 또는 중대한 과실로 인한 손해에 대해서는 관련 법령에 따른 책임을 부담합니다.

제13조 개인정보 보호
회사는 개인정보보호법 등 관련 법령을 준수하며, 개인정보 처리에 관한 구체적인 사항은 별도의 개인정보 처리방침 및 개인정보 수집·이용 동의서에 따릅니다.

제14조 분쟁해결 및 준거법
① 본 약관은 대한민국 법령에 따라 해석됩니다.
② 서비스 이용과 관련하여 분쟁이 발생한 경우 회사와 회원은 성실히 협의하여 해결합니다.
③ 협의가 이루어지지 않는 경우 관할 법원은 민사소송법 등 관련 법령에 따릅니다.

부칙
본 약관은 2026년 6월 14일부터 시행합니다.`;

  const privacyPolicyText = `[필수 개인정보 수집 및 이용 동의]

■ 수집·이용 목적
회원가입, 회원 식별, 계정 관리, 로그인, 서비스 제공, 엄마 계정과 배우자 계정의 연결, 일기 작성·저장, 배우자 계정의 열람 기능 제공, 포스트잇 글 작성 기능 제공, 고객 문의 응대, 부정이용 방지, 서비스 안정성 확보

■ 수집 항목
이메일 주소 또는 휴대전화번호, 비밀번호, 닉네임, 회원식별값, 계정 유형, 연결된 회원 정보, 서비스 이용기록, 접속기록, 기기정보, 앱 버전, 오류·장애 기록

■ 보유·이용 기간
회원 탈퇴 시까지. 단, 관계 법령에 따라 보관이 필요한 정보는 해당 법령에서 정한 기간 동안 보관 후 파기합니다.

■ 동의 거부권 및 불이익
이용자는 개인정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 필수 개인정보 수집·이용에 동의하지 않을 경우 회원가입 및 서비스 이용이 제한될 수 있습니다.`;

  const sensitiveInfoText = `[임신·건강 관련 민감정보 수집 및 이용 동의]

우리의 열달 스튜디오는 '우리의 열달'의 산모 일기 및 임신 기록 관리 기능 제공 과정에서 이용자가 직접 입력하거나 업로드하는 임신·건강 관련 정보를 수집·이용할 수 있습니다. 해당 정보는 건강에 관한 정보 또는 사생활과 밀접한 정보에 해당할 수 있으므로 별도로 동의를 받습니다.

■ 수집·이용 목적
산모 일기 작성·저장, 임신 기록 관리, 임신 주수·출산예정일 기반 기록 정리, 사진·초음파 이미지 저장, 엄마 계정과 배우자 계정의 연결, 배우자 계정의 제한된 열람 기능 제공, 포스트잇 글 작성 기능 제공, 기록 백업 및 복구

■ 수집 항목
임신 여부, 임신 주수, 출산예정일, 건강상태, 증상, 감정·컨디션 기록, 검진·진료 관련 메모, 병원 관련 메모, 태아 관련 기록, 초음파 사진, 검사지·진료 관련 이미지, 이용자가 직접 작성·업로드한 임신·건강 관련 일기 및 파일

■ 배우자 계정 이용 관련 고지
엄마 계정과 배우자 계정이 연결된 경우, 배우자 계정은 서비스가 정한 범위 내에서 엄마 계정의 일기를 열람할 수 있습니다. 단, 엄마 계정이 비밀글로 설정한 일기는 배우자 계정이 열람할 수 없습니다. 배우자 계정은 엄마 계정의 일기 본문을 수정하거나 삭제할 수 없으며, 해당 일기에 포스트잇 형태의 짧은 글만 작성할 수 있습니다.

■ 보유·이용 기간
회원 탈퇴 또는 해당 기록 삭제 시까지. 단, 관계 법령상 보관이 필요한 정보는 해당 기간 동안 분리 보관 후 파기합니다.

■ 동의 거부권 및 불이익
이용자는 임신·건강 관련 민감정보 수집·이용에 동의하지 않을 권리가 있습니다. 다만 동의하지 않을 경우 회원가입이 불가능합니다.`;

  const openModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setShowModal(true);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // User logged in (e.g., via OAuth redirect), check profile
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
        if (profile && profile.couple_id) {
          router.push("/");
        } else {
          if (profile && profile.role) {
            setRole(profile.role);
          }
          setMode("setup_role");
        }
      }
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleOAuthLogin = async (provider) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin + '/login',
      },
    });
    if (error) {
      alert("로그인 실패: " + error.message);
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (mode === "signup" && (!agreeTerms || !agreePrivacy || !agreeSensitive)) {
      alert("모든 필수 약관에 동의해 주세요.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (!data.session) {
          alert("입력하신 이메일로 인증 링크를 발송했습니다. 이메일 확인 후 다시 로그인해 주세요!");
          setMode("login");
          setPassword("");
        } else {
          alert("회원가입 완료! 이제 역할을 설정해주세요.");
          setMode("setup_role");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        // Check if profile exists
        const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
        if (profile && profile.couple_id) {
          router.push("/");
        } else {
          if (profile && profile.role) {
            setRole(profile.role);
          }
          setMode("setup_role");
        }
      }
    } catch (error) {
      let msg = error.message;
      if (msg === "Invalid login credentials") {
        msg = "가입되지 않은 이메일이거나 비밀번호가 틀렸습니다.";
      } else if (msg === "User already registered") {
        msg = "이미 가입된 이메일입니다.";
      }
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupRole = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) throw new Error("로그인이 필요합니다.");

      if (role === "mother") {
        // Generate a random 6 char invite code
        const code = Math.random().toString(36).substring(2, 8).toUpperCase();
        
        // Insert into couples
        const { data: couple, error: coupleError } = await supabase
          .from("couples")
          .insert({ 
            invite_code: code,
            baby_name: babyName || null,
            due_date: dueDate || null
          })
          .select()
          .single();
          
        if (coupleError) throw coupleError;

        // Upsert into profiles FIRST so RLS for pregnancies passes
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: user.id, role: "mother", couple_id: couple.id });
          
        if (profileError) throw profileError;

        // Insert into pregnancies
        const { error: pregnancyError } = await supabase
          .from("pregnancies")
          .insert({ 
            couple_id: couple.id,
            baby_name: babyName || null,
            due_date: dueDate || null,
            status: 'active'
          });
          
        if (pregnancyError) throw pregnancyError;

        alert(`환영합니다! 남편을 초대할 코드입니다: ${code}\n(이 코드는 나중에도 확인할 수 있습니다)`);
        router.push("/");
      } else if (role === "partner") {
        // Find couple by invite code
        const { data: couple, error: coupleError } = await supabase
          .from("couples")
          .select()
          .eq("invite_code", inviteCode)
          .single();
          
        if (coupleError || !couple) throw new Error("유효하지 않은 초대 코드입니다.");

        // Upsert into profiles
        const { error: profileError } = await supabase
          .from("profiles")
          .upsert({ id: user.id, role: "partner", couple_id: couple.id });
          
        if (profileError) throw profileError;

        alert("아내와 성공적으로 연결되었습니다!");
        router.push("/");
      }
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (mode === "landing") {
    return (
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'transparent', boxShadow: 'none' }}>
        
        {/* Header / Hero */}
        <section className="animate-fade-up" style={{ 
          height: '460px', 
          position: 'relative', 
          backgroundColor: '#FDF7F3',
          overflow: 'hidden'
        }}>
          
          {/* Background Image shifted right, with left fade to blend perfectly */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-130px', 
            width: '140%', 
            height: '115%',
            backgroundImage: 'url(/images/hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            backgroundRepeat: 'no-repeat',
            WebkitMaskImage: 'linear-gradient(to right, transparent 5%, transparent 20%, black 50%)',
            maskImage: 'linear-gradient(to right, transparent 5%, transparent 20%, black 50%)',
            zIndex: 1,
            pointerEvents: 'none'
          }} />
          
          {/* Hamburger Menu (Mockup visual) */}
          <div style={{ position: 'absolute', top: '20px', right: '20px', cursor: 'pointer', zIndex: 20 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 12H20M4 6H20M4 18H20" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          {/* Text Overlay */}
          <div style={{ position: 'absolute', top: '15%', left: '20px', zIndex: 10, maxWidth: '65%' }}>
            <div className="animate-float" style={{ fontSize: '3rem', marginBottom: '10px' }}>💜</div>
            <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '15px', letterSpacing: '-0.03em', fontWeight: '800' }}>우리의 열달</h1>
            <p style={{ fontSize: '1.05rem', color: '#555', lineHeight: '1.6', marginBottom: '30px', wordBreak: 'keep-all', fontWeight: '500' }}>
              아내와 남편이 함께 기록하는<br/>가장 특별한 280일의 임신 다이어리
            </p>
            <button 
              className="animate-pulse-btn"
              onClick={() => setMode("login")}
              style={{ 
                padding: '14px 28px', fontSize: '1.05rem', borderRadius: '40px', 
                background: 'linear-gradient(90deg, #B490FF 0%, #D4B5FF 100%)', color: 'white', border: 'none', 
                cursor: 'pointer', fontWeight: 'bold', boxShadow: '0 8px 25px rgba(180, 144, 255, 0.4)',
                display: 'inline-flex', alignItems: 'center', gap: '8px'
              }}>
              다이어리 시작하기 <span style={{ fontWeight: 'normal' }}>→</span>
            </button>
          </div>
        </section>

        {/* Content Container matching mockup (White rounded box) */}
        <div style={{ 
          backgroundColor: 'rgba(255, 255, 255, 0.9)', 
          backdropFilter: 'blur(15px)', 
          borderRadius: '30px', 
          margin: '-40px 15px 0 15px', 
          padding: '30px 0',
          boxShadow: '0 -10px 40px rgba(0,0,0,0.04)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 20
        }}>

        {/* Carousel Section */}
        <section className="animate-fade-up" style={{ animationDelay: '0.2s', paddingBottom: '30px' }}>
          <div 
            ref={scrollRef}
            style={{ 
              display: 'flex', overflowX: 'auto', scrollSnapType: isDragging ? 'none' : 'x mandatory', gap: '20px', 
              padding: '20px 40px', scrollbarWidth: 'none', msOverflowStyle: 'none', cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => {
              setIsDragging(true);
              setStartX(e.pageX - scrollRef.current.offsetLeft);
              setScrollLeft(scrollRef.current.scrollLeft);
            }}
            onMouseLeave={() => setIsDragging(false)}
            onMouseUp={() => setIsDragging(false)}
            onMouseMove={(e) => {
              if (!isDragging) return;
              e.preventDefault();
              const x = e.pageX - scrollRef.current.offsetLeft;
              const walk = (x - startX) * 1.5; // scroll-fast
              scrollRef.current.scrollLeft = scrollLeft - walk;
            }}
            onScroll={(e) => {
              if (isDragging) return;
              const scrollLeft = e.target.scrollLeft;
              const cardWidth = window.innerWidth > 480 ? 480 * 0.85 + 20 : window.innerWidth * 0.85 + 20; 
              setCurrentSlide(Math.round(scrollLeft / cardWidth));
            }}
            className="hide-scrollbar"
          >
            
            {/* Card 1 */}
            <div style={{ flex: '0 0 85%', maxWidth: '400px', scrollSnapAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '30px', padding: '40px 25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', textAlign: 'center', userSelect: 'none' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFF0F5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 25px' }}>🍓</div>
              <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px', fontWeight: '700', wordBreak: 'keep-all' }}>은근슬쩍 전하는 속마음</h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                온도 습도 산후 관리부터 사소한 갈등,<br/>임신 중 설마하고 넘겨보세요.<br/>서운했던 감정들을 일기장에<br/>살며시 남겨보세요.
              </p>
              <div style={{ marginTop: '25px', display: 'inline-block', padding: '8px 20px', backgroundColor: '#FFF0F5', color: '#FF8A8A', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>마음 나누기</div>
            </div>

            {/* Card 2 */}
            <div style={{ flex: '0 0 85%', maxWidth: '400px', scrollSnapAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '30px', padding: '40px 25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', textAlign: 'center', userSelect: 'none' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#FFF8EB', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 25px' }}>✨</div>
              <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px', fontWeight: '700', wordBreak: 'keep-all' }}>센스 만점 예비 아빠</h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                퇴근길 손에 든 단 선물, 받기 힘든<br/>아내의 일기를 보고 무엇이<br/>필요한지 체크해 보세요.<br/>감동을 선물해 보세요.
              </p>
              <div style={{ marginTop: '25px', display: 'inline-block', padding: '8px 20px', backgroundColor: '#FFF8EB', color: '#FFA834', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>서로를 위한 기록</div>
            </div>

            {/* Card 3 */}
            <div style={{ flex: '0 0 85%', maxWidth: '400px', scrollSnapAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '30px', padding: '40px 25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', textAlign: 'center', userSelect: 'none' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F0F5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 25px' }}>💌</div>
              <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px', fontWeight: '700', wordBreak: 'keep-all' }}>얼굴 보고 하지 못한 말</h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                "오늘 하루도 너무 고마워."<br/>쑥스러워 삼켰던 진심을<br/>다이어리를 통해 전해보세요.<br/>사랑이 더 깊어집니다.
              </p>
              <div style={{ marginTop: '25px', display: 'inline-block', padding: '8px 20px', backgroundColor: '#F0F5FF', color: '#5A8CFF', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>진심 전하기</div>
            </div>

            {/* Card 4 */}
            <div style={{ flex: '0 0 85%', maxWidth: '400px', scrollSnapAlign: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: '30px', padding: '40px 25px', boxShadow: '0 10px 40px rgba(0,0,0,0.03)', textAlign: 'center', userSelect: 'none' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#F0FBF4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 25px' }}>👨‍👩‍👦</div>
              <h3 style={{ fontSize: '1.2rem', color: '#333', marginBottom: '15px', fontWeight: '700', wordBreak: 'keep-all' }}>진짜 부모가 되어가는 시간</h3>
              <p style={{ fontSize: '0.95rem', color: '#666', lineHeight: '1.6', wordBreak: 'keep-all' }}>
                서로를 더 깊이 이해하고 위로하며,<br/>온전한 가족이 되어가는<br/>280일의 아름다운 여정입니다.<br/>함께 준비해 보아요.
              </p>
              <div style={{ marginTop: '25px', display: 'inline-block', padding: '8px 20px', backgroundColor: '#F0FBF4', color: '#4CAF50', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>가족의 탄생</div>
            </div>

          </div>

          {/* Pagination Indicators */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
            {[0, 1, 2, 3].map((idx) => (
              <div key={idx} style={{ 
                width: '8px', height: '8px', borderRadius: '50%', 
                backgroundColor: currentSlide === idx ? '#B490FF' : '#E0E0E0',
                transition: 'background-color 0.3s'
              }} />
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px', color: '#999', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
            <span style={{ fontSize: '1.2rem' }}>👆</span> 옆으로 밀어 더 보기
          </div>
        </section>
        </div>

        {/* Feature Badges (Horizontal Row) */}
        <section className="animate-fade-up" style={{ animationDelay: '0.4s', padding: '10px 20px 30px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 0', backgroundColor: 'transparent' }}>
            
            {/* Feature 1 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 5px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#EBE0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '10px' }}>🔒</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>안전한 보안</div>
              <div style={{ fontSize: '0.75rem', color: '#777', wordBreak: 'keep-all', lineHeight: '1.4' }}>소중한 기록을<br/>안전하게 보호해요.</div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '60px', backgroundColor: '#EADACA', marginTop: '20px' }} />

            {/* Feature 2 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 5px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#FFE6E6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '10px' }}>❤️</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>부부가 함께</div>
              <div style={{ fontSize: '0.75rem', color: '#777', wordBreak: 'keep-all', lineHeight: '1.4' }}>서로의 마음을 나누고<br/>함께 기록해요.</div>
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '60px', backgroundColor: '#EADACA', marginTop: '20px' }} />

            {/* Feature 3 */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '0 5px' }}>
              <div style={{ width: '45px', height: '45px', borderRadius: '50%', backgroundColor: '#FFF4D9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: '10px' }}>✨</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#333', marginBottom: '5px' }}>소중한 추억</div>
              <div style={{ fontSize: '0.75rem', color: '#777', wordBreak: 'keep-all', lineHeight: '1.4' }}>280일의 순간을<br/>평생 간직하세요.</div>
            </div>

          </div>
        </section>

        {/* Footer info */}
        <section style={{ padding: '0 20px 40px', textAlign: 'center', marginTop: 'auto' }}>
          <p style={{ color: '#999', fontSize: '0.75rem', lineHeight: '1.5' }}>
            © 2026 우리의 열달. 소중한 오늘, 함께하는 내일.<br/>
            Crafted for Our Ten Months of Precious Journey.
          </p>
        </section>

        {/* CSS overrides for Landing Mode */}
        <style dangerouslySetInnerHTML={{__html: `
          body, .app-container { background: #FDF9F6 !important; }
          .hide-scrollbar::-webkit-scrollbar { display: none; }
        `}} />
      </main>
    );
  }

  if (mode === "setup_role") {
    return (
      <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
        <h2 style={{ marginBottom: '20px', color: 'var(--text-primary)' }}>당신은 누구신가요?</h2>
        
        {!role ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
            <div style={{ display: 'flex', gap: '20px', width: '100%', maxWidth: '300px' }}>
              <div 
                onClick={() => setRole("mother")}
                style={{ flex: 1, aspectRatio: '1', backgroundColor: 'var(--card-bg)', border: '2px solid var(--accent-color)', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '3rem' }}>👩</span>
                <span style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>예비 엄마</span>
              </div>
              <div 
                onClick={() => setRole("partner")}
                style={{ flex: 1, aspectRatio: '1', backgroundColor: 'var(--card-bg)', border: '2px solid #5c5227', borderRadius: '15px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '3rem' }}>👨</span>
                <span style={{ marginTop: '10px', fontWeight: 'bold', color: 'var(--text-primary)' }}>예비 아빠</span>
              </div>
            </div>
            <button 
              onClick={async () => { await supabase.auth.signOut(); setMode("login"); setRole(null); }}
              style={{ marginTop: '30px', padding: '10px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
              다른 계정으로 로그인 (로그아웃)
            </button>
          </div>
        ) : (
          <div style={{ width: '100%', maxWidth: '300px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              {role === "mother" ? "새로운 다이어리를 시작합니다." : "아기의 엄마가 알려준 초대 코드를 입력해주세요."}
            </p>
            {role === "partner" && (
              <input 
                type="text" 
                placeholder="초대 코드 입력" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', textAlign: 'center', textTransform: 'uppercase' }}
              />
            )}
            {role === "mother" && (
              <>
                <input 
                  type="text" 
                  placeholder="우리 아기 태명 (선택)" 
                  value={babyName}
                  onChange={(e) => setBabyName(e.target.value)}
                  style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem' }}
                />
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={{ padding: '15px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '1rem', color: dueDate ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '-5px' }}>
                  출산 예정일을 입력하면 디데이가 표시됩니다.
                </p>
              </>
            )}
            <button 
              onClick={handleSetupRole}
              disabled={loading || (role === "partner" && !inviteCode)}
              style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: role === "mother" ? 'var(--accent-color)' : '#5c5227', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
              {loading ? "처리중..." : "시작하기"}
            </button>
            <button 
              onClick={() => setRole(null)}
              style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
              뒤로 가기
            </button>
            <button 
              onClick={async () => { await supabase.auth.signOut(); setMode("login"); setRole(null); }}
              style={{ padding: '10px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', textDecoration: 'underline' }}>
              다른 계정으로 로그인 (로그아웃)
            </button>
          </div>
        )}
      </main>
    );
  }

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
          {mode === "signup" ? "이메일 회원가입 🤍" : "우리의 열달 🤍"}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {mode === "signup" ? "새로운 계정을 만들어 일기를 시작하세요." : "아빠와 엄마가 함께 기록하는 임신 일지"}
        </p>
      </div>

      {mode === "login" && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '300px' }}>
            <button 
              onClick={() => handleOAuthLogin('google')}
              disabled={loading}
              style={{ padding: '15px', borderRadius: '8px', border: '1px solid #ddd', backgroundColor: 'white', color: '#333', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>G</span> 구글 계정으로 시작하기
            </button>
            
            <button 
              onClick={() => handleOAuthLogin('kakao')}
              disabled={loading}
              style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: '#FEE500', color: '#000000', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span style={{ fontSize: '1.2rem' }}>💬</span> 카카오 계정으로 시작하기
            </button>
            
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center', marginTop: '5px' }}>
              소셜 로그인 시 서비스 이용약관 및 개인정보처리방침에 동의한 것으로 간주합니다.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', margin: '20px 0', width: '100%', maxWidth: '300px' }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
            <span style={{ padding: '0 10px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>또는 이메일로 시작</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-color)' }}></div>
          </div>
        </>
      )}

      <div style={{ width: '100%', maxWidth: '300px' }}>
        <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="email" 
            placeholder="이메일" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit' }}
          />
          <input 
            type="password" 
            placeholder="비밀번호" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit' }}
          />
          
          {mode === "signup" && (
            <div style={{ marginTop: '10px', marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                  <input 
                    type="checkbox" 
                    checked={agreeTerms} 
                    onChange={(e) => setAgreeTerms(e.target.checked)} 
                    required 
                  />
                  [필수] 서비스 이용약관 동의
                </label>
                <span 
                  onClick={() => openModal("서비스 이용약관", termsOfServiceText)}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  보기
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                  <input 
                    type="checkbox" 
                    checked={agreePrivacy} 
                    onChange={(e) => setAgreePrivacy(e.target.checked)} 
                    required 
                  />
                  [필수] 개인정보 수집 및 이용 동의
                </label>
                <span 
                  onClick={() => openModal("개인정보 수집 및 이용 동의", privacyPolicyText)}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  보기
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
                  <input 
                    type="checkbox" 
                    checked={agreeSensitive} 
                    onChange={(e) => setAgreeSensitive(e.target.checked)} 
                    required 
                  />
                  [필수] 민감정보 수집 및 이용 동의
                </label>
                <span 
                  onClick={() => openModal("민감정보 수집 및 이용 동의", sensitiveInfoText)}
                  style={{ color: 'var(--text-secondary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.75rem' }}
                >
                  보기
                </span>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || (mode === "signup" && (!agreeTerms || !agreePrivacy || !agreeSensitive))}
            style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: (mode === "signup" && (!agreeTerms || !agreePrivacy || !agreeSensitive)) ? 'var(--border-color)' : 'var(--text-primary)', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', cursor: (mode === "signup" && (!agreeTerms || !agreePrivacy || !agreeSensitive)) ? 'not-allowed' : 'pointer', marginTop: mode === "signup" ? '0' : '10px' }}>
            {loading ? "처리중..." : (mode === "login" ? "이메일 로그인" : "가입하기")}
          </button>
        </form>

        <div style={{ marginTop: '15px', textAlign: 'center' }}>
          {mode === "login" ? (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              계정이 없으신가요? <span onClick={() => { setMode("signup"); setAgreeTerms(false); setAgreePrivacy(false); setAgreeSensitive(false); }} style={{ color: 'var(--accent-color)', fontWeight: 'bold', cursor: 'pointer' }}>회원가입</span>
            </p>
          ) : (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              이미 계정이 있으신가요? <span onClick={() => setMode("login")} style={{ color: 'var(--text-primary)', fontWeight: 'bold', cursor: 'pointer' }}>로그인</span>
            </p>
          )}
        </div>
      </div>

      {/* Terms Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)', zIndex: 1000,
          display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
          <div style={{
            backgroundColor: 'var(--card-bg)', borderRadius: '15px', padding: '25px',
            width: '100%', maxWidth: '500px', maxHeight: '80vh', display: 'flex', flexDirection: 'column',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2 style={{ fontSize: '1.2rem', color: 'var(--text-primary)', margin: 0 }}>{modalTitle}</h2>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                &times;
              </button>
            </div>
            <div style={{ 
              flex: 1, overflowY: 'auto', padding: '15px', 
              backgroundColor: 'var(--bg-color)', borderRadius: '8px', 
              fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap'
            }}>
              {modalContent}
            </div>
            <button 
              onClick={() => setShowModal(false)}
              style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--text-primary)', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '15px', width: '100%' }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
