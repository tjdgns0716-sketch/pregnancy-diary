"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function SupportPage() {
  const router = useRouter();
  const [type, setType] = useState("id_recovery");
  const [contactEmail, setContactEmail] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('inquiries')
        .insert([
          { 
            type, 
            contact_email: contactEmail, 
            content,
            status: 'pending'
          }
        ]);

      if (error) throw error;

      alert("문의가 성공적으로 접수되었습니다. 남겨주신 이메일로 답변을 보내드리겠습니다.");
      router.push("/login");
    } catch (error) {
      alert("문의 접수 중 오류가 발생했습니다: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '20px', backgroundColor: '#fdfbf7' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
          1:1 문의 게시판 💌
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          궁금하신 점이나 불편한 점을 남겨주시면<br/>
          입력하신 이메일로 빠르게 답변해 드리겠습니다.
        </p>
      </div>

      <div style={{ width: '100%', maxWidth: '400px', backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>문의 유형</label>
            <select 
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit', backgroundColor: 'white' }}
            >
              <option value="id_recovery">아이디/비밀번호 찾기 문의</option>
              <option value="bug_report">오류 신고</option>
              <option value="suggestion">서비스 건의</option>
              <option value="other">기타 문의</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>답변 받을 이메일 주소 <span style={{ color: 'red' }}>*</span></label>
            <input 
              type="email" 
              placeholder="예: hello@gmail.com" 
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>문의 내용 <span style={{ color: 'red' }}>*</span></label>
            {type === 'id_recovery' && (
              <p style={{ fontSize: '0.75rem', color: 'var(--accent-color)', margin: '0 0 5px 0' }}>
                * 아이디 조회를 위해 <b>가려진 이메일 주소, 이름, 생년월일(8자리), 휴대폰 뒷 4자리</b>를 꼭 포함해서 작성해주세요!
              </p>
            )}
            <textarea 
              placeholder="문의 내용을 상세히 적어주세요." 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={6}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !contactEmail || !content}
            style={{ padding: '15px', borderRadius: '8px', border: 'none', backgroundColor: (loading || !contactEmail || !content) ? 'var(--border-color)' : 'var(--text-primary)', color: 'white', fontSize: '1rem', fontWeight: 'bold', cursor: (loading || !contactEmail || !content) ? 'not-allowed' : 'pointer', marginTop: '10px' }}>
            {loading ? "제출 중..." : "문의 접수하기"}
          </button>

          <button 
            type="button" 
            onClick={() => router.push('/login')}
            style={{ padding: '10px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: 'var(--text-secondary)', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'underline' }}>
            로그인 화면으로 돌아가기
          </button>
        </form>
      </div>
    </main>
  );
}
