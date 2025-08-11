"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ChevronDown, X } from "lucide-react"

interface LoginPanelProps {
  isOpen: boolean
  onClose: () => void
  onUserChange: (user: any) => void
}

interface SiteUser {
  id: number
  username: string
  role?: string
}

export function LoginPanel({ isOpen, onClose, onUserChange }: LoginPanelProps) {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [isPasswordRecoveryMode, setIsPasswordRecoveryMode] = useState(false)
  const [isSecurityDropdownOpen, setIsSecurityDropdownOpen] = useState(false)
  const [selectedSecurityQuestion, setSelectedSecurityQuestion] = useState("")
  const [showForgotSecurityMessage, setShowForgotSecurityMessage] = useState(false)
  const [recoveryStep, setRecoveryStep] = useState<"username" | "question">("username")
  const [recoveryUsername, setRecoveryUsername] = useState("")
  const [recoverySecurityQuestion, setRecoverySecurityQuestion] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Form states
  const [loginForm, setLoginForm] = useState({ username: "", password: "" })
  const [registerForm, setRegisterForm] = useState({
    username: "",
    password: "",
    securityAnswer: "",
  })
  const [recoveryForm, setRecoveryForm] = useState({
    username: "",
    securityAnswer: "",
    newPassword: "",
  })

  const securityQuestions = [
    "Как звали вашего первого питомца?",
    "Имя вашего лучшего друга детства?",
    "В каком городе вы родились?",
    "Девичья фамилия вашей матери?",
    "Название вашей первой школы?",
    "Ваше любимое блюдо?",
    "Марка вашего первого автомобиля?",
    "Имя вашего любимого учителя?",
  ]

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginForm.username,
          password: loginForm.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onUserChange(data.user)
        onClose()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!selectedSecurityQuestion) {
      setError("Выберите секретный вопрос")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: registerForm.username,
          password: registerForm.password,
          securityQuestion: selectedSecurityQuestion,
          securityAnswer: registerForm.securityAnswer,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        onUserChange(data.user)
        onClose()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRecoveryUsernameSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/get-security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: recoveryForm.username }),
      })

      const data = await response.json()

      if (response.ok) {
        setRecoveryUsername(recoveryForm.username)
        setRecoverySecurityQuestion(data.securityQuestion)
        setRecoveryStep("question")
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: recoveryUsername,
          securityAnswer: recoveryForm.securityAnswer,
          newPassword: recoveryForm.newPassword,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert("Пароль успешно обновлен! Теперь вы можете войти с новым паролем.")
        switchBackToLogin()
      } else {
        setError(data.error)
      }
    } catch (error) {
      setError("Ошибка подключения к серверу")
    } finally {
      setIsLoading(false)
    }
  }

  const switchToRegister = () => {
    setIsRegisterMode(true)
    setError("")
  }

  const switchToLogin = () => {
    setIsRegisterMode(false)
    setIsSecurityDropdownOpen(false)
    setSelectedSecurityQuestion("")
    setError("")
  }

  const selectSecurityQuestion = (question: string) => {
    setSelectedSecurityQuestion(question)
    setIsSecurityDropdownOpen(false)
  }

  const switchToPasswordRecovery = () => {
    setIsPasswordRecoveryMode(true)
    setIsRegisterMode(false)
    setShowForgotSecurityMessage(false)
    setRecoveryStep("username")
    setError("")
  }

  const switchBackToLogin = () => {
    setIsPasswordRecoveryMode(false)
    setIsRegisterMode(false)
    setShowForgotSecurityMessage(false)
    setIsSecurityDropdownOpen(false)
    setSelectedSecurityQuestion("")
    setRecoveryStep("username")
    setRecoveryUsername("")
    setRecoverySecurityQuestion("")
    setError("")
  }

  const showSecurityCodeMessage = () => {
    setShowForgotSecurityMessage(true)
  }

  const handleMobileBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* МОБИЛЬНАЯ ВЕРСИЯ - Bottom Sheet */}
      <div className="md:hidden">
        {/* Backdrop для мобильных */}
        {isOpen && (
          <div
            className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
            onClick={handleMobileBackdropClick}
          />
        )}

        {/* Мобильная панель */}
        <div
          className={`
            fixed z-50 bg-white shadow-2xl
            bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl
            transition-transform duration-500 ease-out
            ${isOpen ? "translate-y-0" : "translate-y-full"}
          `}
        >
          {/* Мобильный handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
          </div>

          <div className="p-4 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center space-x-2">
                {(isRegisterMode || isPasswordRecoveryMode) && (
                  <button
                    onClick={isPasswordRecoveryMode ? switchBackToLogin : switchToLogin}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {isPasswordRecoveryMode ? "Восстановление пароля" : isRegisterMode ? "Регистрация" : "Вход в аккаунт"}
                </h2>
              </div>

              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {!isRegisterMode && !isPasswordRecoveryMode ? (
                // Login Form
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                      <input
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                        required
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите ваш логин"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите пароль"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl text-base font-medium transition-all min-h-[48px]"
                    >
                      {isLoading ? "Вход..." : "Войти"}
                    </Button>

                    <div className="text-center">
                      <span className="text-sm text-gray-600">или</span>
                    </div>

                    <Button
                      type="button"
                      onClick={switchToRegister}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-4 rounded-xl bg-transparent text-base font-medium transition-all min-h-[48px]"
                    >
                      Зарегистрироваться
                    </Button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={switchToPasswordRecovery}
                        className="text-sm text-blue-500 hover:text-blue-600 transition-colors py-2"
                      >
                        Забыли пароль?
                      </button>
                    </div>
                  </div>
                </form>
              ) : !isPasswordRecoveryMode ? (
                // Registration Form
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                      <input
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
                        required
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите логин"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите пароль"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Секретный вопрос</label>
                      <button
                        type="button"
                        onClick={() => setIsSecurityDropdownOpen(!isSecurityDropdownOpen)}
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-all min-h-[48px]"
                      >
                        <span className={selectedSecurityQuestion ? "text-gray-900" : "text-gray-500"}>
                          {selectedSecurityQuestion || "Выберите секретный вопрос"}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            isSecurityDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isSecurityDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                          {securityQuestions.map((question, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectSecurityQuestion(question)}
                              className="w-full px-4 py-3 text-left hover:bg-blue-50 hover:text-blue-700 text-sm border-b border-gray-100 last:border-b-0 transition-colors min-h-[44px]"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ответ</label>
                      <input
                        type="text"
                        value={registerForm.securityAnswer}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, securityAnswer: e.target.value }))}
                        required
                        className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите ответ на секретный вопрос"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl text-base font-medium transition-all min-h-[48px]"
                    >
                      {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={switchToLogin}
                        className="text-sm text-blue-500 hover:text-blue-600 transition-colors py-2"
                      >
                        Уже есть аккаунт? Войти
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // Password Recovery Form
                <>
                  {recoveryStep === "username" ? (
                    <form onSubmit={handleRecoveryUsernameSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                          <input
                            type="text"
                            value={recoveryForm.username}
                            onChange={(e) => setRecoveryForm((prev) => ({ ...prev, username: e.target.value }))}
                            required
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Введите ваш логин"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl text-base font-medium transition-all min-h-[48px]"
                        >
                          {isLoading ? "Поиск..." : "Найти секретный вопрос"}
                        </Button>

                        <div className="text-center mt-2">
                          <button
                            type="button"
                            onClick={switchBackToLogin}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                          >
                            Вернуться к входу
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordReset}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                          <input
                            type="text"
                            value={recoveryUsername}
                            disabled
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-gray-100 text-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Секретный вопрос</label>
                          <div className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl bg-gray-50 text-gray-700">
                            {recoverySecurityQuestion}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ответ на секретный вопрос
                          </label>
                          <input
                            type="text"
                            value={recoveryForm.securityAnswer}
                            onChange={(e) => setRecoveryForm((prev) => ({ ...prev, securityAnswer: e.target.value }))}
                            required
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Введите ответ на секретный вопрос"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
                          <input
                            type="password"
                            value={recoveryForm.newPassword}
                            onChange={(e) => setRecoveryForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                            required
                            className="w-full px-4 py-3 text-base border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Введите новый пароль"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-xl text-base font-medium transition-all min-h-[48px]"
                        >
                          {isLoading ? "Обновление..." : "Обновить пароль"}
                        </Button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={showSecurityCodeMessage}
                            className="text-sm text-blue-500 hover:text-blue-600 transition-colors py-2"
                          >
                            Забыли секретный код?
                          </button>
                        </div>

                        <div className="text-center mt-2">
                          <button
                            type="button"
                            onClick={() => setRecoveryStep("username")}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                          >
                            Изменить логин
                          </button>
                        </div>

                        {showForgotSecurityMessage && (
                          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-yellow-600 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                                  Нужна помощь с восстановлением?
                                </h4>
                                <p className="text-sm text-yellow-700">
                                  Если вы забыли ответ на секретный вопрос, пожалуйста, свяжитесь с администратором для
                                  восстановления доступа к аккаунту.
                                </p>
                                <div className="mt-3 flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowForgotSecurityMessage(false)}
                                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg transition-colors min-h-[36px]"
                                  >
                                    Понятно
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ДЕСКТОПНАЯ ВЕРСИЯ - Sidebar справа ПОД ШАПКОЙ - УМЕНЬШЕННАЯ ШИРИНА */}
      <div className="hidden md:block">
        {/* Десктопная панель - выезжает справа, начинается под шапкой, ширина 360px */}
        <div
          className={`
            fixed top-16 right-0 bottom-0 z-50 
            w-[400px] bg-white shadow-2xl border-l border-gray-200
            transition-transform duration-300 ease-in-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}
          `}
        >
          <div className="p-6 h-full overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                {(isRegisterMode || isPasswordRecoveryMode) && (
                  <button
                    onClick={isPasswordRecoveryMode ? switchBackToLogin : switchToLogin}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-500" />
                  </button>
                )}
                <h2 className="text-lg font-semibold text-gray-900">
                  {isPasswordRecoveryMode ? "Восстановление пароля" : isRegisterMode ? "Регистрация" : "Вход в аккаунт"}
                </h2>
              </div>

              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {!isRegisterMode && !isPasswordRecoveryMode ? (
                // Login Form
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                      <input
                        type="text"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, username: e.target.value }))}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите ваш логин"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                      <input
                        type="password"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите пароль"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      {isLoading ? "Вход..." : "Войти"}
                    </Button>

                    <div className="text-center">
                      <span className="text-sm text-gray-600">или</span>
                    </div>

                    <Button
                      type="button"
                      onClick={switchToRegister}
                      variant="outline"
                      className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-2 rounded-lg bg-transparent text-sm font-medium transition-all"
                    >
                      Зарегистрироваться
                    </Button>

                    <div className="text-center mt-4">
                      <button
                        type="button"
                        onClick={switchToPasswordRecovery}
                        className="text-sm text-blue-500 hover:text-blue-600 transition-colors py-2"
                      >
                        Забыли пароль?
                      </button>
                    </div>
                  </div>
                </form>
              ) : !isPasswordRecoveryMode ? (
                // Registration Form
                <form onSubmit={handleRegister}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                      <input
                        type="text"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, username: e.target.value }))}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите логин"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Пароль</label>
                      <input
                        type="password"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите пароль"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Секретный вопрос</label>
                      <button
                        type="button"
                        onClick={() => setIsSecurityDropdownOpen(!isSecurityDropdownOpen)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-all"
                      >
                        <span className={selectedSecurityQuestion ? "text-gray-900" : "text-gray-500"}>
                          {selectedSecurityQuestion || "Выберите секретный вопрос"}
                        </span>
                        <ChevronDown
                          className={`h-5 w-5 text-gray-400 transition-transform ${
                            isSecurityDropdownOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isSecurityDropdownOpen && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                          {securityQuestions.map((question, index) => (
                            <button
                              key={index}
                              type="button"
                              onClick={() => selectSecurityQuestion(question)}
                              className="w-full px-3 py-2 text-left hover:bg-blue-50 hover:text-blue-700 text-sm border-b border-gray-100 last:border-b-0 transition-colors"
                            >
                              {question}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ответ</label>
                      <input
                        type="text"
                        value={registerForm.securityAnswer}
                        onChange={(e) => setRegisterForm((prev) => ({ ...prev, securityAnswer: e.target.value }))}
                        required
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        placeholder="Введите ответ на секретный вопрос"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      {isLoading ? "Регистрация..." : "Зарегистрироваться"}
                    </Button>

                    <div className="text-center">
                      <button
                        type="button"
                        onClick={switchToLogin}
                        className="text-sm text-blue-500 hover:text-blue-600 transition-colors py-2"
                      >
                        Уже есть аккаунт? Войти
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                // Password Recovery Form
                <>
                  {recoveryStep === "username" ? (
                    <form onSubmit={handleRecoveryUsernameSubmit}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                          <input
                            type="text"
                            value={recoveryForm.username}
                            onChange={(e) => setRecoveryForm((prev) => ({ ...prev, username: e.target.value }))}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Введите ваш логин"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          {isLoading ? "Поиск..." : "Найти секретный вопрос"}
                        </Button>

                        <div className="text-center mt-2">
                          <button
                            type="button"
                            onClick={switchBackToLogin}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                          >
                            Вернуться к входу
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handlePasswordReset}>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Логин</label>
                          <input
                            type="text"
                            value={recoveryUsername}
                            disabled
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Секретный вопрос</label>
                          <div className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                            {recoverySecurityQuestion}
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ответ на секретный вопрос
                          </label>
                          <input
                            type="text"
                            value={recoveryForm.securityAnswer}
                            onChange={(e) => setRecoveryForm((prev) => ({ ...prev, securityAnswer: e.target.value }))}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Введите ответ на секретный вопрос"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Новый пароль</label>
                          <input
                            type="password"
                            value={recoveryForm.newPassword}
                            onChange={(e) => setRecoveryForm((prev) => ({ ...prev, newPassword: e.target.value }))}
                            required
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            placeholder="Введите новый пароль"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg text-sm font-medium transition-all"
                        >
                          {isLoading ? "Обновление..." : "Обновить пароль"}
                        </Button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={showSecurityCodeMessage}
                            className="text-sm text-blue-500 hover:text-blue-600 transition-colors py-2"
                          >
                            Забыли секретный код?
                          </button>
                        </div>

                        <div className="text-center mt-2">
                          <button
                            type="button"
                            onClick={() => setRecoveryStep("username")}
                            className="text-sm text-gray-500 hover:text-gray-700 transition-colors py-2"
                          >
                            Изменить логин
                          </button>
                        </div>

                        {showForgotSecurityMessage && (
                          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <svg
                                  className="w-5 h-5 text-yellow-600 mt-0.5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <h4 className="text-sm font-medium text-yellow-800 mb-1">
                                  Нужна помощь с восстановлением?
                                </h4>
                                <p className="text-sm text-yellow-700">
                                  Если вы забыли ответ на секретный вопрос, пожалуйста, свяжитесь с администратором для
                                  восстановления доступа к аккаунту.
                                </p>
                                <div className="mt-3 flex space-x-2">
                                  <button
                                    type="button"
                                    onClick={() => setShowForgotSecurityMessage(false)}
                                    className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-3 py-2 rounded-lg transition-colors"
                                  >
                                    Понятно
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </form>
                  )}
                </>
              )}

              {/* Блок преимуществ только для десктопа - компактная версия */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-4 border border-blue-200/50 shadow-sm">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-2">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-sm font-bold text-gray-900">Почему выбирают нас?</h3>
                    <p className="text-xs text-gray-600 mt-1">Современный подход к путешествиям</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg shadow-sm border border-white/50">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Быстрая регистрация</p>
                        <p className="text-xs text-gray-600">Без email и телефона</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg shadow-sm border border-white/50">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">AI-планирование</p>
                        <p className="text-xs text-gray-600">Умные маршруты и советы</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-3 bg-white/80 rounded-lg shadow-sm border border-white/50">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">Персонализация</p>
                        <p className="text-xs text-gray-600">Рекомендации под ваши интересы</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
