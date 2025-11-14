import React, { useState } from 'react'
import '../styles/design-tokens.css'
import './LoginPage.css'
import { Link } from 'react-router-dom'

const LoginPage: React.FC = () => {
    const [account, setAccount] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        // placeholder: replace with real API call
        alert(`登录: ${account}`)
    }

    return (
        <div className="login-root">
            <div className="login-container container">
                <div className="login-card">
                    <h2 className="login-title">账号登录</h2>
                    <form className="login-form" onSubmit={handleSubmit}>
                        <div className="field">
                            <input
                                className="input"
                                placeholder="手机号/邮箱/用户名"
                                value={account}
                                onChange={(e) => setAccount(e.target.value)}
                            />
                        </div>

                        <div className="field">
                            <input
                                className="input"
                                type="password"
                                placeholder="请输入密码"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="field captcha-row">
                            <input className="input" placeholder="验证码" />
                            <img src="/deconstructed_site/otn/view/images/checkcode.png" alt="captcha" className="captcha-img" />
                        </div>

                        <div className="actions-row">
                            <label className="remember">
                                <input type="checkbox" checked={remember} onChange={() => setRemember(!remember)} /> 记住我
                            </label>
                            <Link to="/signup" className="link">立即注册</Link>
                        </div>

                        <div className="submit-row">
                            <button className="btn primary" type="submit">登录</button>
                        </div>
                    </form>
                </div>

                <div className="login-side">
                    <div className="side-box">
                        <h4>新用户注册</h4>
                        <p>快速创建账号，开始购票之旅</p>
                        <Link to="/signup" className="btn ghost">去注册</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
