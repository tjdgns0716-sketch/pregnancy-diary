"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function UpdatePassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      // hash에서 access_token을 읽어서 세션을 복원하는 것은 supabase-js가 자동으로 처리합니다.
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert("유효하지 않거나 만료된 링크입니다. 다시 시도해주세요.");
        router.push("/login");
      }
    };
    
    // 약간의 딜레이를 주어 supabase가 hash의 토큰을 처리할 시간을 줌
    setTimeout(checkSession, 500);
  }, [router]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (password.length < 6) {
      alert("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      alert("비밀번호가 성공적으로 변경되었습니다! 새 비밀번호로 다시 로그인해주세요.");
      // 변경 후 강제 로그아웃 시켜서 다시 로그인하게 유도
      await supabase.auth.signOut();
      router.push("/login");
    } catch (error) {
      alert("비밀번호 변경 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
          새 비밀번호 설정 🔑
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          새롭게 사용할 비밀번호를 입력해주세요.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '300px' }}>
        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input 
            type="password" 
            placeholder="새 비밀번호 (6자 이상)" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit' }}
          />
          <input 
            type="password" 
            placeholder="새 비밀번호 확인" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit' }}
          />
          
          <button 
            type="submit" 
            disabled={loading}
            style={{ padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--text-primary)', color: 'white', fontSize: '0.9rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? "처리중..." : "비밀번호 변경하기"}
          </button>
        </form>
      </div>
    </main>
  );
}
