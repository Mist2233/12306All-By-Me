import React, { useState } from 'react'
import '../styles/design-tokens.css'
import './SignupPage.css'
import { Link } from 'react-router-dom'

const SignupPage: React.FC = () => {
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (password !== confirm) return alert('两次密码不一致')
        alert(`注册: ${email || phone}`)
    }

    return (
        <div className="signup-root">
            <div className="container signup-container">
                <div className="signup-card">
                    <h2>快速注册</h2>
                    <form onSubmit={handleSubmit} className="signup-form">
                        <div className="field"><input placeholder="邮箱（选填）" value={email} onChange={(e) => setEmail(e.target.value)} /></div>
                        <div className="field"><input placeholder="手机号" value={phone} onChange={(e) => setPhone(e.target.value)} /></div>
                        <div className="field code-row">
                            <input placeholder="短信验证码" />
                            <button type="button" className="btn ghost small">发送验证码</button>
                        </div>
                        <div className="field"><input type="password" placeholder="设置密码" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
                        <div className="field"><input type="password" placeholder="确认密码" value={confirm} onChange={(e) => setConfirm(e.target.value)} /></div>
                        <div className="submit-row"><button className="btn primary" type="submit">注册</button></div>
                    </form>
                    <div className="signup-foot">已有账号？ <Link to="/login">去登录</Link></div>
                </div>
            </div>
        </div>
    )
}

export default SignupPage
