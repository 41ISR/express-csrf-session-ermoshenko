const SignIn = () => {
    const handleSubmit = async (e) => {
        e.preventDefault()
        
        const user = {
            email: e.target.email.value,
            password: e.target.password.value
        }

        try {
            const res = await fetch("https://symmetrical-engine-69465rq9xpvpf47gx-3000.app.github.dev/signin", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user),
                credentials: "include"
            })

            if (!res.ok) throw new Error(res.statusText)

            console.log(res)
        } catch (error) {
            console.error(error)
        }
    }
    return (
        <div className="container">

            <h1>🎮 Кликер Игра</h1>
            <p className="subtitle">Демонстрация CSRF + CORS + Sessions</p>

            <div className="forms">
                <div className="form-card">
                    <h2>Вход</h2>
                    <form onSubmit={handleSubmit}>
                        <input id="email" name="email" type="email" placeholder="Почта" required />
                        <input id="password" name="password" type="password" placeholder="Пароль" required />
                        <button type="submit">Войти</button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default SignIn